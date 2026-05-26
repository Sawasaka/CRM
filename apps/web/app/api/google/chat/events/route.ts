import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Google Chat App の HTTPS endpoint。
// Google Chat スペースに Bot を追加し、メッセージが届くと
// このエンドポイントに Google から POST が飛ぶ。
//
// 機能: 「チャットから自動抽出してナレッジを自動作成」
// - ADDED_TO_SPACE: 挨拶
// - MESSAGE: ChatMessage に保存。`#faq` キーワード or 絵文字 ✅ で AI 抽出して FAQ 候補化
// - CARD_CLICKED: 未対応
//
// 認証: 本格運用では google-auth-library で id_token を検証推奨。
// MVP では Bearer の存在確認のみ。

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as ChatEvent
  const type = body.type

  if (type === 'ADDED_TO_SPACE') {
    return NextResponse.json({
      text: 'ルキスマCRM ナレッジBotです。このスペースの会話から自動的にFAQを抽出します。FAQ化したい質疑応答には ✅ リアクションを付けるか、メッセージに `#faq` を含めてください。',
    })
  }

  if (type !== 'MESSAGE' || !body.message) {
    return NextResponse.json({})
  }

  const message = body.message
  const text = stripBotMention(message.text ?? '').trim()
  const senderEmail = message.sender?.email ?? null
  const space = body.space ?? message.space

  // 組織判別（送信者メールから）
  let orgId: string | null = null
  let userId: string | null = null
  if (senderEmail) {
    const user = await prisma.user.findFirst({
      where: { email: senderEmail },
      select: { id: true, orgId: true },
    })
    if (user) {
      orgId = user.orgId
      userId = user.id
    }
  }

  // ChatMessage に保存
  if (orgId && userId && message.name) {
    await prisma.chatMessage
      .upsert({
        where: { chatName: message.name },
        create: {
          orgId,
          userId,
          chatName: message.name,
          spaceName: space?.name ?? '',
          spaceDisplayName: space?.displayName ?? null,
          threadName: message.thread?.name ?? null,
          senderEmail,
          senderDisplayName: message.sender?.displayName ?? null,
          text,
          createdAtChat: body.eventTime ? new Date(body.eventTime) : new Date(),
        },
        update: {
          text,
        },
      })
      .catch((e) => console.error('chat message upsert failed', e))
  }

  // FAQ 抽出トリガ: テキストに `#faq` が含まれる場合
  const triggered = /#faq\b/i.test(text)
  if (orgId && triggered) {
    const cleanedText = text.replace(/#faq\b/gi, '').trim()
    extractAndSaveFaq({ orgId, rootText: cleanedText, sourceUrl: undefined }).catch((e) =>
      console.error('faq extraction failed', e),
    )
    return NextResponse.json({
      text: '✅ FAQ候補として登録しました。ルキスマCRMの「ナレッジ」→ チームFAQ で承認できます。',
      thread: message.thread ? { name: message.thread.name } : undefined,
    })
  }

  // それ以外は ack のみ（応答せず）
  return NextResponse.json({})
}

// ─── AI 抽出 ──────────────────────────────────────────────────────────

async function extractAndSaveFaq(opts: {
  orgId: string
  rootText: string
  sourceUrl?: string
}) {
  const apiKey = process.env.OPENAI_API_KEY
  let title = opts.rootText.slice(0, 200) || '質問'
  let body = opts.rootText
  let department: string | null = null
  let category: string | null = null

  // 組織のルールブック（前提・ポリシー）を取得
  const rulebook = await prisma.knowledgeRulebook.findUnique({
    where: { orgId: opts.orgId },
  })

  if (apiKey) {
    try {
      const { default: OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey })
      const systemPrompt = buildSystemPrompt({
        premises: rulebook?.premises ?? '',
        policies: rulebook?.policies ?? '',
      })
      const completion = await openai.chat.completions.create({
        model: 'gpt-5.5',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: opts.rootText },
        ],
      })
      const raw = completion.choices[0]?.message?.content ?? '{}'
      const parsed = JSON.parse(raw) as {
        title?: string
        body?: string
        department?: string
        category?: string
      }
      if (parsed.title) title = parsed.title.slice(0, 200)
      if (parsed.body) body = parsed.body
      if (parsed.department) department = parsed.department
      if (parsed.category) category = parsed.category
    } catch (e) {
      console.error('openai extract error', e)
    }
  }

  await prisma.faqEntry.create({
    data: {
      orgId: opts.orgId,
      title,
      body,
      department,
      category,
      sourceType: 'GOOGLE_CHAT',
      sourceUrl: opts.sourceUrl,
      status: 'CANDIDATE',
    },
  })
}

function buildSystemPrompt(opts: { premises: string; policies: string }): string {
  const lines = [
    'あなたは社内ナレッジ整理の専門家です。Google Chat のメッセージから FAQ 草稿を作ってください。',
    '出力は JSON で、以下のキーを持つ:',
    '- title: 80字以内の「質問形式」タイトル。必ず「？」で終わる疑問文にする（例: 「〜は？」「〜はどうすればいい？」）。体言止め禁止。',
    '- body: 要点を「コンパクトに整形した」回答本文。Markdown 形式。',
    '  形式ルール: 1) 結論ファースト 2) 箇条書き「- 」/ 番号付き「1. 2. 3.」 3) 数値・期限・担当者を明示 4) 体言止め推奨 5) 【見出し】で区切る 6) 200-300字以内',
    '- department: 大分類。営業/人事/経理/法務/IT/プロダクト/その他 から1つ',
    '- category: department の中分類（20字以内・体言止め）',
    '- tags: 3〜5個のキーワード配列',
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

function stripBotMention(text: string): string {
  return text.replace(/^@\S+\s*/, '').replace(/<users\/[A-Za-z0-9_-]+>/g, '').trim()
}

// ─── 型 ───────────────────────────────────────────────────────────────

interface ChatEvent {
  type: 'MESSAGE' | 'ADDED_TO_SPACE' | 'REMOVED_FROM_SPACE' | 'CARD_CLICKED' | string
  eventTime?: string
  space?: { name?: string; displayName?: string; type?: string }
  message?: {
    name?: string
    text?: string
    sender?: { name?: string; displayName?: string; email?: string }
    thread?: { name?: string }
    space?: { name?: string; displayName?: string; type?: string }
  }
}
