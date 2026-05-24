/**
 * Footer — リリース準備中。
 * リンクツリーは廃止し、お問い合わせフォーム + 法務リンクで構成。
 * フォームは ContactForm (client component) に切り出し。
 */

import { ContactForm } from './ContactForm'

export const Footer = () => (
  <footer className="relative bg-[#0e0e10]">
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start">
        {/* 左: ブランド情報 */}
        <div className="md:col-span-4 md:sticky md:top-24">
          <div className="font-display font-bold text-[1.5rem] fo-gradient-text leading-none">
            ルキスマCRM
          </div>
          <p className="text-[12px] text-[#9b99a0] mt-3 leading-relaxed">
            営業データから何でも答えるチャットCRM。
          </p>

          <div
            className="mt-5 pt-5 space-y-2 text-[12px]"
            style={{ borderTop: '1px solid rgba(171,199,255,0.10)' }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.10em] text-[#7e7c83] w-10 shrink-0">
                提供
              </span>
              <span className="text-[#c7c5c9]">株式会社ルーキースマートジャパン</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.10em] text-[#7e7c83] w-10 shrink-0">
                代表
              </span>
              <span className="text-[#c7c5c9]">沢坂 弘樹</span>
            </div>
          </div>

          <div
            className="mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px]"
            style={{
              background: 'rgba(171,199,255,0.06)',
              color: '#9b99a0',
              boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: '#abc7ff' }}
            />
            リリース準備中
          </div>
        </div>

        {/* 右: お問い合わせフォーム */}
        <div className="md:col-span-8">
          <div className="flex items-baseline justify-between mb-3 gap-3">
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-[#7e7c83]">
              Contact
            </span>
            <span className="text-[10.5px] text-[#7e7c83]">
              h.sawasaka@rookiesmart.jp
            </span>
          </div>
          <ContactForm />
        </div>
      </div>

      <div
        className="mt-14 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#7e7c83]"
        style={{ borderTop: '1px solid rgba(65,71,83,0.18)' }}
      >
        <div>© 2026 株式会社ルーキースマートジャパン</div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a href="/legal/terms" className="hover:text-aurora transition-colors">
            利用規約
          </a>
          <a href="/legal/privacy" className="hover:text-aurora transition-colors">
            プライバシー
          </a>
          <a href="/legal/ai-policy" className="hover:text-aurora transition-colors">
            AI ポリシー
          </a>
          <a href="/legal/cookie" className="hover:text-aurora transition-colors">
            Cookie
          </a>
          <a href="/legal/tokushoho" className="hover:text-aurora transition-colors">
            特定商取引法
          </a>
        </div>
      </div>
    </div>
  </footer>
)
