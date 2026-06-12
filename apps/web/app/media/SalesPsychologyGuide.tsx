'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { ArrowRight, BrainCircuit, Microscope, Sparkles, Target, X } from 'lucide-react'

type PsychologyCard = {
  title: string
  label: string
  copy: string
  image: string
  accent: string
}

type DragonActivation = {
  cardVariant?: 'dragon' | 'weapon'
  cardName: string
  species: string
  name: string
  type: string
  image: string
  accent: string
  trait: string
  effect: string
  evidence: string
  subheading?: string
  example?: string
  conclusion?: string
  technicalTerm?: string
  technicalMeaning?: string
  fieldLine?: string
  finisherName?: string
  methodSteps?: {
    label: string
    title: string
    copy: string
  }[]
  references?: {
    label: string
    source: string
    university: string
    researchers: string
    content: string
    evidenceLevel?: 'メタ分析' | 'RCT'
  }[]
  caution: string
  memo: string
}

const basicEquipment = [
  {
    title: '質問力',
    label: '水流ヒアリング',
    copy: '相手の判断軸・不安・優先順位を引き出す、全ドラゴン共通の基本装備。',
    image: '/media/psychology/weapon-framing.png',
    accent: '#6bc6d9',
  },
  {
    title: '傾聴スキル',
    label: '水温調整',
    copy: '話を聞くだけで終わらず、相手が話したくなる空気を設計する基本装備。',
    image: '/media/psychology/situation-first-meeting.png',
    accent: '#6bc6d9',
  },
  {
    title: '理解力',
    label: '構造把握',
    copy: '顧客の発言を、課題・感情・社内事情・意思決定の構造に分解する基本装備。',
    image: '/media/psychology/weapon-trust.png',
    accent: '#d7ad59',
  },
  {
    title: '影響力',
    label: '意味づけ',
    copy: '押し切る力ではなく、相手の見え方と判断基準を変える基本装備。',
    image: '/media/psychology/weapon-motivation.png',
    accent: '#c98c4a',
  },
]

const dragonWeaponCategories = [
  {
    title: '炎竜の武器庫',
    note: '決断・熱量・前進を扱うドラゴン',
    accent: '#d85b31',
    softAccent: '#f4a261',
    cards: [
      {
        title: '熱量点火',
        label: '動機発掘',
        copy: '顧客が変えたい未来を見つけ、会話に前へ進む火種を入れる。',
        image: '/media/psychology/weapon-motivation.png',
        accent: '#c98c4a',
      },
      {
        title: '先送り焼却',
        label: '緊急度',
        copy: '「今じゃなくていい」を分解し、動く理由を静かに燃やす。',
        image: '/media/psychology/situation-price-objection.png',
        accent: '#d85b31',
      },
      {
        title: '決断ファイア',
        label: '選択支援',
        copy: '迷いを責めず、選べる状態まで判断材料を燃えやすく整える。',
        image: '/media/psychology/weapon-framing.png',
        accent: '#d85b31',
      },
      {
        title: '反論ブースト',
        label: '抵抗変換',
        copy: '反論を敵にせず、顧客の不安を前進エネルギーに変える。',
        image: '/media/psychology/situation-internal-approval.png',
        accent: '#d7ad59',
      },
    ],
  },
  {
    title: '水竜の武器庫',
    note: '信頼・共感・対話を扱うドラゴン',
    accent: '#6bc6d9',
    softAccent: '#bfeef6',
    cards: [
      {
        title: '水流ヒアリング',
        label: '関係構築',
        copy: '警戒心をほどき、相手が話したくなる水温まで商談をあたためる。',
        image: '/media/psychology/situation-first-meeting.png',
        accent: '#6bc6d9',
      },
      {
        title: '共感ミラー',
        label: '感情反射',
        copy: '相手の言葉と感情を映し返し、話しながら整理できる対話を作る。',
        image: '/media/psychology/weapon-reciprocity.png',
        accent: '#6bc6d9',
      },
      {
        title: '沈黙リカバリー',
        label: '間の攻略',
        copy: '沈黙を焦って埋めず、相手が考えを出しやすい余白に変える。',
        image: '/media/psychology/weapon-trust.png',
        accent: '#6bc6d9',
      },
      {
        title: '納得の水路',
        label: '合意形成',
        copy: '押し切らずに、相手が自然に次の一歩へ流れる会話の道を作る。',
        image: '/media/psychology/situation-no-decision.png',
        accent: '#91a1b8',
      },
    ],
  },
  {
    title: '雷竜の武器庫',
    note: '決裁者・優先順位・突破力を扱うドラゴン',
    accent: '#f2cb77',
    softAccent: '#ffe8a3',
    cards: [
      {
        title: '決裁サーチ',
        label: '影響者探索',
        copy: '会えていない決裁者の評価軸を、目の前の担当者から逆算する。',
        image: '/media/psychology/weapon-framing.png',
        accent: '#91a1b8',
      },
      {
        title: '優先度スパーク',
        label: '順位上げ',
        copy: '後回し案件に、今扱う理由と放置リスクの電流を通す。',
        image: '/media/psychology/situation-no-decision.png',
        accent: '#91a1b8',
      },
      {
        title: '要点圧縮',
        label: '一撃伝達',
        copy: '長い説明を、決裁者に刺さる一文と3つの根拠へ圧縮する。',
        image: '/media/psychology/weapon-motivation.png',
        accent: '#c98c4a',
      },
      {
        title: '次アクション雷鳴',
        label: '停滞突破',
        copy: '曖昧な宿題を、期限・担当・確認方法つきの次アクションに変える。',
        image: '/media/psychology/situation-internal-approval.png',
        accent: '#d7ad59',
      },
    ],
  },
  {
    title: '岩竜の武器庫',
    note: '価格・稟議・合意形成を扱うドラゴン',
    accent: '#b6c0a5',
    softAccent: '#d7d8bd',
    cards: [
      {
        title: '価格分解',
        label: '高いの地層',
        copy: '価格抵抗を、予算・不安・優先度・社内説明に掘り分ける。',
        image: '/media/psychology/weapon-trust.png',
        accent: '#d7ad59',
      },
      {
        title: '稟議地図',
        label: '社内迷宮',
        copy: '承認者・反対者・必要資料を地図化し、止まる場所を先に読む。',
        image: '/media/psychology/situation-price-objection.png',
        accent: '#d7ad59',
      },
      {
        title: '合意の石板',
        label: '基準固定',
        copy: '何で判断するかを先に刻み、あとから揺れない比較軸を作る。',
        image: '/media/psychology/weapon-reciprocity.png',
        accent: '#d7ad59',
      },
      {
        title: 'リスク耐性',
        label: '不安処理',
        copy: '導入後の失敗イメージを先に扱い、安心して進める地盤を固める。',
        image: '/media/psychology/situation-internal-approval.png',
        accent: '#d7ad59',
      },
    ],
  },
]

