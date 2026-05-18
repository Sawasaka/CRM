import { Database, Lock, ShieldCheck, Check } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

/**
 * Security — シンプル版
 *
 * 旧版は RLS policy / bucket layout / signed URL のコードを並べていたが、
 * 「セキュリティに詳しくない人にも伝わる」を最優先に書き直し:
 *  - コードスニペット全廃止
 *  - 用語を素人向けに翻訳 (Row-Level Security → 「会社ごとにデータの壁」)
 *  - データ保管先 (Supabase Storage = Amazon S3 互換) を明示
 *  - 4 層スタック + 業界事例は箇条書きにして短く
 *  - Section padding を py-20/28 に圧縮
 */

const LAYERS = [
  { l: '認可',     d: '誰がアクセスできるかを毎回チェック' },
  { l: 'DB 分離',  d: 'データ自体を会社ごとに完全に区切る' },
  { l: '監査ログ', d: 'すべての操作を時系列で記録' },
  { l: '暗号化',   d: '通信も保管も AES-256 + TLS 1.3' },
] as const

const PEERS = ['Notion', 'Linear', 'Vercel', 'Supabase', 'Amazon S3'] as const

export const Security = () => (
  <Section tone="pitch" screenLabel="09 Security">
    <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="max-w-3xl">
        <Eyebrow color="#7ec6ff">SECURITY</Eyebrow>
        <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
          セキュリティは、
          <br />
          <span className="fo-gradient-text">見せないと、信じられない。</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-10 items-stretch">
        {/* 1. テナント遮断 */}
        <div className="rounded-3xl bg-dusk p-6 fo-glass-rim flex flex-col">
          <div className="flex items-center gap-2">
            <Database size={18} color="#7ec6ff" strokeWidth={1.6} />
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.68rem] text-cyan">
              データ分離
            </span>
          </div>
          <div className="font-display font-bold text-[1.25rem] mt-3 leading-tight">
            会社ごとに、<br />データの壁。
          </div>
          <p className="mt-3 text-[13px] text-[#c7c5c9] leading-relaxed flex-1">
            あなたの会社の情報は、他社から見えません。データベースの設計レベル
            (Row-Level Security) で物理的に遮断しています。
          </p>
          <div className="mt-4 text-[11px] text-[#7e7c83]">
            Notion / Linear / Supabase 採用済の標準手法
          </div>
        </div>

        {/* 2. ファイル保管 */}
        <div className="rounded-3xl bg-dusk p-6 fo-glass-rim flex flex-col">
          <div className="flex items-center gap-2">
            <Lock size={18} color="#7ec6ff" strokeWidth={1.6} />
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.68rem] text-cyan">
              ファイル保管
            </span>
          </div>
          <div className="font-display font-bold text-[1.25rem] mt-3 leading-tight">
            資料も議事録も、<br />安全に保管。
          </div>
          <p className="mt-3 text-[13px] text-[#c7c5c9] leading-relaxed flex-1">
            <span className="text-aurora">Supabase Storage (Amazon S3 互換)</span> に
            会社別フォルダで保存。共有リンクは 5 分で失効するので、流出しても無効になります。
          </p>
          <div className="mt-4 text-[11px] text-[#7e7c83]">
            AES-256 暗号化 + TLS 1.3 で通信保護
          </div>
        </div>

        {/* 3. 4 層の防御 */}
        <div className="rounded-3xl bg-dusk p-6 fo-glass-rim flex flex-col">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} color="#7ec6ff" strokeWidth={1.6} />
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.68rem] text-cyan">
              4 層の防御
            </span>
          </div>
          <div className="font-display font-bold text-[1.25rem] mt-3 leading-tight">
            破られても、<br />次がある。
          </div>
          <div className="mt-3 space-y-2 flex-1">
            {LAYERS.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-[12.5px]">
                <Check size={13} color="#7ec6ff" strokeWidth={2.4} className="shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#e7e5ea] font-medium">{s.l}</span>
                  <span className="text-[#9b99a0] ml-1.5">— {s.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 業界事例バー */}
      <div className="mt-8 rounded-2xl bg-dusk/60 px-6 py-4 fo-glass-rim flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#9b99a0]">
          同じ前提で動いているサービス
        </span>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {PEERS.map((p) => (
            <span key={p} className="text-[13px] text-[#c7c5c9]">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  </Section>
)
