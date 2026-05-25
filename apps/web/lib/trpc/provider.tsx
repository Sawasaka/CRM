'use client'

import { useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { trpc } from './client'

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const userId = (session as unknown as { userId?: string } | null)?.userId
  const userIdRef = useRef<string | undefined>(undefined)
  userIdRef.current = userId
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getTrpcUrl(),
          transformer: superjson,
          headers() {
            return userIdRef.current ? { 'x-bgm-user-id': userIdRef.current } : {}
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

function getTrpcUrl() {
  const externalApiUrl = process.env.NEXT_PUBLIC_API_URL
  if (externalApiUrl) return `${externalApiUrl.replace(/\/+$/, '')}/trpc`
  return '/api/trpc'
}
