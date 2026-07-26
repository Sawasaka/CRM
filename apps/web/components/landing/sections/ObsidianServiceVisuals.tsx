'use client'

import type { ReactNode } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Database,
  FileText,
  FolderOpen,
  GitBranch,
  Link2,
  Network,
  Search,
  Sparkles,
  Tags,
} from 'lucide-react'

type VaultFrameProps = {
  accent: string
  folder: string
  note: string
  files: string[]
  properties: [string, string][]
  links: string[]
  children: ReactNode
}

const VaultMark = ({ accent }: { accent: string }) => (
  <span
    className="relative grid h-6 w-6 shrink-0 place-items-center rounded-md border"
    style={{ borderColor: `${accent}55`, background: `${accent}12` }}
  >
    <span
      className="h-2.5 w-2.5 rotate-45 rounded-[2px] border"
      style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}77` }}
    />
  </span>
)

const VaultFrame = ({
  accent,
  folder,
  note,
  files,
  properties,
  links,
  children,
}: VaultFrameProps) => (
  <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-[#05070d] p-3 shadow-2xl shadow-black/50 fo-glass-rim md:p-4">
    <div
      className="pointer-events-none absolute inset-0 opacity-90"
      style={{
        background: `radial-gradient(circle at 76% 42%, ${accent}1f, transparent 35%), radial-gradient(circle at 24% 88%, rgba(105,137,212,0.10), transparent 32%)`,
      }}
    />
    <div className="relative flex min-h-[334px] overflow-hidden rounded-[20px] border border-[#9582c9]/20 bg-[#0b0d14]/95">
      <aside className="hidden w-[122px] shrink-0 border-r border-white/[0.06] bg-[#090a10]/95 p-3 sm:block">
        <div className="flex items-center gap-2">
          <VaultMark accent={accent} />
          <div className="min-w-0">
            <div className="truncate text-[9px] font-semibold text-[#e5e2ed]">Revenue Vault</div>
            <div className="mt-0.5 text-[7px] uppercase tracking-[0.14em] text-[#615f69]">
              Rukisuma LAB
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 rounded-md bg-white/[0.035] px-2 py-1.5 text-[8px] text-[#777583]">
          <Search size={9} />
          <span>Search</span>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[8px] font-semibold text-[#aaa6b2]">
          <ChevronRight size={9} />
          <FolderOpen size={10} color={accent} />
          <span className="truncate">{folder}</span>
        </div>
        <div className="mt-2 space-y-1">
          {files.map((file, index) => (
            <div
              key={file}
              className={`flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[7.5px] ${
                index === 0 ? 'bg-[#8c76bd]/15 text-[#d8cee9]' : 'text-[#6f6d78]'
              }`}
            >
              <FileText size={8} color={index === 0 ? accent : '#666371'} />
              <span className="truncate">{file}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center border-b border-white/[0.06] bg-[#0d0f17]/95 px-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText size={11} color={accent} />
            <span className="truncate text-[9px] font-medium text-[#c9c5d0]">{note}</span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2 text-[#5e5c68]">
            <Link2 size={10} />
            <Tags size={10} />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_126px]">
          <main className="min-w-0 p-4 md:p-5">
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 border-b border-white/[0.06] pb-3">
              {properties.map(([label, value]) => (
                <div key={label} className="flex items-center gap-1.5 text-[8px]">
                  <span className="text-[#615f69]">{label}</span>
                  <span className="font-medium" style={{ color: accent }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            {children}
          </main>

          <aside className="hidden border-l border-white/[0.06] bg-[#090b12]/70 p-3 lg:block">
            <div className="flex items-center gap-1.5 text-[7.5px] font-semibold uppercase tracking-[0.12em] text-[#777483]">
              <GitBranch size={9} color={accent} />
              Linked notes
            </div>
            <div className="relative mt-4 space-y-4 pl-3">
              <span
                className="absolute bottom-2 left-[3px] top-2 w-px"
                style={{ background: `linear-gradient(${accent}66, ${accent}11)` }}
              />
              {links.map((link, index) => (
                <div key={link} className="relative min-w-0">
                  <span
                    className="absolute -left-3 top-1 h-1.5 w-1.5 rounded-full"
                    style={{
                      background: index === 0 ? accent : '#45516a',
                      boxShadow: index === 0 ? `0 0 9px ${accent}` : undefined,
                    }}
                  />
                  <div className="truncate text-[7.5px] text-[#8f8b99]">{link}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
)

const NoteCallout = ({
  accent,
  icon,
  label,
  value,
}: {
  accent: string
  icon: ReactNode
  label: string
  value: string
}) => (
  <div
    className="mt-4 flex min-w-0 items-center gap-2.5 border-l-2 bg-white/[0.025] px-3 py-2.5"
    style={{ borderColor: accent }}
  >
    <span className="shrink-0" style={{ color: accent }}>
      {icon}
    </span>
    <div className="min-w-0">
      <div className="text-[7px] uppercase tracking-[0.12em] text-[#696673]">{label}</div>
      <div className="mt-0.5 truncate text-[9px] font-semibold text-[#d9d5df]">{value}</div>
    </div>
  </div>
)

export const RevenueInfrastructureVault = () => {
  const accent = '#a98cf5'
  const nodes = ['広告', 'LP', 'リード', 'IS', '商談', '受注']

  return (
    <VaultFrame
      accent={accent}
      folder="01_Revenue Map"
      note="売上導線マップ.md"
      files={['売上導線マップ.md', 'ボトルネック.md', '判断基準.md']}
      properties={[
        ['status', '設計中'],
        ['owner', 'FDE'],
        ['scope', 'Marketing / IS'],
      ]}
      links={['広告キーワード', 'LP訴求', '商談化率', '受注理由']}
    >
      <div className="text-[11px] font-semibold text-[#ebe7f0]">流入から受注までの接続図</div>
      <div className="mt-5 flex items-center">
        {nodes.map((node, index) => (
          <div key={node} className="flex min-w-0 flex-1 items-center">
            <div className="min-w-0 flex-1 text-center">
              <span
                className="mx-auto block h-2.5 w-2.5 rounded-full border"
                style={{
                  borderColor: index === 3 ? '#abc7ff' : `${accent}88`,
                  background: index === 3 ? '#5997f2' : '#171526',
                  boxShadow: index === 3 ? '0 0 14px rgba(89,151,242,0.8)' : undefined,
                }}
              />
              <span className="mt-2 block truncate text-[8px] text-[#a6a1af]">{node}</span>
            </div>
            {index < nodes.length - 1 && (
              <span className="mb-5 h-px w-2 shrink-0 bg-gradient-to-r from-[#67518f] to-[#365e95] sm:w-3" />
            )}
          </div>
        ))}
      </div>
      <NoteCallout
        accent="#abc7ff"
        icon={<CircleDot size={11} />}
        label="現在のボトルネック"
        value="IS接続後の商談化率"
      />
    </VaultFrame>
  )
}

export const ProbabilityModelVault = () => {
  const accent = '#c29bff'
  const bars = [20, 31, 48, 72, 96, 84, 58, 36, 18]

  return (
    <VaultFrame
      accent={accent}
      folder="02_Scenario Model"
      note="確率シナリオ.md"
      files={['確率シナリオ.md', '前提条件.md', '損失レンジ.md']}
      properties={[
        ['method', 'Monte Carlo'],
        ['runs', '10,000'],
        ['updated', 'Today'],
      ]}
      links={['CVR分布', 'CAC上限', 'LTV仮説', '実施条件']}
    >
      <div className="grid gap-4 sm:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-2">
          {[
            ['CVR', '1.8–2.6%'],
            ['商談化率', '12–20%'],
            ['受注率', '15–24%'],
            ['LTV', '¥420–680K'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 text-[8px]"
            >
              <span className="text-[#777482]">{label}</span>
              <span className="font-mono text-[#cfc6df]">{value}</span>
            </div>
          ))}
        </div>
        <div className="min-w-0 border-l border-white/[0.06] pl-4">
          <div className="flex items-center gap-1.5 text-[8px] text-[#827e8d]">
            <BarChart3 size={10} color={accent} />
            Expected outcome
          </div>
          <div className="mt-4 flex h-[76px] items-end gap-1">
            {bars.map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-t-[2px]"
                style={{
                  height: `${height}%`,
                  background: `linear-gradient(to top, ${accent}33, ${accent})`,
                  opacity: 0.4 + index * 0.05,
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[7px] text-[#5f5c68]">
            <span>P10</span>
            <span>EXPECTED RANGE</span>
            <span>P90</span>
          </div>
        </div>
      </div>
      <NoteCallout
        accent={accent}
        icon={<Sparkles size={11} />}
        label="事前判断"
        value="損失上限を決めて、小さく開始"
      />
    </VaultFrame>
  )
}

export const MeasurementVault = () => {
  const accent = '#80ddc2'

  return (
    <VaultFrame
      accent={accent}
      folder="03_Measurement"
      note="計測データ辞書.md"
      files={['計測データ辞書.md', 'ID設計.md', '品質ルール.md']}
      properties={[
        ['status', 'Connected'],
        ['quality', '98.4%'],
        ['grain', 'Lead / Deal'],
      ]}
      links={['UTM規則', 'GA4イベント', 'CRM項目', '売上データ']}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#e8e5ec]">
        <Database size={11} color={accent} />
        キーワードから受注まで同じIDで追跡
      </div>
      <div className="mt-4 overflow-hidden border border-white/[0.07]">
        <div className="grid grid-cols-[1fr_0.82fr_0.72fr_auto] bg-white/[0.025] px-2.5 py-2 text-[7px] text-[#676471]">
          <span>DATA</span>
          <span>SOURCE</span>
          <span>KEY</span>
          <span>STATUS</span>
        </div>
        {[
          ['検索語句', 'GA4 / Ads', 'Lead ID', 'OK'],
          ['商談', 'HubSpot', 'Deal ID', 'OK'],
          ['受注', 'CRM / DB', 'Customer', 'SYNC'],
        ].map((row) => (
          <div
            key={row[0]}
            className="grid grid-cols-[1fr_0.82fr_0.72fr_auto] border-t border-white/[0.06] px-2.5 py-2 text-[7.5px]"
          >
            <span className="font-medium text-[#c9c5d0]">{row[0]}</span>
            <span className="text-[#74717e]">{row[1]}</span>
            <span className="font-mono text-[#8f8b98]">{row[2]}</span>
            <span style={{ color: accent }}>{row[3]}</span>
          </div>
        ))}
      </div>
      <NoteCallout
        accent={accent}
        icon={<CheckCircle2 size={11} />}
        label="品質ルール"
        value="欠損・重複・定義ずれを自動監視"
      />
    </VaultFrame>
  )
}

export const BayesianVault = () => {
  const accent = '#b99cff'
  const variants = [
    ['A', '課題訴求', 72],
    ['B', '費用訴求', 51],
    ['C', '事例訴求', 34],
  ] as const

  return (
    <VaultFrame
      accent={accent}
      folder="04_Decision Model"
      note="施策評価ボード.md"
      files={['施策評価ボード.md', '事前分布.md', '停止条件.md']}
      properties={[
        ['model', 'Bayesian'],
        ['variants', '3'],
        ['decision', '逐次更新'],
      ]}
      links={['訴求A', '訴求B', '訴求C', '判断ログ']}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold text-[#e8e5ec]">施策ごとの成功確率</div>
        <div className="text-[7px] text-[#676471]">データ取得ごとに更新</div>
      </div>
      <div className="mt-5 space-y-3">
        {variants.map(([id, label, value]) => (
          <div
            key={id}
            className="grid grid-cols-[15px_48px_1fr_28px] items-center gap-2 text-[8px]"
          >
            <span className="font-mono" style={{ color: accent }}>
              {id}
            </span>
            <span className="text-[#8f8b98]">{label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${value}%`,
                  background: `linear-gradient(90deg, #4d6da4, ${accent})`,
                }}
              />
            </span>
            <span className="text-right font-mono text-[#d5d0dd]">{value}%</span>
          </div>
        ))}
      </div>
      <NoteCallout
        accent={accent}
        icon={<Network size={11} />}
        label="現在の判断"
        value="Aを継続 / Cは停止候補"
      />
    </VaultFrame>
  )
}

