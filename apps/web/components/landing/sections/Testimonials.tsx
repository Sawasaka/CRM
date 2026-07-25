import Image from 'next/image'
import { Eyebrow, Section } from '../atoms'

export const Testimonials = () => (
  <Section tone="obsidian" screenLabel="14 Voice" className="relative overflow-hidden">
    {/* top divider — ROI セクションとの境界を明示 */}
    <div
      className="h-px w-full"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.08) 20%, rgba(171,199,255,0.20) 50%, rgba(171,199,255,0.08) 80%, transparent 100%)',
      }}
    />
    {/* ambient halo */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(171,199,255,0.05) 0%, transparent 55%)',
      }}
    />

    <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Eyebrow color="#abc7ff">FOUNDATION CASE</Eyebrow>
      <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.04] mt-5">
        <span className="fo-gradient-text">実験の前に、測れる土台をつくる。</span>
      </h2>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-[#9b99a0]">
        データが分散したままでは、統計モデルを入れても正しい判断はできません。
        まず売上接点をつなぎ、その上に検証と配分の仕組みを重ねます。
      </p>

      {/* Featured testimonial — 1号契約企業 */}
      <div
        className="mt-12 rounded-3xl p-[1.5px]"
        style={{
          background:
            'linear-gradient(135deg, rgba(171,199,255,0.55), rgba(0,113,227,0.30) 50%, transparent 90%)',
          boxShadow: '0 24px 60px -20px rgba(171,199,255,0.32), 0 0 0 1px rgba(171,199,255,0.08)',
        }}
      >
        <div className="rounded-[22px] bg-dusk fo-glass-rim p-8 md:p-12 relative overflow-hidden">
          {/* ambient orbs */}
          <div
            className="absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(171,199,255,0.20), transparent 60%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute -bottom-24 -left-20 w-60 h-60 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,113,227,0.12), transparent 60%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Top: 1号契約 badge + 企業情報 */}
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-[0.14em] uppercase"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,193,7,0.18), rgba(255,193,7,0.06))',
                  color: '#FFD66B',
                  boxShadow: 'inset 0 0 0 1px rgba(255,193,7,0.32)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse"
                  style={{ boxShadow: '0 0 6px #ffcf4a' }}
                />
                PARTNERSHIP
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Logo (白背景パネル内で表示 — オリジナルロゴが白地想定) */}
              <div
                className="hidden sm:flex items-center justify-center rounded-xl px-3 py-2 shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.96)',
                  boxShadow:
                    'inset 0 0 0 1px rgba(171,199,255,0.20), 0 4px 14px -4px rgba(0,0,0,0.25)',
                }}
              >
                <Image
                  src="/customers/very-forward.svg"
                  alt="Very Forward"
                  width={120}
                  height={68}
                  className="h-9 w-auto"
                  unoptimized
                />
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-[1.05rem] text-[#e7e5ea] tracking-[-0.01em]">
                  合同会社ベリーフォワード
                </div>
                <div className="text-[12px] text-[#9b99a0] mt-1">代表 磯利弘 様</div>
              </div>
            </div>
          </div>

          {/* Quote — 引用本文(主役ではなく、補足の読み物として薄め+小さめ) */}
          <div className="relative">
            <div
              className="font-display font-bold text-[5rem] leading-none -mt-3 select-none"
              style={{ color: 'rgba(171,199,255,0.12)' }}
            >
              &quot;
            </div>
            <p className="font-display font-medium text-[0.92rem] md:text-[1.1rem] leading-[1.8] tracking-[-0.005em] text-[#9b99a0] -mt-10 relative">
              営業活動を拡大していく中で、商談情報や顧客接点、提案内容が個別のツールやメモに分散し、
              <span className="text-[#cfdcff]">案件状況や次に取るべき行動を把握しづらい課題</span>
              がありました。少人数体制でも営業の再現性を高め、見込み顧客へのアプローチ精度を上げるため、
              <span className="text-[#cfdcff]">
                Notion・Google
                Workspace・Zoom・CRMにAIを組み合わせ、売上インフラとしてまとめて設計できる
              </span>
              点に魅力を感じ、導入を決定しました。
            </p>
          </div>

          {/* Bottom: 課題 → 解決の整理(主役 — 3項目を同じテキストスタイルで揃える) */}
          <div className="relative mt-10 pt-8 border-t border-white/[0.10] grid md:grid-cols-[1fr_1fr_1.4fr] gap-5">
            <div className="min-w-0">
              <div className="text-[10.5px] uppercase tracking-[0.18em] text-aurora font-semibold mb-3 whitespace-nowrap">
                課題
              </div>
              <div className="font-display font-bold text-[14.5px] md:text-[15.5px] text-[#e7e5ea] leading-snug whitespace-nowrap">
                商談情報が個別ツールに分散
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10.5px] uppercase tracking-[0.18em] text-aurora font-semibold mb-3 whitespace-nowrap">
                目的
              </div>
              <div className="font-display font-bold text-[14.5px] md:text-[15.5px] text-[#e7e5ea] leading-snug whitespace-nowrap">
                見込み顧客へのアプローチ精度向上
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10.5px] uppercase tracking-[0.18em] text-aurora font-semibold mb-3 whitespace-nowrap">
                設計
              </div>
              <div className="font-display font-bold text-[14.5px] md:text-[15.5px] text-[#e7e5ea] leading-snug whitespace-nowrap">
                既存SaaSと売上データを接続
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 注釈 */}
      <p className="mt-6 text-center text-[11px] text-[#7e7c83]">
        ※ 他社様のお声も順次掲載予定です。
      </p>
    </div>

    {/* bottom divider — パートナープログラムセクションとの境界を明示 */}
    <div
      className="relative h-px w-full"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.06) 20%, rgba(171,199,255,0.15) 50%, rgba(171,199,255,0.06) 80%, transparent 100%)',
      }}
    />
  </Section>
)
