import fs from 'node:fs'
import path from 'node:path'

loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const bundleSid = process.env.TWILIO_REGULATORY_BUNDLE_SID || process.argv[2]

const missing = [
  !accountSid ? 'TWILIO_ACCOUNT_SID' : null,
  !authToken ? 'TWILIO_AUTH_TOKEN' : null,
  !bundleSid ? 'TWILIO_REGULATORY_BUNDLE_SID or first argument' : null,
].filter(Boolean)

if (missing.length > 0) {
  console.error(`Missing required settings: ${missing.join(', ')}`)
  process.exit(1)
}

const evaluation = await twilioFetch(`/Bundles/${bundleSid}/Evaluations`, { method: 'POST' })

const summary = {
  ok: evaluation.status === 'compliant',
  status: evaluation.status,
  bundleSid,
  missingRequirements: evaluation.results
    .filter((result) => !result.passed)
    .map((result) => ({
      requirement: result.requirement_friendly_name,
      requirementName: result.requirement_name,
      acceptedExample: result.friendly_name,
      type: result.object_type,
      missingFields: result.invalid.map((field) => field.friendly_name),
    })),
}

console.log(JSON.stringify(summary, null, 2))

async function twilioFetch(endpoint, init) {
  const response = await fetch(`https://numbers.twilio.com/v2/RegulatoryCompliance${endpoint}`, {
    ...init,
    headers: {
      authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
      ...(init.headers || {}),
    },
  })
  const payload = await response.json().catch(async () => ({
    message: await response.text().catch(() => ''),
  }))
  if (!response.ok) {
    console.error(`Twilio request failed (${response.status})`)
    console.error(JSON.stringify(payload, null, 2))
    process.exit(1)
  }
  return payload
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue
    process.env[key] = unquote(rawValue.trim())
  }
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}
