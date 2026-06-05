'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BrainCircuit,
  CircleCheck,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react'

type DiagnosisCardItem = {
  title: string
  copy: string
  icon: LucideIcon
  colors: [string, string]
  figure: string
  href: string
  kind: 'sales' | 'boss' | 'member'
}

const diagnosisCards: DiagnosisCardItem[] = [
  {
    title: '営業タイプ診断',
    copy: 'あなたの強みと弱みをドラゴン判定',
    icon: BrainCircuit,
    colors: ['#173e69', '#081d33'],
    figure: '営業',
    href: '#diagnosis',
    kind: 'sales',
  },
  {
    title: '上司スタイル診断',
    copy: '上司としての癖を4タイプで観測',
    icon: ShieldAlert,
    colors: ['#0f6b69', '#082d35'],
    figure: '上司',
    href: '#boss-types',
    kind: 'boss',
  },
  {
    title: '部下スタイル診断',
    copy: '部下としての動き方を4タイプで観測',
    icon: BrainCircuit,
    colors: ['#4d3d72', '#1b1830'],
    figure: '部下',
    href: '#member-types',
    kind: 'member',
  },
]

const dragons = [
  {
    species: '炎竜',
    name: 'クロージャー',
    copy: '直感と熱量で突破する、新規を切り拓くタイプ。',
    type: '突破型',
    colors: ['#f07b3f', '#5d1d13'],
    rune: '炎',
    image: '/media/dragon-types/fire-closer-card.png',
    width: 407,
    height: 622,
    accent: '#d85b31',
    trait: '熱量・行動・突破・挑戦',
    strengths: ['初動が速く、商談の空気を動かせる', '未知の顧客や市場に飛び込める', '停滞した案件に勢いを生む'],
    risks: ['勢いで提案し、顧客の本音を拾い切れない', 'クロージングが早すぎて相手の温度感を置き去りにする', '社内調整や細部の詰めを軽く見やすい'],
    strategy: '熱量を武器にしつつ、商談前半では相手の不安・決裁構造・導入リスクを先に拾う。燃やす前に、相手が暖まりたいのかを観測する。',
    memo: '火力はある。だが商談はキャンプファイヤーではない。燃やす前に、相手が暖まりたいのか確認しろ。',
  },
  {
    species: '水竜',
    name: 'ヒアリング',
    copy: '共感と対話で信頼を築く、関係構築タイプ。',
    type: '信頼型',
    colors: ['#6bb9df', '#153e5f'],
    rune: '水',
    image: '/media/dragon-types/water-hearing-card.png',
    width: 392,
    height: 622,
    accent: '#2f8fc3',
    trait: '共感・信頼・対話・調和',
    strengths: ['相手の本音や不安を引き出せる', '長期的な信頼関係を作れる', '社内外の調整で摩擦を減らせる'],
    risks: ['嫌われたくなくて予算や決裁の話を避ける', '相手の「検討します」を信じすぎる', '決めるべき場面で踏み込みが弱くなる'],
    strategy: '共感を土台に、商談の終盤では次回日程・決裁者・導入条件を言語化する。優しさで先延ばしを包まない。',
    memo: '優しさは武器だ。ただし優しすぎると、相手の先延ばしまで丁寧に包んでしまう。',
  },
  {
    species: '雷竜',
    name: 'ドライバー',
    copy: '論理とデータで勝ち筋を描く、目標達成タイプ。',
    type: '達成型',
    colors: ['#9d78df', '#2f2059'],
    rune: '雷',
    image: '/media/dragon-types/thunder-driver-card.png',
    width: 392,
    height: 622,
    accent: '#6e54c7',
    trait: '論理・目標・競争・成果',
    strengths: ['数字へのコミットが強い', '商談を前に進める判断が速い', 'データから勝ち筋を設計できる'],
    risks: ['正論で詰めすぎて相手の感情を置き去りにする', '顧客の社内事情より進捗管理を優先する', '曖昧な不安を軽く扱って失注する'],
    strategy: 'データで納得感を作りながら、相手の不安・面子・社内政治も観測対象に入れる。感情列は非表示になっているだけ。',
    memo: '数字を見る目は鋭い。だが顧客はスプレッドシートではない。感情列が非表示になっているだけだ。',
  },
  {
    species: '岩竜',
    name: 'ガーディアン',
    copy: '計画と精密さで守り抜く、安定運用タイプ。',
    type: '守備型',
    colors: ['#6f7659', '#273327'],
    rune: '岩',
    image: '/media/dragon-types/rock-guardian-card.png',
    width: 407,
    height: 622,
    accent: '#526341',
    trait: '計画・安定・精密・守護',
    strengths: ['抜け漏れが少なく、商談管理が丁寧', '既存顧客や長期案件を安定して進められる', 'リスクや導入条件を現実的に整理できる'],
    risks: ['完璧に準備しようとして初動が遅れる', '変化やリスクを嫌い、チャンスを逃す', 'ルール外の顧客要望に弱くなる'],
    strategy: '守りの精度を活かしつつ、初回接触や仮説提案は早めに出す。完璧な地図を待つより、まず足跡を残す。',
    memo: '守りは強い。だが営業の現場では、城壁の外に顧客がいることもある。',
  },
]

const salesTypeQuestions = [
  { id: 1, text: '社交的だ', dragonIndex: 0 },
  { id: 2, text: '他人の気分は傷つけない', dragonIndex: 1 },
  { id: 3, text: 'データを重視する', dragonIndex: 2 },
  { id: 4, text: '几帳面だ', dragonIndex: 3 },
  { id: 5, text: '大きな視点から見る', dragonIndex: 0 },
  { id: 6, text: '他人に共感する', dragonIndex: 1 },
  { id: 7, text: '論理的に考える', dragonIndex: 2 },
  { id: 8, text: 'あまりしゃべらない', dragonIndex: 3 },
  { id: 9, text: '自発的に動く', dragonIndex: 0 },
  { id: 10, text: '伝統を重んじる', dragonIndex: 1 },
  { id: 11, text: '目標に突き進む', dragonIndex: 2 },
  { id: 12, text: 'ディテールを重視する', dragonIndex: 3 },
  { id: 13, text: 'リスクを取る', dragonIndex: 0 },
  { id: 14, text: '他人との和を重視する', dragonIndex: 1 },
  { id: 15, text: '競争するのが好き', dragonIndex: 2 },
  { id: 16, text: '実利的だ', dragonIndex: 3 },
  { id: 17, text: '変化に強い', dragonIndex: 0 },
  { id: 18, text: '内的モチベーションが高い', dragonIndex: 1 },
  { id: 19, text: 'いろいろと試す', dragonIndex: 2 },
  { id: 20, text: '計画性がある', dragonIndex: 3 },
  { id: 21, text: '想像力を駆使する', dragonIndex: 0 },
  { id: 22, text: '対立を嫌う', dragonIndex: 1 },
  { id: 23, text: '好奇心が強い', dragonIndex: 2 },
  { id: 24, text: '忠誠心が強い', dragonIndex: 3 },
]

type ProfileType = {
  category: string
  species: string
  name: string
  headline: string
  copy: string
  type: string
  colors: [string, string]
  rune: string
  image?: string
  width?: number
  height?: number
  accent: string
  trait: string
  strengths: string[]
  risks: string[]
  strategy: string
  memo: string
}

