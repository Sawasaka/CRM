import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../middleware/trpc'

// 連携対象として登録した Google Drive フォルダの管理。
// 同期ジョブは別途 services/driveSync 配下が読み取る。
export const driveFoldersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.driveFolderConnection.findMany({
      where: { orgId: ctx.orgId },
      orderBy: [{ enabled: 'desc' }, { updatedAt: 'desc' }],
    })
  }),

  add: protectedProcedure
    .input(
      z.object({
        folderId: z.string().min(1),
        folderName: z.string().min(1),
        folderUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.driveFolderConnection.upsert({
        where: { orgId_folderId: { orgId: ctx.orgId, folderId: input.folderId } },
        create: {
          orgId: ctx.orgId,
          folderId: input.folderId,
          folderName: input.folderName,
          folderUrl: input.folderUrl,
          enabled: true,
        },
        update: {
          folderName: input.folderName,
          folderUrl: input.folderUrl,
          enabled: true,
        },
      })
    }),

  setEnabled: protectedProcedure
    .input(z.object({ id: z.string(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.driveFolderConnection.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true },
      })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
      return ctx.prisma.driveFolderConnection.update({
        where: { id: input.id },
        data: { enabled: input.enabled },
      })
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.driveFolderConnection.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        select: { id: true },
      })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
      await ctx.prisma.driveFolderConnection.delete({ where: { id: input.id } })
      return { ok: true }
    }),

  // Drive内をブラウズ。共有ドライブ + マイドライブ + サブフォルダを返す。
  // parentId 未指定: 共有ドライブ + マイドライブのトップ
  // parentId 指定: そのフォルダ配下のサブフォルダ
  browse: protectedProcedure
    .input(
      z
        .object({
          parentId: z.string().optional(),
          driveId: z.string().optional(), // 共有ドライブの場合に指定
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const { createOAuth2Client, listSharedDrives, listSubFolders } = await import(
        '@bgm/integrations-google'
      )
      // 組織の認証済み Google アカウントを利用 (drive.readonly scope 持ち)
      const account = await ctx.prisma.userGoogleAccount.findFirst({
        where: {
          user: { orgId: ctx.orgId },
          scope: { contains: 'drive.readonly' },
        },
        orderBy: { updatedAt: 'desc' },
      })
      if (!account?.accessToken) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Drive 連携アカウントがありません。Google を連携してください。',
        })
      }
      const auth = createOAuth2Client(
        account.accessToken,
        account.refreshToken ?? undefined,
      )

      try {
        if (!input.parentId) {
          // ルート: マイドライブ直下のフォルダ + 共有ドライブ一覧
          const [myFolders, sharedDrives] = await Promise.all([
            listSubFolders(auth, 'root'),
            listSharedDrives(auth),
          ])
          return {
            sharedDrives: sharedDrives.map((d) => ({
              id: d.id ?? '',
              name: d.name ?? '(無題のドライブ)',
            })),
            folders: myFolders.map((f) => ({
              id: f.id ?? '',
              name: f.name ?? '(無題のフォルダ)',
              webViewLink: f.webViewLink ?? null,
            })),
          }
        }
        // サブフォルダ
        const folders = await listSubFolders(auth, input.parentId, input.driveId)
        return {
          sharedDrives: [] as Array<{ id: string; name: string }>,
          folders: folders.map((f) => ({
            id: f.id ?? '',
            name: f.name ?? '(無題のフォルダ)',
            webViewLink: f.webViewLink ?? null,
          })),
        }
      } catch (e) {
        console.error('drive browse error', e)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Drive のブラウズに失敗しました',
        })
      }
    }),

  // 同期トリガ。即時 inline 実行（軽量フォルダ前提）。
  // 大規模ファイル想定時は後続でキュー化する。
  triggerSync: protectedProcedure
    .input(z.object({ id: z.string().optional() }).default({}))
    .mutation(async ({ ctx, input }) => {
      const { syncDriveFolder } = await import('../services/driveSync.js')
      const folders = await ctx.prisma.driveFolderConnection.findMany({
        where: {
          orgId: ctx.orgId,
          enabled: true,
          ...(input.id && { id: input.id }),
        },
      })
      const results = []
      for (const f of folders) {
        try {
          const r = await syncDriveFolder({ orgId: ctx.orgId, folderConnectionId: f.id })
          results.push({ id: f.id, ...r })
        } catch (e) {
          console.error('drive sync trigger error', f.id, e)
          results.push({ id: f.id, ok: false as const, reason: 'exception' as const })
        }
      }
      return { synced: results.length, results }
    }),
})
