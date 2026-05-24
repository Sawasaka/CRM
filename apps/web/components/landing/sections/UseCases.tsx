import { Eyebrow, Section } from '../atoms'

export const UseCases = () => {
  const cols = [
    {
      eyebrow: '営業チーム', color: '#abc7ff',
      title: '商談前ブリーフィングを自動生成。',
      body: 'Sales Agent が議事録自動取込×ホット企業先回り通知。商談の前に「相手のIR・直近の求人・直近接触履歴」を3行サマリーで提示。',
    },
    {
      eyebrow: 'マーケ／インサイドセールス', color: '#ffcf4a',
      title: '1stパーティで、追わない営業へ。',
      body: 'Marketing Agent が1stパーティインテントから自動セグメント。スコア閾値超えのリードに、シーケンスを自動起動します。',
    },
    {
      eyebrow: 'CS／サポート／PDM', color: '#ff8dcf',
      title: 'チケット → ナレッジ → 機能要望。',
      body: 'Customer Agent と Product Agent が連携。チケット対応とナレッジ蓄積、要望機能の集計まで同時進行。PdM 会議が半減します。',
    },
  ]
  return (
    <Section tone="obsidian" screenLabel="12 Use Cases">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-40">
        <div className="max-w-3xl">
          <Eyebrow color="#abc7ff">USE CASES</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.4rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text">3つの現場</span>で、同時に効く。
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-14">
          {cols.map((c, i) => (
            <div key={i} className="rounded-3xl bg-dusk p-7 fo-lift fo-glass-rim relative overflow-hidden">
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
                style={{ background: `radial-gradient(circle, ${c.color}26, transparent 60%)`, filter: 'blur(40px)' }}
              />
              <div
                className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] relative"
                style={{ color: c.color }}
              >
                {c.eyebrow}
              </div>
              <div className="font-display font-bold text-[1.35rem] mt-4 relative">{c.title}</div>
              <p className="mt-4 text-sm text-[#9b99a0] leading-relaxed relative">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
