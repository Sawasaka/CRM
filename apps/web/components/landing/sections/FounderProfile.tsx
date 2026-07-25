import Image from 'next/image'
import Link from 'next/link'
import {
  BadgeCheck,
  BriefcaseBusiness,
  Code2,
  Gauge,
  Handshake,
  Megaphone,
  Settings2,
} from 'lucide-react'
import { companyName, companyProfilePath } from '@/lib/public-site'
import { Eyebrow, NebulaBG, Section } from '../atoms'

const skillItems = [
  {
    label: '計測 / マーケティング',
    detail: 'GA4 / Search Console / Google Ads / UTM / CVR',
    icon: Megaphone,
  },
  {
    label: 'データ / 開発',
    detail: 'HubSpot / BigQuery / Codex / GitHub / AWS',
    icon: Code2,
  },
  {
    label: '営業',
    detail: 'HubSpot / Salesforce / 商談化率 / 受注率',
    icon: Handshake,
  },
  {
    label: '統計モデル',
    detail: 'Monte Carlo / Bayesian / A/B Test',
    icon: Settings2,
  },
  {
    label: '実験配分',
    detail: 'Bandit / Thompson Sampling / Allocation',
    icon: Gauge,
  },
]

const achievementItems = [
  {
    metric: 'ARR 500万円',
    role: '外資SaaS Sales Executive',
    detail:
      '日本法人の正社員1人目として営業基盤をゼロから構築。Country Manager Layerを担い、1年間でARR 500万円を創出。',
  },
  {
    metric: '月間50人以上の登録者数獲得',
    role: 'ITスタートアップ 執行役員CRO',
    detail: '執行役員としてtoC事業の営業・マーケ導線を設計し、月間50人以上の登録者獲得を実現。',
  },
]

const careerItems = [
  {
    label: 'Career 01',
    title: '外資SaaS 日本法人立ち上げ',
    body: '正社員1人目として、初回商談から導入・CSまで一貫して担当。',
  },
  {
    label: 'Career 02',
    title: 'ITスタートアップ 執行役員CRO',
    body: '営業・マーケ・CSを横断し、売上につながる業務導線を設計。',
  },
  {
    label: 'Career 03',
    title: 'エンジニア出身の実験基盤設計',
    body: '業務要件を聞き、データ収集・分析・運用設計まで実装へ落とし込む。',
  },
]

