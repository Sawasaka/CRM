import fs from 'node:fs'
import path from 'node:path'

loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const bundleSid = process.env.TWILIO_REGULATORY_BUNDLE_SID
const businessAddressSid = process.env.TWILIO_ADDRESS_SID
const representativeAddressSid = process.env.TWILIO_REPRESENTATIVE_ADDRESS_SID
const shouldSubmit = process.argv.includes('--submit')

const profile = {
  businessName: process.env.TWILIO_JP_BUSINESS_NAME || '株式会社ルーキースマートジャパン',
  businessDescription:
    process.env.TWILIO_JP_BUSINESS_DESCRIPTION || 'CRM and AI sales automation services',
  firstName: process.env.TWILIO_JP_REP_FIRST_NAME || 'Hiroki',
  lastName: process.env.TWILIO_JP_REP_LAST_NAME || 'Sawasaka',
  birthDate: process.env.TWILIO_JP_REP_BIRTH_DATE,
}

const requiredSettings = [
  !accountSid ? 'TWILIO_ACCOUNT_SID' : null,
  !authToken ? 'TWILIO_AUTH_TOKEN' : null,
  !bundleSid ? 'TWILIO_REGULATORY_BUNDLE_SID' : null,
  !businessAddressSid ? 'TWILIO_ADDRESS_SID' : null,
  !representativeAddressSid ? 'TWILIO_REPRESENTATIVE_ADDRESS_SID' : null,
  !profile.birthDate ? 'TWILIO_JP_REP_BIRTH_DATE=YYYY-MM-DD' : null,
].filter(Boolean)

const corporateRegistryPath = process.env.TWILIO_DOC_CORPORATE_REGISTRY_PATH
const authorizationPath = process.env.TWILIO_DOC_AUTHORIZATION_PATH || corporateRegistryPath
const applicationPath = process.env.TWILIO_DOC_JP_APPLICATION_PATH
const representativeIdPath = process.env.TWILIO_DOC_REP_ID_PATH
const representativeAddressPath = process.env.TWILIO_DOC_REP_ADDRESS_PATH

const requiredFiles = [
  ['TWILIO_DOC_CORPORATE_REGISTRY_PATH', corporateRegistryPath],
  ['TWILIO_DOC_AUTHORIZATION_PATH or TWILIO_DOC_CORPORATE_REGISTRY_PATH', authorizationPath],
  ['TWILIO_DOC_JP_APPLICATION_PATH', applicationPath],
  ['TWILIO_DOC_REP_ID_PATH', representativeIdPath],
  ['TWILIO_DOC_REP_ADDRESS_PATH', representativeAddressPath],
].filter(([, value]) => !value)

if (requiredSettings.length > 0 || requiredFiles.length > 0) {
  console.error('Missing required inputs:')
  for (const key of requiredSettings) console.error(`- ${key}`)
  for (const [key] of requiredFiles) console.error(`- ${key}`)
  console.error('')
  console.error('Accepted file formats: PDF, PNG, JPEG. Twilio limit: 5 MB per file.')
  process.exit(1)
}

const docs = [
  {
    friendlyName: 'JP Corporate Registry - Business and Address',
    type: 'corporate_registry',
    filePath: corporateRegistryPath,
    attributes: {
      business_name: profile.businessName,
      business_description: profile.businessDescription,
      address_sids: [businessAddressSid],
    },
  },
  {
    friendlyName: 'JP Authorization of Representative',
    type: 'company_by_laws',
    filePath: authorizationPath,
    attributes: {
      first_name: profile.firstName,
      last_name: profile.lastName,
    },
  },
  {
    friendlyName: 'JP Representative Identity',
    type: process.env.TWILIO_DOC_REP_ID_TYPE || 'drivers_license',
    filePath: representativeIdPath,
    attributes: {
      first_name: profile.firstName,
      last_name: profile.lastName,
      birth_date: profile.birthDate,
      address_sids: [representativeAddressSid],
    },
  },
  {
    friendlyName: 'JP Representative Address',
    type: process.env.TWILIO_DOC_REP_ADDRESS_TYPE || 'utility_bill_of_authorized_representative',
    filePath: representativeAddressPath,
    attributes: {
      address_sids: [representativeAddressSid],
    },
  },
  {
    friendlyName: 'JP Regulatory Bundle Application',
    type: 'declaration_of_beneficial_ownership',
    filePath: applicationPath,
    attributes: {
      first_name: profile.firstName,
      last_name: profile.lastName,
      business_name: profile.businessName,
      birth_date: profile.birthDate,
      address_sids: [businessAddressSid, representativeAddressSid],
    },
  },
]

for (const doc of docs) {
  validateFile(doc.filePath)
}

const uploaded = []
for (const doc of docs) {
  const supportingDocument = await uploadSupportingDocument(doc)
  await assignToBundle(supportingDocument.sid)
  uploaded.push({
    sid: supportingDocument.sid,
    type: supportingDocument.type,
    friendlyName: supportingDocument.friendly_name,
    mimeType: supportingDocument.mime_type,
  })
}

const evaluation = await createEvaluation()
let bundleStatus = 'draft'
if (shouldSubmit && evaluation.status === 'compliant') {
  const bundle = await updateBundleStatus('pending-review')
  bundleStatus = bundle.status
}

console.log(
  JSON.stringify(
    {
      ok: evaluation.status === 'compliant',
      uploaded,
      evaluationStatus: evaluation.status,
      submitted: shouldSubmit && evaluation.status === 'compliant',
      bundleStatus,
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

async function uploadSupportingDocument(doc) {
  const form = new FormData()
  form.append('FriendlyName', doc.friendlyName)
  form.append('Type', doc.type)
  form.append('Attributes', JSON.stringify(doc.attributes))
  const fileBuffer = fs.readFileSync(doc.filePath)
  const blob = new Blob([fileBuffer], { type: mimeTypeFor(doc.filePath) })
  form.append('File', blob, path.basename(doc.filePath))

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

async function updateBundleStatus(status) {
  return twilioFetch(`/Bundles/${bundleSid}`, {
    method: 'POST',
    body: new URLSearchParams({ Status: status }),
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

function validateFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath || '(empty)'}`)
    process.exit(1)
  }
  const stat = fs.statSync(filePath)
  if (!stat.isFile()) {
    console.error(`Not a file: ${filePath}`)
    process.exit(1)
  }
  if (stat.size > 5 * 1024 * 1024) {
    console.error(`File is larger than Twilio's 5 MB limit: ${filePath}`)
    process.exit(1)
  }
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
