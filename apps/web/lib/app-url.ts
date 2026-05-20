export function getAppBaseUrl() {
  return trimTrailingSlash(
    process.env.AUTH_URL ??
      process.env.NEXTAUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'http://localhost:3002'
  )
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}