const bossTypes: ProfileType[] = [
  {
    category: '上司タイプ診断',
    species: '放任竜',
    name: 'フリーダム',
    headline: '上司タイプが「放任竜」',
    copy: '裁量と挑戦で現場を動かす、開拓型の上司。',
    type: '開拓型',
    colors: ['#1e7f83', '#0b3439'],
    rune: '放',
    image: '/media/boss-types/freedom-boss-card.png',
    width: 542,
    height: 596,
    accent: '#2fa5a4',
    trait: '挑戦・裁量・直感・突破',
    strengths: ['新しい挑戦を許可し、現場に活力を生む', '細かい管理で部下の初速を殺さない', '未開拓の市場や施策に踏み出せる'],
    risks: ['裁量が放置に変わり、新人が迷宮に入る', 'プロセスや振り返りが弱く、成功が再現されにくい', 'リスクの見積もりが甘くなりやすい'],
    strategy: '自由を渡す前に、成功条件・相談タイミング・撤退ラインを決める。挑戦は任せつつ、地図だけは渡す。',
    memo: '裁量は美しい。ただし地図なしで森に放つと、だいたい帰ってこない。',
  },
  {
    category: '上司タイプ診断',
    species: '伴走竜',
    name: 'コーチャー',
    headline: '上司タイプが「伴走竜」',
    copy: '調和と信頼でチームをまとめる、関係構築型の上司。',
    type: '調和型',
    colors: ['#6c7a42', '#26351f'],
    rune: '伴',
    image: '/media/boss-types/coach-boss-card.png',
    width: 542,
    height: 596,
    accent: '#81964a',
    trait: '共感・信頼・対話・調和',
    strengths: ['部下の本音や不安を引き出せる', '相談しやすい空気を作れる', 'チーム内の摩擦を減らし、協働を進められる'],
    risks: ['対立を避けすぎて基準が曖昧になる', '優しさが先行し、厳しいフィードバックが遅れる', '社内政治や感情の板挟みで消耗しやすい'],
    strategy: '共感を土台にしつつ、期待値・期限・責任範囲を明文化する。優しさで基準をぼかさない。',
    memo: '優しい上司は貴重だ。だが、優しさで全部包むと、課題まで寝かしつける。',
  },
  {
    category: '上司タイプ診断',
    species: '詰め竜',
    name: 'プレッシャー',
    headline: '上司タイプが「詰め竜」',
    copy: '目標とデータで現場を動かす、達成型の上司。',
    type: '達成型',
    colors: ['#b7442e', '#4b1612'],
    rune: '詰',
    image: '/media/boss-types/pressure-boss-card.png',
    width: 542,
    height: 588,
    accent: '#c85b3b',
    trait: '目標・論理・競争・結果',
    strengths: ['目標の基準を一気に引き上げる', '停滞した案件に緊張感を生む', 'データから勝ち筋と負け筋を判断できる'],
    risks: ['正論で詰めすぎて、部下が悪い情報を隠す', '感情的な不安や背景事情を軽く扱いやすい', '短期成果の圧で学習が止まりやすい'],
    strategy: '詰める前に、判断基準と期待値を言語化する。圧ではなく基準で動かすと、部下の報告精度が上がる。',
    memo: '圧は早い。だが、圧だけで育った部下は都合の悪い情報を地下に埋める。',
  },
  {
    category: '上司タイプ診断',
    species: '管理竜',
    name: 'キッチリ',
    headline: '上司タイプが「管理竜」',
    copy: '計画と精度で組織を守る、安定運用型の上司。',
    type: '守備型',
    colors: ['#7256a9', '#261c4b'],
    rune: '管',
    image: '/media/boss-types/manager-boss-card.png',
    width: 542,
    height: 588,
    accent: '#8a6ee0',
    trait: '計画・精密・安定・手順',
    strengths: ['抜け漏れを防ぎ、現場の品質を安定させる', '計画や手順を整え、再現性を作れる', 'リスクや導入条件を丁寧に管理できる'],
    risks: ['変化や例外対応に遅れ、チャンスを逃す', '細部の確認が増え、現場の初速を落とす', 'ルール重視で、挑戦する部下の熱量を削りやすい'],
    strategy: '守りの精度を活かしつつ、実験枠をあらかじめ作る。全部を管理するより、失敗していい範囲を決める。',
    memo: '管理は悪ではない。ただし管理表が増えすぎると、営業ではなく管理表の世話をする組織になる。',
  },
]

const memberTypes: ProfileType[] = [
  {
    category: '部下スタイル診断',
    species: '自走竜',
    name: 'ランナー',
    headline: '部下タイプが「自走竜」',
    copy: '仮説を持って自ら動く、開拓型の部下。',
    type: '開拓型',
    colors: ['#246d9a', '#0a2d4a'],
    rune: '走',
    image: '/media/member-types/runner-member-card.png',
    width: 542,
    height: 596,
    accent: '#3e9bd0',
    trait: '自走・挑戦・仮説・探索',
    strengths: ['指示待ちにならず、仮説を持って動ける', '曖昧な仕事や新しい挑戦に強い', '裁量を渡すほど成長速度が上がる'],
    risks: ['進捗共有が薄く、上司が不安になる', '独断で進めて組織の意図とズレる', '面白い方へ走り、優先順位が揺れやすい'],
    strategy: '細かく止めず、目的・相談タイミング・撤退ラインだけ握る。自由を削らず、進路だけ合わせる。',
    memo: '走れる部下は止めるな。ただし、どこへ向かって走っているかだけは定期観測せよ。',
  },
  {
    category: '部下スタイル診断',
    species: '調整竜',
    name: 'ハーモニー',
    headline: '部下タイプが「調整竜」',
    copy: '周囲を見ながらチームを滑らかにする、調和型の部下。',
    type: '調和型',
    colors: ['#3f8a84', '#123c3a'],
    rune: '調',
    image: '/media/member-types/harmony-member-card.png',
    width: 542,
    height: 596,
    accent: '#52aaa0',
    trait: '共感・調整・協調・対話',
    strengths: ['顧客やチームの空気を読み、摩擦を減らせる', '相手の不安や本音を拾いやすい', '関係者を巻き込み、場を前に進められる'],
    risks: ['対立を避けすぎて、主張が弱くなる', '周囲に合わせすぎて自分の判断が遅れる', '優しさで期限や基準をぼかしやすい'],
    strategy: '任せる時は「誰と調整するか」だけでなく「最後に何を決めるか」まで渡す。調和を成果に着地させる。',
    memo: '場を整える力は強い。だが、整えすぎると会議室だけが快適になり、案件は外で待っている。',
  },
  {
    category: '部下スタイル診断',
    species: '達成竜',
    name: 'アチーバー',
    headline: '部下タイプが「達成竜」',
    copy: '目標から逆算して成果を取りに行く、達成型の部下。',
    type: '達成型',
    colors: ['#b77a2e', '#4a2b0a'],
    rune: '達',
    image: '/media/member-types/achiever-member-card.png',
    width: 542,
    height: 588,
    accent: '#d99a42',
    trait: '目標・分析・実行・成果',
    strengths: ['目標へのコミットが強い', '数字やデータから改善点を見つけられる', '成果に直結する行動へ集中できる'],
    risks: ['成果を急ぎ、周囲への共有が雑になる', '正しさや効率を優先し、感情面を軽く見やすい', '勝ち筋が見える仕事以外への関心が薄くなる'],
    strategy: '目標を渡す時は、勝敗条件だけでなく顧客背景や周囲の事情も一緒に渡す。数字と文脈をセットにする。',
    memo: '成果に強い部下は頼もしい。だが、数字だけを追うと、顧客の表情がグラフの外に消える。',
  },
  {
    category: '部下スタイル診断',
    species: '堅実竜',
    name: 'ステディ',
    headline: '部下タイプが「堅実竜」',
    copy: '手順と正確さでチームを支える、守備型の部下。',
    type: '守備型',
    colors: ['#4f5d73', '#1b2636'],
    rune: '堅',
    image: '/media/member-types/steady-member-card.png',
    width: 542,
    height: 588,
    accent: '#5f718b',
    trait: '正確・計画・安定・手順',
    strengths: ['抜け漏れが少なく、業務品質が安定する', '手順やルールを守り、再現性を作れる', '長期案件や細かい調整を粘り強く進められる'],
    risks: ['変化や曖昧な指示に弱く、初動が遅れる', '完璧に準備しようとしてチャンスを逃す', '例外対応や急な方針変更で固まりやすい'],
    strategy: '依頼時は背景・優先順位・完成基準を明確にする。安定運転できる条件を整えると、強さが出る。',
    memo: '堅実さは地味に見える。だが営業組織の床を支えているのは、だいたいこういう足場だ。',
  },
]

const professorChecks = ['失注パターンの解剖', '営業現場の生態観察', '上司タイプの調査', '部下スタイルの収集']

