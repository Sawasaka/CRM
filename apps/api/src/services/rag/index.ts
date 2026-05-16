import { prisma } from '@bgm/db'
import { generateEmbedding, openai } from '@bgm/ai'

// 検索結果の1件を表す共通形
export interface RagHit {
  source: 'faq' | 'drive'
  id: string
  title: string
  body: string
  url: string | null
  score: number
}

const FAQ_TABLE = '"FaqEntry"'
const CHUNK_TABLE = '"KnowledgeChunk"'

/**
 * テキストクエリで FAQ と Drive ドキュメントチャンクを横断検索する。
 * pgvector の cosine 類似度を使う。
 */
export async function searchKnowledge(opts: {
  orgId: string
  query: string
  limit?: number
  includeFaq?: boolean
  includeDrive?: boolean
}): Promise<RagHit[]> {
  const { orgId, query, includeFaq = true, includeDrive = true } = opts
  const limit = opts.limit ?? 8

  if (!query.trim()) return []

  const embedding = await generateEmbedding(query)
  // pgvector は文字列 '[0.1,0.2,...]' 形式で受け取る
  const vec = `[${embedding.join(',')}]`

  const hits: RagHit[] = []

  if (includeFaq) {
    // FaqEntry: status=PUBLISHED のみ
    const rows = await prisma.$queryRawUnsafe<
      Array<{ id: string; title: string; body: string; sourceUrl: string | null; score: number }>
    >(
      `SELECT "id", "title", "body", "sourceUrl", 1 - ("embedding" <=> $1::vector) AS score
       FROM ${FAQ_TABLE}
       WHERE "orgId" = $2 AND "status" = 'PUBLISHED' AND "embedding" IS NOT NULL
       ORDER BY "embedding" <=> $1::vector
       LIMIT $3`,
      vec,
      orgId,
      limit,
    )
    for (const r of rows) {
      hits.push({
        source: 'faq',
        id: r.id,
        title: r.title,
        body: r.body,
        url: r.sourceUrl,
        score: Number(r.score),
      })
    }
  }

  if (includeDrive) {
    const rows = await prisma.$queryRawUnsafe<
      Array<{
        id: string
        content: string
        docFileName: string
        docFileUrl: string
        score: number
      }>
    >(
      `SELECT c."id", c."content", d."fileName" AS "docFileName", d."fileUrl" AS "docFileUrl",
              1 - (c."embedding" <=> $1::vector) AS score
       FROM ${CHUNK_TABLE} c
       JOIN "KnowledgeDoc" d ON d."id" = c."docId"
       WHERE d."orgId" = $2 AND c."embedding" IS NOT NULL
       ORDER BY c."embedding" <=> $1::vector
       LIMIT $3`,
      vec,
      orgId,
      limit,
    )
    for (const r of rows) {
      hits.push({
        source: 'drive',
        id: r.id,
        title: r.docFileName,
        body: r.content,
        url: r.docFileUrl,
        score: Number(r.score),
      })
    }
  }

  // スコア降順で全体ソートして上位 limit 件を返す
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * 検索ヒットを LLM に渡して回答を生成する。
 * 出典は本文に [1], [2], ... の形で挿入される。
 */
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
    const answer = '関連するチームナレッジが見つかりませんでした。手動でFAQを追加するか、Drive連携・Slack履歴の同期を確認してください。'
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
    .map((h, i) => `[${i + 1}] (${h.source === 'faq' ? '公式FAQ' : 'Drive'}: ${h.title})\n${h.body.slice(0, 1200)}`)
    .join('\n\n')

  const completion = await openai.chat.completions.create({
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
      {
        role: 'user',
        content: `質問: ${query}\n\n参照ソース:\n${context}`,
      },
    ],
  })

  const answer = completion.choices[0]?.message?.content ?? '（回答生成に失敗しました）'
  const topScore = hits[0]?.score ?? 0

  // FAQ ヒットがあった場合は hits をインクリメント
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

/**
 * FaqEntry に embedding が無いものを bulk で生成する（バックグラウンドジョブから呼ぶ）。
 */
export async function backfillFaqEmbeddings(orgId: string, batchSize = 20): Promise<number> {
  const candidates = await prisma.$queryRawUnsafe<Array<{ id: string; title: string; body: string }>>(
    `SELECT "id", "title", "body" FROM ${FAQ_TABLE}
     WHERE "orgId" = $1 AND "embedding" IS NULL
     LIMIT $2`,
    orgId,
    batchSize,
  )
  if (candidates.length === 0) return 0
  for (const c of candidates) {
    const text = `${c.title}\n\n${c.body}`.slice(0, 8000)
    const vec = await generateEmbedding(text)
    const vecStr = `[${vec.join(',')}]`
    await prisma.$executeRawUnsafe(
      `UPDATE ${FAQ_TABLE} SET "embedding" = $1::vector WHERE "id" = $2`,
      vecStr,
      c.id,
    )
  }
  return candidates.length
}
