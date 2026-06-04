'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  X,
  Loader2,
  Folder,
  HardDrive,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import { ObsButton } from '@/components/obsidian'
import { trpc } from '@/lib/trpc/client'

// Drive 内の共有ドライブ／フォルダから連携対象を選ぶモーダル。
// パンくず付きで階層をブラウズして、選んだ場所を「このフォルダを連携」で確定する。
//
// データ取得: trpc.driveFolders.browse({ parentId, driveId })
//   - parentId 未指定: マイドライブ直下 + 共有ドライブ一覧を返す
//   - parentId 指定:   その配下のフォルダ一覧

type Crumb = {
  id: string | null // null = ルート
  name: string
  driveId?: string // 共有ドライブを辿っている場合
}

export function DrivePickerModal({
  open,
  onClose,
  onPicked,
}: {
  open: boolean
  onClose: () => void
  onPicked: () => void // 追加完了時に親で list を refetch する用
}) {
  const { data: session } = useSession()
  const userId = (session as unknown as { userId?: string } | null)?.userId
  const [stack, setStack] = useState<Crumb[]>([{ id: null, name: 'マイドライブ・共有ドライブ' }])
  const current = stack[stack.length - 1]!
  const isRoot = current.id === null

  const browseQuery = trpc.driveFolders.browse.useQuery(
    {
      parentId: current.id ?? undefined,
      driveId: current.driveId,
    },
    {
      enabled: open && !!userId,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  const utils = trpc.useUtils()
  const addMutation = trpc.driveFolders.add.useMutation({
    onSuccess: async () => {
      await utils.driveFolders.list.invalidate()
      onPicked()
      onClose()
      // 次回開いたときルートに戻す
      setStack([{ id: null, name: 'マイドライブ・共有ドライブ' }])
    },
  })

  const enterFolder = (c: Crumb) => {
    setStack((prev) => [...prev, c])
  }
  const goBack = (idx: number) => {
    setStack((prev) => prev.slice(0, idx + 1))
  }

  const data = browseQuery.data

  // 「このフォルダを連携」ボタン: ルート以外で有効
  const canPickHere = !isRoot && current.id
  const handlePickHere = () => {
    if (!canPickHere || !current.id) return
    addMutation.mutate({
      folderId: current.id,
      folderName: stack
        .slice(1)
        .map((c) => c.name)
        .join(' / '),
      folderUrl: `https://drive.google.com/drive/folders/${current.id}`,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-[var(--radius-obs-lg)]"
              style={{
                backgroundColor: 'var(--color-obs-surface)',
                boxShadow:
                  '0 24px 64px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {/* ヘッダ */}
              <div
                className="flex items-start justify-between gap-3 px-5 py-4"
                style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.12)' }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(171,199,255,0.10)' }}
                  >
                    <HardDrive size={16} style={{ color: 'var(--color-obs-primary)' }} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="text-[15px] font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      連携先のフォルダを選択
                    </h2>
                    <p
                      className="text-[11.5px] mt-0.5 leading-relaxed"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      共有ドライブ・マイドライブから連携したいフォルダを選んでください。
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* パンくず */}
              <div
                className="flex items-center gap-1 px-5 py-2.5 flex-wrap text-[11.5px]"
                style={{
                  backgroundColor: 'var(--color-obs-surface-low)',
                  color: 'var(--color-obs-text-muted)',
                  boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)',
                }}
              >
                {stack.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    {i > 0 && (
                      <ChevronRight
                        size={11}
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      />
                    )}
                    <button
                      onClick={() => goBack(i)}
                      className="px-1.5 h-6 rounded-[var(--radius-obs-sm)] transition-colors hover:bg-[var(--color-obs-surface-high)] truncate max-w-[200px]"
                      style={{
                        color:
                          i === stack.length - 1
                            ? 'var(--color-obs-text)'
                            : 'var(--color-obs-text-muted)',
                        fontWeight: i === stack.length - 1 ? 600 : 400,
                      }}
                      title={c.name}
                    >
                      {c.name}
                    </button>
                  </span>
                ))}
              </div>

              {/* 一覧 */}
              <div className="flex-1 overflow-y-auto">
                {!userId ? (
                  <DriveAccessError message="Google Drive を使うには、先に連携設定から Google にログインしてください。" />
                ) : browseQuery.isLoading ? (
                  <div
                    className="flex items-center justify-center py-16 gap-2"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[12.5px]">読み込み中...</span>
                  </div>
                ) : browseQuery.error ? (
                  <DriveAccessError message={browseQuery.error.message} />
                ) : (
                  <div className="py-2">
                    {/* ルート時: 共有ドライブ */}
                    {isRoot && (data?.sharedDrives.length ?? 0) > 0 && (
                      <SectionHeader>共有ドライブ</SectionHeader>
                    )}
                    {isRoot &&
                      data?.sharedDrives.map((d) => (
                        <BrowseRow
                          key={`drive-${d.id}`}
                          icon={HardDrive}
                          name={d.name}
                          onClick={() =>
                            enterFolder({
                              id: d.id,
                              name: d.name,
                              driveId: d.id, // 共有ドライブ配下を辿る
                            })
                          }
                        />
                      ))}

                    {/* マイドライブ / サブフォルダ */}
                    {(data?.folders.length ?? 0) > 0 && (
                      <SectionHeader>
                        {isRoot ? 'マイドライブ' : 'サブフォルダ'}
                      </SectionHeader>
                    )}
                    {data?.folders.map((f) => (
                      <BrowseRow
                        key={`folder-${f.id}`}
                        icon={Folder}
                        name={f.name}
                        onClick={() =>
                          enterFolder({
                            id: f.id,
                            name: f.name,
                            driveId: current.driveId, // 共有ドライブの中で辿るときは引き継ぎ
                          })
                        }
                      />
                    ))}

                    {/* 空状態 */}
                    {!browseQuery.isLoading &&
                      (data?.folders.length ?? 0) === 0 &&
                      (data?.sharedDrives.length ?? 0) === 0 && (
                        <div
                          className="px-5 py-10 text-center text-[13px]"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          このフォルダ内にサブフォルダがありません
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* フッタ */}
              <div
                className="flex items-center justify-between gap-3 px-5 py-3"
                style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.12)' }}
              >
                <span
                  className="text-[11.5px] truncate"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {canPickHere
                    ? `選択中: ${stack
                        .slice(1)
                        .map((c) => c.name)
                        .join(' / ')}`
                    : 'フォルダを開いてから連携できます'}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <ObsButton variant="ghost" size="sm" onClick={onClose}>
                    キャンセル
                  </ObsButton>
                  <ObsButton
                    variant="primary"
                    size="sm"
                    onClick={handlePickHere}
                    disabled={!canPickHere || addMutation.isPending}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {addMutation.isPending ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      このフォルダを連携
                    </span>
                  </ObsButton>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function DriveAccessError({ message }: { message: string }) {
  return (
    <div
      className="m-5 p-4 rounded-[var(--radius-obs-md)] flex items-start gap-2"
      style={{
        backgroundColor: 'rgba(255,184,107,0.08)',
        boxShadow: 'inset 0 0 0 1px rgba(255,184,107,0.28)',
      }}
    >
      <AlertTriangle
        size={14}
        style={{ color: 'var(--color-obs-middle)', marginTop: 2 }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-medium"
          style={{ color: 'var(--color-obs-text)' }}
        >
          Drive にアクセスできませんでした
        </p>
        <p
          className="text-[11.5px] mt-1 leading-relaxed"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          {message}
        </p>
        <a
          href="/subscription?tab=integrations"
          className="inline-flex items-center gap-1 mt-3 text-[12px] font-medium"
          style={{ color: 'var(--color-obs-primary)' }}
        >
          連携設定を開く
        </a>
      </div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-5 py-2 text-[10.5px] font-semibold tracking-[0.1em] uppercase"
      style={{ color: 'var(--color-obs-text-subtle)' }}
    >
      {children}
    </div>
  )
}

function BrowseRow({
  icon: Icon,
  name,
  onClick,
}: {
  icon: React.ElementType
  name: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors"
      style={{ color: 'var(--color-obs-text)' }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--color-obs-surface-high)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
    >
      <Icon size={14} style={{ color: 'var(--color-obs-primary)', flexShrink: 0 }} />
      <span className="text-[13px] truncate flex-1">{name}</span>
      <ChevronRight
        size={12}
        style={{ color: 'var(--color-obs-text-subtle)', flexShrink: 0 }}
      />
    </button>
  )
}

// 親コンポーネントから使う「フォルダを選択」ボタン
export function DrivePickerLauncher({
  label = 'フォルダを選択',
  size = 'sm',
}: {
  label?: string
  size?: 'sm' | 'md'
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <ObsButton variant="primary" size={size} onClick={() => setOpen(true)}>
        <span className="inline-flex items-center gap-1.5">
          <Plus size={12} />
          {label}
        </span>
      </ObsButton>
      <DrivePickerModal open={open} onClose={() => setOpen(false)} onPicked={() => {}} />
    </>
  )
}
