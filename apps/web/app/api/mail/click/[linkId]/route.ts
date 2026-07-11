import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * FDE CRM 中継URLのクリックハンドラ。
 *
 * フロー:
 *   1. 配信メール内のリンクは送信時に https://track.bgm.app/c/<linkId> に置換されている
 *   2. 受信者がクリック → このエンドポイントにヒット
 *   3. linkId から CampaignLink を取得し LinkClick を記録
 *   4. 元URLへ 302 リダイレクト
 *
 * Phase 2 (本番) で必要なテーブル設計:
 *   model CampaignLink { id, campaignId, kind, label, originalUrl, createdAt }
 *   model LinkClick    { id, linkId, contactId?, userAgent, ip, clickedAt }
 *
 * 本ハンドラは現状モック動作。linkId が見つからなければ 404、
 * 見つかれば originalUrl に 302 する (記録は console.log のみ)。
 */
export async function GET(req: Request, ctx: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await ctx.params

  // TODO: DB から取得 (Phase 2)
  //   const link = await prisma.campaignLink.findUnique({ where: { id: linkId } })
  //   if (!link) return new Response('not found', { status: 404 })
  //   await prisma.linkClick.create({ data: { linkId, ...trackingMeta(req) } })

  // 現状はモック実装のため、リファラーや UA をログに出すだけ
  console.log('[mail/click]', {
    linkId,
    ua: req.headers.get('user-agent'),
    referer: req.headers.get('referer'),
    at: new Date().toISOString(),
  })

  // モックでは元URLに戻すロジックがないため、固定で FDE CRM トップへ誘導。
  // 本番では link.originalUrl にリダイレクト。
  return NextResponse.redirect('https://bgm.app/', 302)
}
