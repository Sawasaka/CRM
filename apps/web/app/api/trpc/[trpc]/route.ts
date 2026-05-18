import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../../../../../api/src/router'
import { createContext } from '../../../../../api/src/middleware/context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        req: {
          headers: Object.fromEntries(req.headers.entries()),
        } as never,
      }),
  })
}

export { handler as GET, handler as POST }
