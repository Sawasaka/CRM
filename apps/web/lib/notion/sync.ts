import { prisma } from '@bgm/db'
import { getNotionPageText, getNotionPageTitle, searchNotionPages } from './client'
import { getNotionAccountSnapshot, markNotionSynced } from './account-store'

type SyncOptions = {
  query?: string
  dealId?: string
  maxPages?: number
}

type SyncResult = {
  searched: number
  imported: number
  skipped: number
  linked: number
}

type DealCandidate = {
  id: string
  name: string
  companyId: string
  contactId: string | null
  company: { id: string; name: string }
  contact: { id: string; name: string; email: string | null } | null
}

export class NotionNotConnectedError extends Error {
  constructor() {
    super('Notion is not connected.')
    this.name = 'NotionNotConnectedError'
  }
}

export async function syncNotionTranscriptsForUser(
  userId: string,
  opts: SyncOptions = {}
): Promise<SyncResult> {
  const account = await getNotionAccountSnapshot(userId)
  if (!account?.enabled || !account.accessToken) throw new NotionNotConnectedError()

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } })
  if (!user) throw new Error(`User not found: ${userId}`)

  const query = opts.query?.trim() || '議事録'
  const maxPages = Math.min(Math.max(opts.maxPages ?? 20, 1), 50)
  const pages = (await searchNotionPages(account.accessToken, query)).slice(0, maxPages)

  const deals = await prisma.deal.findMany({
    where: {
      orgId: user.orgId,
      ...(opts.dealId ? { id: opts.dealId } : {}),
    },
    take: 200,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      companyId: true,
      contactId: true,
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true, email: true } },
    },
  })

  let imported = 0
  let skipped = 0
  let linked = 0

  for (const page of pages) {
    const pageUrl = page.url ?? `https://www.notion.so/${page.id.replace(/-/g, '')}`
    const existing = await prisma.transcript.findFirst({
      where: { orgId: user.orgId, googleDocUrl: pageUrl },
      select: { id: true },
    })
    if (existing) {
      skipped++
      continue
    }

    const title = getNotionPageTitle(page)
    const fullText = await getNotionPageText(account.accessToken, page.id)
    if (!fullText) {
      skipped++
      continue
    }

    const match = opts.dealId
      ? deals[0] ?? null
      : findBestDealMatch(deals, `${title}\n${fullText}`)

    const transcript = await prisma.transcript.create({
      data: {
        orgId: user.orgId,
        dealId: match?.id ?? null,
        companyId: match?.companyId ?? null,
        contactId: match?.contactId ?? null,
        type: 'MEETING',
        fullText,
        googleDocUrl: pageUrl,
        googleDocId: page.id,
        source: 'OTHER',
        extractedFields: {
          source: 'notion',
          title,
          lastEditedAt: page.last_edited_time ?? null,
        },
      },
    })
    imported++

    if (match) {
      linked++
      await prisma.activity.create({
        data: {
          orgId: user.orgId,
          dealId: match.id,
          contactId: match.contactId,
          companyId: match.companyId,
          userId,
          type: 'MEETING',
          title: `Notion議事録: ${title}`,
          content: fullText.slice(0, 500),
          occurredAt: page.last_edited_time ? new Date(page.last_edited_time) : transcript.createdAt,
          metadata: {
            source: 'notion',
            notionPageId: page.id,
            notionUrl: pageUrl,
            transcriptId: transcript.id,
          },
        },
      })
    }
  }

  await markNotionSynced(userId)
  return { searched: pages.length, imported, skipped, linked }
}

function findBestDealMatch(deals: DealCandidate[], text: string): DealCandidate | null {
  const haystack = normalize(text)
  let best: { deal: DealCandidate; score: number } | null = null

  for (const deal of deals) {
    let score = 0
    if (haystack.includes(normalize(deal.name))) score += 4
    if (haystack.includes(normalize(deal.company.name))) score += 5
    if (deal.contact?.name && haystack.includes(normalize(deal.contact.name))) score += 3
    if (deal.contact?.email && haystack.includes(normalize(deal.contact.email))) score += 3
    if (!best || score > best.score) best = { deal, score }
  }

  return best && best.score >= 3 ? best.deal : null
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '')
}
