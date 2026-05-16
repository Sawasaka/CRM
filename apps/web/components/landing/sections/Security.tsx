import { Database, Layers, Lock, Shield, Check } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export const Security = () => (
  <Section tone="pitch" screenLabel="09 Security">
    <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
      <div className="max-w-3xl">
        <Eyebrow color="#7ec6ff">SECURITY ARCHITECTURE</Eyebrow>
        <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.4rem] leading-[1.06] mt-5">
          セキュリティは、
          <br />
          <span className="fo-gradient-text">見せないと、信じられない。</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-12 gap-6 mt-14">
        {/* 9-A RLS */}
        <div className="md:col-span-7 rounded-3xl bg-dusk p-7 fo-glass-rim">
          <div className="flex items-center gap-2">
            <Database size={16} color="#7ec6ff" strokeWidth={1.5} />
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-cyan">
              9-A · ROW-LEVEL SECURITY
            </span>
          </div>
          <div className="font-display font-bold text-[1.4rem] mt-3">DBレベルから、テナントを物理遮断。</div>
          <div className="mt-5 rounded-xl bg-[#0d0d0f] p-5 font-mono text-[12.5px] leading-relaxed fo-glass-rim">
            <div className="text-[#7e7c83]">-- PostgreSQL Row-Level Security policy</div>
            <div>
              <span className="text-coral">CREATE POLICY</span>{' '}
              <span className="text-aurora">tenant_isolation</span>{' '}
              <span className="text-coral">ON</span> deals
            </div>
            <div className="pl-4">
              <span className="text-coral">USING</span> (tenant_id = auth.jwt() <span className="text-amber">-&gt;&gt;</span>{' '}
              <span className="text-mint">{"'tenant_id'"}</span>);
            </div>
          </div>
          <div className="mt-3 text-xs text-[#7e7c83]">Notion / Linear / Vercel / Supabase 本体も採用</div>
        </div>

        {/* 9-B Defense in Depth */}
        <div className="md:col-span-5 rounded-3xl bg-dusk p-7 fo-glass-rim">
          <div className="flex items-center gap-2">
            <Layers size={16} color="#7ec6ff" strokeWidth={1.5} />
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-cyan">
              9-B · DEFENSE IN DEPTH
            </span>
          </div>
          <div className="font-display font-bold text-[1.4rem] mt-3">4層スタック。</div>
          <div className="mt-5 space-y-2.5" style={{ perspective: '1200px' }}>
            {[
              { l: 'アプリ層 ／ AuthZ',        c: '#abc7ff', o: 0  },
              { l: 'DB層 ／ RLS',              c: '#7ec6ff', o: 6  },
              { l: '監査 ／ Audit Log',        c: '#c8b9ff', o: 12 },
              { l: '暗号化 ／ AES-256 + TLS 1.3', c: '#8dffc9', o: 18 },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-3 text-sm flex items-center justify-between fo-glass-rim"
                style={{
                  background: `linear-gradient(90deg, ${s.c}10, ${s.c}04)`,
                  transform: `translateX(${s.o}px) translateZ(${i * -8}px)`,
                  boxShadow: `inset 0 0 0 1px ${s.c}28`,
                }}
              >
                <span className="text-[#e7e5ea]">{s.l}</span>
                <Check size={14} color={s.c} />
              </div>
            ))}
          </div>
        </div>

        {/* 9-C File isolation */}
        <div className="md:col-span-7 rounded-3xl bg-dusk p-7 fo-glass-rim">
          <div className="flex items-center gap-2">
            <Lock size={16} color="#7ec6ff" strokeWidth={1.5} />
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-cyan">
              9-C · FILE ISOLATION
            </span>
          </div>
          <div className="font-display font-bold text-[1.4rem] mt-3">テナントprefix分離 + 5分失効 Signed URL。</div>
          <div className="mt-5 grid md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#0d0d0f] p-4 font-mono text-[12.5px] leading-relaxed fo-glass-rim">
              <div className="text-[#7e7c83]"># bucket layout</div>
              <div>bucket/</div>
              <div className="pl-3 text-aurora">├ tnt_aaa/</div>
              <div className="pl-6 text-[#c7c5c9]">├ deals/2026/...</div>
              <div className="pl-6 text-[#c7c5c9]">└ meetings/...</div>
              <div className="pl-3 text-mint">├ tnt_bbb/</div>
              <div className="pl-6 text-[#c7c5c9]">└ ...</div>
              <div className="pl-3 text-coral">└ tnt_ccc/</div>
            </div>
            <div className="rounded-xl bg-[#0d0d0f] p-4 font-mono text-[12.5px] leading-relaxed fo-glass-rim">
              <div className="text-[#7e7c83]"># signed URL (5-min expiry)</div>
              <div>
                <span className="text-coral">const</span> url = <span className="text-aurora">await</span> sign(file, &#123;
              </div>
              <div className="pl-3">
                tenantId, ttlSec: <span className="text-mint">300</span>,
              </div>
              <div className="pl-3">
                scope: <span className="text-mint">{"'read'"}</span>,
              </div>
              <div>&#125;);</div>
            </div>
          </div>
        </div>

        {/* 9-D Industry adoption */}
        <div className="md:col-span-5 rounded-3xl bg-dusk p-7 fo-glass-rim">
          <div className="flex items-center gap-2">
            <Shield size={16} color="#7ec6ff" strokeWidth={1.5} />
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-cyan">
              9-D · INDUSTRY STANDARD
            </span>
          </div>
          <div className="font-display font-bold text-[1.4rem] mt-3">RLS は業界標準。</div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {['Notion', 'Linear', 'Vercel', 'Supabase'].map((t) => (
              <div
                key={t}
                className="rounded-xl px-4 py-3 bg-pitch text-center text-sm text-white/60 hover:text-white transition-colors fo-glass-rim"
              >
                {t}
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-[#7e7c83] leading-relaxed">
            これらのプロダクトと同じ前提で、KikuCRM も設計されています。「やっています」だけでなく、コードで見せます。
          </p>
        </div>
      </div>
    </div>
  </Section>
)
