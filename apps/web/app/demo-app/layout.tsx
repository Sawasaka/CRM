export const metadata = {
  title: 'FDE CRM',
  description: 'FDE CRM',
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
