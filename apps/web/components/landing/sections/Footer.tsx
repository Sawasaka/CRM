/**
 * Footer — リリース準備中。
 * リンクツリーは廃止し、お問い合わせフォーム + 法務リンクで構成。
 * フォームは ContactForm (client component) に切り出し。
 */

import { ContactForm } from './ContactForm'

export const Footer = () => (
  <footer id="contact" className="relative bg-[#0e0e10] scroll-mt-24">
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-start">
        {/* 左: ブランド + 代表プロフィール */}
        <div className="md:col-span-5 md:sticky md:top-24 space-y-6">
          {/* ブランド */}
          <div>
            <div className="font-display font-bold text-[1.5rem] fo-gradient-text leading-none">
              ルキスマCRM
            </div>
            <p className="text-[12px] text-[#9b99a0] mt-3 leading-relaxed">
              営業データから何でも答えるチャットCRM。
            </p>

            <div
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px]"
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

          {/* 会社情報 */}
          <div className="space-y-1.5 text-[11.5px]">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83] mb-2">
              会社情報
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.10em] text-[#7e7c83] w-10 shrink-0">
                提供
              </span>
              <span className="text-[#c7c5c9]">株式会社ルーキースマートジャパン</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.10em] text-[#7e7c83] w-10 shrink-0">
                設立
              </span>
              <span className="text-[#c7c5c9]">2025 年 9 月</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.10em] text-[#7e7c83] w-10 shrink-0">
                拠点
              </span>
              <span className="text-[#c7c5c9]">東京都 中央区</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.10em] text-[#7e7c83] w-10 shrink-0">
                連絡
              </span>
              <a
                href="mailto:h.sawasaka@rookiesmart.jp"
                className="text-[#c7c5c9] hover:text-aurora transition-colors"
              >
                h.sawasaka@rookiesmart.jp
              </a>
            </div>
          </div>

          {/* 代表プロフィール (会社情報と同じトーン) */}
          <div className="space-y-3 pt-5" style={{ borderTop: '1px solid rgba(171,199,255,0.08)' }}>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83]">
              代表プロフィール
            </div>

            <ul className="space-y-2 text-[11.5px]">
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#7e7c83] w-[110px] shrink-0">
                  Sales Executive
                </span>
                <span className="text-[#c7c5c9]">外資 SaaS 日本法人 立ち上げ (正社員 1 人目)</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#7e7c83] w-[110px] shrink-0">
                  執行役員 CRO
                </span>
                <span className="text-[#c7c5c9]">IT スタートアップ 立ち上げ (正社員 1 人目)</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#7e7c83] w-[110px] shrink-0">
                  キャリア
                </span>
                <span className="text-[#9b99a0] whitespace-nowrap">
                  エンジニア → IT 法人営業 → DX / AIX 業務コンサルティング
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 右: お問い合わせフォーム */}
        <div className="md:col-span-7">
          <div className="mb-5">
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-[#7e7c83]">
              Contact
            </span>
            <h3 className="font-display font-bold tracking-[-0.01em] text-[1.5rem] md:text-[1.7rem] text-[#e7e5ea] mt-1.5 leading-tight">
              お問い合わせ
            </h3>
          </div>
          <ContactForm />
        </div>
      </div>

      <div
        className="mt-14 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#7e7c83]"
        style={{ borderTop: '1px solid rgba(65,71,83,0.18)' }}
      >
        <div>
          © 2026 <span className="fo-gradient-text font-semibold">ルキスマCRM</span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a href="/legal/terms" className="hover:text-aurora transition-colors">
            利用規約
          </a>
          <a href="/legal/privacy" className="hover:text-aurora transition-colors">
            プライバシーポリシー
          </a>
          <a href="/legal/tokushoho" className="hover:text-aurora transition-colors">
            特定商取引法
          </a>
        </div>
      </div>
    </div>
  </footer>
)