const situations = [
  {
    title: '初回商談',
    label: '最初の3分',
    copy: '警戒心をほどき、相手が話したくなる観察順序を作る。',
    image: '/media/psychology/situation-first-meeting.png',
    accent: '#6bc6d9',
  },
  {
    title: '価格抵抗',
    label: '高いの分解',
    copy: '「高い」を、予算・不安・優先度・社内説明の4系統に分解する。',
    image: '/media/psychology/situation-price-objection.png',
    accent: '#d7ad59',
  },
  {
    title: '稟議停滞',
    label: '社内迷宮',
    copy: '稟議が止まる背景を、意思決定者だけでなく摩擦の地図で見る。',
    image: '/media/psychology/situation-internal-approval.png',
    accent: '#d7ad59',
  },
  {
    title: '決裁者不在',
    label: '空席の王座',
    copy: '会えていない人の不安と評価軸を、目の前の担当者から逆算する。',
    image: '/media/psychology/situation-no-decision.png',
    accent: '#91a1b8',
  },
  {
    title: '価格交渉',
    label: '値引きの設計',
    copy: '値引き応酬ではなく、双方が納得できる着地点を一手で作る。',
    image: '/media/psychology/weapon-reciprocity.png',
    accent: '#d7ad59',
  },
  {
    title: 'クロージング',
    label: '決断の設計',
    copy: '迷いを置き去りにせず、相手が自分から動く最後の一文を渡す。',
    image: '/media/psychology/weapon-framing.png',
    accent: '#6bc6d9',
  },
  {
    title: '信頼形成',
    label: '信用の設計図',
    copy: '好感ではなく、リスクを預けてもいい根拠を積み上げる。',
    image: '/media/psychology/weapon-trust.png',
    accent: '#d7ad59',
  },
  {
    title: '動機づけ',
    label: '動く理由',
    copy: '顧客と営業が前へ進みやすい理由を、言葉にして固定する。',
    image: '/media/psychology/weapon-motivation.png',
    accent: '#c98c4a',
  },
]

const professorChecks = ['論文を営業語に翻訳', '商談の感情ログを観測', '失注の心理パターンを整理', '現場で使える一言に変換']

