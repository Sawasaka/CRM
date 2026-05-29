import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type StripeAccount = {
  id: string
  charges_enabled: boolean
  details_submitted: boolean
}

type StripeWebhookEndpoint = {
  id: string
  secret?: string
  url: string
}

const envPath = path.resolve('.env.local')
const args = new Map(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith('--') && arg.includes('='))
    .map((arg) => {
      const [key, ...rest] = arg.slice(2).split('=')
      return [key, rest.join('=')]
    }),
)

function parseEnvFile(filePath: string) {
  const raw = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
  const env = new Map<string, string>()

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    const [, key, value] = match
    env.set(key, stripQuotes(value.trim()))
  }

  return { raw, env }
}

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

function setEnv(raw: string, key: string, value: string) {
  const escaped = `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  const line = `${key}=${escaped}`
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  if (pattern.test(raw)) return raw.replace(pattern, line)
  return `${raw.replace(/\s*$/, '')}\n${line}\n`
}

async function stripeRequest<T>(
  pathName: string,
  secretKey: string,
  body?: URLSearchParams,
): Promise<T> {
  const res = await fetch(`https://api.stripe.com${pathName}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body,
  })
  const data = (await res.json()) as T & { error?: { message?: string } }
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Stripe API error: ${res.status}`)
  }
  return data
}

async function main() {
  const { raw, env } = parseEnvFile(envPath)
  const secretKey = env.get('STRIPE_SECRET_KEY')
  const appUrl = args.get('app-url') ?? env.get('STRIPE_WEBHOOK_BASE_URL') ?? env.get('NEXT_PUBLIC_APP_URL')

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing in .env.local')
  }
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL or --app-url=https://... is required')
  }

  const account = await stripeRequest<StripeAccount>('/v1/account', secretKey)
  console.log(`Stripe account connected: ${account.id}`)

  if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
    console.log('Skipped webhook creation because app URL is local. Use --app-url=https://crm.rookiesmart-jp.com for production.')
    return
  }

  const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/stripe/webhook`
  const body = new URLSearchParams()
  body.set('url', webhookUrl)
  for (const event of [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'invoice.finalized',
    'invoice.voided',
  ]) {
    body.append('enabled_events[]', event)
  }

  const endpoint = await stripeRequest<StripeWebhookEndpoint>('/v1/webhook_endpoints', secretKey, body)
  const updated = endpoint.secret ? setEnv(raw, 'STRIPE_WEBHOOK_SECRET', endpoint.secret) : raw
  writeFileSync(envPath, updated)

  console.log(`Stripe webhook endpoint created: ${endpoint.id}`)
  console.log(`Webhook URL: ${endpoint.url}`)
  console.log('STRIPE_WEBHOOK_SECRET saved to .env.local')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
