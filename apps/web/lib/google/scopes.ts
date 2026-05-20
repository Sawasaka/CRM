/**
 * 機能ごとに必要な Google OAuth スコープ。
 * Meet は議事録 Doc の export に Drive (readonly) も必要なため依存に含める。
 */
export const SCOPES_BY_SERVICE = {
  gmail: ['https://www.googleapis.com/auth/gmail.modify'],
  drive: ['https://www.googleapis.com/auth/drive.readonly'],
  calendar: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
  meet: [
    'https://www.googleapis.com/auth/meetings.space.readonly',
    'https://www.googleapis.com/auth/meetings.space.created',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
  chat: [
    'https://www.googleapis.com/auth/chat.spaces.readonly',
    'https://www.googleapis.com/auth/chat.messages.readonly',
  ],
} as const

export type GoogleService = keyof typeof SCOPES_BY_SERVICE

export function scopesForServices(services: GoogleService[]): string[] {
  const set = new Set<string>()
  for (const s of services) {
    for (const scope of SCOPES_BY_SERVICE[s]) set.add(scope)
  }
  return Array.from(set)
}

/**
 * 取得済みスコープ文字列から、各サービスが利用可能かを判定。
 */
export function availabilityFromScope(scope: string | null | undefined): Record<GoogleService, boolean> {
  const s = scope ?? ''
  return {
    gmail: SCOPES_BY_SERVICE.gmail.every((x) => s.includes(x)),
    drive: SCOPES_BY_SERVICE.drive.every((x) => s.includes(x)),
    calendar: SCOPES_BY_SERVICE.calendar.every((x) => s.includes(x)),
    meet: SCOPES_BY_SERVICE.meet.every((x) => s.includes(x)),
    chat: SCOPES_BY_SERVICE.chat.every((x) => s.includes(x)),
  }
}
