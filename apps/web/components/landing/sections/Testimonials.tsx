import Image from 'next/image'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const caseFlow = ['分散した顧客接点を整理', '商談と次アクションを接続', '改善できる売上基盤へ']

export const Testimonials = () => (
  <section className="relative border-b border-white/[0.08] bg-[#0f141c]">
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28">
      <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
        <div>
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#72b5ff]">
            Foundation case
          </div>
          <h2 className="mt-4 font-display text-[2.1rem] font-bold leading-[1.08] text-white md:text-[2.85rem]">
            実験の前に、
            <br />
            <span className="text-[#72b5ff]">測れる土台をつくる。</span>
          </h2>
        </div>
        <p className="max-w-[41rem] text-sm leading-7 text-[#aeb6c2] lg:ml-auto">
          データが分散したままでは、統計モデルを入れても正しい判断はできません。
          まず売上接点をつなぎ、その上に検証と配分の仕組みを重ねます。
        </p>
      </div>

      <article className="mt-10 rounded-lg border border-white/[0.1] bg-[#0a0e14]">
        <div className="grid lg:grid-cols-[0.62fr_1.38fr]">
          <div className="border-b border-white/[0.08] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="inline-flex rounded bg-[#ffcf5a]/10 px-2 py-1 text-[0.56rem] font-bold tracking-[0.14em] text-[#ffcf5a]">
              PARTNERSHIP
            </div>
            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-white p-2">
                <Image
                  src="/customers/very-forward.svg"
                  alt="Very Forward"
                  width={120}
                  height={68}
                  className="h-auto w-full"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">合同会社ベリーフォワード</h3>
                <p className="mt-1 text-[0.66rem] text-[#858f9e]">代表 磯利弘 様</p>
              </div>
            </div>
            <div className="mt-7 space-y-3">
              {caseFlow.map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#67dfb0]" aria-hidden="true" />
                  <span className="text-[0.68rem] font-semibold text-[#c1c8d2]">{item}</span>
                  {index < caseFlow.length - 1 ? (
                    <ArrowRight
                      className="ml-auto hidden h-3.5 w-3.5 text-[#465365] sm:block"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="text-5xl leading-none text-[#72b5ff]/20" aria-hidden="true">
              &ldquo;
            </div>
            <blockquote className="-mt-4 text-[0.86rem] leading-8 text-[#bdc5d0] md:text-[0.94rem]">
              営業活動を拡大していく中で、商談情報や顧客接点、提案内容が個別のツールやメモに分散し、
              案件状況や次に取るべき行動を把握しづらい課題がありました。少人数体制でも営業の再現性を高め、
              見込み顧客へのアプローチ精度を上げるため、Notion・Google Workspace・Zoom・CRMを
              売上インフラとしてまとめて設計できる点に魅力を感じ、導入を決定しました。
            </blockquote>
            <div className="mt-7 grid gap-3 border-t border-white/[0.08] pt-6 sm:grid-cols-3">
              {[
                ['課題', '商談情報が分散'],
                ['目的', 'アプローチ精度向上'],
                ['設計', '既存SaaSを接続'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#72b5ff]">
                    {label}
                  </div>
                  <div className="mt-1.5 text-[0.7rem] font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
)
