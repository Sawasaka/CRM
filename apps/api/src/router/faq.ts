import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure, managerProcedure } from '../middleware/trpc'

const faqStatusEnum = z.enum(['CANDIDATE', 'PUBLISHED', 'ARCHIVED', 'REJECTED'])
const faqSourceEnum = z.enum(['MANUAL', 'SLACK', 'GOOGLE_CHAT', 'DRIVE'])

export const faqRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: faqStatusEnum.optional(),
          sourceType: faqSourceEnum.optional(),
          department: z.string().optional(),
          category: z.string().optional(),
          query: z.string().optional(),
          limit: z.number().int().min(1).max(200).default(100),
          cursor: z.string().optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        orgId: ctx.orgId,
        ...(input.status && { status: input.status }),
        ...(input.sourceType && { sourceType: input.sourceType }),
        ...(input.department && { department: input.department }),
        ...(input.category && { category: input.category }),
        ...(input.query && {
          OR: [
            { title: { contains: input.query, mode: 'insensitive' as const } },
            { body: { contains: input.query, mode: 'insensitive' as const } },
            { department: { contains: input.query, mode: 'insensitive' as const } },
            { category: { contains: input.query, mode: 'insensitive' as const } },
          ],
        }),
      }
      const items = await ctx.prisma.faqEntry.findMany({
        where,
        include: { approvedBy: { select: { id: true, name: true } } },
        orderBy: [
          { status: 'asc' }, // CANDIDATE が先に来るよう、後で UI 側でも並べ替え可
          { hits: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: input.limit + 1,
        ...(input.cursor && { skip: 1, cursor: { id: input.cursor } }),
      })
      const hasMore = items.length > input.limit
      const sliced = hasMore ? items.slice(0, input.limit) : items
      const last = sliced[sliced.length - 1]
      return {
        items: sliced,
        nextCursor: hasMore && last ? last.id : null,
      }
    }),

  // ステータス別件数 (バッジ表示用)
  counts: protectedProcedure.query(async ({ ctx }) => {
    const grouped = await ctx.prisma.faqEntry.groupBy({
      by: ['status'],
      where: { orgId: ctx.orgId },
      _count: { _all: true },
    })
    const out: Record<string, number> = { CANDIDATE: 0, PUBLISHED: 0, ARCHIVED: 0, REJECTED: 0 }
    for (const g of grouped) out[g.status] = g._count._all
    return out
  }),

  // カテゴリ一覧（重複排除）
  categories: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.faqEntry.findMany({
      where: { orgId: ctx.orgId, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    })
    return rows.map((r) => r.category!).filter(Boolean)
  }),

  // 部門ごとのFAQ件数 (左サイドナビ用)
  departmentCounts: protectedProcedure.query(async ({ ctx }) => {
    const grouped = await ctx.prisma.faqEntry.groupBy({
      by: ['department', 'status'],
      where: { orgId: ctx.orgId },
      _count: { _all: true },
    })
    // [{ department: '営業', status: 'PUBLISHED', _count: { _all: 3 } }, ...]
    return grouped.map((g) => ({
      department: g.department ?? null,
      status: g.status,
      count: g._count._all,
    }))
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.faqEntry.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        include: { approvedBy: { select: { id: true, name: true } } },
      })
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' })
      return item
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        body: z.string().min(1),
        department: z.string().optional(),
        category: z.string().optional(),
        sourceType: faqSourceEnum.default('MANUAL'),
        sourceUrl: z.string().url().optional(),
        sourceMeta: z.record(z.string(), z.any()).optional(),
        publishImmediately: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const status = input.publishImmediately ? 'PUBLISHED' : 'CANDIDATE'
      return ctx.prisma.faqEntry.create({
        data: {
          orgId: ctx.orgId,
          title: input.title,
          body: input.body,
          department: input.department,
          category: input.category,
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl,
          sourceMeta: input.sourceMeta as never,
          status,
          ...(status === 'PUBLISHED' && {
            approvedById: ctx.userId,
            approvedAt: new Date(),
          }),
        },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(500).optional(),
        body: z.string().min(1).optional(),
        department: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.faqEntry.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true },
      })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
      const { id, ...rest } = input
      return ctx.prisma.faqEntry.update({ where: { id }, data: rest })
    }),

  // 候補→公式への承認 (Manager 以上)
  approve: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.faqEntry.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true },
      })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
      return ctx.prisma.faqEntry.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED',
          approvedById: ctx.userId,
          approvedAt: new Date(),
        },
      })
    }),

  reject: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.faqEntry.update({
        where: { id: input.id },
        data: { status: 'REJECTED' },
      })
    }),

  archive: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.faqEntry.update({
        where: { id: input.id },
        data: { status: 'ARCHIVED' },
      })
    }),

  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.faqEntry.delete({ where: { id: input.id } })
      return { ok: true }
    }),

  // 参照カウントアップ（Bot 応答時などに使用）
  incrementHit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.faqEntry.update({
        where: { id: input.id },
        data: { hits: { increment: 1 } },
      })
    }),

  // FAQ を AI で再生成
  // 既存の title + body を組織のルールブック（前提・ポリシー）に従って整形し直し、
  // department / category / body を上書きする。
  regenerate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const faq = await ctx.prisma.faqEntry.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      })
      if (!faq) throw new TRPCError({ code: 'NOT_FOUND' })

      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'OPENAI_API_KEY が未設定のため再生成できません',
        })
      }

      const rulebook = await ctx.prisma.knowledgeRulebook.findUnique({
        where: { orgId: ctx.orgId },
      })

      const systemLines = [
        'あなたは社内ナレッジ整理の専門家です。既存の FAQ 草稿を、組織のルールに従って整形し直してください。',
        '出力は JSON で、以下のキーを持つ:',
        '- title: 80字以内の「質問形式」タイトル。必ず「？」で終わる疑問文にする（例: 「〜は？」「〜はどうすればいい？」）。体言止め禁止。',
        '- body: 要点を「コンパクトに整形した」回答本文。Markdown 形式。',
        '  形式ルール: 1) 結論ファースト 2) 箇条書き「- 」/ 番号付きステップ「1. 2. 3.」 3) 数値・期限・担当者を明示 4) 体言止め推奨 5) 【見出し】で区切る 6) 200-300字以内に圧縮',
        '- department: 営業/人事/経理/法務/IT/プロダクト/その他 から1つ',
        '- category: department の中分類（20字以内・体言止め）',
        '- tags: 3〜5個のキーワード配列',
        '元の FAQ にない情報を新たに追加・推測しないでください。表現を整え、アウトプット条件違反箇所を修正してください。',
      ]
      if (rulebook?.premises?.trim()) {
        systemLines.push(
          '',
          '## 抽出条件（取り込み済の前提として参照）',
          rulebook.premises.trim(),
        )
      }
      if (rulebook?.policies?.trim()) {
        systemLines.push(
          '',
          '## アウトプット条件（出力時の整形ルール — 必ず守ること）',
          rulebook.policies.trim(),
        )
      }

      const userContent = [
        `# 既存タイトル\n${faq.title}`,
        `# 既存本文\n${faq.body}`,
        faq.department ? `# 既存部門\n${faq.department}` : '',
        faq.category ? `# 既存カテゴリ\n${faq.category}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')

      try {
        const { openai } = await import('@bgm/ai')
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemLines.join('\n') },
            { role: 'user', content: userContent },
          ],
        })
        const raw = completion.choices[0]?.message?.content ?? '{}'
        const parsed = JSON.parse(raw) as {
          title?: string
          body?: string
          department?: string
          category?: string
        }

        return ctx.prisma.faqEntry.update({
          where: { id: faq.id },
          data: {
            title: (parsed.title ?? faq.title).slice(0, 500),
            body: parsed.body ?? faq.body,
            department: parsed.department ?? faq.department,
            category: parsed.category ?? faq.category,
          },
        })
      } catch (e) {
        console.error('faq regenerate failed', e)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI 再生成に失敗しました',
        })
      }
    }),
})
