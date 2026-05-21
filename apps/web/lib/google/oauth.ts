import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { getGoogleAccountSnapshot, updateGoogleAccountTokens } from '@/lib/google/account-store'

// アクセストークンの期限切れ判定の前余裕（秒）
const EXPIRY_BUFFER_SEC = 60

export class GoogleAccountNotConnectedError extends Error {
  constructor(userId: string) {
    super(`User ${userId} has not connected a Google account.`)
    this.name = 'GoogleAccountNotConnectedError'
  }
}

/**
 * Google OAuth2 クライアントを返す。
 * - DB の UserGoogleAccount から refresh_token を読む
 * - access_token が期限切れなら自動で更新し、DB に書き戻す
 */
export async function getGoogleOAuthClient(userId: string): Promise<OAuth2Client> {
  const account = await getGoogleAccountSnapshot(userId)
  if (!account || !account.refreshToken) throw new GoogleAccountNotConnectedError(userId)

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  oauth2.setCredentials({
    access_token: account.accessToken ?? undefined,
    refresh_token: account.refreshToken,
    expiry_date: account.expiresAt?.getTime(),
  })

  // 期限切れ間近なら refresh
  const now = Date.now()
  const expiresAt = account.expiresAt?.getTime() ?? 0
  if (!account.accessToken || expiresAt - now < EXPIRY_BUFFER_SEC * 1000) {
    const { credentials } = await oauth2.refreshAccessToken()
    await updateGoogleAccountTokens({
      userId,
      accessToken: credentials.access_token ?? account.accessToken,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      scope: credentials.scope ?? account.scope,
    })
    oauth2.setCredentials(credentials)
  }

  return oauth2
}

export function getGmailClient(auth: OAuth2Client) {
  return google.gmail({ version: 'v1', auth })
}

export function getCalendarClient(auth: OAuth2Client) {
  return google.calendar({ version: 'v3', auth })
}

export function getDriveClient(auth: OAuth2Client) {
  return google.drive({ version: 'v3', auth })
}

// Meet API は googleapis の v2 として提供される
export function getMeetClient(auth: OAuth2Client) {
  return google.meet({ version: 'v2', auth })
}
