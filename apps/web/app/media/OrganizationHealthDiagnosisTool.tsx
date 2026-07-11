'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  RefreshCcw,
  Scale,
  ShieldAlert,
  Target,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type DiagnosisLevel = 'healthy' | 'risk' | 'dysfunction' | 'incomplete'

type AnswerOption = {
  label: string
  score: 0 | 1 | 2
}

type Question = {
  id: string
  text: string
  options: AnswerOption[]
}

type Category = {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  accent: string
  questions: Question[]
  results: Record<Exclude<DiagnosisLevel, 'incomplete'>, { title: string; body: string; actions: string[] }>
}

type AnswerState = Record<string, number | undefined>

const categories: Category[] = [
  {
    id: 'leadership',
    title: 'リーダーシップへの適応と公正性',
    subtitle: '上司への過剰適応、忖度、公平性の歪みを観測します。',
    icon: Scale,
    accent: '#d7ad59',
    questions: [
      {
        id: 'leadership-1',
        text: '社内で、上司の意見に異を唱えることよりも、同意することの方が評価されると感じますか？',
        options: [
          { label: 'いいえ', score: 0 },
          { label: 'どちらとも言えない', score: 1 },
          { label: 'はい', score: 2 },
        ],
      },
      {
        id: 'leadership-2',
        text: '自分の意見を述べる際、上司の反応を過度に気にして発言を控えることがありますか？',
        options: [
          { label: 'ほとんどない', score: 0 },
          { label: '時々ある', score: 1 },
          { label: '頻繁にある', score: 2 },
        ],
      },
      {
        id: 'leadership-3',
        text: '特定の人物が、客観的な成果とは関係なく、上司への個人的な関係性によって優遇されていると感じますか？',
        options: [
          { label: 'ほとんど感じない', score: 0 },
          { label: '少し感じる', score: 1 },
          { label: '強く感じる', score: 2 },
        ],
      },
    ],
    results: {
      healthy: {
        title: '高い健全性',
        body: '健全な敬意を保ちながら、多様な意見が交わされ、建設的な議論を通じて意思決定できています。',
        actions: ['反対意見の歓迎を明文化する', '評価基準を成果・行動・再現性で共有する', '会議で少数意見を拾う役割を置く'],
      },
      risk: {
        title: '適応過剰リスク',
        body: '上司への過度な適応が起き始めています。異論や客観的な視点が失われると、組織が硬直化します。',
        actions: ['反対意見を出しても不利益にならない場を作る', '意思決定理由をログ化する', '上司以外のレビュー観点を入れる'],
      },
      dysfunction: {
        title: '機能不全',
        body: '媚び・忖度・個人的関係が評価に影響している可能性が高く、不公平感や優秀人材の離反につながる状態です。',
        actions: ['評価と人間関係を切り分ける基準を再設計する', '360度フィードバックを導入する', '昇進・評価の根拠を可視化する'],
      },
    },
  },
  {
    id: 'ownership',
    title: '業務遂行への姿勢と責任感',
    subtitle: '困難な課題、地味な作業、長期成果への向き合い方を見ます。',
    icon: Target,
    accent: '#60a5fa',
    questions: [
      {
        id: 'ownership-1',
        text: '困難な課題や地味な作業に対し、積極的に取り組む社員が多いと感じますか？',
        options: [
          { label: '積極的である', score: 0 },
          { label: 'どちらとも言えない', score: 1 },
          { label: '避けようとする傾向がある', score: 2 },
        ],
      },
      {
        id: 'ownership-2',
        text: '長期的な視点での成果よりも、短期的に楽な方法が選ばれることが多いと感じますか？',
        options: [
          { label: 'いいえ', score: 0 },
          { label: 'どちらとも言えない', score: 1 },
          { label: 'はい', score: 2 },
        ],
      },
      {
        id: 'ownership-3',
        text: '「スマートな働き方」という名のもとに、本来必要な努力や丁寧な仕事が疎かにされていると感じますか？',
        options: [
          { label: 'いいえ', score: 0 },
          { label: 'どちらとも言えない', score: 1 },
          { label: 'はい', score: 2 },
        ],
      },
    ],
    results: {
      healthy: {
        title: '高い業務遂行能力と責任感',
        body: '困難な課題にも向き合い、短期的な楽さよりも長期的な価値と成果を追求できています。',
        actions: ['地味な貢献を称賛する', '長期成果につながる行動指標を置く', '難易度の高い課題をチームで分解する'],
      },
      risk: {
        title: '効率偏重リスク',
        body: '効率性や手軽さが先行し、本質的な問題解決や丁寧な作業が軽視される兆候があります。',
        actions: ['短期成果と長期成果を分けて振り返る', '品質基準を明文化する', '見えにくい下準備をタスク化する'],
      },
      dysfunction: {
        title: '責任回避・怠慢リスク',
        body: '責任を伴う業務や地道な努力から逃れる傾向が強く、生産性低下や不公平感につながる状態です。',
        actions: ['責任範囲と完了条件を明確化する', '丸投げ・先送りをレビュー対象にする', '負荷の偏りを定期的に可視化する'],
      },
    },
  },
  {
    id: 'credit',
    title: '成果帰属の透明性と倫理観',
    subtitle: '誰の貢献か、成果が正しく帰属しているかを確認します。',
    icon: Users,
    accent: '#35d399',
    questions: [
      {
        id: 'credit-1',
        text: 'チーム内で、自分の仕事を他人に任せきりにし、その成果を自分のものとするような行動が見られますか？',
        options: [
          { label: 'ほとんど見られない', score: 0 },
          { label: '時々見られる', score: 1 },
          { label: 'よく見られる', score: 2 },
        ],
      },
      {
        id: 'credit-2',
        text: '成果に対する個人の貢献度が正しく評価されていると感じますか？',
        options: [
          { label: '強く感じる', score: 0 },
          { label: '少し感じる', score: 1 },
          { label: 'ほとんど感じない', score: 2 },
        ],
      },
      {
        id: 'credit-3',
        text: 'プロジェクトやタスクの成功時、誰がどのような役割を果たしたかについて、透明性のある情報共有が行われていますか？',
        options: [
          { label: 'はい', score: 0 },
          { label: 'どちらとも言えない', score: 1 },
          { label: 'いいえ', score: 2 },
        ],
      },
    ],
    results: {
      healthy: {
        title: '高い成果の透明性と公正性',
        body: '個々の貢献が明確に認識され、成果が正当に帰属される文化があります。',
        actions: ['プロジェクト終了時に貢献ログを残す', '成果だけでなく役割も共有する', '称賛を具体的な行動に紐づける'],
      },
      risk: {
        title: '貢献度認識の曖昧さ',
        body: '誰が何をしたかが曖昧になり、一部の人が不当に評価されるリスクがあります。',
        actions: ['タスクの担当・支援・承認を分けて記録する', '週次で貢献の棚卸しを行う', '成果発表時に協力者を明記する'],
      },
      dysfunction: {
        title: '不公正な成果帰属',
        body: '他者の仕事を自分の成果として扱う行動が見られ、真の貢献者のモチベーション低下を招く状態です。',
        actions: ['丸投げと成果横取りを禁止行動として定義する', '評価前に関係者レビューを入れる', '成果物の作業履歴を残す運用にする'],
      },
    },
  },
  {
    id: 'decision',
    title: '意思決定の客観性と健全性',
    subtitle: '何が正しいかで決まるか、誰が言ったかで決まるかを見ます。',
    icon: ShieldAlert,
    accent: '#f97373',
    questions: [
      {
        id: 'decision-1',
        text: '社内の議論において、「誰の意見か」よりも「その意見の内容が正しいか」に焦点が当てられていると感じますか？',
        options: [
          { label: 'はい', score: 0 },
          { label: 'どちらとも言えない', score: 1 },
          { label: 'いいえ', score: 2 },
        ],
      },
      {
        id: 'decision-2',
        text: '役職や立場が上の人の意見が、必ずしも正しくないと感じても、それを指摘しにくい雰囲気がありますか？',
        options: [
          { label: 'ほとんど感じない', score: 0 },
          { label: '少し感じる', score: 1 },
          { label: '強く感じる', score: 2 },
        ],
      },
      {
        id: 'decision-3',
        text: '新しいアイデアや異なる意見が、その発言者の立場に関わらず、公平に検討される文化がありますか？',
        options: [
          { label: 'はい', score: 0 },
          { label: 'どちらとも言えない', score: 1 },
          { label: 'いいえ', score: 2 },
        ],
      },
    ],
    results: {
      healthy: {
        title: '客観的で健全な意思決定',
        body: '役職や立場に関わらず、意見の内容、データ、論理をもとに意思決定できています。',
        actions: ['議論では先に判断基準を置く', '意思決定ログに根拠を残す', '役職を伏せたアイデア検討を試す'],
      },
      risk: {
        title: '権威主義的影響リスク',
        body: '意思決定が権威や立場に左右されやすく、より良い選択肢が見過ごされる可能性があります。',
        actions: ['反対意見を出す担当を決める', '決定前に代替案を必ず比較する', '事実・解釈・意見を分けて議論する'],
      },
      dysfunction: {
        title: '不健全な意思決定プロセス',
        body: '客観的な事実よりも力関係や人間関係が意思決定を支配し、誤った判断が横行しやすい状態です。',
        actions: ['意思決定権限と判断基準を再定義する', '重要会議に第三者レビューを入れる', '決定後の検証と撤回ルールを作る'],
      },
    },
  },
]

