import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'
import {
  buildResearchContext,
  formatContextForPrompt,
  type EntityType,
} from '@/lib/research-context'
import { getOurBusiness, formatOurBusinessPrompt } from '@/lib/our-business'
import { RESEARCH_PRESETS } from '@/lib/research-presets'
import {
  isResearchAllowed,
  resolveResearchModel,
  type ModelKind,
  type ThinkingDepth,
} from '@/lib/research-models'
import { buildWebContext, buildWebContextFromPrompt } from '@/lib/research-web-search'
import { generateGeminiChat } from '@/lib/gemini-chat'
import type { ChatPolicyState } from '@/lib/chat-policy-presets'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

let openai: OpenAI | null = null

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY が未設定です')
  openai ??= new OpenAI({ apiKey })
  return openai
}

type Body = {
  entityType?: EntityType
  entityId?: string
  prompt?: string
  presetId?: string
  model?: ModelKind
  thinking?: ThinkingDepth
  policy?: Partial<ChatPolicyState>
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  /** AssigneeFilter の「外部 ON」(Web 検索などの社外情報を併用) */
  includeExternal?: boolean
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Body>
  const {
    entityType,
    entityId,
    prompt,
    presetId,
    model: reqModel,
    thinking: reqThinking,
    policy,
    history,
    includeExternal,
  } = body
  const hasEntityContext = Boolean(entityType && entityId)

  if (!prompt && !presetId) {
    return NextResponse.json({ error: 'prompt または presetId が必要です' }, { status: 400 })
  }

  const session = await auth()
  let userId = (session as unknown as { userId?: string })?.userId
  // 開発時：画面確認用に最初の User を使う。公開環境では必ず認証を要求する。
  if (!userId && process.env.NODE_ENV !== 'production') {
    const u = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' }, select: { id: true } })
    userId = u?.id
  }
  if (!userId && (process.env.NODE_ENV === 'production' || hasEntityContext)) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // org plan を取得
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { orgId: true, org: { select: { plan: true } } },
      })
    : null
  if (userId && !user) return NextResponse.json({ error: 'user not found' }, { status: 404 })

  const plan = user?.org.plan ?? 'ENTERPRISE'
  if (process.env.NODE_ENV === 'production' && !isResearchAllowed(plan)) {
    return NextResponse.json(
      { error: 'リサーチ機能はSTARTERプラン以上で利用できます' },
      { status: 403 }
    )
  }

  // モデル決定
  const resolved = resolveResearchModel(plan, { model: reqModel, thinking: reqThinking })

  // プロンプト本体を組み立て
  const userPrompt = presetId
    ? (RESEARCH_PRESETS.find((p) => p.id === presetId)?.prompt ?? prompt ?? '')
    : (prompt ?? '')
  if (!userPrompt) return NextResponse.json({ error: 'プロンプトが空です' }, { status: 400 })

  // コンテキスト + 自社情報の組み立て
  const [ctx, ourBiz] = await Promise.all([
    hasEntityContext ? buildResearchContext(entityType!, entityId!) : Promise.resolve(null),
    getOurBusiness(user?.orgId),
  ])

  // 外部Web検索:
  //  (a) プリセット指定 + 対象企業名がある場合 → プリセット連動の複数クエリ
  //  (b) includeExternal=true (チャットの「外部 ON」) のフリーテキスト → ユーザー prompt をそのまま検索
  let webContextText: string | null = null
  if (presetId && ctx?.abm?.company.name) {
    webContextText = await buildWebContext(presetId, ctx.abm.company.name).catch(() => null)
  } else if (includeExternal && userPrompt) {
    webContextText = await buildWebContextFromPrompt(userPrompt).catch(() => null)
  }

  const systemPrompt =
    `あなたはルキスマCRMのB2B営業リサーチAIです。社内データ・外部Web検索結果・当社情報を踏まえ、営業実務で使える具体的・構造化された回答を生成してください。\n` +
    `推測には必ず「根拠 / 推測 / 仮説」のラベルを付けてください。出典が分かる場合はURLや発信元を付記してください。\n` +
    `データが不足している場合は、断定せず、次に確認すべき情報を短く提示してください。\n\n` +
    `${formatOurBusinessPrompt(ourBiz)}\n\n` +
    formatChatPolicyPrompt(policy) +
    (ctx
      ? formatContextForPrompt(ctx)
      : '# 対象コンテキスト\n- 個別企業・取引・コンタクトは未指定です。ユーザーの質問を起点に回答してください。\n') +
    (webContextText ?? '') +
    (resolved.reasoningSystemSuffix ?? '')

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ]
  if (history && history.length > 0) {
    for (const h of history.slice(-10)) {
      messages.push({ role: h.role, content: h.content })
    }
  }
  messages.push({ role: 'user', content: userPrompt })

  const t0 = Date.now()
  try {
    const temperature = resolved.thinking === 'extended' ? 0.3 : 0.4
    if (resolved.model === 'gemini-2.5-flash-lite') {
      const completion = await generateGeminiChat({
        model: resolved.model,
        messages,
        temperature,
      })
      const elapsedMs = Date.now() - t0
      return NextResponse.json({
        content: completion.content,
        model: completion.model,
        thinking: resolved.thinking,
        elapsedMs,
        usage: completion.usageMetadata,
        contextSize: systemPrompt.length,
      })
    }

    const completion = await getOpenAI().chat.completions.create({
      model: resolved.model,
      messages,
      temperature,
    })
    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) throw new Error('OpenAI API から空の回答が返りました')
    const elapsedMs = Date.now() - t0

    return NextResponse.json({
      content,
      model: completion.model,
      thinking: resolved.thinking,
      elapsedMs,
      usage: completion.usage,
      contextSize: systemPrompt.length,
    })
  } catch (e) {
    return NextResponse.json(
      { error: `AIモデル呼び出しに失敗: ${(e as Error).message}` },
      { status: 502 }
    )
  }
}

function formatChatPolicyPrompt(policy: Partial<ChatPolicyState> | undefined): string {
  const premises = policy?.premises?.trim()
  const policies = policy?.policies?.trim()
  if (!premises && !policies) return ''

  const lines = ['# ユーザー指定の前提・ポリシー']
  if (premises) {
    lines.push('## 前提')
    lines.push(premises)
  }
  if (policies) {
    lines.push('## ポリシー')
    lines.push(policies)
  }
  lines.push('')
  return lines.join('\n')
}