export const FounderProfile = () => (
  <Section
    id="founder-profile"
    tone="obsidian"
    screenLabel="15 Founder Profile"
    className="relative overflow-hidden"
  >
    <div
      className="h-px w-full"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.08) 20%, rgba(171,199,255,0.20) 50%, rgba(171,199,255,0.08) 80%, transparent 100%)',
      }}
    />
    <NebulaBG intensity={0.52} />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(circle at 18% 22%, rgba(171,199,255,0.08), transparent 34%), radial-gradient(circle at 82% 50%, rgba(0,113,227,0.08), transparent 38%)',
      }}
    />

    <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <Eyebrow color="#abc7ff">Founder / Revenue Experiment Architect</Eyebrow>
          <h2 className="mt-4 font-display text-[2.1rem] font-bold leading-[1.04] tracking-[-0.025em] md:text-[2.75rem]">
            <span className="fo-gradient-text">現場を聞き、</span>
            <br />
            <span className="fo-gradient-text-soft">実験までつなぐ。</span>
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[#bdbac3] md:text-[0.92rem] lg:pb-1">
          営業・マーケティングの現場を聞き、データ収集から仮説検証、配分改善までを売上実験の仕組みへ。
          ヒアリングした本人が、設計・実装・運用改善まで一気通貫で担当します。
        </p>
      </div>

      <div className="mt-7 overflow-hidden rounded-[1.35rem] border border-[rgba(171,199,255,0.18)] bg-[rgba(9,11,16,0.88)] shadow-[0_24px_80px_rgba(0,0,0,0.36)] fo-glass-rim">
        <div className="grid lg:grid-cols-[0.68fr_1.32fr]">
          <aside className="border-b border-white/[0.08] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-4">
              <Image
                src="/founder-icon.png"
                alt="沢坂弘樹"
                width={108}
                height={108}
                sizes="108px"
                className="h-[108px] w-[108px] shrink-0 rounded-xl border border-white/10 object-cover grayscale-[18%] shadow-[0_18px_48px_rgba(0,0,0,0.34)]"
              />
              <div className="min-w-0">
                <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#abc7ff]">
                  Representative
                </div>
                <h3 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight text-white">
                  沢坂弘樹
                </h3>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[0.64rem] font-semibold text-[#8dffc9]">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Founder / Revenue Experiment Architect
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 border-y border-white/[0.07] py-4">
              <div className="border-l border-[#abc7ff]/25 pl-3">
                <div className="text-[0.6rem] font-semibold tracking-[0.14em] text-[#abc7ff]">
                  DIRECT
                </div>
                <div className="mt-1 text-[0.76rem] font-semibold text-[#e7e5ea]">
                  本人が現場をヒアリング
                </div>
              </div>
              <div className="border-l border-[#abc7ff]/25 pl-3">
                <div className="text-[0.6rem] font-semibold tracking-[0.14em] text-[#abc7ff]">
                  END TO END
                </div>
                <div className="mt-1 text-[0.76rem] font-semibold text-[#e7e5ea]">
                  設計・構築・運用まで担当
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#7e7c83]">
                Company Profile
              </div>
              <div className="grid grid-cols-[62px_minmax(0,1fr)] gap-y-2 text-[0.66rem]">
                <span className="text-[#7e7c83]">提供</span>
                <Link
                  href={companyProfilePath}
                  className="text-[#c7c5c9] transition-colors hover:text-[#abc7ff]"
                >
                  {companyName}
                </Link>
                <span className="text-[#7e7c83]">設立</span>
                <span className="text-[#c7c5c9]">2025年9月</span>
                <span className="text-[#7e7c83]">拠点</span>
                <span className="text-[#c7c5c9]">東京都 中央区</span>
                <span className="text-[#7e7c83]">法人番号</span>
                <span className="text-[#c7c5c9]">8010001258471</span>
                <span className="text-[#7e7c83]">連絡</span>
                <a
                  href="mailto:h.sawasaka@rookiesmart.jp"
                  className="min-w-0 break-all text-[#c7c5c9] transition-colors hover:text-[#abc7ff]"
                >
                  h.sawasaka@rookiesmart.jp
                </a>
              </div>
            </div>
          </aside>

          <div className="p-5 sm:p-6">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#abc7ff]">
              Expertise
            </div>
            <div className="mt-3 grid grid-cols-2 border-y border-white/[0.08] sm:grid-cols-[1.45fr_repeat(4,minmax(0,1fr))]">
              {skillItems.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="min-w-0 px-2 py-3 sm:border-l sm:border-white/[0.07] sm:first:border-l-0 sm:first:pl-0 sm:last:pr-0"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#abc7ff]" aria-hidden="true" />
                    <div className="mt-2 text-[0.7rem] font-bold text-[#edf2ff]">{item.label}</div>
                    <div className="mt-1 text-[0.6rem] font-medium leading-4 text-[#8f8c95]">
                      {item.detail}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#abc7ff]">
                <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                Professional Background
              </div>
              <div className="mt-3 divide-y divide-white/[0.07] border-t border-white/[0.07]">
                {careerItems.map((item) => (
                  <div
                    key={item.label}
                    className="grid gap-1.5 py-2.5 sm:grid-cols-[70px_190px_minmax(0,1fr)] sm:gap-3"
                  >
                    <div className="text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-[#7e7c83]">
                      {item.label}
                    </div>
                    <div className="text-[0.76rem] font-bold leading-5 text-[#f2f0f5]">
                      {item.title}
                    </div>
                    <div className="whitespace-nowrap text-[0.6rem] leading-5 text-[#9f9ca6]">
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-white/[0.08] pt-4">
              <div className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#abc7ff]">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Track Record
              </div>
              <div className="mt-3 grid divide-y divide-white/[0.08] py-2 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {achievementItems.map((item) => (
                  <div
                    key={item.metric}
                    className="min-w-0 py-3 first:pt-0 last:pb-0 sm:px-4 sm:py-0 sm:first:pl-0 sm:last:pr-0"
                  >
                    <div className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#abc7ff]">
                      {item.role}
                    </div>
                    <div className="mt-1.5 text-[1rem] font-bold leading-5 text-white">
                      {item.metric}
                    </div>
                    <div className="mt-1.5 line-clamp-2 max-w-[19rem] text-[0.64rem] leading-[1.65] text-[#9f9ca6]">
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      className="relative h-px w-full"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.06) 20%, rgba(171,199,255,0.15) 50%, rgba(171,199,255,0.06) 80%, transparent 100%)',
      }}
    />
  </Section>
)