const totalQuestionCount = categories.reduce((total, category) => total + category.questions.length, 0)
const maxTotalScore = totalQuestionCount * 2

function getLevel(score: number, answeredCount: number, questionCount: number): DiagnosisLevel {
  if (answeredCount < questionCount) return 'incomplete'
  if (score <= 1) return 'healthy'
  if (score <= 3) return 'risk'
  return 'dysfunction'
}

function getOverallLevel(score: number, answeredCount: number): DiagnosisLevel {
  if (answeredCount < totalQuestionCount) return 'incomplete'
  if (score <= 4) return 'healthy'
  if (score <= 12) return 'risk'
  return 'dysfunction'
}

function getLevelStyle(level: DiagnosisLevel) {
  if (level === 'healthy') return { label: '健全', className: 'border-[#35d399]/30 bg-[#35d399]/12 text-[#a7f3d0]' }
  if (level === 'risk') return { label: 'リスク', className: 'border-[#d7ad59]/40 bg-[#d7ad59]/14 text-[#f2cb77]' }
  if (level === 'dysfunction') return { label: '機能不全', className: 'border-[#f97373]/35 bg-[#f97373]/14 text-[#fecaca]' }
  return { label: '未回答', className: 'border-white/10 bg-white/[0.04] text-[#b7c5d8]' }
}

