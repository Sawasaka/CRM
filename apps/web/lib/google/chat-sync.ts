import { prisma } from '@bgm/db'
import { getGoogleOAuthClient } from './oauth'
import { google } from 'googleapis'

interface SyncResult {
  spaces: number
  messages: number
  matched: number
}

/**
 * Google Chat のスペース・メッセージを同期し、コンタクトのメアドと一致するメッセージを ChatMessage に保存。
 *
 * 紐付けロジック: 送信者メアド完全一致 → contact, company
 */
export async function syncChatForUser(userId: string): Promise<SyncResult> {
  const auth = await getGoogleOAuthClient(userId)
  const chat = google.chat({ version: 'v1', auth })
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } })
  if (!user) throw new Error(`User not found: ${userId}`)

  // コンタクト一覧（メアド一致用）
  const contacts = await prisma.contact.findMany({
    where: { orgId: user.orgId, email: { not: null } },
    select: { id: true, email: true, companyId: true },
  })
  const contactByEmail = new Map<string, { id: string; companyId: string }>()
  for (const c of contacts) {
    if (c.email) contactByEmail.set(c.email.toLowerCase(), { id: c.id, companyId: c.companyId })
  }

  // ユーザーが参加しているスペースを取得
  const spacesResp = await chat.spaces.list({ pageSize: 100 })
  const spaces = spacesResp.data.spaces ?? []

  let messages = 0
  let matched = 0

  for (const space of spaces) {
    if (!space.name) continue
    // スペース内の最近のメッセージを取得
    const msgResp = await chat.spaces.messages.list({
      parent: space.name,
      pageSize: 50,
      orderBy: 'createTime desc',
    })
    const msgs = msgResp.data.messages ?? []

    for (const m of msgs) {
      if (!m.name || !m.text) continue
      const existing = await prisma.chatMessage.findUnique({ where: { chatName: m.name } })
      if (existing) continue

      // sender.name = "users/{id}" 形式で、Chat API 単体ではメアドを直接取れない。
      // people API 併用は次フェーズで対応するため、現状は displayName のみ保存。
      const senderEmail: string | null = null
      const link = senderEmail
        ? contactByEmail.get((senderEmail as string).toLowerCase())
        : undefined
      if (link) matched++

      await prisma.chatMessage.create({
        data: {
          orgId: user.orgId,
          userId,
          chatName: m.name,
          spaceName: space.name,
          spaceDisplayName: space.displayName ?? null,
          threadName: m.thread?.name ?? null,
          senderEmail,
          senderDisplayName: m.sender?.displayName ?? null,
          text: m.text,
          createdAtChat: m.createTime ? new Date(m.createTime) : new Date(),
          contactId: link?.id ?? null,
          companyId: link?.companyId ?? null,
          matchedBy: link ? 'email_match' : null,
        },
      })
      messages++
    }
  }

  await prisma.userGoogleAccount.update({
    where: { userId },
    data: { lastChatSyncAt: new Date() },
  })

  return { spaces: spaces.length, messages, matched }
}
