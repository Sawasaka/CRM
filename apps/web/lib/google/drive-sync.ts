import OpenAI from 'openai'
import { prisma } from '@bgm/db'
import {
  downloadDriveFile,
  exportDriveFile,
  listDriveFiles,
} from '@bgm/integrations-google'
import { getGoogleOAuthClient } from './oauth'

const TEXT_LIKE_MIMETYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.google-apps.document',
])

const GOOGLE_EXPORT_MIMETYPES = new Set(['application/vnd.google-apps.document'])

const CHUNK_CHAR_SIZE = 1500
const CHUNK_OVERLAP = 200

type FolderSyncResult =
  | { ok: true; folderId: string; stat: DriveSyncStat }
  | { ok: false; folderId: string; reason: string }

interface DriveSyncStat {
  fileCount: number
  indexedCount: number
  skippedCount: number
  errorCount: number
  embeddedCount: number
}

export async function syncDriveForUser(userId: string): Promise<{
  folders: number
  results: FolderSyncResult[]
}> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } })
  if (!user) throw new Error(`User not found: ${userId}`)

  const folders = await prisma.driveFolderConnection.findMany({
    where: { orgId: user.orgId, enabled: true },
    orderBy: { updatedAt: 'desc' },
  })

  const results: FolderSyncResult[] = []
  for (const folder of folders) {
    results.push(await syncDriveFolderForUser(userId, user.orgId, folder.id, folder.folderId))
  }

  await prisma.userGoogleAccount.update({
    where: { userId },
    data: { lastDriveSyncAt: new Date() },
  })

  return { folders: folders.length, results }
}

async function syncDriveFolderForUser(
  userId: string,
  orgId: string,
  folderConnectionId: string,
  folderId: string,
): Promise<FolderSyncResult> {
  const auth = await getGoogleOAuthClient(userId)
  const stat: DriveSyncStat = {
    fileCount: 0,
    indexedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    embeddedCount: 0,
  }

  const files = await listDriveFiles(auth, folderId)
  stat.fileCount = files.length

  for (const file of files) {
    if (!file.id || !file.name || !file.mimeType) continue
    if (!TEXT_LIKE_MIMETYPES.has(file.mimeType)) {
      stat.skippedCount++
      continue
    }

    try {
      const text = GOOGLE_EXPORT_MIMETYPES.has(file.mimeType)
        ? await exportDriveFile(auth, file.id, 'text/plain')
        : await downloadDriveFile(auth, file.id)

      if (!text || text.trim().length < 30) {
        stat.skippedCount++
        continue
      }

      const doc = await prisma.knowledgeDoc.upsert({
        where: { orgId_sourceId: { orgId, sourceId: file.id } },
        create: {
          orgId,
          sourceType: 'drive',
          sourceId: file.id,
          fileName: file.name,
          fileUrl: file.webViewLink ?? `https://drive.google.com/file/d/${file.id}`,
          mimeType: file.mimeType,
          lastModified: file.modifiedTime ? new Date(file.modifiedTime) : new Date(),
        },
        update: {
          fileName: file.name,
          fileUrl: file.webViewLink ?? `https://drive.google.com/file/d/${file.id}`,
          mimeType: file.mimeType,
          lastModified: file.modifiedTime ? new Date(file.modifiedTime) : new Date(),
          indexedAt: new Date(),
        },
      })

      await prisma.knowledgeChunk.deleteMany({ where: { docId: doc.id } })

      const chunks = chunkText(text, CHUNK_CHAR_SIZE, CHUNK_OVERLAP)
      for (let idx = 0; idx < chunks.length; idx++) {
        const content = chunks[idx]!
        const embedding = await generateEmbeddingIfConfigured(content)
        if (embedding) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "KnowledgeChunk" ("id", "docId", "content", "embedding", "chunkIndex", "createdAt")
             VALUES ($1, $2, $3, $4::vector, $5, now())`,
            cuid(),
            doc.id,
            content,
            `[${embedding.join(',')}]`,
            idx,
          )
          stat.embeddedCount++
        } else {
          await prisma.knowledgeChunk.create({
            data: {
              docId: doc.id,
              content,
              chunkIndex: idx,
              metadata: { embeddingSkipped: true, reason: 'OPENAI_API_KEY not configured' },
            },
          })
        }
      }
      stat.indexedCount++
    } catch (e) {
      console.error('[google drive sync]', file.id, e)
      stat.errorCount++
    }
  }

  await prisma.driveFolderConnection.update({
    where: { id: folderConnectionId },
    data: { lastSyncAt: new Date(), lastSyncStat: stat as never },
  })

  return { ok: true, folderId, stat }
}

let openai: OpenAI | null | undefined

async function generateEmbeddingIfConfigured(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null
  openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text.replace(/\n/g, ' '),
    dimensions: 1536,
  })
  return response.data[0]?.embedding ?? null
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const cleaned = text.replace(/\0/g, '').trim()
  if (cleaned.length <= size) return [cleaned]
  const out: string[] = []
  let i = 0
  while (i < cleaned.length) {
    out.push(cleaned.slice(i, i + size))
    i += size - overlap
  }
  return out
}

function cuid(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}
