// dev用: 認証なしでリサーチロジックを直接呼び出すテスト
// $ cd apps/web && npx tsx --env-file=../../.env.local scripts/test-research.ts
import OpenAI from 'openai'
import { buildResearchContext, formatContextForPrompt } from '../lib/research-context.js'
import { getOurBusiness, formatOurBusinessPrompt } from '../lib/our-business.js'
import { RESEARCH_PRESETS } from '../lib/research-presets.js'

async function main() {
  const ctx = await buildResearchContext('company', '9deb66bf-72c8-4b73-a21c-c8e45a4f7b06')
  console.log('=== コンテキスト概要 ===')
  console.log(`entity=${ctx.entityType}, abm=${ctx.abm ? '取得成功' : 'null'}`)
  if (ctx.abm) {
    console.log(`企業: ${ctx.abm.company.name}`)
    console.log(`offices: ${ctx.abm.offices.length}`)
    console.log(`intentSignals: ${ctx.abm.intentSignals.length}`)
    console.log(`companyIntents: ${ctx.abm.companyIntents.length}`)
  }

  const ourBiz = await getOurBusiness()
  const sysPrompt =
    `あなたはB2B営業のシニアリサーチャーです。\n\n` +
    `${formatOurBusinessPrompt(ourBiz)}\n\n` +
    `${formatContextForPrompt(ctx)}`

  console.log(`\n=== システムプロンプト長: ${sysPrompt.length}文字 ===`)

  const preset = RESEARCH_PRESETS.find((p) => p.id === 'company_intel')!
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  console.log('\n=== gpt-5.5 呼び出し中... ===')
  const t0 = Date.now()
  const completion = await openai.chat.completions.create({
    model: 'gpt-5.5',
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: preset.prompt },
    ],
    temperature: 0.4,
  })
  const ms = Date.now() - t0
  console.log(`応答時間: ${ms}ms`)
  console.log(`tokens: ${JSON.stringify(completion.usage)}`)
  console.log('\n--- 応答 ---')
  console.log(completion.choices[0]?.message?.content)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
