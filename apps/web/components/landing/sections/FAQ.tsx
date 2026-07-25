import { HelpCircle, Plus } from 'lucide-react'

const faqItems = [
  {
    question: 'Revenue Experiment Infrastructureとは何ですか？',
    answer:
      '広告・Web・CRM・商談・受注・継続データを接続し、仮説の試算、計測、並行検証、予算配分までを繰り返せる売上実験の基盤です。',
  },
  {
    question: 'どのような企業に向いていますか？',
    answer:
      '広告やSEO、インサイドセールスを行っているものの、どの施策が商談・受注につながったか見えにくい企業に適しています。データ量が少ない段階でも、計測設計から始められます。',
  },
  {
    question: '最初に何から始めますか？',
    answer:
      '現在の集客導線、CRM、商談管理、受注データを確認し、売上まで追える箇所と欠けている箇所を整理します。その上で、最初に試す小さな実験を1つ決めます。',
  },
  {
    question: '確率モデルでは何をシミュレーションしますか？',
    answer:
      '流入数、CVR、商談化率、受注率、CAC、LTVなどに幅を持たせ、複数の結果を事前に試算します。将来を断定するものではなく、試す価値が高い仮説を絞るために使います。',
  },
  {
    question: 'ベイズ統計とバンディットはどう使い分けますか？',
    answer:
      'ベイズ統計は、複数案の成功確率をデータに応じて更新するために使います。バンディットは、その確率をもとに予算・流入・営業工数を有望な案へ寄せながら、次の探索も残すために使います。',
  },
  {
    question: 'HubSpotやGA4など、今あるツールは使えますか？',
    answer:
      'はい。HubSpot、Salesforce、GA4、Search Console、広告媒体、Google Workspaceなど、既存環境を前提に設計します。必要のない全面移行は行いません。',
  },
  {
    question: '成果は保証されますか？',
    answer:
      '売上や施策成果を保証するサービスではありません。データの不確実性を明示し、仮説・計測条件・判断ルールを整えることで、再現性のある意思決定を支援します。',
  },
]

export const FAQ = () => (
  <section className="relative border-b border-white/[0.08] bg-[#0b0f15]">
    <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 md:py-24">
      <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#c8b9ff]">
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        FAQ
      </div>
      <h2 className="mt-4 font-display text-[2rem] font-bold leading-tight text-white md:text-[2.7rem]">
        よくある質問
      </h2>

      <div className="mt-9 divide-y divide-white/[0.08] border-y border-white/[0.08]">
        {faqItems.map((item) => (
          <details key={item.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-bold text-[#e7ecf3] marker:hidden">
              {item.question}
              <Plus
                className="h-4 w-4 shrink-0 text-[#7f8999] transition-transform group-open:rotate-45"
                aria-hidden="true"
              />
            </summary>
            <p className="max-w-[48rem] pb-6 pr-9 text-[0.76rem] leading-7 text-[#9ca6b4]">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
)
