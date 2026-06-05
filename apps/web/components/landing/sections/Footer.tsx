/**
 * Footer — リリース準備中。
 * リンクツリーは廃止し、お問い合わせフォーム + 法務リンクで構成。
 * フォームは ContactForm (client component) に切り出し。
 */

import { ContactForm } from './ContactForm'
import Image from 'next/image'
import Link from 'next/link'
import { operatorProfilePath } from '@/lib/public-site'

export const Footer = () => (
  <footer id="contact" className="relative bg-[#0e0e10] scroll-mt-24 overflow-x-hidden">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* 左: ブランド + プロフィール */}
        <div className="md:col-span-5 md:sticky md:top-24 space-y-6">
          {/* ブランド */}
          <div>
            <div className="font-display font-bold text-[1.5rem] leading-none text-[#e7e5ea]">
              ルキスマ<span className="text-aurora">CRM</span>
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

          {/* プロフィール (会社情報と同じトーン) */}
          <div className="relative space-y-3 pt-5 pr-20 sm:pr-28" style={{ borderTop: '1px solid rgba(171,199,255,0.08)' }}>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83]">
              プロフィール
            </div>

            <div className="space-y-1">
              <Link href={operatorProfilePath} className="text-[#e7e5ea] text-sm font-semibold hover:text-aurora transition-colors">
                沢坂弘樹
              </Link>
              <p className="text-[11.5px] text-[#9b99a0] leading-relaxed">
                株式会社ルーキースマートジャパン代表。<br />
                営業実行とCRM構築を同時に支援します。
              </p>
            </div>

            <Image
              src="/founder-icon.png"
              alt="沢坂弘樹"
              width={88}
              height={88}
              sizes="88px"
              className="absolute right-8 top-5 h-[76px] w-[76px] rounded-full border border-white/10 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.26)] sm:right-9 md:h-[88px] md:w-[88px]"
            />

            <ul className="space-y-3 sm:space-y-2 text-[11.5px]">
              <li className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#7e7c83] sm:w-[110px] sm:shrink-0">
                  Sales Executive
                </span>
                <span className="text-[#c7c5c9] whitespace-nowrap leading-snug">
                  外資 SaaS 日本法人 立ち上げ (正社員 1 人目)
                </span>
              </li>
              <li className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#7e7c83] sm:w-[110px] sm:shrink-0">
                  執行役員 CRO
                </span>
                <span className="text-[#c7c5c9] whitespace-nowrap leading-snug">
                  IT スタートアップ 立ち上げ (正社員 1 人目)
                </span>
              </li>
              <li className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#7e7c83] sm:w-[110px] sm:shrink-0">
                  キャリア
                </span>
                <span className="text-[#9b99a0] whitespace-nowrap leading-snug">
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
          <Link href="/media" className="hover:text-aurora transition-colors">
            メディア
          </Link>
          <Link href="/legal/terms" className="hover:text-aurora transition-colors">
            利用規約
          </Link>
          <Link href="/legal/privacy" className="hover:text-aurora transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/legal/tokushoho" className="hover:text-aurora transition-colors">
            特定商取引法
          </Link>
        </div>
      </div>
    </div>
  </footer>
)
