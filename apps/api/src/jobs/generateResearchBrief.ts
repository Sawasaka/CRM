import { Worker } from 'bullmq'
import { redis, JOB_NAMES } from '@bgm/queue'
import { prisma } from '@bgm/db'
import { synthesizeResearchBrief } from '@bgm/ai'

export const researchBriefWorker = new Worker(
  'standard',
  async (job) => {
    if (job.name !== JOB_NAMES.GENERATE_RESEARCH_BRIEF) return

    const { dealId, companyName } = job.data as { dealId: string; companyName: string }

    // 1. Tavily で企業検索
    const searchResults = await searchCompanyWithTavily(companyName)

    // 2. GPT-5.5 で Research Brief 合成
    const briefData = await synthesizeResearchBrief(searchResults, companyName)

    // 3. DB に保存
    await prisma.researchBrief.upsert({
      where: { dealId },
      create: { dealId, companyName, ...briefData },
      update: { ...briefData },
    })

    console.log(`Research Brief generated for deal: ${dealId}`)
  },
  { connection: redis, concurrency: 5 }
)

async function searchCompanyWithTavily(companyName: string): Promise<string> {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query: `${companyName} 会社概要 事業内容 課題`,
      search_depth: 'advanced',
      max_results: 5,
      include_answer: true,
    }),
  })

  const data = await response.json() as { results: Array<{ content: string }> }
  return data.results.map((r: { content: string }) => r.content).join('\n\n')
}
