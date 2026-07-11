'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { AITipsColumn } from '@/lib/ai-tips-columns'

type ColumnsIndexClientProps = {
  columns: AITipsColumn[]
}

const formatDate = (date: string) => date.replaceAll('-', '.')

export function ColumnsIndexClient({ columns }: ColumnsIndexClientProps) {
  const genres = useMemo(() => ['すべて', ...Array.from(new Set(columns.map((column) => column.genre)))], [columns])
  const [activeGenre, setActiveGenre] = useState('すべて')

  const filteredColumns = useMemo(() => {
    return [...columns]
      .filter((column) => activeGenre === 'すべて' || column.genre === activeGenre)
      .sort((a, b) => {
        const newsDiff = b.newsPublishedAt.localeCompare(a.newsPublishedAt)
        if (newsDiff !== 0) return newsDiff
        return b.publishedAt.localeCompare(a.publishedAt)
      })
  }, [activeGenre, columns])

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2">
        {genres.map((genre) => {
          const active = genre === activeGenre
          return (
            <button
              key={genre}
              type="button"
              onClick={() => setActiveGenre(genre)}
              className={[
                'rounded-full border px-4 py-2 text-[12px] font-semibold transition',
                active
                  ? 'border-[#abc7ff]/50 bg-[#abc7ff]/16 text-[#f4f7ff] shadow-[0_0_24px_rgba(171,199,255,0.14)]'
                  : 'border-white/[0.08] bg-white/[0.035] text-[#a9a6af] hover:border-white/[0.18] hover:text-white',
              ].join(' ')}
            >
              {genre}
            </button>
          )
        })}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {filteredColumns.map((column) => (
          <Link
            key={column.slug}
            href={`/columns/${column.slug}`}
            className="group overflow-hidden rounded-[28px] bg-[#0b0d13] p-[1px] fo-glass-rim"
          >
            <article className="h-full overflow-hidden rounded-[27px] bg-[#10141d]">
              <div className="relative aspect-[16/8.5] overflow-hidden">
                <Image
                  src={column.image}
                  alt={`${column.title} のサムネイル`}
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10141d] via-[#10141d]/16 to-transparent" />
                <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-semibold"
                    style={{ background: `${column.accent}18`, color: column.accent }}
                  >
                    {column.genre}
                  </span>
                  <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold text-[#d7d4dd]">
                    News {formatDate(column.newsPublishedAt)}
                  </span>
                </div>
              </div>
              <div className="p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9b99a0]">
                  <Sparkles size={13} color={column.accent} />
                  <span>{column.category}</span>
                  <span className="h-1 w-1 rounded-full bg-[#55525c]" />
                  <span>{column.readingTime}</span>
                </div>
                <h2 className="mt-4 text-[1.15rem] font-bold leading-relaxed text-[#f2f0f5] md:text-[1.35rem]">
                  {column.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#a9a6af]">{column.description}</p>
                <div className="mt-5 grid gap-2 rounded-2xl bg-black/24 p-3 text-[11px] text-[#9b99a0] sm:grid-cols-2">
                  <span>ニュース公開日: {formatDate(column.newsPublishedAt)}</span>
                  <span>参照元: {column.sourceName}</span>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold" style={{ color: column.accent }}>
                  コラムを読む
                  <ArrowRight size={14} />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </>
  )
}
