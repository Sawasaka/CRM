'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScrollText,
  Save,
  Loader2,
  CheckCircle2,
  Wand2,
  X,
  Settings2,
} from 'lucide-react'
import { ObsButton } from '@/components/obsidian'
import { trpc } from '@/lib/trpc/client'

// 「前提」と「ポリシー」を自然言語で書いて、AI 自動抽出のシステムプロンプトに差し込む。
// 組織ごとに 1 件だけ存在する KnowledgeRulebook を編集する。
// メイン画面での占有を抑えるため、ヘッダのボタン → モーダル開閉。

const PRESETS: Array<{
  name: string
  premises: string // 抽出条件（何を取り込むか／除外するか）
  policies: string // アウトプット条件（どう出力するか）
}> = [
  {
    name: '営業議事録サンプル',
    premises: [
      '【対象ソース】Google Meet / Zoom の商談議事録（社内ロープレ・打ち合わせも可）。',
      '【対象テーマ】営業の質問と回答に該当する発話のみ。ヒアリング設計・失注分析・クロージング・価格交渉・トライアル・稟議対応など。',
      '【取り込むトリガ】顧客もしくは社内メンバーから「どう聞けばいい？」「どう返せばいい？」に類する質問が出て、回答が成立している箇所。',
      '【除外】挨拶・雑談・社内事務連絡・他部門（経理/IT/法務）の質問は対象外。',
      '【信頼性】複数の議事録で同じ質問が繰り返し出ている場合、最新かつ最も詳細な回答を「正規回答」として採用。',
    ].join('\n'),
    policies: [
      '【タイトル】80字以内・質問形式（「〜は？」「〜のコツは？」「〜を上げるには？」）。語尾は必ず ? で終わる。',
      '【本文】Markdown。冒頭に結論、次に箇条書きで具体的アクション。商談フェーズ別の使い分けがあれば明記。',
      '【マスク】顧客企業名・人名・取引金額は ●● で伏字。社内メンバー名はイニシャル。',
      '【部門】department は「営業」固定。',
      '【カテゴリ】ヒアリング / 失注分析 / 商談クロージング / 商談オペレーション / コール / 価格交渉 / トライアル / 提案・稟議 から1つ厳密に選択。',
      '【タグ】3〜5個、商談フェーズや行動を表すキーワードで付与（例: 初回商談 / 値引き / 競合比較）。',
      '【重複】同義の既存FAQが存在する場合は status=REJECTED とし、本文末に既存FAQへの参照を残す。',
    ].join('\n'),
  },
]

// ─── 公開: タブ内などに置くインラインパネル ─────────────────────────────

