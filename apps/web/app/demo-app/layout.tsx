/**
 * /demo-app — 無料デモ専用ルート (本番 NextAuth / DB ロジックを呼ばない)
 *
 * 本番のサイドバー/ヘッダーを使わないための専用レイアウト。
 * トークン検証は searchParams を受け取れる page.tsx 側で行う。
 */

export const metadata = {
  title: '無料デモ｜ルキスマCRM',
  description: '時間限定のデモアクセスです。実環境とは分離されたサンプルデータでお試しいただけます。',
  icons: {
    icon: [
      { url: '/service-icon.svg?v=unified-service-favicon-20260611', type: 'image/svg+xml' },
      { url: '/service-favicon.ico?v=unified-service-favicon-20260611', sizes: '32x32' },
    ],
    shortcut: '/service-icon.svg?v=unified-service-favicon-20260611',
    apple: '/service-icon.svg?v=unified-service-favicon-20260611',
  },
}

export default async function DemoAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
