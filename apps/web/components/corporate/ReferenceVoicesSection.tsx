'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'

type ReferenceVoice = {
  id: string
  displayOrder: number
  number: string
  year: string
  source: string
  companyType?: string
  context: string
  title: string
  excerpt: string
  paragraphs: readonly string[]
  proof?: readonly string[]
  kind?: 'reference' | 'customer'
  company?: string
  representative?: string
  logo?: string
  facts?: readonly {
    label: string
    value: string
  }[]
}

const referenceVoices: readonly ReferenceVoice[] = [
  {
    id: 'market-launch-sales',
    displayOrder: 1,
    number: '04',
    year: '2025',
    source: '元上司',
    companyType: '外資系IT企業',
    context: '日本法人立ち上げ / クラウドセキュリティSaaS',
    title: '場の空気をよくしながら、難しい商談を前へ進める。',
    excerpt: '初対面でも打ち解けるのが早く、商談を和やかにしながら本題へ自然に入っていける。',
    paragraphs: [
      '沢坂さんは、当社における日本市場立ち上げフェーズのセールスメンバーとして約1年間在籍し、クラウドセキュリティ系SaaSプロダクトの営業を担当していました。問い合わせ対応に加え、インバウンドリードからの案件化、オンラインデモ、見積・契約締結、導入後のフォローまで、一連のプロセスを主担当として対応していました。',
      '在籍期間中、チームとしては新規・既存を含め複数社の成約を獲得。その多くのフロント対応に沢坂さんが関わっていました。特に中堅〜中小企業のお客様に対して、オンラインミーティングを中心に課題ヒアリングから提案、クロージングまでを粘り強く進めていた印象です。',
      '沢坂さんの大きな強みは、「場の空気をよくする力」です。社内外問わず、初対面の相手とも打ち解けるのが早く、商談の場を和やかな雰囲気にしつつ、本題に自然に入っていけるコミュニケーション力があります。そのため、お客様からの第一印象が良く、「話しやすい」「相談しやすい」といったフィードバックをいただくことが多いタイプです。営業活動においても、堅くなりがちなクラウドセキュリティの話を、相手の温度感に合わせて進めていくことで、ヒアリングや関係構築の面でプラスに働いていました。',
      '以上となりますが、事実に基づき、沢坂さんのこれまでの業務上の関わりと強みについてご紹介しました。御社でご活躍される機会があれば幸いです。',
    ],
    proof: ['ダイレクト顧客 7社', 'パートナー顧客 2社'],
  },
  {
    id: 'zero-to-one-launch',
    displayOrder: 2,
    number: '01',
    year: '2024',
    source: '代表',
    companyType: 'ITスタートアップ',
    context: '設立直後 / 営業体制の0→1',
    title: '何もない状態から、1カ月で営業体制をつくる。',
    excerpt: '成功の保証がない状態でも前向きに入り、失敗を恐れずチャレンジし続ける人です。',
    paragraphs: [
      '沢坂さんには、設立直後で事業開始前、何もない状態の弊社にジョインしていただきました。今後成功する保証もなく、リスクが非常に大きい状態でも前向きに入社していただけたことからも分かるように、常に前向きで失敗を恐れずチャレンジし続ける方です。',
      '弊社に入社した後は、１ヶ月という短い期間でゼロから営業体制を整え、その直後に受注に成功するなど、プレイヤー・マネジメント双方の立場で活躍していただきました。一般的なセオオリーや外部からのアドバイスを鵜呑みにすることなく、その場その場で自身の最適解を考え、それを実行していく姿勢が随所で垣間見られ、それが結果に表れていたと感じます。',
      '沢坂さんは、制約がなくより裁量を持てる局面で，事業を前に進め大活躍できる方です。今後、沢坂さんの活躍を祈念しております。',
    ],
  },
  {
    id: 'founder-mindset',
    displayOrder: 3,
    number: '02',
    year: '2023',
    source: '代表',
    companyType: '上場IT企業',
    context: 'スタートアップ / 困難な局面',
    title: '厳しいときこそ、一緒に立ち向かう。',
    excerpt: '逃げる人でも、黙って何もしない人でもない。社長と一緒に立ち向かう人です。',
    paragraphs: [
      '沢坂さんは持ち前の明るさや営業能力だけでなく、会社から徒歩1分以内に住むという前向きな姿勢に現れるように、給料をもらって、それなりに頑張る普通のサラリーマンとは違う起業家タイプの人です。',
      '両親が起業家であるということも、これから起こるであろうスタートアップならではの困難さを乗り越えていけると思います。新しく入る会社では幹部を用意されることになると思いますが、困難な時には3つのタイプが出てきます。逃げ出す人、他人事のように黙って何もしない人、社長と一緒に立ち向かう人の3つです。',
      '沢坂さんは、一緒に立ち向かってくれる人です。スタートアップの環境は厳しいタイミングも必ずあることかと思いますが、そんな厳しい時こそ、沢坂さんを大切にしつつ、一緒に乗り越えて、飛躍して欲しいと思います。',
    ],
  },
  {
    id: 'enterprise-growth',
    displayOrder: 4,
    number: '03',
    year: '2023',
    source: '元執行役員 CRO',
    companyType: '上場IT企業',
    context: 'エンタープライズ営業 / 新規顧客開拓',
    title: '過去の方法に固執せず、最善を探し続ける。',
    excerpt: '常に最善の方法を模索して改善し、その過程で自分の主体性を見せていました。',
    paragraphs: [
      '［会社名非公開］での仕事を通じて、沢坂さんはエンタープライズセールスおよびインサイドセールスの分野で熱心にご活躍いただきました。彼は、単なるこれまでの過去の一つの方法に固執せず、常に最善の方法を模索して改善に努め、そのプロセスで自己の主体性を見せてくれました。彼の対応力とモチベーションはビジネスの成長に貢献いただきました。',
      '大学を卒業してからは渡米という大胆な決断をし、成功に向かう決意と探究心に溢れている証だと感じました。仕事場でも新たな挑戦に果敢に立ち向かう姿勢が見て取れ、その姿勢こそが彼の成果を導く力であったことが分かりました。',
      '［会社名非公開］での貴重な経験を通じて、沢坂さんは新規顧客の獲得手法を磨き、エンタープライズ顧客との効果的なコミュニケーション方法を習得し、ソリューション提案のスキルを高め、AI製品の有効活用に関する洞察を得ました。こうしたスキルと知識は、今後のビジネスにおいて一層の成果をもたらすと思っております。',
      '沢坂さんが私たちのチームで培ったスキルや経験は、将来のビジネスキャリアにおいて大いに役立つものだと確信しております。彼の持ち前の情熱と向上心によって、新たなフィールドでも確かな成功を収めることを期待しております。',
    ],
  },
  {
    id: 'ownership-feedback',
    displayOrder: 5,
    number: '05',
    year: '2023',
    source: '元上司',
    companyType: '上場IT企業',
    context: '営業組織 / 率直なフィードバック',
    title: '流れ仕事にせず、想いを強く乗せる。',
    excerpt: '責任感が強いあまり抱え込みやすい。周りの力を借りられれば、もっと強くなる。',
    paragraphs: [
      '沢坂さんの良い点は、人によって態度を変えることのない裏表のないところです。自分に任された仕事に責任感を持って遂行されます。従業員感覚ではなく自分の責務を遂行できるように自分の中で試行錯誤しながら、結果を出せるように努力ができる人だと思います。',
      '例えば、インサイドセールスにおける一つの業務を一部対応されていましたが、会社にあるテンプレートではなく、自分で考えたオリジナルのやり方、また顧客のトーンや、戦略も含めて営業側に申し送りされていました。流れ仕事ではなく、想いを強く乗せて仕事をされていたのは、沢坂さんの責任感の表れだと感じています。',
      '次ステップのみなさまへ申し送りとしては、責任感が強いあまりに、全責任を自分で持つか、相手に任せるか、その配分を曖昧にすることが苦手な方と感じております。周りの力も借りながら、進められると、もっと沢坂さんのエネルギーの強さを軸に、周りのメンバーもけん引できるのではないかと考えます。',
      '一個人の意見ですが、まっすぐな沢坂さんが次のステージで活躍できるよう応援しています。',
    ],
  },
  {
    id: 'very-forward-customer',
    displayOrder: 6,
    number: '06',
    year: '導入事例',
    source: '導入企業',
    context: '営業・マーケティング基盤設計 / 売上インフラ',
    title: '散らばった商談情報を、次の行動が見える売上基盤へ。',
    excerpt: '既存ツールとAIを組み合わせ、売上インフラとしてまとめて設計できる点に魅力を感じ、導入を決定しました。',
    paragraphs: [
      '営業活動を拡大していく中で、商談情報や顧客接点、提案内容が個別のツールやメモに分散し、案件状況や次に取るべき行動を把握しづらい課題がありました。',
      '少人数体制でも営業の再現性を高め、見込み顧客へのアプローチ精度を上げるため、Notion・Google Workspace・Zoom・CRMにAIを組み合わせ、売上インフラとしてまとめて設計できる点に魅力を感じ、導入を決定しました。',
    ],
    kind: 'customer',
    company: '合同会社ベリーフォワード',
    representative: '代表 磯利弘 様',
    logo: '/customers/very-forward.svg',
    facts: [
      { label: '課題', value: '商談情報が個別ツールに分散' },
      { label: '目的', value: '見込み顧客へのアプローチ精度向上' },
      { label: '設計', value: '既存SaaSと売上データを接続' },
    ],
  },
] as const