export default function DragonGuide() {
  const [selectedDragon, setSelectedDragon] = useState<(typeof dragons)[number] | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null)
  const [isSalesDiagnosisOpen, setIsSalesDiagnosisOpen] = useState(false)
  const [isBossDiagnosisOpen, setIsBossDiagnosisOpen] = useState(false)
  const [isMemberDiagnosisOpen, setIsMemberDiagnosisOpen] = useState(false)
  const [checkedQuestionIds, setCheckedQuestionIds] = useState<number[]>([])
  const [checkedBossQuestionIds, setCheckedBossQuestionIds] = useState<number[]>([])
  const [checkedMemberQuestionIds, setCheckedMemberQuestionIds] = useState<number[]>([])
  const [isSalesDiagnosisSubmitted, setIsSalesDiagnosisSubmitted] = useState(false)
  const [isBossDiagnosisSubmitted, setIsBossDiagnosisSubmitted] = useState(false)
  const [isMemberDiagnosisSubmitted, setIsMemberDiagnosisSubmitted] = useState(false)

  useEffect(() => {
    if (!selectedDragon && !selectedProfile && !isSalesDiagnosisOpen && !isBossDiagnosisOpen && !isMemberDiagnosisOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedDragon(null)
        setSelectedProfile(null)
        setIsSalesDiagnosisOpen(false)
        setIsBossDiagnosisOpen(false)
        setIsMemberDiagnosisOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedDragon, selectedProfile, isSalesDiagnosisOpen, isBossDiagnosisOpen, isMemberDiagnosisOpen])

  const handleOpenSalesDiagnosis = () => {
    setSelectedDragon(null)
    setSelectedProfile(null)
    setIsBossDiagnosisOpen(false)
    setIsMemberDiagnosisOpen(false)
    setIsSalesDiagnosisOpen(true)
  }

  const handleOpenBossDiagnosis = () => {
    setSelectedDragon(null)
    setSelectedProfile(null)
    setIsSalesDiagnosisOpen(false)
    setIsMemberDiagnosisOpen(false)
    setIsBossDiagnosisOpen(true)
  }

  const handleOpenMemberDiagnosis = () => {
    setSelectedDragon(null)
    setSelectedProfile(null)
    setIsSalesDiagnosisOpen(false)
    setIsBossDiagnosisOpen(false)
    setIsMemberDiagnosisOpen(true)
  }

  const handleToggleQuestion = (questionId: number) => {
    setCheckedQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId].sort((a, b) => a - b)
    )
    setIsSalesDiagnosisSubmitted(false)
  }

  const handleResetSalesDiagnosis = () => {
    setCheckedQuestionIds([])
    setIsSalesDiagnosisSubmitted(false)
  }

  const handleToggleBossQuestion = (questionId: number) => {
    setCheckedBossQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId].sort((a, b) => a - b)
    )
    setIsBossDiagnosisSubmitted(false)
  }

  const handleResetBossDiagnosis = () => {
    setCheckedBossQuestionIds([])
    setIsBossDiagnosisSubmitted(false)
  }

  const handleToggleMemberQuestion = (questionId: number) => {
    setCheckedMemberQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId].sort((a, b) => a - b)
    )
    setIsMemberDiagnosisSubmitted(false)
  }

  const handleResetMemberDiagnosis = () => {
    setCheckedMemberQuestionIds([])
    setIsMemberDiagnosisSubmitted(false)
  }

  return (
    <main className="min-h-screen bg-[#071a28] text-[#07111a]">
      <header className="sticky top-[72px] z-40 px-3 py-3 backdrop-blur-md">
        <nav className="mx-auto flex min-h-[62px] max-w-[1500px] items-center justify-between gap-3 rounded-2xl border border-[#d7ad59]/20 bg-[#061727]/90 px-3 shadow-[0_18px_48px_-34px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:px-5">
          <Link href="/media" className="group flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d7ad59] text-2xl font-black text-[#07111a] shadow-[0_0_0_1px_rgba(255,255,255,0.18)_inset,0_10px_24px_-16px_rgba(215,173,89,0.9)] transition-transform group-hover:-rotate-3">
              竜
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-black leading-none text-[#f0c76b] sm:text-2xl">
                営業ドラゴン図鑑
              </span>
              <span className="mt-1 hidden text-[11px] font-bold text-[#f4e0b5] sm:block">
                営業組織の真理を、エンタメで解剖する
              </span>
            </span>
          </Link>
        </nav>
      </header>

      <div className="relative mx-auto max-w-[1500px] bg-[#f7f0e4] shadow-[0_0_0_1px_rgba(215,173,89,0.18)]">
        <aside className="absolute bottom-0 left-0 top-0 hidden w-[60px] bg-[#08243a] md:block">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(135deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="sticky top-[94px] mx-auto mt-9 flex h-[356px] w-10 flex-col items-center gap-3 rounded-lg border border-[#d7ad59]/45 bg-[#0b304d] px-2 py-4 text-[#f2cb77]">
            <span className="text-2xl font-black leading-none">竜</span>
            <span
              className="text-[12px] font-black leading-5"
              style={{ writingMode: 'vertical-rl' }}
            >
              今日もどこかで、ドラゴンが暴れている。
            </span>
          </div>
        </aside>

        <section className="relative overflow-hidden border-b border-[#061727]/10 pl-0 md:pl-[60px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_44%_22%,rgba(6,23,39,0.08),transparent_17%),radial-gradient(circle_at_62%_18%,rgba(215,173,89,0.16),transparent_18%),linear-gradient(90deg,rgba(6,23,39,0.04)_1px,transparent_1px),linear-gradient(rgba(6,23,39,0.035)_1px,transparent_1px)] bg-[length:auto,auto,42px_42px,42px_42px]" />
          <div className="absolute left-[35%] top-10 hidden text-[17rem] font-black leading-none text-[#07111a]/[0.035] lg:block">
            竜
          </div>

          <div className="relative grid min-h-[520px] gap-6 px-4 pb-0 pt-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:pt-9">
            <div className="relative z-10 flex flex-col justify-center pb-8 lg:pb-10">
              <div className="mb-7 inline-flex w-fit items-center gap-3 rounded-md border border-[#061727]/15 bg-white/80 px-4 py-2 text-[13px] font-black text-[#07111a] shadow-[0_14px_28px_-26px_rgba(6,23,39,0.8)]">
                <span className="h-1.5 w-9 rounded-full bg-[#d7ad59]" />
                現場のモヤモヤを、博士がエンタメに変換する。
              </div>

              <h1 className="font-display text-[3rem] font-black leading-[1.04] text-[#07111a] sm:text-[4.15rem] lg:text-[4.25rem] xl:text-[4.35rem] 2xl:text-[5.2rem]">
                <span className="sm:whitespace-nowrap">営業組織に潜む</span>
                <span className="block text-[#a27628] sm:whitespace-nowrap">ドラゴンを観測せよ</span>
              </h1>

              <p className="mt-5 max-w-[700px] text-base font-black leading-8 text-[#151f2c] sm:text-lg">
                はぐれ博士が、失注・上司・営業現場を図鑑化する営業エンタメメディア
              </p>

              <div className="mt-6 grid max-w-[620px] gap-3 sm:grid-cols-2">
                <a
                  href="#dragons"
                  className="group rounded-lg border-2 border-[#d7ad59] bg-[#061727] p-3 text-[#f2cb77] shadow-[0_18px_40px_-26px_rgba(6,23,39,0.8)] transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex h-9 items-center gap-3 text-base font-black">
                    <span className="text-2xl">竜</span>
                    営業ドラゴン図鑑を見る
                    <ArrowRight size={18} className="ml-auto transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-1 block pl-9 text-xs font-black leading-5 text-[#fff3d8]/75">
                    組織に潜む竜を観測
                  </span>
                </a>
                <Link
                  href="/media?view=psychology"
                  className="group rounded-lg border-2 border-[#d7ad59]/45 bg-[linear-gradient(135deg,#102b42_0%,#071927_58%,#2b2417_100%)] p-3 text-[#fff3d8] shadow-[0_18px_44px_-28px_rgba(6,23,39,0.9)] transition-transform hover:-translate-y-0.5 hover:border-[#f2cb77]/80"
                >
                  <span className="flex h-9 items-center gap-3 text-base font-black">
                    <Sparkles size={22} className="text-[#f2cb77]" />
                    営業武器庫を見る
                    <ArrowRight size={18} className="ml-auto transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-1 block pl-9 text-xs font-black leading-5 text-[#f7e2aa]/70">
                    商談で使う攻略カード
                  </span>
                </Link>
              </div>
            </div>

            <div id="professor" className="relative z-10 min-h-[500px] lg:min-h-[520px]">
              <div className="absolute bottom-0 left-[12%] right-[7%] top-9 rounded-lg border border-[#d7ad59]/30 bg-[#071a28] shadow-[0_24px_70px_-44px_rgba(6,23,39,0.9)]" />
              <div className="absolute bottom-0 left-[9%] right-[10%] top-7 overflow-hidden rounded-lg border border-[#061727]/15 bg-[#fbf7ec]">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,23,39,0.05)_1px,transparent_1px),linear-gradient(rgba(6,23,39,0.04)_1px,transparent_1px)] bg-[length:42px_42px]" />
                <Image
                  src="/characters/hagure-hakase.png"
                  alt="営業ドラゴン図鑑の解説者、はぐれ博士"
                  width={455}
                  height={855}
                  priority
                  className="absolute bottom-[-8px] left-[34%] h-[103%] w-auto max-w-none -translate-x-1/2 object-contain mix-blend-multiply"
                />
              </div>

              <div className="absolute right-0 top-[112px] w-[276px] rounded-lg border border-[#d7ad59]/40 bg-[#061727] p-5 text-[#fff3d8] shadow-[0_20px_50px_-32px_rgba(0,0,0,0.9)] max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:bottom-5 max-sm:w-auto">
                <div className="flex items-center gap-2 text-lg font-black text-[#f2cb77]">
                  <Sparkles size={20} />
                  はぐれ博士
                </div>
                <p className="mt-4 text-[13px] font-bold leading-7">
                  営業組織の片隅でドラゴンを観測する、はぐれ系研究者。
                </p>
                <div className="my-4 h-px bg-[#d7ad59]/35" />
                <ul className="space-y-2">
                  {professorChecks.map((check) => (
                    <li key={check} className="flex items-center gap-2 text-[13px] font-bold text-[#efe2c7]">
                      <CircleCheck size={15} className="text-[#d7ad59]" />
                      {check}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-lg border border-[#d7ad59]/35 bg-[#0d2233] p-4">
                  <div className="text-[11px] font-black text-[#d7ad59]">今日の観測メモ</div>
                  <p className="mt-2 text-[13px] font-black leading-6">
                    また「価格が高い」で片付けているな...。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="diagnosis" className="relative border-b border-[#061727]/10 bg-[#061727] px-4 py-4 sm:px-8 md:pl-[92px] lg:px-12 lg:pl-[92px]">
          <div className="mx-auto max-w-[1370px]">
            <div className="mb-3 flex items-center gap-3 text-sm font-black text-[#fff3d8]">
              <span>まずは自分を診断しよう</span>
              <span className="h-px w-14 bg-[#d7ad59]" />
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {diagnosisCards.map((card) => (
                <DiagnosisTile
                  key={card.title}
                  card={card}
                  onClick={card.kind === 'sales' ? handleOpenSalesDiagnosis : card.kind === 'boss' ? handleOpenBossDiagnosis : handleOpenMemberDiagnosis}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="dragons" className="relative bg-[#f7f0e4] px-4 py-4 sm:px-8 md:pl-[92px] lg:px-12 lg:pl-[92px]">
          <div className="mx-auto max-w-[1370px]">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle eyebrow="営業タイプ四竜" title="診断結果と連動する4つの営業スタイル" />
              <a href="#dragons" className="inline-flex items-center gap-2 text-sm font-black text-[#07111a]">
                すべてのドラゴンを見る
                <ArrowRight size={15} />
              </a>
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
              {dragons.map((dragon) => (
                <DragonTypeCard
                  key={dragon.name}
                  dragon={dragon}
                  onClick={() => setSelectedDragon(dragon)}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="boss-types" className="relative bg-[#f7f0e4] px-4 py-4 sm:px-8 md:pl-[92px] lg:px-12 lg:pl-[92px]">
          <div className="mx-auto max-w-[1370px]">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle eyebrow="上司タイプ診断" title="上司タイプが○○で見える、組織の勝ち筋と詰まり筋" />
              <span className="hidden text-sm font-black text-[#414b56] sm:inline">上司の癖を、責めずに観測する</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
              {bossTypes.map((profile) => (
                <ProfileTypeCard
                  key={profile.species}
                  profile={profile}
                  onClick={() => setSelectedProfile(profile)}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="member-types" className="relative bg-[#f7f0e4] px-4 pb-8 pt-4 sm:px-8 md:pl-[92px] lg:px-12 lg:pl-[92px]">
          <div className="mx-auto max-w-[1370px]">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle eyebrow="部下スタイル診断" title="部下タイプが○○で見える、任せ方と育て方" />
              <span className="hidden text-sm font-black text-[#414b56] sm:inline">部下の癖を、責めずに任せ方へ変える</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
              {memberTypes.map((profile) => (
                <ProfileTypeCard
                  key={profile.species}
                  profile={profile}
                  onClick={() => setSelectedProfile(profile)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {selectedDragon ? (
        <DragonModal dragon={selectedDragon} onClose={() => setSelectedDragon(null)} />
      ) : null}
      {selectedProfile ? (
        <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      ) : null}
      {isSalesDiagnosisOpen ? (
        <SalesTypeDiagnosisModal
          checkedQuestionIds={checkedQuestionIds}
          isSubmitted={isSalesDiagnosisSubmitted}
          onClose={() => setIsSalesDiagnosisOpen(false)}
          onSubmit={() => setIsSalesDiagnosisSubmitted(true)}
          onToggleQuestion={handleToggleQuestion}
          onReset={handleResetSalesDiagnosis}
          onOpenDragon={(dragon) => {
            setIsSalesDiagnosisOpen(false)
            setSelectedDragon(dragon)
          }}
        />
      ) : null}
      {isBossDiagnosisOpen ? (
        <BossTypeDiagnosisModal
          checkedQuestionIds={checkedBossQuestionIds}
          isSubmitted={isBossDiagnosisSubmitted}
          onClose={() => setIsBossDiagnosisOpen(false)}
          onSubmit={() => setIsBossDiagnosisSubmitted(true)}
          onToggleQuestion={handleToggleBossQuestion}
          onReset={handleResetBossDiagnosis}
          onOpenProfile={(profile) => {
            setIsBossDiagnosisOpen(false)
            setSelectedProfile(profile)
          }}
        />
      ) : null}
      {isMemberDiagnosisOpen ? (
        <MemberTypeDiagnosisModal
          checkedQuestionIds={checkedMemberQuestionIds}
          isSubmitted={isMemberDiagnosisSubmitted}
          onClose={() => setIsMemberDiagnosisOpen(false)}
          onSubmit={() => setIsMemberDiagnosisSubmitted(true)}
          onToggleQuestion={handleToggleMemberQuestion}
          onReset={handleResetMemberDiagnosis}
          onOpenProfile={(profile) => {
            setIsMemberDiagnosisOpen(false)
            setSelectedProfile(profile)
          }}
        />
      ) : null}
    </main>
  )
}

function SectionTitle({
  eyebrow,
  title,
  compact = false,
}: {
  eyebrow: string
  title: string
  compact?: boolean
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-3">
      <div className="text-xl font-black text-[#07111a]">› {eyebrow}</div>
      <div className={`hidden min-w-0 font-bold text-[#414b56] sm:block ${compact ? 'text-sm' : 'text-[13px]'}`}>
        {title}
      </div>
    </div>
  )
}

function DiagnosisTile({
  card,
  onClick,
}: {
  card: DiagnosisCardItem
  onClick?: () => void
}) {
  const Icon = card.icon
  const className =
    'group relative block min-h-[116px] w-full overflow-hidden rounded-lg border border-[#f7f0e4]/25 bg-[#061727] p-4 text-left shadow-[0_18px_42px_-34px_rgba(0,0,0,0.9)] transition-transform hover:-translate-y-0.5'
  const content = (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 32%, rgba(255,255,255,0.18), transparent 24%), linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})`,
        }}
      />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -bottom-8 -left-4 font-display text-[7rem] font-black leading-none text-white/10">
        {card.figure}
      </div>

      <div className="relative z-10 flex h-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-[#f7f0e4]/25 bg-[#061727]/65 text-[#f2cb77] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <Icon size={26} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl font-black leading-tight text-[#fff3d8]">{card.title}</h3>
            <p className="mt-1 text-[13px] font-bold leading-6 text-[#f7e8c6]">{card.copy}</p>
          </div>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f7f0e4] text-[#061727] transition-transform group-hover:translate-x-1">
          <ArrowRight size={20} />
        </span>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return (
    <a href={card.href} className={className}>
      {content}
    </a>
  )
}

function DragonTypeCard({
  dragon,
  onClick,
}: {
  dragon: (typeof dragons)[number]
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block overflow-hidden rounded-lg border border-[#061727]/35 bg-[#061727] text-left shadow-[0_14px_32px_-30px_rgba(6,23,39,0.85)] transition-transform hover:-translate-y-0.5"
      style={{ aspectRatio: '407 / 285' }}
      aria-label={`${dragon.species} ${dragon.name}の詳細を見る`}
    >
      <Image
        src={dragon.image}
        alt={`${dragon.species} ${dragon.name}カード`}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]"
      />
      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#061727]/88 px-3 py-1.5 text-[11px] font-black text-[#f2cb77] shadow-[0_10px_20px_-14px_rgba(0,0,0,0.9)]">
        詳細
        <ArrowRight size={13} />
      </span>
    </button>
  )
}

function DragonModal({
  dragon,
  onClose,
}: {
  dragon: (typeof dragons)[number]
  onClose: () => void
}) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/78 px-4 py-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dragon-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] overflow-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/35 bg-[#061727] text-[#f2cb77] transition-transform hover:scale-105"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <div className="bg-[#061727] p-2 sm:p-3">
          <Image
            src={dragon.image}
            alt={`${dragon.species} ${dragon.name}カード`}
            width={dragon.width}
            height={dragon.height}
            priority
            className="mx-auto h-auto max-h-[86vh] w-auto max-w-full rounded-md"
          />
          <h2 id="dragon-modal-title" className="sr-only">
            {dragon.species} {dragon.name}
          </h2>
        </div>
      </div>
    </div>,
    document.body
  )
}

function SalesTypeDiagnosisModal({
  checkedQuestionIds,
  isSubmitted,
  onClose,
  onSubmit,
  onToggleQuestion,
  onReset,
  onOpenDragon,
}: {
  checkedQuestionIds: number[]
  isSubmitted: boolean
  onClose: () => void
  onSubmit: () => void
  onToggleQuestion: (questionId: number) => void
  onReset: () => void
  onOpenDragon: (dragon: (typeof dragons)[number]) => void
}) {
  const scrollBodyRef = useRef<HTMLDivElement>(null)
  const checkedQuestionSet = useMemo(() => new Set(checkedQuestionIds), [checkedQuestionIds])
  const scores = useMemo(() => {
    return dragons.map((dragon, dragonIndex) => ({
      dragon,
      score: salesTypeQuestions.filter((question) => question.dragonIndex === dragonIndex && checkedQuestionSet.has(question.id)).length,
    }))
  }, [checkedQuestionSet])
  const maxScore = Math.max(...scores.map((score) => score.score))
  const topScores = scores.filter((score) => score.score === maxScore && score.score > 0)
  const primaryScore = topScores[0]
  const isUnobservable = isSubmitted && maxScore === 0

  useEffect(() => {
    if (!isSubmitted) return
    const scrollBody = scrollBodyRef.current
    scrollBody?.scrollTo({ top: scrollBody.scrollHeight, behavior: 'smooth' })
  }, [isSubmitted])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/78 px-4 py-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sales-diagnosis-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/35 bg-[#061727] text-[#f2cb77] transition-transform hover:scale-105"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <div ref={scrollBodyRef} className="relative overflow-y-auto bg-[#f7f0e4] text-[#07111a]">
          <div className="sticky top-0 z-10 border-b border-[#d7ad59]/35 bg-[#061727] px-5 py-5 text-[#fff3d8] sm:px-7">
            <div className="flex flex-wrap items-center gap-2 pr-12">
              <span className="rounded-full bg-[#d7ad59] px-3 py-1 text-[12px] font-black text-[#07111a]">
                はぐれ博士の観測テスト
              </span>
              <span className="text-[12px] font-black text-[#f2cb77]">{checkedQuestionIds.length} / 24 チェック中</span>
            </div>
            <h2 id="sales-diagnosis-title" className="mt-3 font-display text-3xl font-black leading-tight sm:text-5xl">
              営業タイプ診断
            </h2>
            <p className="mt-2 max-w-[760px] text-sm font-bold leading-7 text-[#f7e8c6]">
              仕事中の自分に近いものをチェックしてください。直感で大丈夫です。
            </p>
          </div>

          <div className="flex flex-col px-5 py-5 sm:px-7">
            {isUnobservable ? (
              <div className="order-last mt-5 rounded-lg border border-[#d85b31]/35 bg-[#fff4ed] p-4 text-[#5d1d13]">
                <div className="font-display text-2xl font-black">まだ観測不能</div>
                <p className="mt-2 text-sm font-bold leading-7">
                  1つ以上チェックすると、はぐれ博士が営業タイプを観測できます。
                </p>
              </div>
            ) : null}

            {isSubmitted && primaryScore ? (
              <div className="order-last mt-5 overflow-hidden rounded-lg border border-[#061727]/20 bg-white/80 shadow-[0_18px_40px_-34px_rgba(6,23,39,0.8)]">
                <div
                  className="px-5 py-5 text-white sm:px-6"
                  style={{
                    background: `linear-gradient(135deg, ${primaryScore.dragon.colors[0]}, ${primaryScore.dragon.colors[1]})`,
                  }}
                >
                  <div className="text-[12px] font-black text-white/75">
                    {topScores.length > 1 ? '複合タイプ' : 'あなたの主タイプ'}
                  </div>
                  <div className="mt-2 font-display text-4xl font-black leading-tight sm:text-5xl">
                    {topScores.length > 1
                      ? topScores.map((score) => `${score.dragon.species}${score.dragon.name}`).join(' × ')
                      : `${primaryScore.dragon.species} ${primaryScore.dragon.name}`}
                  </div>
                  <p className="mt-3 max-w-[700px] text-sm font-bold leading-7 text-white/90">
                    {topScores.length > 1
                      ? '複数の営業スタイルが同じ強さで出ています。状況によって顔が変わるタイプです。'
                      : primaryScore.dragon.copy}
                  </p>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <div className="text-[12px] font-black text-[#a27628]">4タイプスコア</div>
                    <div className="mt-3 space-y-3">
                      {scores.map((score) => (
                        <div key={score.dragon.name}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-[12px] font-black text-[#273240]">
                            <span>{score.dragon.species} {score.dragon.name}</span>
                            <span>{score.score} / 6</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-[#061727]/12">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(score.score / 6) * 100}%`,
                                backgroundColor: score.dragon.accent,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-lg border border-[#061727]/18 bg-[#f7f0e4] p-4">
                      <div className="text-[12px] font-black" style={{ color: primaryScore.dragon.accent }}>
                        強み
                      </div>
                      <ul className="mt-3 space-y-2">
                        {primaryScore.dragon.strengths.slice(0, 3).map((strength) => (
                          <li key={strength} className="flex gap-2 text-[13px] font-bold leading-6 text-[#273240]">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primaryScore.dragon.accent }} />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#061727]/18 bg-[#f7f0e4] p-4">
                      <div className="text-[12px] font-black" style={{ color: primaryScore.dragon.accent }}>
                        失注しやすい癖
                      </div>
                      <ul className="mt-3 space-y-2">
                        {primaryScore.dragon.risks.slice(0, 3).map((risk) => (
                          <li key={risk} className="flex gap-2 text-[13px] font-bold leading-6 text-[#273240]">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primaryScore.dragon.accent }} />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#061727]/12 bg-[#061727] p-5 text-[#fff3d8]">
                  <div className="text-[12px] font-black text-[#f2cb77]">はぐれ博士の観測メモ</div>
                  <p className="mt-2 text-sm font-bold leading-7">{primaryScore.dragon.memo}</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpenDragon(primaryScore.dragon)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d7ad59] px-4 text-sm font-black text-[#07111a] transition-transform hover:-translate-y-0.5"
                    >
                      主タイプの図鑑カードを見る
                      <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={onReset}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-[#d7ad59]/35 px-4 text-sm font-black text-[#f2cb77] transition-colors hover:bg-[#d7ad59]/10"
                    >
                      もう一度診断する
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {salesTypeQuestions.map((question) => {
                const dragon = dragons[question.dragonIndex]!
                const checked = checkedQuestionSet.has(question.id)

                return (
                  <button
                    key={question.id}
                    type="button"
                    aria-label={`質問${question.id}: ${question.text}`}
                    aria-pressed={checked}
                    onClick={() => onToggleQuestion(question.id)}
                    className={`group flex min-h-[68px] items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      checked
                        ? 'border-[#d7ad59] bg-[#061727] text-[#fff3d8] shadow-[0_14px_30px_-24px_rgba(6,23,39,0.85)]'
                        : 'border-[#061727]/16 bg-white/70 text-[#273240] hover:border-[#d7ad59]/55 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-black ${
                        checked ? 'bg-[#d7ad59] text-[#07111a]' : 'bg-[#061727]/10 text-[#061727]'
                      }`}
                    >
                      {question.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-black leading-6">{question.text}</span>
                      <span className={`mt-1 block text-[11px] font-black ${checked ? 'text-[#f2cb77]' : 'text-[#66717d]'}`}>
                        {dragon.species} {dragon.name}
                      </span>
                    </span>
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                        checked ? 'border-[#d7ad59] bg-[#d7ad59] text-[#07111a]' : 'border-[#061727]/24 bg-white/60 text-transparent'
                      }`}
                    >
                      <CircleCheck size={16} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[#d7ad59]/25 bg-[#061727]/96 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] font-bold leading-6 text-[#f7e8c6]">
            チェック数: <span className="font-black text-[#f2cb77]">{checkedQuestionIds.length}</span> / 24
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#d7ad59]/35 px-4 text-sm font-black text-[#f2cb77] transition-colors hover:bg-[#d7ad59]/10"
            >
              リセット
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d7ad59] px-5 text-sm font-black text-[#07111a] transition-transform hover:-translate-y-0.5"
            >
              診断する
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function BossTypeDiagnosisModal({
  checkedQuestionIds,
  isSubmitted,
  onClose,
  onSubmit,
  onToggleQuestion,
  onReset,
  onOpenProfile,
}: {
  checkedQuestionIds: number[]
  isSubmitted: boolean
  onClose: () => void
  onSubmit: () => void
  onToggleQuestion: (questionId: number) => void
  onReset: () => void
  onOpenProfile: (profile: ProfileType) => void
}) {
  const scrollBodyRef = useRef<HTMLDivElement>(null)
  const checkedQuestionSet = useMemo(() => new Set(checkedQuestionIds), [checkedQuestionIds])
  const scores = useMemo(() => {
    return bossTypes.map((profile, profileIndex) => ({
      profile,
      score: salesTypeQuestions.filter((question) => question.dragonIndex === profileIndex && checkedQuestionSet.has(question.id)).length,
    }))
  }, [checkedQuestionSet])
  const maxScore = Math.max(...scores.map((score) => score.score))
  const topScores = scores.filter((score) => score.score === maxScore && score.score > 0)
  const primaryScore = topScores[0]
  const isUnobservable = isSubmitted && maxScore === 0

  useEffect(() => {
    if (!isSubmitted) return
    const scrollBody = scrollBodyRef.current
    scrollBody?.scrollTo({ top: scrollBody.scrollHeight, behavior: 'smooth' })
  }, [isSubmitted])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/78 px-4 py-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="boss-diagnosis-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/35 bg-[#061727] text-[#f2cb77] transition-transform hover:scale-105"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <div ref={scrollBodyRef} className="relative overflow-y-auto bg-[#f7f0e4] text-[#07111a]">
          <div className="sticky top-0 z-10 border-b border-[#d7ad59]/35 bg-[#061727] px-5 py-5 text-[#fff3d8] sm:px-7">
            <div className="flex flex-wrap items-center gap-2 pr-12">
              <span className="rounded-full bg-[#d7ad59] px-3 py-1 text-[12px] font-black text-[#07111a]">
                はぐれ博士の上司観測
              </span>
              <span className="text-[12px] font-black text-[#f2cb77]">{checkedQuestionIds.length} / 24 チェック中</span>
            </div>
            <h2 id="boss-diagnosis-title" className="mt-3 font-display text-3xl font-black leading-tight sm:text-5xl">
              上司スタイル診断
            </h2>
            <p className="mt-2 max-w-[760px] text-sm font-bold leading-7 text-[#f7e8c6]">
              上司として仕事をしている時の自分に近いものをチェックしてください。直感で大丈夫です。
            </p>
          </div>

          <div className="flex flex-col px-5 py-5 sm:px-7">
            {isUnobservable ? (
              <div className="order-last mt-5 rounded-lg border border-[#d85b31]/35 bg-[#fff4ed] p-4 text-[#5d1d13]">
                <div className="font-display text-2xl font-black">まだ観測不能</div>
                <p className="mt-2 text-sm font-bold leading-7">
                  1つ以上チェックすると、はぐれ博士が上司タイプを観測できます。
                </p>
              </div>
            ) : null}

            {isSubmitted && primaryScore ? (
              <div className="order-last mt-5 overflow-hidden rounded-lg border border-[#061727]/20 bg-white/80 shadow-[0_18px_40px_-34px_rgba(6,23,39,0.8)]">
                <div
                  className="px-5 py-5 text-white sm:px-6"
                  style={{
                    background: `linear-gradient(135deg, ${primaryScore.profile.colors[0]}, ${primaryScore.profile.colors[1]})`,
                  }}
                >
                  <div className="text-[12px] font-black text-white/75">
                    {topScores.length > 1 ? '複合上司タイプ' : 'あなたの上司タイプ'}
                  </div>
                  <div className="mt-2 font-display text-4xl font-black leading-tight sm:text-5xl">
                    {topScores.length > 1
                      ? topScores.map((score) => score.profile.species).join(' × ')
                      : `${primaryScore.profile.species} ${primaryScore.profile.name}`}
                  </div>
                  <p className="mt-3 max-w-[700px] text-sm font-bold leading-7 text-white/90">
                    {topScores.length > 1
                      ? '複数の上司スタイルが同じ強さで出ています。場面によって管理・支援・圧・裁量の出方が変わるタイプです。'
                      : primaryScore.profile.copy}
                  </p>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <div className="text-[12px] font-black text-[#a27628]">4タイプスコア</div>
                    <div className="mt-3 space-y-3">
                      {scores.map((score) => (
                        <div key={score.profile.species}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-[12px] font-black text-[#273240]">
                            <span>{score.profile.species} {score.profile.name}</span>
                            <span>{score.score} / 6</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-[#061727]/12">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(score.score / 6) * 100}%`,
                                backgroundColor: score.profile.accent,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-lg border border-[#061727]/18 bg-[#f7f0e4] p-4">
                      <div className="text-[12px] font-black" style={{ color: primaryScore.profile.accent }}>
                        強み
                      </div>
                      <ul className="mt-3 space-y-2">
                        {primaryScore.profile.strengths.slice(0, 3).map((strength) => (
                          <li key={strength} className="flex gap-2 text-[13px] font-bold leading-6 text-[#273240]">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primaryScore.profile.accent }} />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#061727]/18 bg-[#f7f0e4] p-4">
                      <div className="text-[12px] font-black" style={{ color: primaryScore.profile.accent }}>
                        やりがちな罠
                      </div>
                      <ul className="mt-3 space-y-2">
                        {primaryScore.profile.risks.slice(0, 3).map((risk) => (
                          <li key={risk} className="flex gap-2 text-[13px] font-bold leading-6 text-[#273240]">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primaryScore.profile.accent }} />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#061727]/12 bg-[#061727] p-5 text-[#fff3d8]">
                  <div className="text-[12px] font-black text-[#f2cb77]">はぐれ博士の観測メモ</div>
                  <p className="mt-2 text-sm font-bold leading-7">{primaryScore.profile.memo}</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpenProfile(primaryScore.profile)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d7ad59] px-4 text-sm font-black text-[#07111a] transition-transform hover:-translate-y-0.5"
                    >
                      上司タイプの詳細を見る
                      <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={onReset}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-[#d7ad59]/35 px-4 text-sm font-black text-[#f2cb77] transition-colors hover:bg-[#d7ad59]/10"
                    >
                      もう一度診断する
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {salesTypeQuestions.map((question) => {
                const profile = bossTypes[question.dragonIndex]!
                const checked = checkedQuestionSet.has(question.id)

                return (
                  <button
                    key={question.id}
                    type="button"
                    aria-label={`上司診断 質問${question.id}: ${question.text}`}
                    aria-pressed={checked}
                    onClick={() => onToggleQuestion(question.id)}
                    className={`group flex min-h-[68px] items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      checked
                        ? 'border-[#d7ad59] bg-[#061727] text-[#fff3d8] shadow-[0_14px_30px_-24px_rgba(6,23,39,0.85)]'
                        : 'border-[#061727]/16 bg-white/70 text-[#273240] hover:border-[#d7ad59]/55 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-black ${
                        checked ? 'bg-[#d7ad59] text-[#07111a]' : 'bg-[#061727]/10 text-[#061727]'
                      }`}
                    >
                      {question.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-black leading-6">{question.text}</span>
                      <span className={`mt-1 block text-[11px] font-black ${checked ? 'text-[#f2cb77]' : 'text-[#66717d]'}`}>
                        {profile.species} {profile.name}
                      </span>
                    </span>
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                        checked ? 'border-[#d7ad59] bg-[#d7ad59] text-[#07111a]' : 'border-[#061727]/24 bg-white/60 text-transparent'
                      }`}
                    >
                      <CircleCheck size={16} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[#d7ad59]/25 bg-[#061727]/96 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] font-bold leading-6 text-[#f7e8c6]">
            チェック数: <span className="font-black text-[#f2cb77]">{checkedQuestionIds.length}</span> / 24
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#d7ad59]/35 px-4 text-sm font-black text-[#f2cb77] transition-colors hover:bg-[#d7ad59]/10"
            >
              リセット
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d7ad59] px-5 text-sm font-black text-[#07111a] transition-transform hover:-translate-y-0.5"
            >
              診断する
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function MemberTypeDiagnosisModal({
  checkedQuestionIds,
  isSubmitted,
  onClose,
  onSubmit,
  onToggleQuestion,
  onReset,
  onOpenProfile,
}: {
  checkedQuestionIds: number[]
  isSubmitted: boolean
  onClose: () => void
  onSubmit: () => void
  onToggleQuestion: (questionId: number) => void
  onReset: () => void
  onOpenProfile: (profile: ProfileType) => void
}) {
  const scrollBodyRef = useRef<HTMLDivElement>(null)
  const checkedQuestionSet = useMemo(() => new Set(checkedQuestionIds), [checkedQuestionIds])
  const scores = useMemo(() => {
    return memberTypes.map((profile, profileIndex) => ({
      profile,
      score: salesTypeQuestions.filter((question) => question.dragonIndex === profileIndex && checkedQuestionSet.has(question.id)).length,
    }))
  }, [checkedQuestionSet])
  const maxScore = Math.max(...scores.map((score) => score.score))
  const topScores = scores.filter((score) => score.score === maxScore && score.score > 0)
  const primaryScore = topScores[0]
  const isUnobservable = isSubmitted && maxScore === 0

  useEffect(() => {
    if (!isSubmitted) return
    const scrollBody = scrollBodyRef.current
    scrollBody?.scrollTo({ top: scrollBody.scrollHeight, behavior: 'smooth' })
  }, [isSubmitted])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/78 px-4 py-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-diagnosis-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/35 bg-[#061727] text-[#f2cb77] transition-transform hover:scale-105"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <div ref={scrollBodyRef} className="relative overflow-y-auto bg-[#f7f0e4] text-[#07111a]">
          <div className="sticky top-0 z-10 border-b border-[#d7ad59]/35 bg-[#061727] px-5 py-5 text-[#fff3d8] sm:px-7">
            <div className="flex flex-wrap items-center gap-2 pr-12">
              <span className="rounded-full bg-[#d7ad59] px-3 py-1 text-[12px] font-black text-[#07111a]">
                はぐれ博士の部下観測
              </span>
              <span className="text-[12px] font-black text-[#f2cb77]">{checkedQuestionIds.length} / 24 チェック中</span>
            </div>
            <h2 id="member-diagnosis-title" className="mt-3 font-display text-3xl font-black leading-tight sm:text-5xl">
              部下スタイル診断
            </h2>
            <p className="mt-2 max-w-[760px] text-sm font-bold leading-7 text-[#f7e8c6]">
              仕事中の自分に近いものをチェックしてください。部下としての動き方や、上司との関わり方を観測します。
            </p>
          </div>

          <div className="flex flex-col px-5 py-5 sm:px-7">
            {isUnobservable ? (
              <div className="order-last mt-5 rounded-lg border border-[#d85b31]/35 bg-[#fff4ed] p-4 text-[#5d1d13]">
                <div className="font-display text-2xl font-black">まだ観測不能</div>
                <p className="mt-2 text-sm font-bold leading-7">
                  1つ以上チェックすると、はぐれ博士が部下タイプを観測できます。
                </p>
              </div>
            ) : null}

            {isSubmitted && primaryScore ? (
              <div className="order-last mt-5 overflow-hidden rounded-lg border border-[#061727]/20 bg-white/80 shadow-[0_18px_40px_-34px_rgba(6,23,39,0.8)]">
                <div
                  className="px-5 py-5 text-white sm:px-6"
                  style={{
                    background: `linear-gradient(135deg, ${primaryScore.profile.colors[0]}, ${primaryScore.profile.colors[1]})`,
                  }}
                >
                  <div className="text-[12px] font-black text-white/75">
                    {topScores.length > 1 ? '複合部下タイプ' : 'あなたの部下タイプ'}
                  </div>
                  <div className="mt-2 font-display text-4xl font-black leading-tight sm:text-5xl">
                    {topScores.length > 1
                      ? topScores.map((score) => score.profile.species).join(' × ')
                      : `${primaryScore.profile.species} ${primaryScore.profile.name}`}
                  </div>
                  <p className="mt-3 max-w-[700px] text-sm font-bold leading-7 text-white/90">
                    {topScores.length > 1
                      ? '複数の部下スタイルが同じ強さで出ています。仕事の場面によって、動き方や上司への求め方が変わるタイプです。'
                      : primaryScore.profile.copy}
                  </p>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <div className="text-[12px] font-black text-[#a27628]">4タイプスコア</div>
                    <div className="mt-3 space-y-3">
                      {scores.map((score) => (
                        <div key={score.profile.species}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-[12px] font-black text-[#273240]">
                            <span>{score.profile.species} {score.profile.name}</span>
                            <span>{score.score} / 6</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-[#061727]/12">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(score.score / 6) * 100}%`,
                                backgroundColor: score.profile.accent,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-lg border border-[#061727]/18 bg-[#f7f0e4] p-4">
                      <div className="text-[12px] font-black" style={{ color: primaryScore.profile.accent }}>
                        強み
                      </div>
                      <ul className="mt-3 space-y-2">
                        {primaryScore.profile.strengths.slice(0, 3).map((strength) => (
                          <li key={strength} className="flex gap-2 text-[13px] font-bold leading-6 text-[#273240]">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primaryScore.profile.accent }} />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#061727]/18 bg-[#f7f0e4] p-4">
                      <div className="text-[12px] font-black" style={{ color: primaryScore.profile.accent }}>
                        詰まりやすい癖
                      </div>
                      <ul className="mt-3 space-y-2">
                        {primaryScore.profile.risks.slice(0, 3).map((risk) => (
                          <li key={risk} className="flex gap-2 text-[13px] font-bold leading-6 text-[#273240]">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primaryScore.profile.accent }} />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#061727]/12 bg-[#061727] p-5 text-[#fff3d8]">
                  <div className="text-[12px] font-black text-[#f2cb77]">はぐれ博士の観測メモ</div>
                  <p className="mt-2 text-sm font-bold leading-7">{primaryScore.profile.memo}</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpenProfile(primaryScore.profile)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d7ad59] px-4 text-sm font-black text-[#07111a] transition-transform hover:-translate-y-0.5"
                    >
                      部下タイプの詳細を見る
                      <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={onReset}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-[#d7ad59]/35 px-4 text-sm font-black text-[#f2cb77] transition-colors hover:bg-[#d7ad59]/10"
                    >
                      もう一度診断する
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {salesTypeQuestions.map((question) => {
                const profile = memberTypes[question.dragonIndex]!
                const checked = checkedQuestionSet.has(question.id)

                return (
                  <button
                    key={question.id}
                    type="button"
                    aria-label={`部下診断 質問${question.id}: ${question.text}`}
                    aria-pressed={checked}
                    onClick={() => onToggleQuestion(question.id)}
                    className={`group flex min-h-[68px] items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      checked
                        ? 'border-[#d7ad59] bg-[#061727] text-[#fff3d8] shadow-[0_14px_30px_-24px_rgba(6,23,39,0.85)]'
                        : 'border-[#061727]/16 bg-white/70 text-[#273240] hover:border-[#d7ad59]/55 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-black ${
                        checked ? 'bg-[#d7ad59] text-[#07111a]' : 'bg-[#061727]/10 text-[#061727]'
                      }`}
                    >
                      {question.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-black leading-6">{question.text}</span>
                      <span className={`mt-1 block text-[11px] font-black ${checked ? 'text-[#f2cb77]' : 'text-[#66717d]'}`}>
                        {profile.species} {profile.name}
                      </span>
                    </span>
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                        checked ? 'border-[#d7ad59] bg-[#d7ad59] text-[#07111a]' : 'border-[#061727]/24 bg-white/60 text-transparent'
                      }`}
                    >
                      <CircleCheck size={16} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[#d7ad59]/25 bg-[#061727]/96 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] font-bold leading-6 text-[#f7e8c6]">
            チェック数: <span className="font-black text-[#f2cb77]">{checkedQuestionIds.length}</span> / 24
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#d7ad59]/35 px-4 text-sm font-black text-[#f2cb77] transition-colors hover:bg-[#d7ad59]/10"
            >
              リセット
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d7ad59] px-5 text-sm font-black text-[#07111a] transition-transform hover:-translate-y-0.5"
            >
              診断する
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function ProfileTypeCard({
  profile,
  onClick,
}: {
  profile: ProfileType
  onClick: () => void
}) {
  if (profile.image) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative block overflow-hidden rounded-lg border border-[#061727]/35 bg-[#061727] text-left shadow-[0_14px_32px_-30px_rgba(6,23,39,0.85)] transition-transform hover:-translate-y-0.5"
        style={{ aspectRatio: '407 / 285' }}
        aria-label={`${profile.headline}の詳細を見る`}
      >
        <Image
          src={profile.image}
          alt={`${profile.species} ${profile.name}カード`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]"
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#061727]/88 px-3 py-1.5 text-[11px] font-black text-[#f2cb77] shadow-[0_10px_20px_-14px_rgba(0,0,0,0.9)]">
          詳細
          <ArrowRight size={13} />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[234px] overflow-hidden rounded-lg border border-[#061727]/35 bg-[#061727] p-4 text-left shadow-[0_14px_32px_-30px_rgba(6,23,39,0.85)] transition-transform hover:-translate-y-0.5"
      aria-label={`${profile.headline}の詳細を見る`}
    >
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background: `radial-gradient(circle at 18% 18%, ${profile.accent}58, transparent 34%), linear-gradient(135deg, ${profile.colors[0]}, ${profile.colors[1]})`,
        }}
      />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute -bottom-10 -right-5 font-display text-[9rem] font-black leading-none text-white/10">
        {profile.rune}
      </div>

      <div className="relative z-10 flex min-h-[202px] flex-col rounded-md border border-[#f7f0e4]/42 bg-[#f7f0e4]/92 p-4 text-[#07111a] shadow-[inset_0_0_0_1px_rgba(6,23,39,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-black text-white shadow-[0_10px_20px_-16px_rgba(0,0,0,0.8)]"
            style={{ backgroundColor: profile.accent }}
          >
            {profile.headline}
          </span>
          <span className="shrink-0 rounded-full border border-[#061727]/20 bg-white/65 px-2.5 py-1 text-[11px] font-black text-[#061727]">
            {profile.type}
          </span>
        </div>

        <div className="mt-5">
          <div className="font-display text-4xl font-black leading-none" style={{ color: profile.accent }}>
            {profile.species}
          </div>
          <div className="mt-2 text-2xl font-black leading-none text-[#07111a]">{profile.name}</div>
          <p className="mt-4 max-w-[22rem] text-[13px] font-bold leading-6 text-[#273240]">{profile.copy}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="truncate text-[12px] font-black text-[#414b56]">{profile.trait}</span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#061727] px-3 py-1.5 text-[11px] font-black text-[#f2cb77]">
            詳細
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </button>
  )
}

function ProfileModal({
  profile,
  onClose,
}: {
  profile: ProfileType
  onClose: () => void
}) {
  if (typeof document === 'undefined') return null
  const imageWidth = profile.width ?? 542
  const imageHeight = profile.height ?? 596

  if (profile.image) {
    return createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/78 px-4 py-5 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[620px] overflow-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95)]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/35 bg-[#061727] text-[#f2cb77] transition-transform hover:scale-105"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>

          <div className="bg-[#061727] p-2 sm:p-3">
            <Image
              src={profile.image}
              alt={`${profile.species} ${profile.name}カード`}
              width={imageWidth}
              height={imageHeight}
              priority
              className="mx-auto h-auto max-h-[86vh] w-auto max-w-full rounded-md"
            />
            <h2 id="profile-modal-title" className="sr-only">
              {profile.headline}
            </h2>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/78 px-4 py-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[720px] overflow-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] p-3 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/35 bg-[#061727] text-[#f2cb77] transition-transform hover:scale-105"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <div className="relative overflow-hidden rounded-md bg-[#f7f0e4] p-5 text-[#07111a] sm:p-7">
          <div
            className="absolute inset-x-0 top-0 h-28"
            style={{
              background: `linear-gradient(135deg, ${profile.colors[0]}, ${profile.colors[1]})`,
            }}
          />
          <div className="absolute right-4 top-2 font-display text-[9rem] font-black leading-none text-white/10">
            {profile.rune}
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 pr-12">
              <span className="rounded-full bg-[#061727] px-3 py-1 text-[12px] font-black text-[#f2cb77]">
                {profile.category}
              </span>
              <span
                className="rounded-full px-3 py-1 text-[12px] font-black text-white"
                style={{ backgroundColor: profile.accent }}
              >
                {profile.type}
              </span>
            </div>

            <h2 id="profile-modal-title" className="mt-12 font-display text-4xl font-black leading-tight text-[#07111a] sm:text-5xl">
              {profile.headline}
            </h2>
            <p className="mt-3 max-w-[560px] text-base font-black leading-8 text-[#273240]">{profile.copy}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ProfileList title="強み" items={profile.strengths} accent={profile.accent} />
              <ProfileList title="出やすい癖" items={profile.risks} accent={profile.accent} />
              <div className="rounded-lg border border-[#061727]/18 bg-white/76 p-4">
                <div className="text-[12px] font-black" style={{ color: profile.accent }}>
                  相性の良い戦い方
                </div>
                <p className="mt-3 text-[13px] font-bold leading-7 text-[#273240]">{profile.strategy}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#061727]/20 bg-[#061727] p-4 text-[#fff3d8]">
              <div className="text-[12px] font-black text-[#f2cb77]">はぐれ博士の観測メモ</div>
              <p className="mt-2 text-sm font-bold leading-7">{profile.memo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function ProfileList({
  title,
  items,
  accent,
}: {
  title: string
  items: string[]
  accent: string
}) {
  return (
    <div className="rounded-lg border border-[#061727]/18 bg-white/76 p-4">
      <div className="text-[12px] font-black" style={{ color: accent }}>
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[13px] font-bold leading-6 text-[#273240]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
