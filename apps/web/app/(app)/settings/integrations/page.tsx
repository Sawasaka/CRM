import { redirect } from 'next/navigation'

export default async function IntegrationsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const currentParams = await searchParams
  const nextParams = new URLSearchParams({ tab: 'integrations' })

  for (const [key, value] of Object.entries(currentParams)) {
    if (key === 'tab' || value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) nextParams.append(key, item)
      continue
    }
    nextParams.set(key, value)
  }

  redirect(`/subscription?${nextParams.toString()}`)
}
