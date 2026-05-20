'use client'

/**
 * Hero のメインエリアに表示する、サイドバー連動の機能モック群。
 * クリックされたサイドバー項目に応じて表示が切り替わる装飾用UI。
 * 全て読み取り専用・装飾のみ（操作は無効）。
 */

import { Search, Filter, Plus, Building2 } from 'lucide-react'

export type HeroDemoKey =
  | 'chat'
  | 'companies'
  | 'pipeline'
  | 'contacts'
  | 'deals'
  | 'lists'
  | 'tasks'
  | 'tickets'
  | 'action-board'
  | 'mail'
  | 'priority'
  | 'knowledge'
  | 'new-chat'
  | 'search'

const DEMO_TITLES: Record<Exclude<HeroDemoKey, 'chat' | 'new-chat' | 'search'>, string> = {
  companies:    '290万社DB',
  pipeline:     'パイプライン',
  contacts:     'コンタクト',
  deals:        '取引',
  lists:        'ISリスト',
  tasks:        'タスク一覧',
  tickets:      'チケット',
  'action-board': 'アクションボード',
  mail:         'メール配信',
  priority:     '開発優先度',
  knowledge:    'ナレッジ',
}

// ===== Shared header =====
const DemoHeader = ({ title, count, accent }: { title: string; count?: string; accent: string }) => (
  <div className="px-5 md:px-7 py-3 flex items-center justify-between border-b border-white/[0.04]">
    <div className="flex items-center gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
      <span className="text-sm text-[#e7e5ea]">{title}</span>
      {count && <span className="text-[10px] font-mono text-[#7e7c83]">{count}</span>}
    </div>
    <div className="flex items-center gap-2">
      <button className="w-7 h-7 rounded-md hover:bg-shimmer/40 flex items-center justify-center text-[#9b99a0]" disabled>
        <Search size={13} />
      </button>
      <button className="w-7 h-7 rounded-md hover:bg-shimmer/40 flex items-center justify-center text-[#9b99a0]" disabled>
        <Filter size={13} />
      </button>
      <button
        className="h-7 px-2.5 rounded-md text-[11px] font-medium text-[#0a0a0c] flex items-center gap-1"
        style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)' }}
        disabled
      >
        <Plus size={11} /> 新規
      </button>
    </div>
  </div>
)

