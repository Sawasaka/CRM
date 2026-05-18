// Slack webhook など web 側エンドポイントから RAG 検索＋回答生成を呼ぶためのブリッジ。
// 実装は apps/api 側 services/rag と等価。共通化は packages 化を待つ。

import { prisma } from '@bgm/db'
import OpenAI from 'openai'

let openai: OpenAI | null = null

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
  openai ??= new OpenAI({ apiKey })
  return openai
}

async function generateEmbedding(text: string): Promise<number[]> {
  const r = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-large',
    input: text.replace(/\n/g, ' '),
    dimensions: 1536,
  })
  return r.data[0]?.embedding ?? []
}

export interface RagHit {
  source: 'faq' | 'drive'
  id: string
  title: string
  body: string
  url: string | null
  score: number
}

export async function searchKnowledge(opts: {
  orgId: string
  query: string
  limit?: number
}): Promise<RagHit[]> {
  const { orgId, query } = opts
  const limit = opts.limit ?? 6
  if (!query.trim()) return []

  const embedding = await generateEmbedding(query)
  const vec = `[${embedding.join(',')}]`

  const faqRows = await prisma.$queryRawUnsafe<
    Array<{ id: string; title: string; body: string; sourceUrl: string | null; score: number }>
  >(
    `SELECT "id","title","body","sourceUrl", 1 - ("embedding" <=> $1::vector) AS score
     FROM "FaqEntry"
     WHERE "orgId" = $2 AND "status" = 'PUBLISHED' AND "embedding" IS NOT NULL
     ORDER BY "embedding" <=> $1::vector
     LIMIT $3`,
    vec,
    orgId,
    limit
  )

  const driveRows = await prisma.$queryRawUnsafe<
    Array<{ id: string; content: string; docFileName: string; docFileUrl: string; score: number }>
  >(
    `SELECT c."id", c."content", d."fileName" AS "docFileName", d."fileUrl" AS "docFileUrl",
            1 - (c."embedding" <=> $1::vector) AS score
     FROM "KnowledgeChunk" c
     JOIN "KnowledgeDoc" d ON d."id" = c."docId"
     WHERE d."orgId" = $2 AND c."embedding" IS NOT NULL
     ORDER BY c."embedding" <=> $1::vector
     LIMIT $3`,
    vec,
    orgId,
    limit
  )

  const hits: RagHit[] = [
    ...faqRows.map((r) => ({
      source: 'faq' as const,
      id: r.id,
      title: r.title,
      body: r.body,
      url: r.sourceUrl,
      score: Number(r.score),
    })),
    ...driveRows.map((r) => ({
      source: 'drive' as const,
      id: r.id,
      title: r.docFileName,
      body: r.content,
      url: r.docFileUrl,
      score: Number(r.score),
    })),
  ]
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

export async function answerWithRag(opts: {
  orgId: string
  query: string
  userId?: string
  slackTs?: string
}): Promise<{
  answer: string
  hits: RagHit[]
  confidence: number
  ragQueryId: string
}> {
  const { orgId, query, userId, slackTs } = opts
  const hits = await searchKnowledge({ orgId, query, limit: 6 })

  if (hits.length === 0) {
    const answer =
      '関連するチームナレッジが見つかりませんでした。手動でFAQを追加するか、Drive連携・Slack履歴の同期を確認してください。'
    const saved = await prisma.ragQuery.create({
      data: {
        orgId,
        userId: userId ?? null,
        query,
        answer,
        sources: [],
        confidence: 0,
        slackTs: slackTs ?? null,
      },
    })
    return { answer, hits: [], confidence: 0, ragQueryId: saved.id }
  }

  const context = hits
    .map(
      (h, i) =>
        `[${i + 1}] (${h.source === 'faq' ? '公式FAQ' : 'Drive'}: ${h.title})\n${h.body.slice(0, 1200)}`
    )
    .join('\n\n')

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: [
          'あなたは社内ナレッジ Bot です。提供された参照ソースの内容のみに基づいて、簡潔かつ正確に日本語で回答してください。',
          '回答内では参照番号を [1] のように本文に埋め込んでください。',
          'ソースに無い情報は推測せず、わからない場合はその旨を伝えてください。',
        ].join('\n'),
      },
      { role: 'user', content: `質問: ${query}\n\n参照ソース:\n${context}` },
    ],
  })

  const answer = completion.choices[0]?.message?.content ?? '（回答生成に失敗しました）'
  const topScore = hits[0]?.score ?? 0

  const faqHits = hits.filter((h) => h.source === 'faq')
  if (faqHits.length > 0) {
    await prisma.faqEntry.updateMany({
      where: { id: { in: faqHits.map((h) => h.id) } },
      data: { hits: { increment: 1 } },
    })
  }

  const saved = await prisma.ragQuery.create({
    data: {
      orgId,
      userId: userId ?? null,
      query,
      answer,
      sources: hits.map((h) => ({
        source: h.source,
        id: h.id,
        title: h.title,
        url: h.url,
        score: h.score,
      })) as never,
      confidence: topScore,
      slackTs: slackTs ?? null,
    },
  })

  return { answer, hits, confidence: topScore, ragQueryId: saved.id }
}
