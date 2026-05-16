/**
 * Slack Web API のミニマルクライアント。
 * 大量に使うわけではないので fetch 直叩き。
 */

const SLACK_API = 'https://slack.com/api'

export class SlackApiError extends Error {
  constructor(
    public method: string,
    public payload: unknown,
  ) {
    super(`Slack API error: ${method} - ${JSON.stringify(payload)}`)
  }
}

async function call<T>(method: string, token: string, params: Record<string, string | undefined>): Promise<T> {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) search.set(k, v)
  }
  const r = await fetch(`${SLACK_API}/${method}?${search}`, {
    headers: { authorization: `Bearer ${token}` },
  })
  const json = (await r.json()) as { ok: boolean } & Record<string, unknown>
  if (!json.ok) throw new SlackApiError(method, json)
  return json as T
}

export const slack = {
  conversationsList: (token: string, opts: { cursor?: string; types?: string; limit?: number }) =>
    call<{
      channels: Array<{ id: string; name: string; is_archived: boolean; is_member: boolean }>
      response_metadata?: { next_cursor?: string }
    }>('conversations.list', token, {
      types: opts.types ?? 'public_channel,private_channel,im,mpim',
      limit: String(opts.limit ?? 200),
      cursor: opts.cursor,
    }),

  conversationsHistory: (token: string, opts: { channel: string; limit?: number; oldest?: string }) =>
    call<{
      messages: Array<{
        ts: string
        thread_ts?: string
        user?: string
        text?: string
        bot_id?: string
      }>
    }>('conversations.history', token, {
      channel: opts.channel,
      limit: String(opts.limit ?? 50),
      oldest: opts.oldest,
    }),

  usersInfo: (token: string, user: string) =>
    call<{
      user: {
        id: string
        real_name?: string
        profile?: { email?: string; display_name?: string; real_name?: string }
      }
    }>('users.info', token, { user }),

  chatGetPermalink: (token: string, channel: string, message_ts: string) =>
    call<{ permalink?: string }>('chat.getPermalink', token, { channel, message_ts }),

  chatPostMessage: async (
    token: string,
    body: {
      channel: string
      text: string
      thread_ts?: string
      blocks?: unknown[]
    },
  ) => {
    const r = await fetch(`${SLACK_API}/chat.postMessage`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    })
    const json = (await r.json()) as { ok: boolean; ts?: string; channel?: string; error?: string }
    if (!json.ok) throw new SlackApiError('chat.postMessage', json)
    return json
  },

  conversationsRepliesText: async (token: string, channel: string, ts: string) =>
    call<{
      messages: Array<{ ts: string; user?: string; text?: string; bot_id?: string }>
    }>('conversations.replies', token, { channel, ts, limit: '20' }),

  oauthV2Access: async (params: {
    client_id: string
    client_secret: string
    code: string
    redirect_uri: string
  }) => {
    const r = await fetch(`${SLACK_API}/oauth.v2.access`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    })
    const json = (await r.json()) as {
      ok: boolean
      access_token?: string
      bot_user_id?: string
      scope?: string
      team?: { id: string; name: string }
      enterprise?: { id?: string } | null
      authed_user?: { access_token?: string; id?: string }
      error?: string
    }
    if (!json.ok) throw new SlackApiError('oauth.v2.access', json)
    return json
  },
}
