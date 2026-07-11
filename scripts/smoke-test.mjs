#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { rm } from 'node:fs/promises'
import net from 'node:net'
import process from 'node:process'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const webNextDir = fileURLToPath(new URL('../apps/web/.next', import.meta.url))
const routes = [
  '/',
  '/lp',
  '/login',
  '/forgot-password',
  '/legal',
  '/dashboard',
  '/today',
  '/pipeline',
  '/companies',
  '/contacts',
  '/deals',
  '/tickets',
  '/knowledge',
  '/tasks',
  '/settings/integrations',
]

const crashMarkers = [
  'Application error',
  'Internal Server Error',
  'Runtime Error',
  'Unhandled Runtime Error',
  'Build Error',
]

const results = []
const serverLog = []

function remember(line) {
  serverLog.push(line)
  if (serverLog.length > 120) serverLog.shift()
}

async function findFreePort(start = Number(process.env.SMOKE_TEST_PORT ?? 3302)) {
  for (let port = start; port < start + 1000; port++) {
    if (await canListen(port)) return port
  }
  throw new Error(`No free port found from ${start}`)
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '127.0.0.1')
  })
}

function startWebServer(port) {
  const child = spawn(
    `corepack pnpm --filter @bgm/web exec next dev --port ${port} --turbopack`,
    {
      shell: true,
      cwd: rootDir,
      env: {
        ...process.env,
        NEXT_PUBLIC_DEV_MODE: 'true',
        NEXT_PUBLIC_API_URL: `http://localhost:${port}/api`,
        NODE_ENV: 'development',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  child.stdout.on('data', (chunk) => remember(chunk.toString()))
  child.stderr.on('data', (chunk) => remember(chunk.toString()))
  child.on('error', (error) => remember(`server spawn failed: ${error.message}\n`))
  return child
}

async function waitForServer(baseUrl, timeoutMs = 45_000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/lp`, { redirect: 'manual' })
      if (res.status < 500) return
    } catch {
      // Server is still booting.
    }
    await sleep(500)
  }
  throw new Error(`Timed out waiting for ${baseUrl}`)
}

async function check(name, fn) {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`PASS ${name}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    results.push({ name, ok: false, message })
    console.error(`FAIL ${name}: ${message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function visitRoute(page, baseUrl, route) {
  const pageErrors = []
  const consoleErrors = []
  const documentFailures = []
  const requestFailures = []

  const onPageError = (error) => pageErrors.push(error.message)
  const onConsole = (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  }
  const onResponse = (response) => {
    if (response.request().resourceType() === 'document' && response.status() >= 500) {
      documentFailures.push(`${response.status()} ${response.url()}`)
    }
  }
  const onRequestFailed = (request) => {
    requestFailures.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`)
  }

  page.on('pageerror', onPageError)
  page.on('console', onConsole)
  page.on('response', onResponse)
  page.on('requestfailed', onRequestFailed)

  try {
    const response = await page.goto(`${baseUrl}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    await page.waitForTimeout(700)
    const status = response?.status() ?? 0
    const bodyText = await page.locator('body').innerText({ timeout: 5_000 }).catch(() => '')
    const visibleNotFound = await page
      .locator('h1.next-error-h1')
      .filter({ hasText: '404' })
      .first()
      .isVisible()
      .catch(() => false)
    const relevantRequestFailures = requestFailures.filter(
      (failure) => !(failure.includes('net::ERR_ABORTED') && failure.includes('_rsc=')),
    )

    assert(status > 0 && status < 500, `document status was ${status}`)
    assert(bodyText.trim().length > 0, 'body was empty')
    assert(!visibleNotFound, 'visible 404 page')

    const marker = crashMarkers.find((text) => bodyText.includes(text))
    assert(!marker, `crash marker found: ${marker}`)
    assert(documentFailures.length === 0, `document failures: ${documentFailures.join(', ')}`)
    assert(relevantRequestFailures.length === 0, `request failures: ${relevantRequestFailures.slice(0, 3).join(' | ')}`)
    assert(pageErrors.length === 0, `page errors: ${pageErrors.slice(0, 3).join(' | ')}`)

    const relevantConsoleErrors = consoleErrors.filter(
      (text) => !text.includes('favicon') && !text.includes('Download the React DevTools'),
    )
    assert(
      relevantConsoleErrors.length === 0,
      `console errors: ${relevantConsoleErrors.slice(0, 3).join(' | ')}`,
    )
  } finally {
    page.off('pageerror', onPageError)
    page.off('console', onConsole)
    page.off('response', onResponse)
    page.off('requestfailed', onRequestFailed)
  }
}

async function checkApis(baseUrl) {
  const demoAccess = await fetch(`${baseUrl}/api/demo-access`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      company: 'Smoke Test Co.',
      name: 'Smoke Tester',
      email: 'smoke@example.com',
    }),
  })
  const demoJson = await demoAccess.json()
  assert(demoAccess.status === 410, `demo-access status was ${demoAccess.status}`)
  assert(demoJson.ok === false, 'demo-access deprecation response was invalid')

  const contact = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      company: 'Smoke Test Co.',
      name: 'Smoke Tester',
      email: 'smoke@example.com',
      message: 'Automated smoke test',
    }),
  })
  const contactJson = await contact.json()
  assert(contact.ok, `contact failed: ${contact.status}`)
  assert(contactJson.ok === true, 'contact response was invalid')

  return '/lp'
}

async function main() {
  await rm(webNextDir, { recursive: true, force: true })
  const port = await findFreePort(Number(process.env.SMOKE_PORT ?? 3302))
  const baseUrl = `http://localhost:${port}`
  const server = startWebServer(port)
  let browser

  try {
    await waitForServer(baseUrl)
    browser = await chromium.launch({ headless: true })

    await check('API: disabled demo-access and contact', async () => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
      const route = await checkApis(baseUrl)
      try {
        await visitRoute(page, baseUrl, route)
      } finally {
        await page.close()
      }
    })

    for (const route of routes) {
      await check(`Route: ${route}`, async () => {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
        try {
          await visitRoute(page, baseUrl, route)
        } finally {
          await page.close()
        }
      })
    }
  } catch (error) {
    console.error(error)
    if (serverLog.length > 0) {
      console.log('')
      console.log('Recent server log:')
      console.log(serverLog.join('').trim())
    }
    process.exitCode = 1
    return
  } finally {
    if (browser) await browser.close()
    server.kill('SIGTERM')
  }

  const failed = results.filter((result) => !result.ok)
  console.log('')
  console.log(`Smoke test finished: ${results.length - failed.length}/${results.length} passed`)
  if (failed.length > 0) {
    console.log('')
    console.log('Failures:')
    for (const failure of failed) {
      console.log(`- ${failure.name}: ${failure.message}`)
    }
    console.log('')
    console.log('Recent server log:')
    console.log(serverLog.join('').trim())
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
