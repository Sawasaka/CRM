import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'

export async function listDriveFiles(
  auth: OAuth2Client,
  folderId: string,
  mimeTypes?: string[]
) {
  const drive = google.drive({ version: 'v3', auth })
  const q = mimeTypes
    ? `'${folderId}' in parents and (${mimeTypes.map((m) => `mimeType='${m}'`).join(' or ')})`
    : `'${folderId}' in parents`

  const res = await drive.files.list({
    q,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })
  return res.data.files ?? []
}

// 共有ドライブの一覧
export async function listSharedDrives(auth: OAuth2Client) {
  const drive = google.drive({ version: 'v3', auth })
  const res = await drive.drives.list({
    pageSize: 100,
    fields: 'drives(id, name, kind)',
  })
  return res.data.drives ?? []
}

// 指定 folder 配下の「フォルダのみ」を一覧（共有ドライブ対応）
// parentId: 'root' でマイドライブ直下、driveId 指定で共有ドライブ直下
export async function listSubFolders(
  auth: OAuth2Client,
  parentId: string,
  driveId?: string,
) {
  const drive = google.drive({ version: 'v3', auth })
  const baseParams = {
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name, parents, webViewLink, modifiedTime)',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    orderBy: 'name',
  }
  const res = driveId
    ? await drive.files.list({ ...baseParams, driveId, corpora: 'drive' })
    : await drive.files.list(baseParams)
  return res.data.files ?? []
}

export async function exportDriveFile(
  auth: OAuth2Client,
  fileId: string,
  mimeType = 'text/plain'
): Promise<string> {
  const drive = google.drive({ version: 'v3', auth })
  const res = await drive.files.export(
    { fileId, mimeType },
    { responseType: 'text' }
  )
  return res.data as string
}

export async function watchDriveFolder(
  auth: OAuth2Client,
  folderId: string,
  webhookUrl: string,
  channelId: string
) {
  const drive = google.drive({ version: 'v3', auth })
  return drive.files.watch({
    fileId: folderId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
    },
  })
}
