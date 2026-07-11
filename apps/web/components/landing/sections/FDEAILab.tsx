import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { fdeAIArticles } from '@/lib/fde-ai-lab'
import { Eyebrow, Section } from '../atoms'

export const FDEAILab = () => (
  <Section tone="pitch" screenLabel="15 FDE AI Lab" className="relative overflow-hidden">
    <div
      className="h-px w-full"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(200,185,255,0.07) 20%, rgba(200,185,255,0.18) 50%, rgba(200,185,255,0.07) 80%, transparent 100%)',
      }}
    />

    <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.74fr_1.66fr] lg:items-center">
        <div>
          <Eyebrow color="#c8b9ff">FDE MEDIA</Eyebrow>
          <h2 className="mt-5 font-display text-[2.25rem] font-bold leading-[1.04] tracking-[-0.02em] md:text-[3.2rem]">
            <span className="fo-gradient-text-soft">FDE AI Lab</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-8 text-[#c7c5c9] md:text-base">
            FDE / Forward Deployed Engineerの事例を読み解く専門メディアです。
            実際の公開事例を、営業・CS・PdMの現場で使える実装知に翻訳します。
          </p>
          <Link
            href="/media"
            className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-[1px]"
            style={{
              background: 'linear-gradient(135deg, #9f8cff 0%, #1e6fcc 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(200,185,255,0.20), 0 14px 30px -18px rgba(159,140,255,0.60)',
            }}
          >
            FDE AI Labを見る
            <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {fdeAIArticles.map((article) => (
            <Link
              key={article.title}
              href={`/media/${article.slug}`}
              className="group flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] fo-glass-rim transition-colors hover:bg-white/[0.055]"
            >
              <div className="relative aspect-video overflow-hidden border-b border-white/[0.08] bg-black/20">
                <Image
                  src={article.image}
                  alt={`${article.title} のサムネイル`}
                  fill
                  sizes="(min-width: 1024px) 250px, (min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.10em]"
                    style={{ background: `${article.color}18`, color: article.color }}
                  >
                    FDEの事例
                  </span>
                  <span className="text-[10px] font-semibold text-[#7e7c83]">{article.source}</span>
                </div>

                <h3 className="mt-3 font-display text-[1.04rem] font-bold leading-snug text-[#f4f3f7]">
                  {article.title}
                </h3>
                <p className="mt-3 line-clamp-4 text-[12.5px] leading-6 text-[#b8b5be]">{article.summary}</p>

                <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/15 p-3">
                  <p className="text-[10px] font-semibold tracking-[0.12em]" style={{ color: article.color }}>
                    FDE視点
                  </p>
                  <p className="mt-2 line-clamp-3 text-[12px] leading-6 text-[#9b99a0]">{article.fdeView}</p>
                </div>

                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {article.points.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/[0.08] bg-black/20 px-2 py-1 text-[9px] font-semibold text-white/65"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </Section>
)
