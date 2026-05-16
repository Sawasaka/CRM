import type { Signal } from '@/components/crm/SignalBadge'

/**
 * 自社1stパーティーデータ(メール開封・資料DL・サイト訪問)から算出した
 * 企業単位の最新シグナル。Deals(/deals)と Companies(290万社DB) で共有する。
 *
 * 取引が登録されている = 何らかの自社接点がある、という前提で
 * 取引マスタ(MOCK_DEALS)から派生させたモック。
 * 同じ社名の取引が複数あれば最強(Hot > Middle > Low)を採用する。
 *
 * 実装後は ScoreEvent テーブルから集計するエンドポイントに差し替える想定。
 */
export interface CompanyFirstPartySignalEntry {
  companyName: string
  signal: Signal
}

export const COMPANY_FIRST_PARTY_SIGNALS: CompanyFirstPartySignalEntry[] = [
  { companyName: '株式会社テクノリード',     signal: 'Hot' },
  { companyName: '株式会社イノベーション',   signal: 'Hot' },
  { companyName: '合同会社フューチャー',     signal: 'Hot' },
  { companyName: '株式会社グロース',         signal: 'Middle' },
  { companyName: '有限会社サクセス',         signal: 'Middle' },
  { companyName: '株式会社ネクスト',         signal: 'Low' },
]

const SIGNAL_RANK: Record<Signal, number> = { Hot: 3, Middle: 2, Low: 1 }

const SIGNAL_BY_NAME: Map<string, Signal> = (() => {
  const m = new Map<string, Signal>()
  for (const e of COMPANY_FIRST_PARTY_SIGNALS) {
    const prev = m.get(e.companyName)
    if (!prev || SIGNAL_RANK[e.signal] > SIGNAL_RANK[prev]) {
      m.set(e.companyName, e.signal)
    }
  }
  return m
})()

export function getCompanyFirstPartySignal(companyName: string): Signal | null {
  return SIGNAL_BY_NAME.get(companyName) ?? null
}