const dragonActivations: Record<string, DragonActivation> = {
  質問力: {
    cardVariant: 'weapon',
    cardName: '水流ヒアリングカード',
    species: '水竜',
    name: '水流ヒアリング',
    type: '信頼構築型',
    image: '/media/dragon-types/water-hearing-card.png',
    accent: '#6bc6d9',
    trait: '質問設計・理解感・有用性・信頼形成',
    effect: '相手に「この人はわかってくれる」「話す価値がある」と感じてもらい、信頼関係の入口を開く。',
    evidence: '質問は情報を抜き取る作業ではなく、相手が状況・不安・優先順位を整理するための共同作業として機能する。',
    subheading: '質問は、商談の扉をこじ開ける道具ではない。相手が自分から話したくなる道を照らす、営業の基本武器。',
    technicalTerm: 'アクティブリスニング / 認知的信頼 / 顧客理解',
    example: '「いきなり提案ではなく、まず状況の地図を描かせてください。最近いちばん判断しづらい商談は、どこで止まりますか？」',
    fieldLine: '相手が話しながら整理できる場を作り、理解者・伴走者・役に立つ相手として認識される。',
    finisherName: '理解の一閃',
    methodSteps: [
      {
        label: '01',
        title: '水温を上げる',
        copy: '安心して話せる入口を作る。',
      },
      {
        label: '02',
        title: '軸を聞く',
        copy: '不安・優先度・判断軸を拾う。',
      },
      {
        label: '03',
        title: '理解を返す',
        copy: '要約で「わかっている」を作る。',
      },
    ],
    caution: '質問を連打すると尋問になる。問いは刃物だ。振り回すな、道を切り開け。',
    memo: '博士いわく、良い質問は顧客の頭の中に橋をかける。渡る前に売り込むな。',
  },
  初回商談: {
    cardName: '温感メソッドカード',
    species: '水竜',
    name: 'ウォームヒアリング',
    type: '温かみ発動型',
    image: '/media/dragon-types/water-hearing-card.png',
    accent: '#6bc6d9',
    trait: '温かみ・有能さ・深層演技・傾聴',
    effect: '初回商談の最初の3分だけ、水竜の聞き役を召喚する。警戒心の水門をゆるめ、専門性で押す前に「この人には話しても大丈夫かも」を発生させるカード。',
    evidence: 'Fiske・Cuddy・GlickのSCMでは、対人評価の主要軸は温かみと有能さ。Hülsheger & Scheweのメタ分析では、表層演技より深層演技が接客成果と相性よし。',
    subheading: '初回3分は、売り込む前に「安心して話せる人」を演じきる。',
    example: '「いきなり提案ではなく、まず状況の地図を描かせてください。最近いちばん詰まりやすい商談は、どこで止まりますか？」',
    conclusion: '温かみで警戒水位を下げ、有能さは要約と問いの精度でチラ見せする。',
    technicalTerm: 'SCM（温かみ・有能さ） / 印象形成 / 深層演技',
    technicalMeaning: 'SCMは人を温かみと有能さで評価する枠組み。Deep Actingは表情だけでなく、内側の感情から役に入る感情労働の用語。',
    fieldLine: '売る前に、相手の警戒ゲージを下げる。水竜の仕事は「話してもいい場」を作ること。',
    finisherName: '安心地図オープン',
    methodSteps: [
      {
        label: '01',
        title: '温かい人に変身',
        copy: '声量・表情・相づちを半段やわらかく。表層スマイルではなく、聞く姿勢から入る。',
      },
      {
        label: '02',
        title: '状況の地図を描く',
        copy: '課題を詰問せず、商談が止まる地点を聞く。相手の頭の中に一緒に潜る。',
      },
      {
        label: '03',
        title: '要約で牙を見せる',
        copy: '最後に感情と論点を短く返す。温かいだけで終わらず、有能さをチラ見せする。',
      },
    ],
    references: [
      {
        label: '社会認知モデル',
        source: 'Universal dimensions of social cognition: warmth and competence',
        university: 'Princeton University',
        researchers: 'Susan T. Fiske / Amy J.C. Cuddy / Peter Glick',
        content: '人は相手をまず温かみ、次に有能さで評価しやすいという社会認知の主要軸を整理。',
      },
      {
        label: '信頼形成と影響力',
        source: 'Connect, Then Lead',
        university: 'Harvard Business School',
        researchers: 'Amy J.C. Cuddy / Matthew Kohut / John Neffinger',
        content: '影響力を出すには、能力を見せる前に温かみで信頼の土台を作るという実務向け整理。',
      },
      {
        label: '感情労働メタ分析',
        source: 'On the costs and benefits of emotional labor',
        university: 'Maastricht University / Bielefeld University',
        researchers: 'Ute R. Hülsheger / Anna F. Schewe',
        content: '感情労働研究を統合し、表層演技より深層演技が接客成果と相性がよいことを示す。',
        evidenceLevel: 'メタ分析',
      },
    ],
    caution: 'ニコニコするだけの表層演技だと、相手の警戒センサーに秒で見破られる。温かみを出しつつ、有能さのチラ見せを忘れるな。',
    memo: '博士いわく、初手から賢さで殴るな。まず水温を上げろ。そのあと剣を抜け。',
  },
  価格抵抗: {
    cardName: '価値分解カード',
    species: '岩竜',
    name: 'バリューガード',
    type: '納得設計型',
    image: '/media/dragon-types/rock-guardian-card.png',
    accent: '#d7ad59',
    trait: '予算・不安・優先度・社内説明',
    effect: '「高い」をひとまとめにせず、4つの摩擦に分けて攻略ルートを作る。',
    evidence: '価格反応は金額そのものだけでなく、損失回避・参照価格・社内説明コストの影響を受けやすい。',
    caution: '値引きで殴ると、価値まで一緒に削れる。',
    memo: '価格は敵ではない。説明不足の鎧を着た不安だ。',
  },
  稟議停滞: {
    cardName: '社内迷宮カード',
    species: '岩竜',
    name: 'ルートメーカー',
    type: '摩擦可視化型',
    image: '/media/dragon-types/rock-guardian-card.png',
    accent: '#d7ad59',
    trait: '社内説明・合意形成・摩擦地図',
    effect: '止まった稟議を、担当者の怠慢ではなく社内説明の迷路として読み直す。',
    evidence: '組織内の意思決定は、個人の納得だけでなく、関係者の評価軸と説明責任に左右される。',
    caution: '決裁者の名前だけ聞いても迷路は抜けられない。通路と罠を聞け。',
    memo: '稟議はドラゴンではない。だいたい通路が暗いだけだ。',
  },
  決裁者不在: {
    cardName: '決裁者探索カード',
    species: '雷竜',
    name: 'キーマンレーダー',
    type: '評価軸探索型',
    image: '/media/dragon-types/thunder-driver-card.png',
    accent: '#91a1b8',
    trait: '影響者・評価軸・不在リスク',
    effect: '会えていない人の不安と判断軸を、目の前の担当者の言葉から逆算する。',
    evidence: 'B2B購買では複数関係者の評価軸が絡むため、目の前の担当者だけを見ても意思決定の全体像は見えにくい。',
    caution: '「決裁者に会えますか」だけでは芸がない。会う理由を先に作れ。',
    memo: '空席の王座にも、だいたい座り心地の好みがある。',
  },
  価格交渉: {
    cardName: '均衡交渉カード',
    species: '岩竜',
    name: 'バランサー',
    type: '着地設計型',
    image: '/media/dragon-types/rock-guardian-card.png',
    accent: '#d7ad59',
    trait: '条件・譲歩・合意・着地点',
    effect: '値引き合戦を避け、条件交換で双方が納得できる着地点を作る。',
    evidence: '交渉では一方的な譲歩より、条件交換と相互利益の設計が合意の質を上げやすい。',
    caution: '最初に値段を下げると、博士のメガネも少し曇る。',
    memo: '譲歩は投げ銭ではない。交換条件を連れてこい。',
  },
  クロージング: {
    cardName: '決断点火カード',
    species: '炎竜',
    name: 'ラストワード',
    type: '前進支援型',
    image: '/media/dragon-types/fire-closer-card.png',
    accent: '#d85b31',
    trait: '不安整理・期限・次の一歩',
    effect: '迷いを置き去りにせず、相手が自分で前へ進む最後の一文を渡す。',
    evidence: '意思決定は合理性だけでなく、不安の整理と次の行動の明確さに左右される。',
    caution: '詰めすぎると、炎ではなく焦げ臭さだけが残る。',
    memo: 'クロージングは扉を蹴る技ではない。鍵穴を照らす技だ。',
  },
  信頼形成: {
    cardName: '信頼蓄積カード',
    species: '水竜',
    name: 'トラストレイク',
    type: '信用設計型',
    image: '/media/dragon-types/water-hearing-card.png',
    accent: '#6bc6d9',
    trait: '一貫性・根拠・安心材料',
    effect: '好感だけに頼らず、相手がリスクを預けてもいい根拠を積み上げる。',
    evidence: '信頼は温かみだけでなく、能力・一貫性・誠実さの手がかりから形成される。',
    caution: 'いい人カードだけでは稟議を突破できない。',
    memo: '信頼は気合いではない。小さい約束の積立投資だ。',
  },
  動機づけ: {
    cardName: '理由点火カード',
    species: '雷竜',
    name: 'イグナイター',
    type: '行動理由設計型',
    image: '/media/dragon-types/thunder-driver-card.png',
    accent: '#c98c4a',
    trait: '目的・危機感・理想状態',
    effect: '顧客と営業が前へ進みやすい理由を、ふわっとした温度感から言葉へ固定する。',
    evidence: '人は外から押されるだけでなく、自分の目的や意味づけと接続した時に動きやすい。',
    caution: '熱量だけを足すと、議事録がポエムになる。',
    memo: '動く理由がない案件は、だいたい椅子から立たない。',
  },
}