export default function OrganizationHealthDiagnosisTool() {
  const [answers, setAnswers] = useState<AnswerState>({})

  const result = useMemo(() => {
    const categoryResults = categories.map((category) => {
      const values = category.questions.map((question) => answers[question.id])
      const answeredCount = values.filter((value) => typeof value === 'number').length
      const score = values.reduce<number>((total, value) => total + (typeof value === 'number' ? value : 0), 0)
      const level = getLevel(score, answeredCount, category.questions.length)
      return { category, answeredCount, score, level }
    })

    const answeredCount = categoryResults.reduce<number>((total, item) => total + item.answeredCount, 0)
    const score = categoryResults.reduce<number>((total, item) => total + item.score, 0)
    const overallLevel = getOverallLevel(score, answeredCount)

    return { categoryResults, answeredCount, score, overallLevel }
  }, [answers])

  const progress = Math.round((result.answeredCount / totalQuestionCount) * 100)
  const overallStyle = getLevelStyle(result.overallLevel)

  return (
    <section
      id="organization-health-diagnosis"
      className="mt-8 rounded-lg border border-white/10 bg-[#07111d] p-5 shadow-[0_34px_120px_-80px_rgba(96,165,250,0.5)] sm:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[760px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ad59]/25 bg-[#d7ad59]/10 px-3 py-1.5 text-[12px] font-black tracking-[0.16em] text-[#f2cb77]">
            <ClipboardList size={15} />
            ORGANIZATION DIAGNOSIS
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-normal text-white sm:text-4xl">
            組織健全性診断ツール
          </h2>
          <p className="mt-4 text-[15px] font-bold leading-8 text-[#b7c5d8]">
            上司への過剰適応、責任回避、成果の横取り、権威主義的な意思決定など、組織の活力を削る行動パターンを12問で観測します。
          </p>
        </div>
        <div className="min-w-[240px] rounded-lg border border-white/10 bg-[#0b101a] p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-black tracking-[0.16em] text-[#abc7ff]">進捗</span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${overallStyle.className}`}>
              {overallStyle.label}
            </span>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-black text-white">{result.answeredCount}</span>
            <span className="pb-1 text-sm font-bold text-[#b7c5d8]">/ {totalQuestionCount} 問</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#60a5fa]" style={{ width: `${progress}%` }} />
          </div>
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-[#dbeafe] transition-colors hover:bg-white/[0.08]"
          >
            <RefreshCcw size={16} />
            回答をリセット
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {categories.map((category, categoryIndex) => {
          const categoryResult = result.categoryResults[categoryIndex] ?? {
            category,
            answeredCount: 0,
            score: 0,
            level: 'incomplete' as const,
          }
          const style = getLevelStyle(categoryResult.level)
          const Icon = category.icon
          const resultCopy =
            categoryResult.level === 'incomplete' ? null : category.results[categoryResult.level]

          return (
            <article key={category.id} className="rounded-lg border border-white/10 bg-[#0b101a] p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                  <span
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]"
                    style={{ color: category.accent }}
                  >
                    <Icon size={23} />
                  </span>
                  <div>
                    <p className="text-[12px] font-black tracking-[0.16em] text-[#abc7ff]">CATEGORY {categoryIndex + 1}</p>
                    <h3 className="mt-1 text-xl font-black text-white">{category.title}</h3>
                    <p className="mt-2 text-[14px] font-bold leading-7 text-[#b7c5d8]">{category.subtitle}</p>
                  </div>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1.5 text-[12px] font-black ${style.className}`}>
                  {style.label} · {categoryResult.score}/{category.questions.length * 2}
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {category.questions.map((question, questionIndex) => (
                  <div key={question.id} className="rounded-lg border border-white/10 bg-[#111827] p-4">
                    <p className="text-[14px] font-black leading-7 text-white">
                      Q{questionIndex + 1}. {question.text}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {question.options.map((option) => {
                        const isSelected = answers[question.id] === option.score
                        return (
                          <button
                            key={option.label}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.score }))}
                            className={[
                              'min-h-11 rounded-lg border px-3 py-2 text-left text-[13px] font-black leading-5 transition-colors',
                              isSelected
                                ? 'border-[#60a5fa] bg-[#60a5fa]/18 text-white'
                                : 'border-white/10 bg-white/[0.03] text-[#b7c5d8] hover:bg-white/[0.07]',
                            ].join(' ')}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {resultCopy ? (
                <div className="mt-5 rounded-lg border border-white/10 bg-[#07111d] p-5">
                  <div className="flex items-center gap-2">
                    {categoryResult.level === 'healthy' ? (
                      <CheckCircle2 size={18} className="text-[#35d399]" />
                    ) : (
                      <AlertTriangle size={18} className={categoryResult.level === 'risk' ? 'text-[#d7ad59]' : 'text-[#f97373]'} />
                    )}
                    <h4 className="text-base font-black text-white">{resultCopy.title}</h4>
                  </div>
                  <p className="mt-3 text-[14px] font-bold leading-7 text-[#b7c5d8]">{resultCopy.body}</p>
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    {resultCopy.actions.map((action) => (
                      <div key={action} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[13px] font-bold leading-6 text-[#dbeafe]">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}
      </div>

      <OverallResult score={result.score} answeredCount={result.answeredCount} level={result.overallLevel} />
    </section>
  )
}

function OverallResult({
  score,
  answeredCount,
  level,
}: {
  score: number
  answeredCount: number
  level: DiagnosisLevel
}) {
  const style = getLevelStyle(level)
  const isComplete = answeredCount === totalQuestionCount
  const percent = Math.round((score / maxTotalScore) * 100)

  const copy =
    level === 'healthy'
      ? {
          title: '総合判定：健全な議論と責任の土台があります',
          body: '現時点では深刻な組織毒は強く出ていません。今の文化を維持しながら、意思決定ログと貢献の可視化を続けると強い組織になります。',
        }
      : level === 'risk'
        ? {
            title: '総合判定：組織毒の兆候があります',
            body: '一部のカテゴリで、忖度・責任回避・成果帰属の曖昧さ・権威主義の兆候があります。高スコアのカテゴリから優先的に改善してください。',
          }
        : level === 'dysfunction'
          ? {
              title: '総合判定：機能不全の可能性が高い状態です',
              body: '組織の不公平感や意思決定の歪みが、成果・採用・定着に影響している可能性があります。評価・会議・責任範囲の再設計が必要です。',
            }
          : {
              title: '12問すべてに回答すると総合判定が表示されます',
              body: '回答途中でもカテゴリ別の傾向は確認できます。まずは直感で、組織の実情に近い選択肢を選んでください。',
            }

  return (
    <div className="mt-8 rounded-lg border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#07111d_62%,#162134_100%)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-[12px] font-black tracking-[0.16em] text-[#d7ad59]">
            <BarChart3 size={16} />
            TOTAL RESULT
          </div>
          <h3 className="mt-3 text-2xl font-black text-white">{copy.title}</h3>
          <p className="mt-3 max-w-[860px] text-[14px] font-bold leading-7 text-[#b7c5d8]">{copy.body}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#05070d]/70 p-4 text-center">
          <span className={`inline-flex rounded-full border px-3 py-1.5 text-[12px] font-black ${style.className}`}>
            {style.label}
          </span>
          <div className="mt-3 text-4xl font-black text-white">{score}</div>
          <div className="text-[12px] font-bold text-[#b7c5d8]">/ {maxTotalScore} pt</div>
          <div className="mt-2 text-[12px] font-black text-[#abc7ff]">{isComplete ? `毒性シグナル ${percent}%` : `${answeredCount}/${totalQuestionCount} 回答済み`}</div>
        </div>
      </div>
    </div>
  )
}
