export const Footer = () => (
  <footer className="relative bg-[#0e0e10]">
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="font-display font-bold text-[1.4rem] fo-gradient-text">ルキスマCRM</div>
          <div className="text-xs text-[#7e7c83] mt-3 leading-relaxed">
            BGM (Business Growth Management) — レベニュー側を統合する、はじめてのカテゴリ。
          </div>
        </div>
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          {[
            { h: 'Product',   l: ['Chat Home', 'CRM', 'Marketing', 'PDM', 'Helpdesk', 'Support'] },
            { h: 'Company',   l: ['About', 'Careers', 'News', 'Contact'] },
            { h: 'Trust',     l: ['Security', 'Privacy', 'SOC2', 'Status'] },
            { h: 'Resources', l: ['Docs', 'API', 'Release Notes', 'Partners'] },
          ].map((g, i) => (
            <div key={i}>
              <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-[#7e7c83]">{g.h}</div>
              <ul className="mt-4 space-y-2 text-[#9b99a0]">
                {g.l.map((x) => (
                  <li key={x}>
                    <a href="#" className="hover:text-aurora">{x}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div
        className="mt-14 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#7e7c83]"
        style={{ borderTop: '1px solid rgba(65,71,83,0.18)' }}
      >
        <div>© 2026 RookieSmart Inc. — ルキスマCRM is a service of RookieSmart Inc.</div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-aurora">Terms</a>
          <a href="#" className="hover:text-aurora">Privacy</a>
          <a href="#" className="hover:text-aurora">特定商取引法</a>
        </div>
      </div>
    </div>
  </footer>
)
