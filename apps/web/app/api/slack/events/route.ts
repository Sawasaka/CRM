import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { prisma } from '@bgm/db'
import { slack } from '@/lib/slack/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Slack Events API の受信エンドポイント。
// - URL verification (challenge) 応答
// - reaction_added (✅): 元メッセージとそのスレッドを FAQ 候補として登録
//   = 「チャットから自動抽出してナレッジを自動作成」のトリガ
//
// Slack 署名検証は SLACK_SIGNING_SECRET で行う。
// 受信は 3 秒以内に 200 を返す必要があるため、重い処理は ack 後に非同期で進める。

export async function POST(req: Request) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  const rawBody = await req.text()

  if (signingSecret) {
    const ts = req.headers.get('x-slack-request-timestamp') ?? ''
    const sig = req.headers.get('x-slack-signature') ?? ''
    if (!verifySlackSignature(signingSecret, ts, sig, rawBody)) {
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
    }
  }

  const body = JSON.parse(rawBody) as SlackEnvelope

  // URL 検証
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge })
  }

  if (body.type === 'event_callback' && body.event) {
    // 同一イベントの重複処理対策（Slack は最大 3 回再送する）
    if (body.event_id) {
      const seen = await prisma.ragQuery.findFirst({
        where: { slackTs: `evt:${body.event_id}` },
        select: { id: true },
      })
      if (seen) return NextResponse.json({ ok: true })
    }
    handleEvent(body).catch((e) => console.error('slack event handler error', e))
  }

  return NextResponse.json({ ok: true })
}

async function handleEvent(env: SlackEnvelope) {
  const ev = env.event
  const teamId = env.team_id
  if (!ev || !teamId) return

  const workspace = await prisma.slackWorkspace.findFirst({
    where: { teamId, enabled: true },
  })
  if (!workspace) return

  if (ev.type === 'reaction_added') {
    await handleReactionAdded(workspace, ev as SlackEventReactionAdded)
  }
}

async function handleReactionAdded(
  ws: { id: string; orgId: string; botToken: string },
  ev: SlackEventReactionAdded,
) {
  // ✅ または white_check_mark のみ処理。これが「ナレッジ化トリガ」
  if (!['white_check_mark', 'heavy_check_mark', 'check'].includes(ev.reaction)) return
  if (!ev.item || ev.item.type !== 'message') return

  const channel = ev.item.channel
  const ts = ev.item.ts

  // メッセージ本体＋スレッドを取得
  const replies = await slack.conversationsRepliesText(ws.botToken, channel, ts).catch(() => null)
  const root = replies?.messages?.[0]
  if (!root) return
  const followUps = replies!.messages.slice(1)

  // 組織のルールブック（前提・ポリシー）を取得
  const rulebook = await prisma.knowledgeRulebook.findUnique({
    where: { orgId: ws.orgId },
  })

  // AI が「質問」「回答」を整理してタイトル・本文・部門・カテゴリを生成
  const extracted = await extractFaqFromConversation({
    rootText: root.text ?? '',
    replyTexts: followUps.map((m) => m.text ?? '').filter(Boolean),
    premises: rulebook?.premises ?? '',
    policies: rulebook?.policies ?? '',
  })

  const permalink = await slack
    .chatGetPermalink(ws.botToken, channel, ts)
    .then((r) => r.permalink ?? null)
    .catch(() => null)

  await prisma.faqEntry.create({
    data: {
      orgId: ws.orgId,
      title: extracted.title,
      body: extracted.body,
      department: extracted.department,
      category: extracted.category,
      sourceType: 'SLACK',
      sourceUrl: permalink,
      sourceMeta: {
        channel,
        ts,
        threadTs: root.ts,
        reactedBy: ev.user,
      } as never,
      status: 'CANDIDATE',
    },
  })
}

// ─── AI 抽出（チャット → 質問&回答 → FAQ 草稿） ────────────────────────

