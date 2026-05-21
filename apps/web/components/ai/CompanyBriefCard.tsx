'use client'

import { Building2, CheckCircle2, Search, Target, TrendingUp, Users } from 'lucide-react'

export type CompanyBrief = {
  companyName: string
  content: string
}

type Section = {
  title: string
  body: string
}

export function CompanyBriefCard({ brief }: { brief: CompanyBrief }) {
  const sections = extractSections(brief.content)
  const summary = firstReadableParagraph(brief.content)
  const highlights = extractBullets(brief.content).slice(0, 4)

  return (
    <div
      className="w-full overflow-hidden rounded-[var(--radius-obs-xl)]"
      style={{
        background:
          'linear-gradient(145deg, rgba(24,31,42,0.96) 0%, rgba(18,19,23,0.98) 58%, rgba(11,11,12,0.98) 100%)',
        border: '1px solid rgba(171,199,255,0.16)',
        boxShadow: '0 24px 72px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="relative px-5 py-5"
        style={{
          background:
            'radial-gradient(circle at 18% 0%, rgba(171,199,255,0.16), transparent 38%), radial-gradient(circle at 88% 15%, rgba(74,144,226,0.14), transparent 38%)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{
                color: 'var(--color-obs-primary)',
                backgroundColor: 'rgba(171,199,255,0.10)',
                border: '1px solid rgba(171,199,255,0.18)',
              }}
            >
              <Building2 size={12} />
              Company Brief
            </div>
            <h2
              className="mt-3 text-[26px] font-semibold tracking-[-0.015em] leading-tight"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {brief.companyName}
            </h2>
            {summary && (
              <p
                className="mt-2 max-w-[680px] text-[13.5px] leading-relaxed"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                {summary}
              </p>
            )}
          </div>
          <div
            className="hidden sm:flex h-10 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium"
            style={{
              color: 'var(--color-obs-low)',
              backgroundColor: 'rgba(126,198,255,0.12)',
              border: '1px solid rgba(126,198,255,0.18)',
            }}
          >
            <CheckCircle2 size={12} />
            AI Research
          </div>
        </div>

        {highlights.length > 0 && (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <div
                key={`${index}-${item.slice(0, 16)}`}
                className="rounded-[var(--radius-obs-md)] px-3 py-2 text-[12.5px] leading-relaxed"
                style={{
                  color: 'var(--color-obs-text)',
                  backgroundColor: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.055)',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2">
        {sections.slice(0, 4).map((section, index) => {
          const Icon = sectionIcons[index] ?? Search
          return (
            <section
              key={`${section.title}-${index}`}
              className="rounded-[var(--radius-obs-md)] p-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.028)',
                border: '1px solid rgba(109,106,111,0.16)',
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon size={15} style={{ color: 'var(--color-obs-primary)' }} />
                <h3
                  className="text-[13px] font-semibold tracking-[-0.005em]"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {section.title}
                </h3>
              </div>
              <p
                className="text-[12.5px] leading-relaxed whitespace-pre-line"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                {section.body}
              </p>
            </section>
          )
        })}
      </div>
    </div>
  )
}

const sectionIcons = [TrendingUp, Target, Users, Search]

function extractSections(content: string): Section[] {
  const lines = content.split('\n')
  const sections: Section[] = []
  let current: Section | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const heading = line.match(/^#{1,4}\s*(.+)$/) ?? line.match(/^\*\*(.+?)\*\*:?$/)
    if (heading?.[1]) {
      if (current?.body.trim()) sections.push(current)
      current = { title: cleanText(heading[1]), body: '' }
      continue
    }

    if (!current) current = { title: '要点', body: '' }
    const cleaned = cleanText(line)
    if (cleaned) current.body += `${current.body ? '\n' : ''}${cleaned}`
  }

  if (current?.body.trim()) sections.push(current)

  if (sections.length === 0) {
    return [{ title: '企業ブリーフ', body: cleanText(content).slice(0, 700) }]
  }

  return sections.map((section) => ({
    title: normalizeTitle(section.title),
    body: section.body.slice(0, 700),
  }))
}

function extractBullets(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*・]\s+/.test(line))
    .map(cleanText)
    .filter(Boolean)
}

function firstReadableParagraph(content: string): string {
  const paragraph =
    content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && !/^[-*・]\s+/.test(line))
      .map(cleanText)
      .find((line) => line && !line.match(/^\d+\./)) ?? ''
  return paragraph.slice(0, 180)
}

function normalizeTitle(title: string): string {
  const clean = cleanText(title)
  if (/について/.test(clean)) return '企業概要'
  if (/概要|事業|サービス/.test(clean)) return '企業概要'
  if (/課題|仮説|論点/.test(clean)) return '課題仮説'
  if (/キーパーソン|接点|組織/.test(clean)) return '接点仮説'
  if (/営業|アプローチ|提案/.test(clean)) return '営業アプローチ'
  if (/確認|次/.test(clean)) return '次に確認すること'
  return clean.slice(0, 24)
}

function cleanText(text: string): string {
  return text
    .replace(/^[-*・]\s+/, '')
    .replace(/^#{1,4}\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim()
}
