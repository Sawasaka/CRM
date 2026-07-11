export function verifyAiCallToolSecret(req: Request) {
  const configured = process.env.AI_CALL_TOOL_SECRET ?? process.env.AI_CALL_WEBHOOK_SECRET
  if (!configured) return true

  const url = new URL(req.url)
  const provided =
    req.headers.get('x-ai-call-tool-secret') ??
    req.headers.get('x-ai-call-secret') ??
    url.searchParams.get('secret')

  return provided === configured
}
