import fs from 'node:fs'
import path from 'node:path'

loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const addressSid = process.env.TWILIO_ADDRESS_SID || process.argv[2]
const bundleSid = process.env.TWILIO_REGULATORY_BUNDLE_SID || process.argv[3]

const missing = [
  !accountSid ? 'TWILIO_ACCOUNT_SID' : null,
  !authToken ? 'TWILIO_AUTH_TOKEN' : null,
  !addressSid ? 'TWILIO_ADDRESS_SID or first argument' : null,
].filter(Boolean)

if (missing.length > 0) {
  console.error(`Missing required settings: ${missing.join(', ')}`)
  process.exit(1)
}

const candidates = await findCandidates()
if (candidates.length === 0) {
  console.error('No Japanese voice-capable Twilio numbers were found.')
  process.exit(1)
}

const selected = candidates[0]
console.log(`Selected candidate: ${maskPhone(selected.phoneNumber)} (${selected.label})`)

const purchased = await purchaseNumber(selected.phoneNumber)
saveEnvValue('TWILIO_FROM_NUMBER', purchased.phone_number || selected.phoneNumber)

console.log(
  JSON.stringify(
    {
      ok: true,
      phoneNumber: maskPhone(purchased.phone_number || selected.phoneNumber),
      sid: purchased.sid,
      label: selected.label,
    },
    null,
    2,
  ),
)

async function findCandidates() {
  const rankedSearches = [
    { label: 'Tokyo 03', type: 'Local', contains: '+813' },
    { label: 'Osaka 06', type: 'Local', contains: '+816' },
    { label: '050 IP', type: 'Local', contains: '+8150' },
    { label: 'Japan toll-free 0800', type: 'TollFree', contains: '+81800' },
  ]

  const found = []
  for (const search of rankedSearches) {
    const numbers = await availableNumbers(search)
    for (const number of numbers) {
      found.push({
        label: search.label,
        phoneNumber: number.phone_number,
        score: scoreNumber(number.phone_number, search.label),
      })
    }
  }

  return found.sort((a, b) => b.score - a.score)
}

async function availableNumbers(search) {
  const params = new URLSearchParams({
    VoiceEnabled: 'true',
    PageSize: '20',
    Contains: search.contains,
  })
  const payload = await twilioFetch(
    `/AvailablePhoneNumbers/JP/${search.type}.json?${params.toString()}`,
    { method: 'GET' },
  )
  return payload.available_phone_numbers || []
}

async function purchaseNumber(phoneNumber) {
  const body = new URLSearchParams(
    Object.fromEntries(
      Object.entries({
        PhoneNumber: phoneNumber,
        AddressSid: addressSid,
        BundleSid: bundleSid,
      }).filter(([, value]) => Boolean(value)),
    ),
  )
  return twilioFetch('/IncomingPhoneNumbers.json', {
    method: 'POST',
    body,
  })
}

async function twilioFetch(endpoint, init) {
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}${endpoint}`,
    {
      ...init,
      headers: {
        authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded',
        ...(init.headers || {}),
      },
    },
  )
  const payload = await response.json().catch(async () => ({
    message: await response.text().catch(() => ''),
  }))
  if (!response.ok) {
    console.error(`Twilio request failed (${response.status})`)
    console.error(JSON.stringify(redactTwilioPayload(payload), null, 2))
    process.exit(1)
  }
  return payload
}

function scoreNumber(phoneNumber, label) {
  const digits = phoneNumber.replace(/[^\d]/g, '')
  const last4 = digits.slice(-4)
  let score = 0
  if (label === 'Tokyo 03') score += 400
  if (label === 'Osaka 06') score += 300
  if (label === '050 IP') score += 200
  if (label.includes('toll-free')) score += 100
  if (/(\d)\1{1,}/.test(last4)) score += 30
  if (/(\d{2})\1/.test(last4)) score += 25
  if (last4.includes('00')) score += 15
  if (last4.includes('11')) score += 10
  return score
}

function saveEnvValue(key, value) {
  const envPath = path.resolve(process.cwd(), '.env.local')
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
  const line = `${key}=${JSON.stringify(value)}`
  const re = new RegExp(`^${key}=.*$`, 'm')
  content = re.test(content)
    ? content.replace(re, line)
    : `${content.replace(/\s*$/, '')}\n${line}\n`
  fs.writeFileSync(envPath, content)
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

function maskPhone(value) {
  const text = String(value || '')
  if (text.length <= 6) return '***'
  return `${text.slice(0, 3)}***${text.slice(-3)}`
}

function redactTwilioPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (['phone_number', 'PhoneNumber', 'from', 'to'].includes(key)) return [key, maskPhone(value)]
      return [key, value]
    }),
  )
}
