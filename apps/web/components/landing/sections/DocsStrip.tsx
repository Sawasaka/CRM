import { Book, Handshake, FileText, type LucideIcon } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

interface DocCard { Icon: LucideIcon; t: string; d: string; c: string }

const CARDS: DocCard[] = [
  { Icon: Book,      t: 'セットアップガイド',         d: '30分で初期設定', c: '#abc7ff' },
  { Icon: Handshake, t: 'パートナー運用マニュアル',   d: '代理店・SIer向け', c: '#c8b9ff' },
  { Icon: FileText,  t: 'リリースノート',             d: '毎週更新',      c: '#ffcf4a' },
]

export const DocsStrip = () => (
  <Section tone="pitch" screenLabel="19 Docs">
    <div className="relative mx-auto max-w-6xl px-6 py-24">
      <Eyebrow color="#abc7ff">DOCS</Eyebrow>
      <div className="grid md:grid-cols-3 gap-3 mt-8">
        {CARDS.map((c, i) => {
          const Icon = c.Icon
          return (
            <div
              key={i}
              className="relative rounded-2xl bg-dusk p-5 fo-glass-rim block opacity-70 cursor-not-allowed"
              aria-disabled="true"
            >
              <Icon size={18} color={c.c} strokeWidth={1.5} />
              <div className="font-display font-bold text-[0.95rem] mt-3 text-[#e7e5ea]">{c.t}</div>
              <div className="text-xs text-[#9b99a0] mt-1">{c.d}</div>
              <span
                className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.04em]"
                style={{
                  background: 'rgba(171,199,255,0.10)',
                  color: '#abc7ff',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
                }}
              >
                準備中
              </span>
            </div>
          )
        })}
      </div>
    </div>
  </Section>
)