const orderedReferenceVoices = [...referenceVoices].sort((a, b) => a.displayOrder - b.displayOrder)

export function ReferenceVoicesSection() {
  const [activeReference, setActiveReference] = useState<ReferenceVoice | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!activeReference) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveReference(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeReference])

  return (
    <>
      <section className="overflow-hidden bg-[#f4f9fc] py-16 sm:py-24 lg:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
          <div>
            <div>
              <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.24em] text-[#0b6fb7]">
                <span className="h-px w-10 bg-[#2a8bc6]" />
                REFERENCE
              </div>
              <h2 className="mt-7 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[2.15rem] font-semibold leading-[1.45] tracking-[-0.03em] text-[#123b59] sm:text-5xl sm:leading-[1.4]">
                一緒に働いた人の、<br className="hidden sm:block" />リアルの言葉。
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-[#587383] sm:text-[15px]">
                過去の正社員時代に寄せられた5件の推薦文と、実際に支援した企業の導入事例です。
              </p>
            </div>
          </div>

          <div className="mt-12 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3 sm:mt-14">
            {orderedReferenceVoices.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveReference(item)}
                className="group flex h-full min-h-[27rem] w-full flex-col border border-[#c9dfe9] bg-white p-7 text-left shadow-[0_18px_60px_rgba(18,59,89,0.06)] transition-all hover:-translate-y-1 hover:border-[#6eb3d9] hover:shadow-[0_22px_70px_rgba(18,59,89,0.11)] sm:p-8"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5">
                  <p className="text-[9px] font-bold tracking-[0.2em] text-[#0b6fb7]">{item.kind === 'customer' ? 'CUSTOMER STORY' : 'REFERENCE'} {item.number}</p>
                  {item.kind === 'customer' && item.logo ? (
                    <span className="flex h-[22px] w-24 shrink-0 items-start justify-end">
                      <Image src={item.logo} alt={item.company ?? '導入企業'} width={96} height={36} className="max-h-[22px] w-auto max-w-full" unoptimized />
                    </span>
                  ) : (
                    <span className="relative h-11 w-11 shrink-0" aria-hidden="true">
                      <span className="absolute inset-0 overflow-hidden rounded-full border border-[#8fc5df] bg-[#f4f9fc]">
                        <Image
                          src="/brand/rookie-smart-japan/rsj-corporate-cat-reading-transparent.png"
                          alt=""
                          width={88}
                          height={88}
                          className="absolute -left-5 top-0 h-[88px] w-[88px] max-w-none"
                        />
                      </span>
                    </span>
                  )}
                  <p className="col-span-2 mt-2 text-[10px] leading-5 tracking-[0.08em] text-[#7893a2] sm:whitespace-nowrap">
                    {item.kind === 'customer' ? `${item.company} / ${item.representative}` : `${item.source} / ${item.companyType}`}
                  </p>
                </div>
                <p className="mt-7 text-[10px] font-semibold leading-5 tracking-[0.08em] text-[#638194]">{item.context}</p>
                <h3 className="mt-4 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[1.45rem] font-semibold leading-[1.65] tracking-[-0.02em] text-[#123b59]">{item.title}</h3>
                <blockquote className="mt-5 border-l-2 border-[#72b8dc] pl-4 text-sm leading-7 text-[#587383]">「{item.excerpt}」</blockquote>
                <span className="mt-auto flex items-center justify-between border-t border-[#dceaf1] pt-6 text-xs font-bold text-[#0b6fb7]">
                  {item.kind === 'customer' ? '導入事例の全文を読む' : '推薦文の全文を読む'}
                  <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            ))}
          </div>

          <p className="mt-5 text-[9px] leading-5 tracking-[0.08em] text-[#7893a2] xl:whitespace-nowrap">
            ※ リファレンス01〜05の本文は実際の原文をそのまま掲載しています。宛名・日付・署名および会社名のみ、プライバシー保護のため非公開です。
          </p>
        </div>
      </section>

      {activeReference ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#09243a]/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={() => setActiveReference(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reference-dialog-title"
            className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-[0_30px_100px_rgba(6,35,54,0.28)] sm:rounded-none"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#d9e8f0] bg-white/95 px-6 py-5 backdrop-blur sm:px-9">
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] text-[#0b6fb7]">{activeReference.kind === 'customer' ? 'CUSTOMER STORY' : 'REFERENCE'} {activeReference.number} / FULL VOICE</p>
                <p className="mt-1 text-xs text-[#7893a2]">
                  {activeReference.kind === 'customer'
                    ? `${activeReference.source} / ${activeReference.year}`
                    : `${activeReference.source} / ${activeReference.companyType}`}
                </p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={() => setActiveReference(null)} aria-label="リファレンスを閉じる" className="grid h-11 w-11 place-items-center border border-[#c8dfe9] text-[#123b59] transition-colors hover:bg-[#edf6fa]">
                <X size={19} />
              </button>
            </div>

            <div className="px-6 py-8 sm:px-10 sm:py-11">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.1em] text-[#638194]">{activeReference.context}</p>
                  {activeReference.company ? (
                    <div className="mt-3">
                      <p className="text-sm font-bold text-[#123b59]">{activeReference.company}</p>
                      <p className="mt-1 text-xs text-[#7893a2]">{activeReference.representative}</p>
                    </div>
                  ) : null}
                </div>
                {activeReference.logo ? (
                  <span className="flex h-16 w-36 items-center justify-center border border-[#d8e7ee] bg-white px-3">
                    <Image src={activeReference.logo} alt={activeReference.company ?? '導入企業'} width={120} height={68} className="max-h-10 w-auto" unoptimized />
                  </span>
                ) : null}
              </div>
              <h2 id="reference-dialog-title" className="mt-4 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[1.85rem] font-semibold leading-[1.5] tracking-[-0.025em] text-[#123b59] sm:text-[2.35rem]">
                {activeReference.title}
              </h2>

              {activeReference.proof ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {activeReference.proof.map((proof) => <span key={proof} className="border border-[#b9d8e8] bg-[#eff8fc] px-4 py-2 text-xs font-bold text-[#0b6fb7]">{proof}</span>)}
                </div>
              ) : null}

              <div className="mt-9 space-y-6 border-t border-[#d9e8f0] pt-8 text-[15px] leading-8 text-[#425f70] sm:text-base sm:leading-9">
                {activeReference.paragraphs.map((paragraph, index) => <p key={`${activeReference.id}-${index}`}>{paragraph}</p>)}
              </div>

              {activeReference.facts ? (
                <dl className="mt-10 grid border border-[#c9dfe9] sm:grid-cols-3">
                  {activeReference.facts.map((fact) => (
                    <div key={fact.label} className="border-b border-[#d9e8f0] bg-[#f5fafc] px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                      <dt className="text-[9px] font-bold tracking-[0.18em] text-[#0b6fb7]">{fact.label}</dt>
                      <dd className="mt-3 text-sm font-bold leading-6 text-[#123b59]">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="mt-8 border-l-2 border-[#66b6dd] bg-[#f3f9fc] px-4 py-3 text-[10px] leading-5 tracking-[-0.01em] text-[#638194] sm:whitespace-nowrap">
                {activeReference.kind === 'customer'
                  ? '本事例は、既に公開している導入企業情報とお客様の声をもとに掲載しています。'
                  : '本文は実際の原文をそのまま掲載しています。宛名・日付・署名および会社名のみ、プライバシー保護のため非公開です。'}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
