'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Copy,
  Upload,
  Trash2,
  Check,
  Link2,
  Globe,
  Zap,
} from 'lucide-react'
import { ObsCard, ObsButton } from '@/components/obsidian'

interface SimpleDoc {
  id: string
  name: string
  trackingUrl: string
  uploadedAt: string
}

const INITIAL_DOCS: SimpleDoc[] = []

function randomToken(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export function LinkDocsView() {
  const [docs, setDocs] = useState<SimpleDoc[]>(INITIAL_DOCS)
  const [copied, setCopied] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const newDocs: SimpleDoc[] = Array.from(files).map((f) => ({
      id: `doc-${Date.now()}-${randomToken(4)}`,
      name: f.name,
      trackingUrl: `https://track.bgm.app/d/${randomToken(10)}`,
      uploadedAt: dateStr,
    }))
    setDocs((prev) => [...newDocs, ...prev])
  }

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 1800)
  }

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Upload Zone */}
      <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          className="w-full px-6 py-10 flex flex-col items-center gap-2 transition-colors cursor-pointer"
          style={{
            backgroundColor: dragOver ? 'rgba(171,199,255,0.06)' : 'transparent',
            boxShadow: dragOver ? 'inset 0 0 0 1.5px var(--color-obs-primary)' : 'inset 0 0 0 1px rgba(109,106,111,0.18)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(171,199,255,0.14)' }}
          >
            <Upload size={20} style={{ color: 'var(--color-obs-primary)' }} />
          </div>
          <div className="text-[14px] font-semibold mt-1" style={{ color: 'var(--color-obs-text)' }}>
            ファイルをドロップしてリンク化
          </div>
          <div className="text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            またはクリックして選択（PDF / 画像 / Office ファイル）
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </button>
      </ObsCard>

      {/* Docs Table */}
      <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
        <div
          className="grid items-center px-5 py-3 text-[10.5px] font-semibold tracking-[0.08em] uppercase"
          style={{
            gridTemplateColumns: '2fr 0.9fr 2.4fr 80px',
            color: 'var(--color-obs-text-muted)',
            borderBottom: '1px solid rgba(109,106,111,0.18)',
          }}
        >
          <div>ファイル名</div>
          <div className="text-center">アップロード日</div>
          <div>トラッキングURL</div>
          <div className="text-right">操作</div>
        </div>

        {docs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText size={28} className="mx-auto mb-3" style={{ color: 'var(--color-obs-text-subtle)' }} />
            <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
              まだリンク化された資料はありません
            </p>
          </div>
        ) : (
          docs.map((d, i) => (
            <div
              key={d.id}
              className="grid items-center px-5 py-3 transition-colors hover:bg-[rgba(171,199,255,0.04)] group"
              style={{
                gridTemplateColumns: '2fr 0.9fr 2.4fr 80px',
                borderBottom: i < docs.length - 1 ? '1px solid rgba(109,106,111,0.10)' : undefined,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={14} style={{ color: 'var(--color-obs-primary)' }} className="shrink-0" />
                <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>{d.name}</span>
              </div>
              <div className="text-center text-[11.5px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {d.uploadedAt}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Link2 size={12} style={{ color: 'var(--color-obs-text-muted)' }} className="shrink-0" />
                <code
                  className="text-[11.5px] font-mono truncate"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >{d.trackingUrl}</code>
              </div>
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleCopy(d.trackingUrl, d.id)}
                  className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[rgba(171,199,255,0.10)]"
                  title="URLをコピー"
                >
                  {copied === d.id
                    ? <Check size={13} style={{ color: '#6ee7a1' }} />
                    : <Copy size={12} style={{ color: 'var(--color-obs-text-muted)' }} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
                  className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[rgba(255,107,107,0.12)] opacity-0 group-hover:opacity-100"
                  title="削除"
                >
                  <Trash2 size={12} style={{ color: 'var(--color-obs-hot)' }} />
                </button>
              </div>
            </div>
          ))
        )}
      </ObsCard>

      {/* ── 配信ドメイン設定 ── */}
      <DeliveryDomainSection
        docCount={docs.length}
        onCopy={handleCopy}
        copiedKey={copied}
      />

      {/* Toast for copy */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-[12px] font-medium"
            style={{
              backgroundColor: 'var(--color-obs-surface-highest)',
              color: 'var(--color-obs-text)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.24)',
            }}
          >
            URLをコピーしました
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Delivery Domain Section ─────────────────────────────────────────────────────
// 資料DLリンクの発行ドメイン設定。
// 顧客が自社のベースドメイン(例: zooba.io)を登録すると、FDE CRM が
// 自動でサブドメイン(例: docs.zooba.io)を発行して資料DL用に利用する。

const SUBDOMAIN_PREFIX = 'docs'

function deriveSubdomain(baseDomain: string): string {
  const cleaned = baseDomain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase()
  if (!cleaned) return ''
  // 既に prefix が付いている場合は重複させない
  if (cleaned.startsWith(`${SUBDOMAIN_PREFIX}.`)) return cleaned
  return `${SUBDOMAIN_PREFIX}.${cleaned}`
}

function DeliveryDomainSection({
  docCount,
  onCopy,
  copiedKey,
}: {
  docCount: number
  onCopy: (value: string, id: string) => void
  copiedKey: string | null
}) {
  // モック: 既に登録済みの状態
  const [registeredBase, setRegisteredBase] = useState<string>('zooba.io')
  const [draftBase, setDraftBase] = useState<string>('')

  const issuedSubdomain = registeredBase ? deriveSubdomain(registeredBase) : ''
  const previewSubdomain = draftBase ? deriveSubdomain(draftBase) : ''

  const isVerified = !!registeredBase

  return (
    <div>
      <h3 className="text-[12px] font-semibold tracking-[0.08em] uppercase mb-3 px-1" style={{ color: 'var(--color-obs-text-muted)' }}>
        配信ドメイン
      </h3>

      <ObsCard depth="low" padding="lg" radius="xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-obs-surface-high)' }}>
            <Globe size={14} style={{ color: 'var(--color-obs-text)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>資料DLリンクの発行ドメイン</div>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>登録した自社ドメインに <code className="font-mono">{SUBDOMAIN_PREFIX}.</code> サブドメインを自動発行して配信します</p>
          </div>
        </div>

        {/* 登録済みドメイン + 発行サブドメイン */}
        {isVerified && (
          <div className="ml-11 mb-4">
            <div className="text-[10.5px] font-semibold tracking-[0.05em] uppercase mb-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
              発行中のサブドメイン
            </div>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 px-3 h-9 leading-9 rounded-[6px] text-[13px] font-mono"
                style={{ backgroundColor: 'var(--color-obs-surface-lowest)', color: 'var(--color-obs-text)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}
              >
                {issuedSubdomain}
              </code>
              <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(110,231,161,0.12)', color: '#6ee7a1' }}>
                <Check size={9} strokeWidth={3} />認証済
              </span>
              <button
                type="button"
                onClick={() => onCopy(issuedSubdomain, 'issued-domain')}
                className="w-9 h-9 rounded-[6px] flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                title="コピー"
              >
                {copiedKey === 'issued-domain' ? <Check size={12} style={{ color: '#6ee7a1' }} /> : <Copy size={11} style={{ color: 'var(--color-obs-text-muted)' }} />}
              </button>
            </div>
            <div className="flex items-center gap-3 text-[11px] mt-2" style={{ color: 'var(--color-obs-text-subtle)' }}>
              <span>登録ベース: <code className="font-mono" style={{ color: 'var(--color-obs-text-muted)' }}>{registeredBase}</code></span>
              <span>•</span>
              <span>発行中の資料リンク <span className="tabular-nums font-semibold" style={{ color: 'var(--color-obs-text-muted)' }}>{docCount}</span> 件</span>
              <button
                type="button"
                onClick={() => { setRegisteredBase(''); setDraftBase('') }}
                className="ml-auto text-[11px] underline-offset-2 hover:underline"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                ドメインを変更
              </button>
            </div>
          </div>
        )}

        {/* ベースドメイン入力(未登録時 or 変更時) */}
        {!isVerified && (
          <div className="ml-11">
            <div className="text-[10.5px] font-semibold tracking-[0.05em] uppercase mb-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
              使いたい自社ドメインを登録
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draftBase}
                onChange={(e) => setDraftBase(e.target.value)}
                placeholder="例: zooba.io"
                className="flex-1 min-w-0 px-3 h-9 rounded-[6px] text-[12.5px] font-mono outline-none"
                style={{ backgroundColor: 'var(--color-obs-surface-lowest)', color: 'var(--color-obs-text)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}
              />
              <ObsButton
                size="sm"
                variant="primary"
                disabled={!draftBase.trim()}
                onClick={() => { setRegisteredBase(draftBase.trim()); setDraftBase('') }}
              >
                <span className="inline-flex items-center gap-1"><Zap size={11} />登録してサブドメインを発行</span>
              </ObsButton>
            </div>
            {previewSubdomain && (
              <p className="text-[11px] mt-2" style={{ color: 'var(--color-obs-text-subtle)' }}>
                発行されるサブドメイン: <code className="font-mono" style={{ color: 'var(--color-obs-primary)' }}>{previewSubdomain}</code>
              </p>
            )}
          </div>
        )}
      </ObsCard>
    </div>
  )
}