// ===== Companies (290万社DB) =====
export const CompaniesDemo = () => {
  const rows = [
    { n: '株式会社テクノリード',    cat: 'SaaS',   emp: '1,840名', score: 92, intent: '採用↑+12' },
    { n: '合同会社フューチャー',    cat: 'コンサル', emp: '420名',  score: 88, intent: 'PR↑3' },
    { n: '株式会社グロース',        cat: '製造',   emp: '3,200名', score: 86, intent: '調達↑2' },
    { n: '株式会社ベルガモット工業', cat: '化学',    emp: '560名',   score: 81, intent: '採用↑+8' },
    { n: 'PoltCraft Inc.',          cat: 'FinTech', emp: '240名',  score: 77, intent: 'IR↑1' },
    { n: 'セレナーデ商事',          cat: '商社',    emp: '1,200名', score: 73, intent: '採用↑+5' },
    { n: '株式会社ノクターン物流',  cat: '物流',    emp: '880名',   score: 69, intent: '— ' },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="290万社DB" count="フィルタ済 4,071社 / 全 2,900,000社" accent="#7aa4ff" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3">
        <div className="grid grid-cols-12 text-[10px] uppercase tracking-[0.14em] text-[#7e7c83] pb-2">
          <div className="col-span-4">会社名</div>
          <div className="col-span-2">業種</div>
          <div className="col-span-2">従業員</div>
          <div className="col-span-2">インテント</div>
          <div className="col-span-2 text-right">スコア</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-12 items-center text-[12.5px] py-2"
            style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.05)' }}
          >
            <div className="col-span-4 text-[#e7e5ea] truncate flex items-center gap-2">
              <Building2 size={12} color="#7aa4ff" strokeWidth={1.6} />
              {r.n}
            </div>
            <div className="col-span-2 text-[#9b99a0]">{r.cat}</div>
            <div className="col-span-2 text-[#9b99a0]">{r.emp}</div>
            <div className="col-span-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(122,164,255,0.10)', color: '#7aa4ff' }}>
                {r.intent}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <div className="flex-1 max-w-[60px] h-1 rounded-full bg-shimmer/60 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: 'linear-gradient(90deg, #7aa4ff55, #abc7ff)' }} />
              </div>
              <span className="font-mono text-aurora text-xs w-7 text-right">{r.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Pipeline (kanban) =====
export const PipelineDemo = () => {
  const stages = [
    { name: 'IS',           color: '#7aa4ff', cards: [{ c: 'テクノリード', a: '¥12.5M', p: 35 }] },
    { name: 'NURTURING',    color: '#abc7ff', cards: [{ c: 'フューチャー', a: '¥8.9M', p: 48 }] },
    { name: 'MEETING',      color: '#9be2ff', cards: [{ c: 'サクセス',     a: '¥5.2M', p: 52 }, { c: 'イノベーション', a: '¥3.6M', p: 60 }] },
    { name: 'POC',          color: '#ffcf4a', cards: [{ c: 'ネクスト',     a: '¥6.8M', p: 70 }] },
    { name: 'CLOSED_WON',   color: '#8dffc9', cards: [{ c: 'テクノリード', a: '¥48M',  p: 100 }] },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="パイプライン ／ 11ステージ" count="42件 / ¥186.4M" accent="#abc7ff" />
      <div className="flex-1 overflow-x-auto fo-thin-scroll px-5 md:px-7 py-3">
        <div className="grid grid-cols-5 gap-2 min-w-[680px] h-full">
          {stages.map((st) => (
            <div key={st.name} className="rounded-lg bg-[#0e0e10] p-2 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.14em]" style={{ color: st.color }}>{st.name}</span>
                <span className="text-[9px] font-mono text-[#7e7c83]">{st.cards.length}</span>
              </div>
              <div className="space-y-1.5">
                {st.cards.map((c, i) => (
                  <div key={i} className="rounded-md bg-pitch p-2 fo-glass-rim cursor-default">
                    <div className="text-[11px] text-[#e7e5ea] truncate">{c.c}</div>
                    <div className="text-[9px] text-[#7e7c83] mt-0.5">{c.a}</div>
                    <div className="mt-1.5 h-1 rounded-full bg-shimmer/40 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.p}%`, background: st.color, boxShadow: `0 0 6px ${st.color}80` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===== Contacts =====
export const ContactsDemo = () => {
  const rows = [
    { n: '田中 誠',      role: '取締役 営業本部長',     co: 'テクノリード',    sig: '接続済み', col: '#8dffc9' },
    { n: '加藤 雄介',    role: 'マネージャー',           co: 'ビジョン',         sig: '未着手',   col: '#9b99a0' },
    { n: '山本 佳子',    role: 'CMO',                  co: 'フューチャー',     sig: 'アポ獲得', col: '#abc7ff' },
    { n: '小林 健太',    role: 'IT部長',               co: 'サクセス',         sig: '不通',     col: '#ffcf4a' },
    { n: '佐々木 拓也',  role: 'プロダクトオーナー',     co: 'イノベーション',  sig: '接続済み', col: '#8dffc9' },
    { n: '中村 理恵',    role: 'CTO',                  co: 'グロース',         sig: 'アポ獲得', col: '#abc7ff' },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="コンタクト" count="6件表示 / 全 1,284件" accent="#9be2ff" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.05)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-[#0a0a0c]" style={{ background: 'linear-gradient(135deg, #abc7ff, #c8b9ff)' }}>
              {r.n[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] text-[#e7e5ea]">{r.n}</div>
              <div className="text-[10px] text-[#7e7c83]">{r.role} ／ {r.co}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${r.col}1a`, color: r.col }}>{r.sig}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Deals =====
export const DealsDemo = () => {
  const rows = [
    { code: 'RKS-0842', n: 'グローバルERP統合計画',    co: 'テクノリード',    a: '¥12.5M', s: 'Hot',    col: '#ff6b6b' },
    { code: 'RKS-0992', n: '次世代CRM導入検討',       co: 'フューチャー',     a: '¥8.9M',  s: 'Hot',    col: '#ff6b6b' },
    { code: 'RKS-1066', n: '物流最適化システム提案',   co: 'イノベーション',  a: '¥3.6M',  s: 'Middle', col: '#ffcf4a' },
    { code: 'RKS-1122', n: '基幹システムクラウド移行', co: 'グロース',         a: '¥18.5M', s: 'Hot',    col: '#ff6b6b' },
    { code: 'RKS-0901', n: 'AI解析エンジン検証',      co: 'ネクスト',         a: '¥6.8M',  s: 'Hot',    col: '#ff6b6b' },
    { code: 'RKS-0718', n: 'エンタープライズ契約2期', co: 'テクノリード',    a: '¥48M',   s: 'Hot',    col: '#ff6b6b' },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="取引" count="6件表示 / 全 138件" accent="#b9a5ff" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3">
        <div className="grid grid-cols-12 text-[10px] uppercase tracking-[0.14em] text-[#7e7c83] pb-2">
          <div className="col-span-3">CODE</div>
          <div className="col-span-5">名称</div>
          <div className="col-span-2">企業</div>
          <div className="col-span-1">シグナル</div>
          <div className="col-span-1 text-right">金額</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-12 items-center text-[12px] py-2" style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.05)' }}>
            <div className="col-span-3 font-mono text-[#7aa4ff] text-[11px]">{r.code}</div>
            <div className="col-span-5 text-[#e7e5ea] truncate">{r.n}</div>
            <div className="col-span-2 text-[#9b99a0] truncate">{r.co}</div>
            <div className="col-span-1"><span className="text-[10px] font-mono" style={{ color: r.col }}>● {r.s}</span></div>
            <div className="col-span-1 text-right font-mono text-[#e7e5ea] text-[11px]">{r.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== IS List =====
export const ListsDemo = () => {
  const rows = [
    { n: '加藤 雄介',    co: 'ビジョン',       seq: '新規開拓 v2', tries: 2, next: '4/22' },
    { n: '山本 佳子',    co: 'フューチャー',   seq: '長期ナーチャ', tries: 6, next: '4/24' },
    { n: '小林 健太',    co: 'サクセス',       seq: '新規開拓 v2', tries: 1, next: '4/28' },
    { n: '佐々木 拓也',  co: 'イノベーション',seq: '提案フォロー',  tries: 4, next: '4/23' },
    { n: '中村 理恵',    co: 'グロース',       seq: '決裁者MTG',   tries: 8, next: '4/25' },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="ISリスト ／ 新規開拓 v2" count="進捗 67%" accent="#ffd37a" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.05)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-amber shadow-[0_0_6px_#ffcf4a]" />
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] text-[#e7e5ea]">{r.n}</div>
              <div className="text-[10px] text-[#7e7c83]">{r.co} ／ {r.seq}</div>
            </div>
            <div className="text-[10px] font-mono text-[#9b99a0]">試行 ×{r.tries}</div>
            <div className="text-[10px] font-mono text-aurora">→ {r.next}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Tasks =====
export const TasksDemo = () => {
  const tasks = [
    { t: '常務向け1Pサマリ送付',           by: 'テクノリード田中様', due: '今日', done: false, p: 'high' },
    { t: '提案書レビュー（先方CTO）',     by: 'イノベーション佐々木様', due: '今日', done: false, p: 'high' },
    { t: '商談実施',                     by: 'サクセス小林様',    due: '明日', done: false, p: 'mid' },
    { t: 'ナーチャリングメール送信',     by: 'スタート吉田様',   due: '5/3',  done: false, p: 'low' },
    { t: '初回コール',                   by: 'ビジョン加藤様',   due: '完了', done: true,  p: 'mid' },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="タスク一覧" count="未完 12件 / 完了 38件" accent="#abc7ff" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3 space-y-1.5">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-md bg-pitch fo-glass-rim">
            <span
              className="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: t.done ? '#8dffc9' : '#414753', background: t.done ? '#8dffc922' : 'transparent' }}
            >
              {t.done && <span className="text-[8px]" style={{ color: '#8dffc9' }}>✓</span>}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`text-[12.5px] ${t.done ? 'text-[#7e7c83] line-through' : 'text-[#e7e5ea]'}`}>{t.t}</div>
              <div className="text-[10px] text-[#7e7c83]">{t.by}</div>
            </div>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                background: t.p === 'high' ? 'rgba(255,141,207,0.12)' : t.p === 'mid' ? 'rgba(255,207,74,0.10)' : 'rgba(155,153,160,0.08)',
                color: t.p === 'high' ? '#ff8dcf' : t.p === 'mid' ? '#ffcf4a' : '#9b99a0',
              }}
            >
              {t.due}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Tickets =====
export const TicketsDemo = () => {
  const rows = [
    { id: 'T-1042', t: 'ログイン2段階認証が突然要求される', co: 'A社', as: '佐藤', sla: '2:14', sev: 'high',   status: 'AI回答中' },
    { id: 'T-1041', t: 'CSV出力で文字化け',                co: 'B社', as: '田中', sla: '5:00', sev: 'med',    status: 'NEW' },
    { id: 'T-1039', t: 'APIレート上限を超過',              co: 'C社', as: '鈴木', sla: '0:42', sev: 'high',   status: '有人' },
    { id: 'T-1037', t: 'Webhook 再送が実行されない',       co: 'D社', as: '高橋', sla: '8:00', sev: 'med',    status: 'AI回答中' },
    { id: 'T-1030', t: 'パスワードリセット',               co: 'E社', as: '—',   sla: '—',    sev: 'low',    status: '解決' },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="チケット" count="24件未対応 / SLA違反 1件" accent="#ff8dcf" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3 space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-md bg-pitch fo-glass-rim">
            <span className="font-mono text-[10px] text-coral w-12">{r.id}</span>
            <div className="flex-1 min-w-0 text-[12px] text-[#e7e5ea] truncate">{r.t}</div>
            <span className="text-[10px] text-[#7e7c83]">{r.co} / @{r.as}</span>
            <span className="text-[10px] font-mono text-[#c7c5c9]">SLA {r.sla}</span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                background: r.status === '有人' ? 'rgba(255,207,74,0.12)' : r.status === '解決' ? 'rgba(141,255,201,0.10)' : 'rgba(171,199,255,0.10)',
                color: r.status === '有人' ? '#ffcf4a' : r.status === '解決' ? '#8dffc9' : '#abc7ff',
              }}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Action Board =====
export const ActionBoardDemo = () => {
  const cells = [
    { t: 'HOT 5社へ即アプローチ',     c: 5, color: '#ff8dcf' },
    { t: '今日の商談ブリーフィング',  c: 3, color: '#abc7ff' },
    { t: 'Next Action 承認待ち',     c: 8, color: '#ffcf4a' },
    { t: 'SLA違反チケット',           c: 1, color: '#ff6b6b' },
    { t: '未読議事録',                c: 4, color: '#8dffc9' },
    { t: '進行中シーケンス',          c: 12, color: '#d3a5ff' },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="アクションボード" count="今日のアクション 33件" accent="#abc7ff" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3">
        <div className="grid grid-cols-3 gap-2.5">
          {cells.map((cell, i) => (
            <div key={i} className="rounded-lg bg-pitch p-3 fo-glass-rim relative overflow-hidden">
              <div
                className="absolute -top-6 -right-6 w-16 h-16 rounded-full"
                style={{ background: `radial-gradient(circle, ${cell.color}22, transparent 70%)`, filter: 'blur(12px)' }}
              />
              <div className="text-[11px] text-[#9b99a0] relative">{cell.t}</div>
              <div className="font-display font-bold text-[1.6rem] mt-1 relative" style={{ color: cell.color }}>{cell.c}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===== Mail (sequences) =====
export const MailDemo = () => {
  const seqs = [
    { t: '新規ICP向けナーチャ',    lead: 142, open: 41, ctr: 12, st: 'RUNNING',  col: '#8dffc9' },
    { t: '比較検討フォロー',       lead: 86,  open: 38, ctr: 15, st: 'RUNNING',  col: '#8dffc9' },
    { t: 'PoC後アンケート',        lead: 12,  open: 92, ctr: 28, st: 'RUNNING',  col: '#8dffc9' },
    { t: '失注 90日後リエンゲ',    lead: 34,  open: 22, ctr: 5,  st: 'PAUSED',   col: '#9b99a0' },
    { t: 'リファラル ASK',         lead: 18,  open: 51, ctr: 18, st: 'RUNNING',  col: '#8dffc9' },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="メール配信" count="5シーケンス稼働中" accent="#ff9f6b" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3 space-y-1.5">
        {seqs.map((s, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-pitch fo-glass-rim">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${s.col}1a`, color: s.col }}>{s.st}</span>
            <div className="flex-1 text-[12.5px] text-[#e7e5ea] truncate">{s.t}</div>
            <div className="text-[10px] font-mono text-[#9b99a0]">配信 <span className="text-[#e7e5ea]">{s.lead}</span></div>
            <div className="text-[10px] font-mono text-[#9b99a0]">開封 <span className="text-aurora">{s.open}%</span></div>
            <div className="text-[10px] font-mono text-[#9b99a0]">CTR <span className="text-mint">{s.ctr}%</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Priority (開発優先度) =====
export const PriorityDemo = () => {
  const items = [
    { t: 'Salesforce 双方向連携',      cnt: 14, eff: 4, imp: 5, score: 92 },
    { t: '議事録 話者分離 + 要約',    cnt: 11, eff: 3, imp: 5, score: 85 },
    { t: 'PDM スコア閾値カスタム',     cnt: 9,  eff: 2, imp: 4, score: 78 },
    { t: 'Marketo / HubSpot 双方向',   cnt: 8,  eff: 4, imp: 4, score: 72 },
    { t: '監査ログ CSV (24ヶ月)',      cnt: 7,  eff: 1, imp: 3, score: 64 },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="開発優先度" count="ボード反映済 5件 / ロードマップ Q3" accent="#ff6b8d" />
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3 space-y-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg bg-pitch p-3 fo-glass-rim">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#7e7c83]">#{i + 1}</span>
                <span className="text-[12.5px] text-[#e7e5ea]">{it.t}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,107,141,0.12)', color: '#ff6b8d' }}>
                {it.cnt}社
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-[#9b99a0]">
              <span>Effort {it.eff}/5</span>
              <span>Impact {it.imp}/5</span>
              <div className="flex-1 h-1 rounded-full bg-shimmer/40 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${it.score}%`, background: 'linear-gradient(90deg, #ff6b8d55, #ff6b8d)', boxShadow: '0 0 6px #ff6b8d80' }} />
              </div>
              <span className="text-[#ff6b8d]">P{it.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Knowledge =====
export const KnowledgeDemo = () => {
  const tickets = [
    { q: '経費精算の上限額って、出張先で違いましたっけ？', a: '国内 8,000円/日 / 海外は地域A〜C…', conf: 95 },
    { q: '提案書テンプレートはどこにある？',                a: 'Drive: /02_Sales/Templates/ にあり…',   conf: 91 },
    { q: 'PoCの標準期間は？',                              a: '4週間が標準。延長は要承認…',           conf: 88 },
    { q: 'SOC2 監査向けの資料',                           a: '/Trust Center にWP公開済み…',           conf: 86 },
  ]
  return (
    <div className="flex-1 flex flex-col">
      <DemoHeader title="ナレッジ" count="3,284件 / 自動蓄積中" accent="#c8b9ff" />
      <div className="flex items-center gap-1.5 px-5 md:px-7 pt-2">
        {['チケット', 'FAQ', 'ソース連携'].map((t, i) => (
          <button
            key={t}
            disabled
            className="px-3 py-1 text-[11px] rounded-md"
            style={i === 0 ? { background: 'rgba(200,185,255,0.10)', color: '#c8b9ff', boxShadow: 'inset 0 0 0 1px rgba(200,185,255,0.20)' } : { color: '#7e7c83' }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto fo-thin-scroll px-5 md:px-7 py-3 space-y-2">
        {tickets.map((tk, i) => (
          <div key={i} className="rounded-lg bg-pitch p-3 fo-glass-rim">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#7e7c83]">Q.</span>
              <span className="text-[9px] font-mono text-lilac">conf · {tk.conf}%</span>
            </div>
            <div className="text-[12.5px] text-[#e7e5ea]">{tk.q}</div>
            <div className="mt-1.5 text-[11px] text-[#9b99a0]"><span className="text-mint font-mono mr-1">A.</span>{tk.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Search overlay =====
export const SearchDemo = () => (
  <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
    <Search size={28} color="#abc7ff" strokeWidth={1.5} />
    <div className="font-display font-bold text-[1.4rem] mt-5 fo-gradient-text">企業・コンタクト・取引・議事録を横断検索</div>
    <p className="text-[12.5px] text-[#9b99a0] mt-3 max-w-md">
      キーワード一つで、すべてのデータから関連情報を即抽出します。
    </p>
    <div className="mt-5 flex flex-wrap gap-2 justify-center">
      {['#テクノリード', '#PoC', '#見積', '#Q2', '#Salesforce 連携'].map((t) => (
        <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-pitch fo-glass-rim text-[#c7c5c9]">{t}</span>
      ))}
    </div>
  </div>
)

// ===== Demo router =====
export const HeroDemoView = ({ kind }: { kind: HeroDemoKey }) => {
  switch (kind) {
    case 'companies':    return <CompaniesDemo />
    case 'pipeline':     return <PipelineDemo />
    case 'contacts':     return <ContactsDemo />
    case 'deals':        return <DealsDemo />
    case 'lists':        return <ListsDemo />
    case 'tasks':        return <TasksDemo />
    case 'tickets':      return <TicketsDemo />
    case 'action-board': return <ActionBoardDemo />
    case 'mail':         return <MailDemo />
    case 'priority':     return <PriorityDemo />
    case 'knowledge':    return <KnowledgeDemo />
    case 'search':       return <SearchDemo />
    default:             return null
  }
}

export { DEMO_TITLES }