export function RulebookPanel() {
  const utils = trpc.useUtils()
  const ruleQuery = trpc.knowledgeRules.get.useQuery()
  const updateMutation = trpc.knowledgeRules.update.useMutation({
    onSuccess: async () => {
      setSavedAt(new Date())
      await utils.knowledgeRules.get.invalidate()
    },
  })

  const [premises, setPremises] = useState('')
  const [policies, setPolicies] = useState('')
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (ruleQuery.data) {
      setPremises(ruleQuery.data.premises ?? '')
      setPolicies(ruleQuery.data.policies ?? '')
      setDirty(false)
    }
  }, [ruleQuery.data])

  const apply = (preset: (typeof PRESETS)[number]) => {
    setPremises(preset.premises)
    setPolicies(preset.policies)
    setDirty(true)
  }

  const save = () => {
    updateMutation.mutate({ premises, policies })
    setDirty(false)
  }

  return (
    <div
      className="rounded-[var(--radius-obs-lg)] p-6"
      style={{
        backgroundColor: 'var(--color-obs-surface-high)',
        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
      }}
    >
      {/* ヘッダ: アイコン+タイトル+説明 (左) | サンプル (右) */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(171,199,255,0.10)' }}
          >
            <ScrollText size={16} style={{ color: 'var(--color-obs-primary)' }} />
          </div>
          <div className="min-w-0">
            <h3
              className="text-[14px] font-semibold tracking-[-0.01em]"
              style={{ color: 'var(--color-obs-text)' }}
            >
              FAQ作成のAIルール
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span
            className="text-[11px] font-medium inline-flex items-center gap-1"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            <Wand2 size={11} /> サンプル:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => apply(p)}
              className="h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                color: 'var(--color-obs-text-muted)',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 前提とポリシーを2カラムで横並び（広い画面で幅を活用） */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Field
          label="抽出条件"
          hint="どの議事録から、どんな発話を取り込むか／除外するか"
          value={premises}
          onChange={(v) => {
            setPremises(v)
            setDirty(true)
          }}
          placeholder={[
            '【対象議事録】',
            '  - 例: Google Meet / Zoom の商談議事録、ステージ「商談」以降の Deal に紐づくもの',
            '【取り込むトリガ】',
            '  - 例: 「どう聞けばいい？」「どう返せばいい？」型の質疑が成立している箇所',
            '【除外条件】',
            '  - 例: 挨拶・雑談・社内事務連絡、他部門の話題',
            '【正規回答の条件】',
            '  - 例: 複数議事録で繰り返し出る質問は最新かつ詳細な回答を採用',
          ].join('\n')}
          rows={10}
        />

        <Field
          label="アウトプット条件"
          hint="どう FAQ として出力するか"
          value={policies}
          onChange={(v) => {
            setPolicies(v)
            setDirty(true)
          }}
          placeholder={[
            '【タイトル】',
            '  - 例: 80字以内・質問形式（「〜は？」「〜のコツは？」）',
            '【本文】',
            '  - 例: Markdown、冒頭に結論、その後に商談フェーズ別の具体アクションを箇条書き',
            '【マスク・伏字】',
            '  - 例: 顧客企業名・人名・取引金額は ●● で伏字',
            '【カテゴリ・タグ】',
            '  - 例: ヒアリング / 失注分析 / クロージング … から1つ、タグは3-5個',
            '【重複・既存FAQ】',
            '  - 例: 同義の既存FAQがあれば REJECTED にして参照を残す',
          ].join('\n')}
          rows={10}
        />
      </div>

      {/* 保存 */}
      <div className="flex items-center justify-end gap-3 mt-4">
        <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {dirty
            ? '未保存の変更があります'
            : ruleQuery.data?.updatedAt
              ? `最終更新 ${new Date(ruleQuery.data.updatedAt).toLocaleString('ja-JP')}`
              : ''}
          {savedAt && !dirty && (
            <span
              className="ml-2 inline-flex items-center gap-1"
              style={{ color: 'var(--color-obs-low)' }}
            >
              <CheckCircle2 size={10} /> 保存しました
            </span>
          )}
        </span>
        <ObsButton
          variant="primary"
          size="md"
          onClick={save}
          disabled={!dirty || updateMutation.isPending}
        >
          <span className="inline-flex items-center gap-1.5">
            {updateMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            保存
          </span>
        </ObsButton>
      </div>
    </div>
  )
}

// ─── 公開: ヘッダに置く小さなボタン ─────────────────────────────────────

export function RulebookButton() {
  const [open, setOpen] = useState(false)
  const ruleQuery = trpc.knowledgeRules.get.useQuery()
  const isEmpty =
    !ruleQuery.data ||
    ((ruleQuery.data.premises ?? '').trim() === '' &&
      (ruleQuery.data.policies ?? '').trim() === '')

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors"
        style={{
          backgroundColor: 'var(--color-obs-surface-high)',
          color: 'var(--color-obs-text-muted)',
        }}
      >
        <Settings2 size={13} />
        FAQ作成のAIルール
        {!isEmpty && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(126,198,255,0.18)',
              color: 'var(--color-obs-low)',
            }}
          >
            設定済
          </span>
        )}
      </button>
      <RulebookModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

// ─── モーダル本体 ────────────────────────────────────────────────────────

function RulebookModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils()
  const ruleQuery = trpc.knowledgeRules.get.useQuery()
  const updateMutation = trpc.knowledgeRules.update.useMutation({
    onSuccess: async () => {
      setSavedAt(new Date())
      await utils.knowledgeRules.get.invalidate()
    },
  })

  const [premises, setPremises] = useState('')
  const [policies, setPolicies] = useState('')
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (ruleQuery.data) {
      setPremises(ruleQuery.data.premises ?? '')
      setPolicies(ruleQuery.data.policies ?? '')
      setDirty(false)
    }
  }, [ruleQuery.data])

  const apply = (preset: (typeof PRESETS)[number]) => {
    setPremises(preset.premises)
    setPolicies(preset.policies)
    setDirty(true)
  }

  const save = () => {
    updateMutation.mutate({ premises, policies })
    setDirty(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />
          {/* ダイアログ */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-[var(--radius-obs-lg)]"
              style={{
                backgroundColor: 'var(--color-obs-surface)',
                boxShadow:
                  '0 24px 64px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {/* ヘッダ */}
              <div
                className="flex items-start justify-between gap-3 px-6 py-5 sticky top-0 z-10"
                style={{
                  backgroundColor: 'var(--color-obs-surface)',
                  boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.12)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(171,199,255,0.10)' }}
                  >
                    <ScrollText size={16} style={{ color: 'var(--color-obs-primary)' }} />
                  </div>
                  <div>
                    <h2
                      className="text-[16px] font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      FAQ作成のAIルール
                    </h2>
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

              {/* 本体 */}
              <div className="px-6 py-5">
                {/* プリセット */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span
                    className="text-[11px] font-medium inline-flex items-center gap-1"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <Wand2 size={11} /> サンプル:
                  </span>
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => apply(p)}
                      className="h-7 px-3 rounded-full text-[11px] font-medium transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <Field
                  label="前提（業界・チーム・対象顧客などの文脈）"
                  hint="例: 当社は ●● 業界向け SaaS、メインターゲットは ●● 部門。"
                  value={premises}
                  onChange={(v) => {
                    setPremises(v)
                    setDirty(true)
                  }}
                  placeholder={[
                    '- 業界 / 提供サービスの一行説明',
                    '- メインターゲット顧客の属性（業界・規模・役職）',
                    '- 社内でよく使われる用語・略語',
                    '- 主要な情報源（Slack のチャンネル / Drive のフォルダなど）',
                  ].join('\n')}
                  rows={5}
                />

                <Field
                  label="ポリシー（除外条件・分類基準・優先度）"
                  hint="例: 個人情報・取引先名はマスク。法務関連は @legal の発言のみ採用。"
                  value={policies}
                  onChange={(v) => {
                    setPolicies(v)
                    setDirty(true)
                  }}
                  placeholder={[
                    '- 機密扱い / 除外する条件',
                    '- 個人情報・固有名詞のマスクルール',
                    '- 担当者しか答えられないトピックの取扱',
                    '- カテゴリ分類の選択肢と優先順位',
                    '- FAQ化しない会話の見分け方',
                  ].join('\n')}
                  rows={7}
                />

              </div>

              {/* フッタ */}
              <div
                className="flex items-center justify-between gap-3 px-6 py-4 sticky bottom-0"
                style={{
                  backgroundColor: 'var(--color-obs-surface)',
                  boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.12)',
                }}
              >
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {dirty
                    ? '未保存の変更があります'
                    : ruleQuery.data?.updatedAt
                      ? `最終更新 ${new Date(ruleQuery.data.updatedAt).toLocaleString('ja-JP')}`
                      : ''}
                  {savedAt && !dirty && (
                    <span
                      className="ml-2 inline-flex items-center gap-1"
                      style={{ color: 'var(--color-obs-low)' }}
                    >
                      <CheckCircle2 size={10} /> 保存しました
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <ObsButton variant="ghost" size="sm" onClick={onClose}>
                    閉じる
                  </ObsButton>
                  <ObsButton
                    variant="primary"
                    size="sm"
                    onClick={save}
                    disabled={!dirty || updateMutation.isPending}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {updateMutation.isPending ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      保存
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

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows: number
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label
          className="text-[12px] font-medium"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {label}
        </label>
        {hint && (
          <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {hint}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-[13px] leading-[1.7] rounded-[var(--radius-obs-sm)] outline-none resize-y transition-all font-mono"
        style={{
          backgroundColor: 'var(--color-obs-surface-lowest)',
          color: 'var(--color-obs-text)',
          boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
        }}
      />
    </div>
  )
}
