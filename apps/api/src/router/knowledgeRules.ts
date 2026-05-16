import { z } from 'zod'
import { router, protectedProcedure } from '../middleware/trpc'

// 組織の「前提」と「ポリシー」を保持・編集するルーター。
// AI 自動抽出時に system prompt に差し込んで、組織ごとの判断基準を効かせる。
export const knowledgeRulesRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const rulebook = await ctx.prisma.knowledgeRulebook.findUnique({
      where: { orgId: ctx.orgId },
    })
    return (
      rulebook ?? {
        id: null,
        orgId: ctx.orgId,
        premises: '',
        policies: '',
        updatedById: null,
        createdAt: null,
        updatedAt: null,
      }
    )
  }),

  update: protectedProcedure
    .input(
      z.object({
        premises: z.string().max(20000),
        policies: z.string().max(20000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.knowledgeRulebook.upsert({
        where: { orgId: ctx.orgId },
        create: {
          orgId: ctx.orgId,
          premises: input.premises,
          policies: input.policies,
          updatedById: ctx.userId,
        },
        update: {
          premises: input.premises,
          policies: input.policies,
          updatedById: ctx.userId,
        },
      })
    }),

  // システムプロンプトのプレビュー（保存せずに見るだけ）
  previewSystemPrompt: protectedProcedure
    .input(
      z
        .object({
          premises: z.string().optional(),
          policies: z.string().optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      let premises = input.premises
      let policies = input.policies
      if (premises === undefined || policies === undefined) {
        const rulebook = await ctx.prisma.knowledgeRulebook.findUnique({
          where: { orgId: ctx.orgId },
        })
        premises = premises ?? rulebook?.premises ?? ''
        policies = policies ?? rulebook?.policies ?? ''
      }
      return { systemPrompt: buildSystemPrompt({ premises, policies }) }
    }),
})

export function buildSystemPrompt(opts: { premises: string; policies: string }): string {
  const lines = [
    'あなたは社内ナレッジ整理の専門家です。チャットの会話から、再利用可能な FAQ 草稿を作ります。',
    '出力は JSON で、以下のキーを持ってください:',
    '- title: 80字以内の「質問形式」タイトル。必ず「？」で終わる疑問文にする（例: 「〜は？」「〜はどうすればいい？」「〜の方法は？」）。体言止め禁止。',
    '- body: 要点を「コンパクトに整形した」回答本文。Markdown 形式。冗長な接続詞・前置きは削る。',
    '  形式ルール:',
    '    1. 結論ファースト（最初に結果や結論を1行）',
    '    2. 詳細は箇条書き「- 」で要点列挙、複数ステップは番号付き「1. 2. 3.」',
    '    3. 数値・期限・担当者・URL・チャンネル名などの「具体情報」を必ず明示',
    '    4. 1項目あたり1行・体言止め推奨。冗長な文末は省く',
    '    5. 関連グループは【見出し】で区切る（例: 【手順】【国内】【特例】）',
    '    6. 200〜300字を目安に圧縮。原文の言い回しに引きずられない',
    '- department: 営業/人事/経理/法務/IT/プロダクト/その他 から1つ',
    '- category: department の中の小分類（20字以内、体言止め）',
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
