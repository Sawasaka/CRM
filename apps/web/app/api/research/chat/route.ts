import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'
import { buildResearchContext, formatContextForPrompt, type EntityType } from '@/lib/research-context'
import { getOurBusiness, formatOurBusinessPrompt } from '@/lib/our-business'
import { RESEARCH_PRESETS } from '@/lib/research-presets'
import { isResearchAllowed, resolveResearchModel, type ModelKind, type ThinkingDepth } from '@/lib/research-models'
import { buildWebContext } from '@/lib/research-web-search'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type Body = {
  entityType: EntityType
  entityId: string
  prompt?: string
  presetId?: string
  model?: ModelKind
  thinking?: ThinkingDepth
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export async function POST(req: NextRequest) {
  const session = await auth()
  let userId = (session as unknown as { userId?: string })?.userId
  // 開発時：RESEARCH_DEV_BYPASS=1 で認証バイパス（最初の Org の最初の User を使う）
  if (!userId && process.env.NODE_ENV !== 'production' && process.env.RESEARCH_DEV_BYPASS === '1') {
    const u = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' }, select: { id: true } })
    userId = u?.id
  }
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as Partial<Body>
  const { entityType, entityId, prompt, presetId, model: reqModel, thinking: reqThinking, history } = body

  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'entityType と entityId は必須です' }, { status: 400 })
  }
  if (!prompt && !presetId) {
    return NextResponse.json({ error: 'prompt または presetId が必要です' }, { status: 400 })
  }

  // org plan を取得
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { orgId: true, org: { select: { plan: true } } },
  })
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 })

  const plan = user.org.plan
  if (!isResearchAllowed(plan)) {
    return NextResponse.json({ error: 'リサーチ機能はSTARTERプラン以上で利用できます' }, { status: 403 })
  }

  // モデル決定
  const resolved = resolveResearchModel(plan, { model: reqModel, thinking: reqThinking })

  // プロンプト本体を組み立て
  const userPrompt = presetId
    ? RESEARCH_PRESETS.find((p) => p.id === presetId)?.prompt ?? prompt ?? ''
    : (prompt ?? '')
  if (!userPrompt) return NextResponse.json({ error: 'プロンプトが空です' }, { status: 400 })

  // コンテキスト + 自社情報の組み立て
  const [ctx, ourBiz] = await Promise.all([
    buildResearchContext(entityType, entityId),
    getOurBusiness(user.orgId),
  ])

  // 外部Web検索（プリセット指定時のみ・対象企業名がある場合のみ）
  let webContextText: string | null = null
  if (presetId && ctx.abm?.company.name) {
    webContextText = await buildWebContext(presetId, ctx.abm.company.name).catch(() => null)
  }

  const systemPrompt =
    `あなたはB2B営業のシニアリサーチャーです。以下の社内データ・外部Web検索結果・当社情報を踏まえ、営業実務で使える具体的・構造化された回答を生成してください。\n` +
    `推測には必ず「根拠 / 推測 / 仮説」のラベルを付けてください。出典が分かる場合はURLや発信元を付記してください。\n\n` +
    `${formatOurBusinessPrompt(ourBiz)}\n\n` +
    `${formatContextForPrompt(ctx)}` +
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
    const completion = await openai.chat.completions.create({
      model: resolved.model,
      messages,
      temperature: resolved.thinking === 'extended' ? 0.3 : 0.4,
    })
    const content = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({
      content,
      model: resolved.model,
      thinking: resolved.thinking,
      elapsedMs: Date.now() - t0,
      usage: completion.usage,
      contextSize: systemPrompt.length,
    })
  } catch (e) {
    return NextResponse.json(
      { error: `OpenAI 呼び出しに失敗: ${(e as Error).message}` },
      { status: 502 },
    )
  }
}
