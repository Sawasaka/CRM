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
    formatAnswerStylePrompt() +
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
    if (resolved.model.startsWith('gemini-')) {
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

function formatAnswerStylePrompt(): string {
  return [
    '# 回答の体裁ルール',
    '- 1つの段落に情報を詰め込まず、必ず見出しと箇条書きで回答する。',
    '- 見出しは `### 結論` のようなMarkdown見出しを使う。',
    '- 箇条書きは1行1メッセージにし、1項目は原則35〜70字程度に収める。',
    '- 「根拠:」「推測:」「仮説:」「次アクション:」を行頭ラベルとして使い、事実と推論を混ぜない。',
    '- 会社・人物リサーチでは、原則 `### 企業概要` `### 接点仮説` `### 課題仮説` `### 次アクション` の順で出す。',
    '- 同じ見出しを2回以上使わない。補足がある場合は既存の見出し内に追記する。',
    '- 不明な項目は無理に埋めず `不明` と書き、確認方法を短く添える。',
    '- 表はユーザーが明示的に求めた場合だけ使う。通常回答では箇条書きを優先する。',
    '- 長いURLや出典は本文に混ぜず、最後に `### 出典・確認元` としてまとめる。',
    '',
    '# 標準フォーマット',
    '### 結論',
    '- 結論: まず何が言えるかを1〜2点で示す。',
    '',
    '### 根拠・推測',
    '- 根拠: 確認できた事実を書く。',
    '- 推測: 事実から推測した内容を書く。',
    '',
    '### 次アクション',
    '- 次アクション: 営業・CS・PDMが次に取る行動を書く。',
    '',
  ].join('\n')
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
