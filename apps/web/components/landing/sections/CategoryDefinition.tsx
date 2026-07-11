import { Eyebrow, Section } from '../atoms'

export const CategoryDefinition = () => (
  <Section tone="pitch" screenLabel="03 Category">
    <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
      <div className="grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <Eyebrow color="#abc7ff">Revenue AI/DX Infrastructure</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.4rem] leading-[1.06] mt-5">
            <span className="text-[#9b99a0]">ツールを入れる時代から、</span>
            <br />
            <span className="fo-gradient-text">売上インフラを設計する時代へ。</span>
          </h2>
        </div>
        <div className="md:col-span-7 md:pl-10 space-y-4 text-[#c7c5c9] text-[1.05rem] leading-relaxed">
          <p>AIやDXは、単体ツールを契約するだけでは成果につながりません。</p>
          <p>営業・マーケ・CSの現場に合わせて、Obsidian、Notion、Google Workspace、Microsoft、ZoomなどをAIと接続します。</p>
          <p>議事録、社内ナレッジ、ドキュメント、問い合わせ、顧客メモを横断し、次に取るべきアクションが自然に生まれるインフラへ整えます。</p>
          <p className="text-[#7e7c83]">私自身がFDE（Forward Deployed Engineer）形式でヒアリングし、御社の状況に合わせたAI/DXインフラとして設計します。</p>
        </div>
      </div>

      <div className="mt-20 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-dusk p-8 md:p-10 fo-lift fo-glass-rim">
          <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-[#7e7c83]">BACK OFFICE</div>
          <div className="font-display font-bold text-[1.6rem] mt-3 text-[#9b99a0]">守る、整える、回す。</div>
          <div className="mt-6 flex flex-wrap gap-2">
            {['人事', '会計', '法務', '総務', '購買', '勤怠', '給与', '経費', '契約'].map((t) => (
              <span key={t} className="rounded-full px-3 py-1 text-sm bg-shimmer/60 text-[#9b99a0]">{t}</span>
            ))}
          </div>
          <div className="mt-8 text-xs text-[#7e7c83]">freee / SmartHR / Money Forward / Workday …</div>
        </div>
        <div
          className="rounded-3xl p-[1px] fo-lift"
          style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.4), rgba(0,113,227,0.3), transparent 70%)' }}
        >
          <div className="rounded-3xl bg-pitch p-8 md:p-10 h-full fo-glass-rim relative overflow-hidden">
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(171,199,255,0.18), transparent 60%)', filter: 'blur(40px)' }}
            />
            <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-aurora relative">
              Revenue Stack
            </div>
            <div className="font-display font-bold text-[1.6rem] mt-3 fo-gradient-text relative">聞く、判断する、動く。</div>
            <div className="mt-6 flex flex-wrap gap-2 relative">
              {[
                ['Obsidian', '#d3a5ff'], ['Notion', '#e7e5ea'], ['Google Workspace', '#abc7ff'],
                ['Microsoft 365', '#7ec6ff'], ['Zoom', '#7aa4ff'], ['Chatbot', '#ff8dcf'],
                ['CRM', '#8dffc9'], ['Owned Media', '#c8b9ff'],
              ].map(([t, c]) => (
                <span
                  key={t}
                  className="rounded-full px-3 py-1 text-sm"
                  style={{ background: `${c}14`, color: c, boxShadow: `inset 0 0 0 1px ${c}30` }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-8 text-xs text-aurora/80">AI/DX Infrastructure by 株式会社ルーキースマートジャパン / 沢坂弘樹</div>
          </div>
        </div>
      </div>
    </div>
  </Section>
)