const fallbackActivation: DragonActivation = {
  cardName: '営業心理カード',
  species: '観測竜',
  name: 'オブザーバー',
  type: '仮説観測型',
  image: '/media/dragon-types/water-hearing-card.png',
  accent: '#d7ad59',
  trait: '観察・仮説・現場変換',
  effect: '商談の違和感を観察し、次に使える問いへ変換する。',
  evidence: '観察と仮説化を分けると、商談後の振り返りが再現可能な学習に変わりやすい。',
  caution: '決めつけると、心理学ではなく思い込みになる。',
  memo: '博士いわく、観察は強い。ただし雑な観察はただの感想だ。',
}

function getDragonActivation(card: PsychologyCard) {
  return dragonActivations[card.title] ?? fallbackActivation
}

export default function SalesPsychologyGuide() {
  const [selectedCard, setSelectedCard] = useState<PsychologyCard | null>(null)

  useEffect(() => {
    if (!selectedCard) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedCard(null)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCard])

  return (
    <main className="min-h-screen bg-[#061727] text-[#07111a]">
      <div className="relative mx-auto max-w-[1500px] bg-[#061727] shadow-[0_0_0_1px_rgba(215,173,89,0.16)]">
        <aside className="absolute bottom-0 left-0 top-0 hidden w-[60px] bg-[#07111a] md:block">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(135deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="sticky top-[94px] mx-auto mt-9 flex h-[356px] w-10 flex-col items-center gap-3 rounded-lg border border-[#d7ad59]/45 bg-[#102334] px-2 py-4 text-[#f5d486]">
            <span className="text-2xl font-black leading-none">心</span>
            <span className="text-[12px] font-black leading-5" style={{ writingMode: 'vertical-rl' }}>
              顧客の沈黙には、だいたい手がかりがある。
            </span>
          </div>
        </aside>

        <section id="psychology-lab" className="relative overflow-hidden border-b border-[#d7ad59]/25 pl-0 md:pl-[60px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_30%,rgba(215,173,89,0.18),transparent_20%),radial-gradient(circle_at_70%_26%,rgba(107,198,217,0.16),transparent_18%),linear-gradient(115deg,rgba(2,10,16,0.72),rgba(6,23,39,0.94)_48%,rgba(3,12,19,0.98)),linear-gradient(90deg,rgba(245,212,134,0.05)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.04)_1px,transparent_1px)] bg-[length:auto,auto,auto,44px_44px,44px_44px]" />
          <div className="absolute inset-0 bg-[url('/media/psychology/weapon-trust.png')] bg-cover bg-center opacity-[0.18] mix-blend-screen" />
          <div className="absolute left-[32%] top-8 hidden text-[16rem] font-black leading-none text-[#f5d486]/[0.055] lg:block">
            心
          </div>

          <div className="relative grid min-h-[560px] gap-6 px-4 pb-0 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pt-9">
            <div className="relative z-10 flex flex-col justify-center pb-8 lg:pb-10">
              <div className="mb-7 inline-flex w-fit items-center gap-3 rounded-md border border-[#d7ad59]/35 bg-[#07111a]/78 px-4 py-2 text-[13px] font-black text-[#fff3d8] shadow-[0_14px_28px_-26px_rgba(0,0,0,0.9)] backdrop-blur-sm">
                <span className="h-1.5 w-9 rounded-full bg-[#d7ad59]" />
                論文と本の知見を、博士が現場の攻略カードに変換する。
              </div>

              <h1 className="font-display text-[2.8rem] font-black leading-[1.04] text-[#fffaf0] drop-shadow-[0_12px_34px_rgba(0,0,0,0.75)] sm:text-[4rem] lg:text-[4.2rem] xl:text-[4.7rem]">
                <span className="sm:whitespace-nowrap">はぐれ博士の</span>
                <span className="block text-[#f2cb77] sm:whitespace-nowrap">営業武器庫</span>
              </h1>

              <p className="mt-5 max-w-[700px] text-base font-black leading-8 text-[#fff3d8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.7)] sm:text-lg">
                アダム・グラント系の本や行動科学の知見を、商談・失注・稟議・信頼形成で使える攻略カードに変える営業エンタメメディア。
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#psychology-situations"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59] bg-[#061727] px-7 text-base font-black text-[#f5d486] shadow-[0_18px_40px_-26px_rgba(6,23,39,0.8)] transition-transform hover:-translate-y-0.5"
                >
                  <Target size={22} />
                  状況別攻略を見る
                  <ArrowRight size={20} />
                </a>
                <a
                  href="/media#dragons"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59]/45 bg-[#07111a]/80 px-7 text-base font-black text-[#fff3d8] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334]"
                >
                  <span className="text-2xl">竜</span>
                  営業竜学園を見る
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div id="psychology-professor" className="relative z-10 min-h-[520px] lg:min-h-[540px]">
              <div className="absolute bottom-0 left-[8%] right-[6%] top-8 rounded-lg border border-[#d7ad59]/30 bg-[#071a28] shadow-[0_24px_70px_-44px_rgba(6,23,39,0.9)]" />
              <div className="absolute bottom-0 left-[5%] right-[12%] top-6 overflow-hidden rounded-lg border border-[#d7ad59]/25 bg-[#071a28]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(215,173,89,0.16),transparent_18%),linear-gradient(90deg,rgba(245,212,134,0.05)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.04)_1px,transparent_1px)] bg-[length:auto,42px_42px,42px_42px]" />
                <Image
                  src="/media/psychology/weapon-reciprocity.png"
                  alt="営業心理学ラボで研究するはぐれ博士"
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-cover opacity-88"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,23,39,0.1),rgba(6,23,39,0.22)_42%,rgba(6,23,39,0.58))]" />
                <div className="absolute right-7 top-8 hidden h-44 w-44 rounded-full border border-[#d7ad59]/30 bg-[#061727]/85 shadow-[0_0_54px_-24px_rgba(215,173,89,0.95)] sm:block">
                  <div className="absolute left-1/2 top-1/2 h-[1px] w-[120%] -translate-x-1/2 bg-[#d7ad59]/40" />
                  <div className="absolute left-1/2 top-1/2 h-[120%] w-[1px] -translate-y-1/2 bg-[#6bc6d9]/40" />
                  <div className="absolute inset-8 rounded-full border border-[#d7ad59]/35" />
                </div>
              </div>

              <div className="absolute right-0 top-[112px] w-[292px] rounded-lg border border-[#d7ad59]/45 bg-[#061727]/95 p-5 text-[#fff3d8] shadow-[0_20px_50px_-32px_rgba(0,0,0,0.9)] backdrop-blur-sm max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:bottom-5 max-sm:w-auto">
                <div className="flex items-center gap-2 text-lg font-black text-[#f5d486]">
                  <Microscope size={20} />
                  はぐれ博士の研究室
                </div>
                <p className="mt-4 text-[13px] font-bold leading-7">
                  論文を丸写しせず、現場で使える観察メモに翻訳するはぐれ系研究者。
                </p>
                <div className="my-4 h-px bg-[#d7ad59]/35" />
                <ul className="space-y-2">
                  {professorChecks.map((check) => (
                    <li key={check} className="flex items-center gap-2 text-[13px] font-bold text-[#ffe8ec]">
                      <Sparkles size={15} className="text-[#d7ad59]" />
                      {check}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-lg border border-[#d7ad59]/35 bg-[#07111a] p-4">
                  <div className="text-[11px] font-black text-[#f5d486]">今日の観察メモ</div>
                  <p className="mt-2 text-[13px] font-black leading-6">
                    「検討します」は、感情の棚卸し不足かもしれない。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="psychology-situations" className="relative bg-[#061727] px-4 py-5 sm:px-8 md:pl-[92px] lg:px-12 lg:pl-[92px]">
          <div className="mx-auto max-w-[1370px]">
            <div className="mb-4 flex flex-col gap-2 border-l-2 border-[#6bc6d9] pl-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-[#6bc6d9] px-2 py-0.5 text-[11px] font-black text-[#04111d]">01</span>
                  <span className="text-[11px] font-black tracking-[0.16em] text-[#6bc6d9]">COMMON BASIC</span>
                </div>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-xl font-black text-[#fff3d8]">基本装備</h2>
                  <p className="text-[13px] font-bold text-[#bfeef6]">どのドラゴンも最初に持つ、営業の共通スキル</p>
                </div>
              </div>
              <span className="text-sm font-black text-[#6bc6d9]">全タイプ共通の4スキル</span>
            </div>
            <div className="rounded-lg border border-[#6bc6d9]/28 bg-[linear-gradient(90deg,rgba(107,198,217,0.10),rgba(7,17,26,0.42))] p-3 sm:p-4">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="text-[11px] font-black tracking-[0.16em] text-[#6bc6d9]">BASIC EQUIPMENT</span>
                  <span className="text-lg font-black text-[#fff3d8]">質問力・傾聴スキル・理解力・影響力</span>
                </div>
                <div className="text-[12px] font-black text-[#6bc6d9]">まず持つ4つの装備</div>
              </div>
              <div className="grid gap-3 lg:grid-cols-4">
                {basicEquipment.map((card) => (
                  <PsychologyImageCard key={`basic-${card.title}`} card={card} onOpen={() => setSelectedCard(card)} />
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[#d7ad59]/25 pt-5">
              <div className="mb-4 flex flex-col gap-2 border-l-2 border-[#d7ad59] pl-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-[#d7ad59] px-2 py-0.5 text-[11px] font-black text-[#04111d]">02</span>
                    <span className="text-[11px] font-black tracking-[0.16em] text-[#f5d486]">SCENARIO PLAYBOOK</span>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-xl font-black text-[#fff3d8]">状況別攻略</h2>
                    <p className="text-[13px] font-bold text-[#f5d486]/75">商談で詰まる場面を、心理の構造から読み解く</p>
                  </div>
                </div>
                <span className="text-sm font-black text-[#f5d486]">商談の詰まり8場面</span>
              </div>
              <div className="rounded-lg border border-[#d7ad59]/20 bg-[#020a10]/28 p-3 sm:p-4">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex min-w-0 items-baseline gap-3">
                    <span className="text-[11px] font-black tracking-[0.16em] text-[#f5d486]">FIELD TROUBLE</span>
                    <span className="text-lg font-black text-[#fff3d8]">現場で出やすい詰まりどころ</span>
                  </div>
                  <div className="text-[12px] font-black text-[#f5d486]/65">8 SCENARIOS</div>
                </div>
                <div className="grid gap-3 lg:grid-cols-4">
                  {situations.map((card) => (
                    <PsychologyImageCard key={card.title} card={card} onOpen={() => setSelectedCard(card)} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#d7ad59]/25 pt-5">
              <div className="mb-4 flex flex-col gap-2 border-l-2 border-[#d7ad59] pl-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-[#d7ad59] px-2 py-0.5 text-[11px] font-black text-[#04111d]">03</span>
                    <span className="text-[11px] font-black tracking-[0.16em] text-[#f5d486]">DRAGON TYPE ARSENAL</span>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-xl font-black text-[#fff3d8]">ドラゴン別 必殺技武器庫</h2>
                    <p className="text-[13px] font-bold text-[#f5d486]/75">各タイプの奥義で、商談の詰まりを突破する</p>
                  </div>
                </div>
                <span className="text-sm font-black text-[#f5d486]">炎・水・雷・岩の専用奥義</span>
              </div>
              <div className="space-y-5">
                {dragonWeaponCategories.map((category) => (
                  <div key={category.title} className="rounded-lg border border-[#d7ad59]/24 bg-[#07111a]/42 p-3 shadow-[0_18px_46px_-40px_rgba(0,0,0,0.9)] sm:p-4">
                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-[11px] font-black tracking-[0.16em]" style={{ color: category.accent }}>
                          DRAGON TYPE
                        </div>
                        <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-lg font-black" style={{ color: category.softAccent }}>
                            {category.title}
                          </span>
                          <span className="text-[13px] font-bold" style={{ color: category.accent }}>
                            {category.note}
                          </span>
                        </div>
                      </div>
                      <div className="text-[12px] font-black" style={{ color: category.accent }}>
                        4 WEAPONS
                      </div>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-4">
                      {category.cards.map((card) => (
                        <PsychologyImageCard key={`${category.title}-${card.title}`} card={card} onOpen={() => setSelectedCard(card)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
      {selectedCard && typeof document !== 'undefined'
        ? createPortal(
            <PsychologyStrategyModal card={selectedCard} onClose={() => setSelectedCard(null)} />,
            document.body,
          )
        : null}
    </main>
  )
}

function PsychologyImageCard({
  card,
  onOpen,
  dark = false,
}: {
  card: PsychologyCard
  onOpen: () => void
  dark?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${card.title}の攻略カードを見る`}
      className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border text-left shadow-[0_16px_38px_-34px_rgba(6,23,39,0.9)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d486] ${
        dark ? 'border-[#d7ad59]/25 bg-[#071a28]' : 'border-[#061727]/25 bg-[#061727]'
      }`}
      style={{ aspectRatio: '407 / 285' }}
    >
      <Image
        src={card.image}
        alt={`${card.title}の営業心理学カード`}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,17,27,0.18),rgba(5,17,27,0.28)_36%,rgba(5,17,27,0.82))]" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-right">
        <div className="ml-auto inline-flex rounded-full px-2.5 py-1 text-[11px] font-black text-[#04141d]" style={{ background: card.accent }}>
          {card.label}
        </div>
        <h3 className="mt-2 font-display text-2xl font-black leading-tight text-white">{card.title}</h3>
        <p className="ml-auto mt-1 max-w-[230px] text-[12px] font-bold leading-5 text-[#fff3f5]">{card.copy}</p>
      </div>
      <ArrowRight className="absolute right-3 top-3 text-white/88" size={18} />
    </button>
  )
}

function PsychologyStrategyModal({
  card,
  onClose,
}: {
  card: PsychologyCard
  onClose: () => void
}) {
  const activation = getDragonActivation(card)

  if (activation.cardVariant === 'weapon') {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#02070d]/88 px-4 py-6 text-[#fff3d8] backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="psychology-strategy-card-title"
        onClick={onClose}
      >
        <div className="relative w-full max-w-[980px]" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            aria-label="攻略カードを閉じる"
            className="absolute -right-3 -top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/45 bg-[#061727]/95 text-[#fff3d8] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d486] sm:-right-4 sm:-top-4"
          >
            <X size={20} />
          </button>
          <WeaponStrategyCard activation={activation} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#02070d]/86 px-4 py-6 text-[#fff3d8] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="psychology-strategy-card-title"
      onClick={onClose}
    >
      <div
        className="relative my-auto max-h-[88vh] w-full max-w-[1040px] overflow-y-auto overflow-x-hidden rounded-xl border border-[#d7ad59]/55 bg-[#061727] shadow-[0_34px_120px_-48px_rgba(0,0,0,1),0_0_0_1px_rgba(245,212,134,0.12)] lg:max-h-[87vh] lg:overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="攻略カードを閉じる"
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/40 bg-[#061727]/92 text-[#fff3d8] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d486]"
        >
          <X size={20} />
        </button>

        <div className="relative overflow-hidden">
          <Image
            src={activation.image}
            alt={`${activation.species} ${activation.name}のカード背景`}
            fill
            sizes="(min-width: 1024px) 920px, 100vw"
            className="object-cover opacity-18"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(107,198,217,0.16),transparent_18%),radial-gradient(circle_at_28%_76%,rgba(215,173,89,0.18),transparent_20%),linear-gradient(115deg,rgba(2,10,16,0.98),rgba(6,23,39,0.95)_54%,rgba(3,12,19,0.98))]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,212,134,0.055)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.045)_1px,transparent_1px)] bg-[length:42px_42px]" />

          <div className="relative z-10 grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col p-5 pr-16 sm:p-6 sm:pr-20 lg:p-5 lg:pr-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ad59]/45 bg-[#061727]/78 px-3 py-1.5 text-[12px] font-black text-[#f5d486]">
                  <Sparkles size={14} />
                  はぐれ博士の営業武器庫
                </div>
                <div className="ml-0 mt-3 inline-flex rounded-full px-3 py-1.5 text-[12px] font-black text-[#04111d] sm:ml-2 sm:mt-0" style={{ background: activation.accent }}>
                  {card.title}で発動
                </div>
              </div>

              <div className="mt-4 max-w-[520px] lg:mt-5">
                <div className="mb-3 h-1.5 w-16 rounded-full" style={{ background: activation.accent }} />
                <h2 id="psychology-strategy-card-title" className="flex flex-wrap items-end gap-2 font-display text-[2.35rem] font-black leading-none text-[#fffaf0] drop-shadow-[0_12px_34px_rgba(0,0,0,0.72)] sm:text-[2.85rem]">
                  <span>{card.title}</span>
                  <span className="mb-1 rounded-full border border-[#d7ad59]/45 bg-[#d7ad59] px-2.5 py-1 text-[12px] font-black leading-none text-[#04111d]">
                    {activation.cardName}
                  </span>
                </h2>
                <div className="mt-2 truncate text-[11px] font-black text-[#f2cb77]">
                  {activation.technicalTerm ?? activation.trait}
                </div>
                <p className="mt-2 text-[13px] font-black leading-6 text-[#fff3d8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.7)]">
                  {activation.subheading ?? activation.effect}
                </p>
              </div>

              <div className="mt-3 rounded-lg border border-[#d7ad59]/35 bg-[#020a10]/72 p-2.5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-black text-[#f5d486]">3連コンボ</div>
                  <div className="text-[10px] font-black text-[#fff3d8]/55">初回3分</div>
                </div>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
                  {(activation.methodSteps ?? [
                    { label: '01', title: '観察', copy: activation.effect },
                    { label: '02', title: '変換', copy: activation.memo },
                    { label: '03', title: '発動', copy: activation.caution },
                  ]).map((step) => (
                    <div key={step.label} className="flex min-w-0 items-center gap-1.5 rounded-md border border-[#d7ad59]/18 bg-[#061727]/78 px-2 py-2">
                      <span className="shrink-0 rounded-full bg-[#d7ad59] px-1.5 py-0.5 text-[9px] font-black leading-none text-[#04111d]">
                        {step.label}
                      </span>
                      <span className="truncate text-[10px] font-black text-[#fffaf0]">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 rounded-lg border border-[#d7ad59]/40 bg-[#061727]/86 p-2.5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] font-black text-[#f5d486]">
                    <BrainCircuit size={14} />
                    決め技
                  </div>
                  <div className="rounded-full bg-[#d7ad59] px-2 py-1 text-[10px] font-black text-[#04111d]">
                    {activation.finisherName ?? '最終一言'}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-[12px] font-black leading-5 text-[#fff3d8]">
                  {activation.example ?? activation.memo}
                </p>
              </div>

              <div className="mt-2 rounded-lg border border-[#d7ad59]/35 bg-[#061727]/82 p-2.5 backdrop-blur-sm">
                <div className="flex items-start gap-2.5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-[#6bc6d9]/45 bg-[#6bc6d9]/16 text-[#8cecff]">
                    <Target size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-[#f5d486]">効果</div>
                    <p className="mt-1 line-clamp-2 text-[12px] font-black leading-5 text-[#fff3d8]">
                      {activation.fieldLine ?? activation.effect}
                    </p>
                  </div>
                </div>
              </div>
              {activation.references?.length ? (
                <div className="mt-2 rounded-lg border border-[#d7ad59]/35 bg-[#020a10]/76 p-2.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black text-[#f5d486]">参照文献・研究根拠</div>
                      <div className="mt-0.5 text-[10px] font-bold text-[#fff3d8]/62">温かみ・有能さ・深層演技を営業場面へ応用</div>
                    </div>
                    <div className="rounded-full border border-[#d7ad59]/35 px-2 py-1 text-[10px] font-black text-[#f5d486]">
                      論文ベース
                    </div>
                  </div>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
                    {activation.references.map((reference) => (
                      <div key={reference.source} className="min-w-0 rounded-md border border-[#d7ad59]/20 bg-[#061727]/78 p-2">
                        <div className="flex min-h-5 items-start justify-between gap-1.5">
                          <div className="line-clamp-1 text-[10px] font-black leading-4 text-[#f5d486]">{reference.label}</div>
                          {reference.evidenceLevel ? (
                            <div className="shrink-0 rounded-full bg-[#d7ad59] px-1.5 py-0.5 text-[8px] font-black leading-3 text-[#04111d]">
                              {reference.evidenceLevel}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-1 line-clamp-1 text-[8px] font-black leading-3 text-[#fffaf0]">{reference.source}</div>
                        <div className="mt-1 line-clamp-1 text-[8px] font-bold leading-3 text-[#fff3d8]/72">
                          機関: {reference.university}
                        </div>
                        <div className="line-clamp-1 text-[8px] font-bold leading-3 text-[#fff3d8]/72">
                          研究者: {reference.researchers}
                        </div>
                        <div className="mt-1 line-clamp-2 text-[8px] font-bold leading-3 text-[#fff3d8]/78">
                          要旨: {reference.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative min-h-[450px] border-t border-[#d7ad59]/25 bg-[#020a10]/42 p-5 sm:p-6 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(245,212,134,0.18),transparent_20%)]" />
              <div className="relative mx-auto flex h-full max-w-[430px] flex-col items-center justify-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d7ad59]/45 bg-[#061727]/85 px-3 py-1.5 text-[12px] font-black text-[#f5d486]">
                  <span className="text-base">{activation.species.includes('竜') ? '竜' : '伴'}</span>
                  {activation.type}
                </div>
                <div className="relative w-full max-w-[334px] overflow-hidden rounded-lg border border-[#d7ad59]/55 bg-[#061727] p-2 shadow-[0_26px_80px_-38px_rgba(0,0,0,1)]">
                  <Image
                    src={activation.image}
                    alt={`${activation.species} ${activation.name}カード`}
                    width={392}
                    height={622}
                    priority
                    className="h-auto max-h-[56vh] w-full rounded-md object-contain"
                  />
                </div>
                <div className="mt-3 w-full max-w-[322px] rounded-lg border border-[#d7ad59]/35 bg-[#061727]/88 p-3">
                  <div className="text-[11px] font-black text-[#f5d486]">属性</div>
                  <div className="mt-1.5 text-[13px] font-black leading-5 text-[#fff3d8]">{activation.trait}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeaponStrategyCard({ activation }: { activation: DragonActivation }) {
  const steps = activation.methodSteps ?? [
    { label: '01', title: '水温を上げる', copy: 'いきなり提案せず、相手が話してもいい場を作る。' },
    { label: '02', title: '判断軸を聞く', copy: '困りごと・優先順位・不安を、質問で水路に流す。' },
    { label: '03', title: '理解を返す', copy: '要約して返し、理解者として信頼の足場を作る。' },
  ]

  return (
    <div className="relative max-h-[88vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-[#d7ad59]/60 bg-[#061727] shadow-[0_34px_120px_-48px_rgba(0,0,0,1),0_0_0_1px_rgba(245,212,134,0.12)]">
      <Image
        src={activation.image}
        alt=""
        fill
        sizes="980px"
        priority
        className="object-cover opacity-[0.13]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(107,198,217,0.20),transparent_22%),radial-gradient(circle_at_82%_78%,rgba(215,173,89,0.18),transparent_24%),linear-gradient(115deg,rgba(2,10,16,0.98),rgba(6,23,39,0.94)_48%,rgba(3,12,19,0.98))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,212,134,0.055)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.045)_1px,transparent_1px)] bg-[length:42px_42px]" />

      <div className="relative z-10 grid gap-0 lg:grid-cols-[360px_1fr]">
        <div className="border-b border-[#d7ad59]/25 p-4 sm:p-5 lg:border-b-0 lg:border-r lg:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ad59]/45 bg-[#020a10]/74 px-3 py-1.5 text-[12px] font-black text-[#f5d486]">
              <span className="text-base">竜</span>
              水流ドラゴン出現
            </div>
            <div className="rounded-full bg-[#6bc6d9] px-3 py-1.5 text-[12px] font-black text-[#04111d]">
              {activation.type}
            </div>
          </div>

          <div className="relative mx-auto max-w-[300px] overflow-hidden rounded-xl border border-[#d7ad59]/60 bg-[#f8efe0] p-2 shadow-[0_26px_80px_-38px_rgba(0,0,0,1)]">
            <Image
              src={activation.image}
              alt={`${activation.name}のドラゴンカード`}
              width={392}
              height={622}
              priority
              className="h-auto w-full rounded-lg object-contain"
            />
          </div>

          <div className="mx-auto mt-3 max-w-[300px] rounded-lg border border-[#d7ad59]/35 bg-[#020a10]/70 p-3">
            <div className="text-[11px] font-black text-[#f5d486]">属性</div>
            <div className="mt-1 text-[13px] font-black leading-5 text-[#fff3d8]">{activation.trait}</div>
          </div>
        </div>

        <div className="relative overflow-hidden p-4 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-[#6bc6d9]/16 blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 left-10 h-44 w-44 rounded-full bg-[#d7ad59]/12 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-6 top-20 h-px bg-gradient-to-r from-transparent via-[#6bc6d9]/55 to-transparent" />
          <div className="pointer-events-none absolute right-8 top-8 h-28 w-28 rounded-full border border-[#6bc6d9]/15" />
          <div className="pointer-events-none absolute right-16 top-16 h-16 w-16 rounded-full border border-[#f5d486]/18" />
          <div className="relative max-w-[560px]">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-1.5 w-16 rounded-full bg-[#6bc6d9] shadow-[0_0_22px_rgba(107,198,217,0.85)]" />
              <div className="h-px flex-1 bg-gradient-to-r from-[#6bc6d9]/55 to-transparent" />
              <span className="rounded-full border border-[#6bc6d9]/45 bg-[#6bc6d9]/14 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-[#9cefff]">
                DRAGON CARD ACTIVATED
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#d7ad59]/45 bg-[#020a10]/78 px-3 py-1.5 text-[12px] font-black text-[#f5d486] shadow-[0_0_22px_rgba(215,173,89,0.16)]">
                はぐれ博士の営業武器庫
              </span>
              <span className="rounded-full bg-[#6bc6d9] px-3 py-1.5 text-[12px] font-black text-[#04111d] shadow-[0_0_22px_rgba(107,198,217,0.55)]">
                質問力で発動
              </span>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#6bc6d9]/35 bg-[linear-gradient(135deg,rgba(3,21,33,0.92),rgba(7,38,54,0.62)_42%,rgba(6,17,27,0.92))] p-4 shadow-[inset_0_0_38px_rgba(107,198,217,0.08),0_24px_60px_-48px_rgba(107,198,217,1)]">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full border border-[#6bc6d9]/28" />
              <div className="absolute right-8 top-7 h-10 w-10 rotate-45 border border-[#f5d486]/24" />
              <div className="relative">
                <h2
                  id="psychology-strategy-card-title"
                  className="font-display text-[2.75rem] font-black leading-[0.98] text-[#fffaf0] drop-shadow-[0_14px_34px_rgba(0,0,0,0.75)] sm:text-[3.45rem]"
                >
                  {activation.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-lg font-black leading-7 text-[#6bc6d9] drop-shadow-[0_0_18px_rgba(107,198,217,0.36)]">質問力の基本ドラゴン</span>
                  <span className="rounded-full border border-[#d7ad59]/40 px-2.5 py-1 text-[10px] font-black tracking-[0.14em] text-[#f5d486]">
                    TRUST BUILD
                  </span>
                </div>
                <p className="mt-4 max-w-[520px] text-[15px] font-black leading-7 text-[#fff3d8]">
                  売る前に、警戒心をほどく。相手が話し出す水温を作るドラゴン。
                </p>
              </div>
            </div>

            <div className="relative mt-4 rounded-2xl border border-[#d7ad59]/35 bg-[#020a10]/62 p-3.5 shadow-[inset_0_0_28px_rgba(215,173,89,0.06)]">
              <div className="absolute left-6 right-6 top-[54px] hidden h-px bg-gradient-to-r from-[#6bc6d9]/20 via-[#f5d486]/70 to-[#6bc6d9]/20 sm:block" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[12px] font-black tracking-[0.14em] text-[#f5d486]">
                  <Sparkles size={15} />
                  3連コンボ
                </div>
                <div className="text-[11px] font-black text-[#fff3d8]/58">水流発動シークエンス</div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {steps.map((step) => (
                  <div
                    key={step.label}
                    className="relative rounded-xl border border-[#6bc6d9]/30 bg-[linear-gradient(180deg,rgba(9,42,59,0.92),rgba(3,16,27,0.94))] p-3 text-center shadow-[inset_0_0_22px_rgba(107,198,217,0.10),0_14px_28px_-24px_rgba(107,198,217,0.9)]"
                  >
                    <div className="mx-auto grid h-8 w-8 place-items-center rounded-full border border-[#6bc6d9]/45 bg-[#6bc6d9] text-[11px] font-black leading-none text-[#04111d] shadow-[0_0_18px_rgba(107,198,217,0.58)]">
                      {step.label}
                    </div>
                    <div className="mt-2 text-[15px] font-black text-[#fffaf0]">{step.title}</div>
                    <p className="mx-auto mt-1 max-w-[130px] text-[10px] font-bold leading-4 text-[#fff3d8]/72">{step.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="relative overflow-hidden rounded-2xl border border-[#d7ad59]/42 bg-[linear-gradient(135deg,rgba(215,173,89,0.18),rgba(2,10,16,0.7))] p-4">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#d7ad59]/20 blur-2xl" />
                <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-[#f5d486]/70 to-transparent" />
                <div className="flex items-center gap-2 text-[12px] font-black text-[#f5d486]">
                  <Sparkles size={15} />
                  使用例
                </div>
                <p className="mt-2 text-[14px] font-black leading-6 text-[#fffaf0]">
                  「まず状況の地図を描かせてください」
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[#6bc6d9]/40 bg-[linear-gradient(135deg,rgba(107,198,217,0.18),rgba(2,10,16,0.72))] p-4">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#6bc6d9]/20 blur-2xl" />
                <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-[#6bc6d9]/70 to-transparent" />
                <div className="flex items-center gap-2 text-[12px] font-black text-[#6bc6d9]">
                  <Target size={15} />
                  効果
                </div>
                <p className="mt-2 text-[14px] font-black leading-6 text-[#fffaf0]">
                  話しやすさ → 理解感 → 信頼形成
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#f7efe0]/30 bg-[#f7efe0] p-3 text-[#102334] shadow-[0_18px_48px_-34px_rgba(245,212,134,0.8)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#0f5c70] px-2.5 py-1 text-[10px] font-black text-white">メタ分析</span>
                <span className="text-[11px] font-black leading-5">
                  ヘブライ大学 Avraham N. Kluger教授｜知覚された傾聴
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
