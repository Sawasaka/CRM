import { promises as fs } from 'fs'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { auth } from '@/lib/auth'
import {
  CHAT_POLICY_PRESETS,
  DEFAULT_CHAT_POLICY_STATE,
  resolveChatPolicyPreset,
  type ChatPolicyPresetId,
  type ChatPolicyState,
} from '@/lib/chat-policy-presets'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function resolveUserId(): Promise<string | null> {
  const session = await auth()
  let userId = (session as unknown as { userId?: string })?.userId ?? null

  if (!userId && process.env.NODE_ENV !== 'production') {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    userId = user?.id ?? 'local-dev-user'
  }

  return userId
}

function policyPath(userId: string): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_')
  return join(process.cwd(), `.chat-policy-${safeUserId}.json`)
}

async function readPolicy(userId: string): Promise<ChatPolicyState> {
  try {
    const raw = await fs.readFile(policyPath(userId), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<ChatPolicyState>
    const preset = resolveChatPolicyPreset(parsed.selectedPresetId)
    return {
      selectedPresetId: preset.id,
      premises: parsed.premises ?? preset.premises,
      policies: parsed.policies ?? preset.policies,
    }
  } catch {
    return DEFAULT_CHAT_POLICY_STATE
  }
}

export async function GET() {
  const userId = await resolveUserId()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  return NextResponse.json({
    presets: CHAT_POLICY_PRESETS,
    policy: await readPolicy(userId),
  })
}

export async function PUT(req: NextRequest) {
  const userId = await resolveUserId()
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as Partial<ChatPolicyState>
  const preset = resolveChatPolicyPreset(body.selectedPresetId)
  const next: ChatPolicyState = {
    selectedPresetId: preset.id as ChatPolicyPresetId,
    premises: String(body.premises ?? preset.premises).slice(0, 8000),
    policies: String(body.policies ?? preset.policies).slice(0, 8000),
  }

  await fs.writeFile(policyPath(userId), JSON.stringify(next, null, 2), 'utf-8')

  return NextResponse.json({ policy: next })
}
