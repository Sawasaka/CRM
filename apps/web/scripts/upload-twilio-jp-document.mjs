import fs from 'node:fs'
import path from 'node:path'

loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const bundleSid = process.env.TWILIO_REGULATORY_BUNDLE_SID
const [type, friendlyName, filePath, attributesJson = '{}'] = process.argv.slice(2)

const missing = [
  !accountSid ? 'TWILIO_ACCOUNT_SID' : null,
  !authToken ? 'TWILIO_AUTH_TOKEN' : null,
  !bundleSid ? 'TWILIO_REGULATORY_BUNDLE_SID' : null,
  !type ? 'document type argument' : null,
  !friendlyName ? 'friendly name argument' : null,
  !filePath ? 'file path argument' : null,
].filter(Boolean)

if (missing.length > 0) {
  console.error(`Missing required inputs: ${missing.join(', ')}`)
  console.error('Usage: node scripts/upload-twilio-jp-document.mjs <type> <friendlyName> <filePath> <attributesJson>')
  process.exit(1)
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`)
  process.exit(1)
}

const stat = fs.statSync(filePath)
if (stat.size > 5 * 1024 * 1024) {
  console.error(`File is larger than Twilio's 5 MB limit: ${filePath}`)
  process.exit(1)
}

let attributes
try {
  attributes = JSON.parse(attributesJson)
} catch {
  console.error('attributesJson must be valid JSON')
  process.exit(1)
}

const document = await uploadSupportingDocument()
const assignment = await assignToBundle(document.sid)
const evaluation = await createEvaluation()

console.log(
  JSON.stringify(
    {
      ok: true,
      document: {
        sid: document.sid,
        type: document.type,
        friendlyName: document.friendly_name,
        mimeType: document.mime_type,
      },
      assignmentSid: assignment.sid,
      evaluationStatus: evaluation.status,
      remainingRequirements: evaluation.results
        .filter((result) => !result.passed)
        .map((result) => ({
          requirement: result.requirement_friendly_name,
          type: result.object_type,
          missingFields: result.invalid.map((field) => field.friendly_name),
        })),
    },
    null,
    2,
  ),
)

async function uploadSupportingDocument() {
  const form = new FormData()
  form.append('FriendlyName', friendlyName)
  form.append('Type', type)
  form.append('Attributes', JSON.stringify(attributes))
  const blob = new Blob([fs.readFileSync(filePath)], { type: mimeTypeFor(filePath) })
  form.append('File', blob, path.basename(filePath))

  const response = await fetch('https://numbers-upload.twilio.com/v2/RegulatoryCompliance/SupportingDocuments', {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    },
    body: form,
  })
  return parseTwilioResponse(response)
}

async function assignToBundle(objectSid) {
  return twilioFetch(`/Bundles/${bundleSid}/ItemAssignments`, {
    method: 'POST',
    body: new URLSearchParams({ ObjectSid: objectSid }),
  })
}

async function createEvaluation() {
  return twilioFetch(`/Bundles/${bundleSid}/Evaluations`, {
    method: 'POST',
    body: new URLSearchParams(),
  })
}

async function twilioFetch(endpoint, init) {
  const response = await fetch(`https://numbers.twilio.com/v2/RegulatoryCompliance${endpoint}`, {
    ...init,
    headers: {
      authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
      ...(init.headers || {}),
    },
  })
  return parseTwilioResponse(response)
}

async function parseTwilioResponse(response) {
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

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.pdf') return 'application/pdf'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  console.error(`Unsupported file type: ${filePath}`)
  process.exit(1)
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
