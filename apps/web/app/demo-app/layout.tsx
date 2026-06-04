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
      { url: '/service-icon.svg?v=service-black-2-20260531-final', type: 'image/svg+xml' },
      { url: '/service-favicon.ico?v=service-black-2-20260531-final', sizes: '32x32' },
    ],
    shortcut: '/service-icon.svg?v=service-black-2-20260531-final',
    apple: '/service-icon.svg?v=service-black-2-20260531-final',
  },
}

export default async function DemoAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
