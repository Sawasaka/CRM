import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentAppContext } from '@/lib/app-context'
import {
  DEFAULT_CALL_SCENARIOS,
  DEFAULT_INQUIRY_CALL_SCENARIO,
  getCallScenarios,
  upsertCallScenario,
} from '@/lib/ai-calls/call-scenario'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const scenarioSchema = z.object({
  key: z.string().min(1).max(80).optional(),
  name: z.string().min(1).max(120),
  objective: z.string().min(1).max(4000),
  openingTalk: z.string().min(1).max(3000),
  requiredQuestions: z.array(z.string()).max(40),
  optionalQuestions: z.array(z.string()).max(40),
  ngResponses: z.array(z.string()).max(40),
  schedulingPolicy: z.string().min(1).max(4000),
  handoffConditions: z.array(z.string()).max(40),
  completionCriteria: z.string().min(1).max(4000),
  ragSources: z.array(z.string()).max(40),
  enabled: z.boolean(),
})

export async function GET() {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const scenarios = await getCallScenarios(context.appOrgId)
  return NextResponse.json({
    scenario: scenarios[0] ?? DEFAULT_INQUIRY_CALL_SCENARIO,
    scenarios,
    defaultScenario: DEFAULT_INQUIRY_CALL_SCENARIO,
    defaultScenarios: DEFAULT_CALL_SCENARIOS,
  })
}

export async function PUT(req: Request) {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = scenarioSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', detail: parsed.error.flatten() }, { status: 400 })
  }

  const scenario = await upsertCallScenario(context.appOrgId, {
    ...DEFAULT_INQUIRY_CALL_SCENARIO,
    ...parsed.data,
    key: parsed.data.key ?? DEFAULT_INQUIRY_CALL_SCENARIO.key,
  })
  const scenarios = await getCallScenarios(context.appOrgId)
  return NextResponse.json({ ok: true, scenario, scenarios })
}