async function extractFaqFromConversation(opts: {
  rootText: string
  replyTexts: string[]
  premises: string
  policies: string
}): Promise<{
  title: string
  body: string
  department: string | null
  category: string | null
}> {
  const apiKey = process.env.OPENAI_API_KEY
  const fallback = {
    title: (opts.rootText || '質問').slice(0, 200),
    body: [
      `# 質問\n${opts.rootText}`,
      opts.replyTexts.length
        ? `\n# スレッドの返信\n${opts.replyTexts.map((t) => `- ${t}`).join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
    department: null as string | null,
    category: null as string | null,
  }
  if (!apiKey) return fallback

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey })
    const systemPrompt = buildSystemPrompt(opts)
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.5',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            `# 元メッセージ\n${opts.rootText}`,
            opts.replyTexts.length
              ? `\n# スレッド返信\n${opts.replyTexts.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
              : '',
          ].join('\n'),
        },
      ],
    })
    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as {
      title?: string
      body?: string
      department?: string
      category?: string
    }
    return {
      title: (parsed.title ?? fallback.title).slice(0, 200),
      body: parsed.body ?? fallback.body,
      department: parsed.department ?? null,
      category: parsed.category ?? null,
    }
  } catch (e) {
    console.error('extractFaqFromConversation failed', e)
    return fallback
  }
}

// 組織のルールブックをシステムプロンプトに合成
function buildSystemPrompt(opts: { premises: string; policies: string }): string {
  const lines = [
    'あなたは社内ナレッジ整理の専門家です。Slack の会話から、再利用可能な FAQ 草稿を作ってください。',
    '出力は JSON で、以下のキーを持つ:',
    '- title: 80字以内の「質問形式」タイトル。必ず「？」で終わる疑問文にする（例: 「〜は？」「〜はどうすればいい？」）。体言止め禁止。',
    '- body: 要点を「コンパクトに整形した」回答本文。Markdown 形式。冗長な接続詞・前置きは削る。',
    '  形式ルール:',
    '    1. 結論ファースト（最初に結果や結論を1行）',
    '    2. 詳細は箇条書き「- 」で要点列挙、複数ステップは番号付き「1. 2. 3.」',
    '    3. 数値・期限・担当者・URL・チャンネル名などの「具体情報」を必ず明示',
    '    4. 1項目あたり1行・体言止め推奨。冗長な文末は省く',
    '    5. 関連グループは【見出し】で区切る（例: 【手順】【特例】）',
    '    6. 200〜300字を目安に圧縮。原文の言い回しに引きずられない',
    '- department: 大分類。営業/人事/経理/法務/IT/プロダクト/その他 から1つ',
    '- category: department の中の中分類（20字以内・体言止め）',
    '- tags: 3〜5個のサブカテゴリ・キーワード配列',
    '推測や創作はせず、会話に書かれた内容のみを根拠にしてください。',
  ]
  if (opts.premises.trim()) {
    lines.push(
      '',
      '## 抽出条件（何を取り込むか／除外するか — 必ず判定すること）',
      opts.premises.trim(),
    )
  }
  if (opts.policies.trim()) {
    lines.push(
      '',
      '## アウトプット条件（出力時の整形ルール — 必ず守ること）',
      opts.policies.trim(),
    )
  }
  return lines.join('\n')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  signature: string,
  rawBody: string,
): boolean {
  if (!timestamp || !signature) return false
  const ageSec = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (Number.isNaN(ageSec) || ageSec > 60 * 5) return false
  const base = `v0:${timestamp}:${rawBody}`
  const hmac = crypto.createHmac('sha256', signingSecret).update(base).digest('hex')
  const expected = `v0=${hmac}`
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

// ─── Slack event payload (最小限の型定義) ────────────────────────────────────

type SlackEnvelope = {
  type: 'url_verification' | 'event_callback'
  challenge?: string
  team_id?: string
  event_id?: string
  event?: SlackEventReactionAdded | { type: string }
}

type SlackEventReactionAdded = {
  type: 'reaction_added'
  user: string
  reaction: string
  item: { type: 'message'; channel: string; ts: string }
}
