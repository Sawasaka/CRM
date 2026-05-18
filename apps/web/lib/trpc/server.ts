import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '../../../../apps/api/src/router'

export const trpcServer = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getServerTrpcUrl(),
      transformer: superjson,
    }),
  ],
})

function getServerTrpcUrl() {
  const externalApiUrl = process.env.NEXT_PUBLIC_API_URL
  if (externalApiUrl) return `${externalApiUrl.replace(/\/+$/, '')}/trpc`

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL
  if (appUrl) return `${appUrl.replace(/\/+$/, '')}/api/trpc`

  return 'http://localhost:3001/trpc'
}