export const AllocationVault = () => {
  const accent = '#d19cff'

  return (
    <VaultFrame
      accent={accent}
      folder="05_Allocation"
      note="配分ルール.md"
      files={['配分ルール.md', '探索枠.md', '学習ログ.md']}
      properties={[
        ['method', 'Bandit'],
        ['policy', 'Thompson'],
        ['cycle', 'Weekly'],
      ]}
      links={['広告予算', 'LP流入', 'IS工数', '次回学習']}
    >
      <div className="text-[10px] font-semibold text-[#e8e5ec]">期待値に応じた資源配分</div>
      <div className="mt-4 flex h-9 overflow-hidden rounded-md border border-white/[0.07]">
        <span className="flex w-[60%] items-center justify-center bg-[#769fe1] text-[8px] font-bold text-[#08101d]">
          勝ち筋 60%
        </span>
        <span className="flex w-[25%] items-center justify-center bg-[#6d5b91] text-[7px] text-white">
          継続 25%
        </span>
        <span className="flex w-[15%] items-center justify-center bg-[#211a30] text-[7px] text-[#cfbfff]">
          探索
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.07]">
        {[
          ['広告予算', '+18%'],
          ['LP流入', '+12%'],
          ['IS工数', '+20%'],
        ].map(([label, value]) => (
          <div key={label} className="px-2 first:pl-0 last:pr-0">
            <div className="truncate text-[7px] text-[#6e6a77]">{label}</div>
            <div className="mt-1 font-mono text-[10px]" style={{ color: accent }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <NoteCallout
        accent={accent}
        icon={<GitBranch size={11} />}
        label="学習の継承"
        value="探索枠を残し、次の判断へ接続"
      />
    </VaultFrame>
  )
}
