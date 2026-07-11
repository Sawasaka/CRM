'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { ArrowRight, BrainCircuit, Microscope, Sparkles, Target, X } from 'lucide-react'

type PsychologyCard = {
  title: string
  label: string
  copy: string
  image: string
  modalImage?: string
  accent: string
}

type ArsenalLesson = {
  hook: string
  lecture: string
  combo: [string, string, string]
  script: string
  outcome: string
  research: string
}

const basicEquipment = [
  {
    title: '質問力',
    label: '水流ヒアリング',
    copy: '相手の判断軸・不安・優先順位を引き出す、全ドラゴン共通の基本装備。',
    image: '/media/psychology/weapon-framing.png',
    modalImage: '/media/psychology/water-hearing-modal-card-v2.png',
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

const arsenalLessons: Record<string, ArsenalLesson> = {
  質問力: {
    hook: '相手の頭の中にある判断地図を、問いで照らす基本装備。',
    lecture: '質問は情報回収ではなく、相手の不安・優先順位・判断軸を整理する共同作業。',
    combo: ['問いを開く', '判断軸を拾う', '理解を返す'],
    script: '「まず状況の地図を一緒に描かせてください。最近いちばん判断しづらいのは、予算・優先順位・社内説明のどこですか？」',
    outcome: '話しやすさ → 理解感 → 信頼形成',
    research: 'ヘブライ大学 / Avraham N. Kluger教授 / 知覚された傾聴',
  },
  傾聴スキル: {
    hook: '聞くふりではなく、相手が深く話したくなる水温を作る。',
    lecture: '傾聴は相手のニーズを汲み取り、距離を縮めるための技術。営業では沈黙・迷い・言い淀みを急かさず、話しやすい場を設計する。',
    combo: ['遮らない', '感情を拾う', '要約で戻す'],
    script: '「今の話、優先度よりも社内説明のしづらさが大きそうに聞こえました。」',
    outcome: '警戒解除 → 本音の露出 → 関係深化',
    research: '正式用語: アクティブリスニング / 知覚された傾聴｜メタ分析: ヘブライ大学 / Avraham N. Kluger教授',
  },
  理解力: {
    hook: '発言をそのまま受け取らず、構造に分解する解析装備。',
    lecture: '人材評価では、成果だけでなく環境・役割・強みの噛み合わせを見る。営業でも顧客発言を課題、感情、社内事情、意思決定構造に分けると打ち手が見える。',
    combo: ['事実を分ける', '感情を読む', '構造で返す'],
    script: '「課題は機能不足ではなく、導入後に誰が説明するかが未定な点ですね。」',
    outcome: '混乱整理 → 論点明確化 → 次アクション',
    research: '正式用語: 認知的共感 / 対人正確性｜メタ分析: ノースイースタン大学 / Judith A. Hall教授',
  },
  影響力: {
    hook: '押し切らず、相手の見え方と判断基準を変える装備。',
    lecture: '人は正面から説得されるほど固くなる。営業では提案の見え方を変え、相手が自分で考え直したくなる問いと共通価値を設計する。',
    combo: ['現状を再解釈', '価値を接続', '行動理由を置く'],
    script: '「これはツール導入というより、属人化している判断をチーム資産に変える話です。」',
    outcome: '見え方変化 → 優先度上昇 → 行動',
    research: '正式用語: フレーミング効果 / 心理的リアクタンス｜メタ分析: アリゾナ大学 / Stephen A. Rains教授',
  },
  初回商談: {
    hook: '最初の3分で、敵ではなく伴走者だと認識してもらう。',
    lecture: '初回は提案より場づくりが先。相手の話題を明確にし、いきなり正解を押しつけず、相手が安心して状況を話せる入口を作る。',
    combo: ['温度を合わせる', '地図を描く', '要約で示す'],
    script: '「いきなり提案せず、まず今の状況を一緒に整理させてください。」',
    outcome: '警戒解除 → 会話量増加 → 信頼の入口',
    research: '正式用語: 印象形成 / 温かみと有能さ｜メタ分析: プリンストン大学 / Susan T. Fiske教授',
  },
  価格抵抗: {
    hook: '「高い」を敵にせず、4つの地層に掘り分ける。',
    lecture: '価格抵抗は金額だけではない。誘導尋問のように「安ければいいですよね」と詰めず、予算・不安・優先度・社内説明のどこが詰まるかを分解する。',
    combo: ['高いの種類を聞く', '不安を分ける', '説明材料を渡す'],
    script: '「金額そのもの、社内説明、優先度のどこが一番引っかかっていますか？」',
    outcome: '値引き回避 → 摩擦特定 → 納得設計',
    research: '正式用語: 損失回避 / 参照価格｜メタ分析: カリフォルニア工科大学 / Colin F. Camerer教授',
  },
  稟議停滞: {
    hook: '止まった稟議を、社内迷宮の地図として読み解く。',
    lecture: '組織の停滞は個人のやる気だけで説明できない。人材配置と同じく、関係者・権限・評価軸・説明責任の噛み合わせを見る。',
    combo: ['関係者を出す', '反対理由を読む', '資料を先回り'],
    script: '「誰が反対しそうかより、誰に何を説明できれば進みそうですか？」',
    outcome: '停滞理由の可視化 → 先回り資料 → 前進',
    research: '正式用語: 組織コミットメント / 役割葛藤｜メタ分析: ウェスタン大学 / John P. Meyer教授',
  },
  決裁者不在: {
    hook: '会えていない王座の評価軸を、目の前の人から逆算する。',
    lecture: '採用でも最終決裁者の評価軸が見えないと通らない。営業では目の前の担当者を味方にし、決裁者の不安・評価基準・関心事を探る。',
    combo: ['評価軸を聞く', '不安を推測', '会う理由を作る'],
    script: '「決裁者の方は、最終的に何を一番気にされそうですか？」',
    outcome: '空席の不安把握 → 面談理由生成 → 決裁前進',
    research: '正式用語: 社会的影響 / 意思決定単位｜メタ分析: アリゾナ州立大学 / Robert B. Cialdini教授',
  },
  価格交渉: {
    hook: '値引き合戦ではなく、交換条件で着地点を作る。',
    lecture: '人材の条件交渉と同じで、一方的な譲歩は価値を削る。価格を下げる前に、範囲・時期・支援内容・契約条件の交換設計をする。',
    combo: ['譲れない軸を置く', '交換条件を出す', '合意点を固定'],
    script: '「価格だけでなく、範囲と開始時期を含めて最適な着地点を作りましょう。」',
    outcome: '値崩れ防止 → 条件交換 → 合意',
    research: '正式用語: アンカリング効果 / 交渉における初期提示｜メタ分析: ヴァンダービルト大学 / Chris Guthrie教授',
  },
  クロージング: {
    hook: '最後の一押しではなく、迷いを片付ける決断設計。',
    lecture: '人材が転職を決める時も、条件より最後の不安整理が効く。営業のクロージングは圧ではなく、未処理の不安と次の一歩を明確にする作業。',
    combo: ['迷いを聞く', '未解決を潰す', '次の一歩を渡す'],
    script: '「進めるとしたら、最後に確認しておきたい不安は何ですか？」',
    outcome: '不安処理 → 決断準備 → 行動確定',
    research: '正式用語: 実行意図 / 決定回避｜メタ分析: ニューヨーク大学 / Peter M. Gollwitzer教授',
  },
  信頼形成: {
    hook: '好感ではなく、リスクを預けてもいい根拠を積む。',
    lecture: '人材への信頼は人柄だけではなく、能力・一貫性・誠実さで作られる。営業も「いい人」だけでは弱く、約束の履行と根拠提示が必要。',
    combo: ['約束を小さく守る', '根拠を出す', 'リスクを先に扱う'],
    script: '「懸念が残る前提で、失敗しやすい点から先に整理します。」',
    outcome: '安心材料 → 能力認知 → 信頼蓄積',
    research: '正式用語: 信頼性知覚 / 能力・誠実性・善意｜メタ分析: フロリダ大学 / Jason A. Colquitt教授',
  },
  動機づけ: {
    hook: '人が動く理由を、外圧ではなく内側から掘り出す。',
    lecture: '人材は命令だけでは続かない。意味、裁量、成長実感が行動を支える。営業でも顧客の「やる理由」を本人の言葉にする。',
    combo: ['変えたい未来を聞く', '放置リスクを置く', '本人の言葉にする'],
    script: '「これが解決したら、チームの何が一番変わりますか？」',
    outcome: '納得 → 優先度上昇 → 自走',
    research: '正式用語: 自己決定理論 / 自律的動機づけ｜メタ分析: ロチェスター大学 / Edward L. Deci教授',
  },
  熱量点火: {
    hook: '顧客の中に眠る「変えたい未来」に火を入れる。',
    lecture: '人材育成でも、本人の欲求や成長テーマに火がつくと行動が変わる。営業では課題ではなく、変わった後の未来を言語化する。',
    combo: ['理想を聞く', '現状との差を見る', '火種を置く'],
    script: '「半年後、これがうまくいったら何が一番楽になりますか？」',
    outcome: '未来像 → 熱量 → 前進',
    research: '正式用語: 目標設定理論 / 期待価値理論｜メタ分析: メリーランド大学 / Edwin A. Locke教授',
  },
  先送り焼却: {
    hook: '「今じゃなくていい」を、静かに燃やす。',
    lecture: '人材の成長課題も放置すると固まる。営業では先送りの裏にある不安、面倒、優先度の低さを分けて扱う。',
    combo: ['先送り理由を聞く', '放置コストを出す', '小さく始める'],
    script: '「今やらない場合、次に困るタイミングはいつになりそうですか？」',
    outcome: '先送り分解 → 緊急度形成 → 着手',
    research: '正式用語: 現状維持バイアス / 時間割引｜メタ分析: カルガリー大学 / Piers Steel教授',
  },
  決断ファイア: {
    hook: '迷いを責めず、選べる状態まで材料を燃えやすく整える。',
    lecture: '優秀な人材ほど選択肢が多いと迷う。営業でも比較軸を減らし、意思決定に必要な材料だけを残す。',
    combo: ['選択肢を減らす', '基準を決める', '決める順番を作る'],
    script: '「比較軸を3つに絞るなら、成果・工数・社内説明のどれが最重要ですか？」',
    outcome: '迷い縮小 → 判断基準 → 決断',
    research: '正式用語: 選択過多 / 認知負荷｜メタ分析: コロンビア大学 / Sheena S. Iyengar教授',
  },
  反論ブースト: {
    hook: '反論を敵にせず、前進エネルギーへ変換する。',
    lecture: '反論は拒絶ではなく、不安・誤解・未整理のサイン。正面から論破せず、共通して大切にしている価値を探して前進条件に変える。',
    combo: ['反論を歓迎', '背景を聞く', '前進条件に変える'],
    script: '「その懸念がある前提で、進めるなら何が確認できればよさそうですか？」',
    outcome: '反論回収 → 条件化 → 推進',
    research: '正式用語: 心理的リアクタンス / 接種理論｜メタ分析: アリゾナ大学 / Stephen A. Rains教授',
  },
  水流ヒアリング: {
    hook: '警戒心をほどき、相手が話したくなる水温まで商談をあたためる。',
    lecture: '水竜の武器は質問攻めではなく、相手が自分の言葉で整理できる場づくり。How/Whatで開き、話題を明確にし、理解を返す。',
    combo: ['水温を上げる', '話題を開く', '理解を返す'],
    script: '「まず状況を整理したいです。今いちばん話しづらい論点はどこですか？」',
    outcome: '本音 → 整理 → 信頼',
    research: '正式用語: アクティブリスニング / オープンクエスチョン｜メタ分析: ヘブライ大学 / Avraham N. Kluger教授',
  },
  共感ミラー: {
    hook: '相手の言葉と感情を映し返し、会話の水面を整える。',
    lecture: '人材面談では、相手の言葉を正しく反射すると深い話が出る。営業でも感情の反射で、顧客は自分の論点を見つけやすくなる。',
    combo: ['言葉を拾う', '感情を映す', '次の問いへ流す'],
    script: '「不安というより、社内で説明しきれるかが気になっている感じですね。」',
    outcome: '共感 → 深掘り → 整理',
    research: '正式用語: 反射的傾聴 / 共感的正確性｜メタ分析: ノースイースタン大学 / Judith A. Hall教授',
  },
  沈黙リカバリー: {
    hook: '沈黙を焦って埋めず、考えが出る余白に変える。',
    lecture: '面接でも沈黙は失敗ではなく、考えているサインの場合がある。営業では沈黙を恐れず、相手が言葉を探す時間を守る。',
    combo: ['沈黙を待つ', '選択肢を置く', '短く確認する'],
    script: '「少し考える時間を取って大丈夫です。近いのは予算・社内説明・優先度のどれですか？」',
    outcome: '圧の低下 → 本音の出現 → 前進',
    research: '正式用語: 沈黙耐性 / 認知負荷｜メタ分析: ニューサウスウェールズ大学 / John Sweller教授',
  },
  納得の水路: {
    hook: '押し切らず、相手が自然に次の一歩へ流れる道を作る。',
    lecture: '人が動くには、納得できる順番が必要。営業では結論を急がず、理解、合意、次アクションの水路を作る。',
    combo: ['合意点を置く', '不安を流す', '次を決める'],
    script: '「ここまで合っていれば、次は社内説明に必要な材料を一緒に作りましょう。」',
    outcome: '納得 → 合意 → 次の一歩',
    research: '正式用語: 実行意図 / コミットメント｜メタ分析: ニューヨーク大学 / Peter M. Gollwitzer教授',
  },
  決裁サーチ: {
    hook: '会えていない決裁者の評価軸を探知する。',
    lecture: '採用で最終面接官の視点が重要なように、営業でも決裁者の関心を逆算する。担当者の言葉から、評価軸と不安を拾う。',
    combo: ['誰が見るか', '何を見るか', 'どう通すか'],
    script: '「最終的に見る方は、成果・コスト・リスクのどこを重視されますか？」',
    outcome: '評価軸把握 → 提案調整 → 決裁接近',
    research: '正式用語: 社会的影響 / 組織内意思決定｜メタ分析: アリゾナ州立大学 / Robert B. Cialdini教授',
  },
  優先度スパーク: {
    hook: '後回し案件に、今扱う理由の電流を通す。',
    lecture: '人材課題も緊急でないと後回しになる。営業では放置コストと今やる便益を並べ、優先順位の順位表を書き換える。',
    combo: ['後回し理由を聞く', '放置コストを示す', '今やる意味を置く'],
    script: '「今月扱わない場合、次にどの数字や現場負荷に出そうですか？」',
    outcome: '放置認識 → 優先度上昇 → 着手',
    research: '正式用語: 損失回避 / 時間割引｜メタ分析: カリフォルニア工科大学 / Colin F. Camerer教授',
  },
  要点圧縮: {
    hook: '長い説明を、決裁者に刺さる一文と3根拠へ圧縮する。',
    lecture: '人材評価でも長い推薦文より、短い根拠の束が効く。営業では決裁者の認知負荷を下げる資料設計が武器になる。',
    combo: ['一文にする', '3根拠に絞る', 'リスクを添える'],
    script: '「決裁者向けには、目的・効果・リスク対策の3点に圧縮します。」',
    outcome: '理解速度UP → 社内共有 → 決裁',
    research: '正式用語: 認知負荷理論 / ワーキングメモリ｜メタ分析: ニューサウスウェールズ大学 / John Sweller教授',
  },
  次アクション雷鳴: {
    hook: '曖昧な宿題を、期限・担当・確認方法つきの次手に変える。',
    lecture: '育成でも次に何をするかが曖昧だと動かない。営業では会議の最後に行動単位へ落とし、停滞を防ぐ。',
    combo: ['担当を決める', '期限を置く', '確認方法を決める'],
    script: '「次は誰が、いつまでに、何を確認できれば前に進みますか？」',
    outcome: '曖昧さ除去 → 実行 → フォロー',
    research: '正式用語: 実行意図 / コミットメント｜メタ分析: ニューヨーク大学 / Peter M. Gollwitzer教授',
  },
  価格分解: {
    hook: '価格抵抗を、予算・不安・優先度・社内説明に掘り分ける。',
    lecture: '人材の不満も給与だけでは説明できない。価格抵抗も金額以外の地層を掘ると、打ち手が変わる。',
    combo: ['地層を聞く', '不安を掘る', '説明を固める'],
    script: '「高いと感じる理由は、予算枠・比較先・社内説明のどれに近いですか？」',
    outcome: '抵抗分解 → 対策明確化 → 納得',
    research: '正式用語: 価格知覚 / 損失回避｜メタ分析: カリフォルニア工科大学 / Colin F. Camerer教授',
  },
  稟議地図: {
    hook: '承認者・反対者・必要資料を地図化し、止まる場所を先に読む。',
    lecture: '組織内で人が動くには、役割と関係性の地図が必要。営業も稟議の通路を見える化すれば、止まる前に手が打てる。',
    combo: ['通路を見る', '罠を読む', '資料を置く'],
    script: '「稟議が止まるとしたら、誰のどんな不安が一番大きそうですか？」',
    outcome: '迷宮可視化 → 反対先回り → 稟議推進',
    research: '正式用語: 役割葛藤 / 組織コミットメント｜メタ分析: ウェスタン大学 / John P. Meyer教授',
  },
  合意の石板: {
    hook: '何で判断するかを先に刻み、あとから揺れない比較軸を作る。',
    lecture: '人材選考で評価基準が曖昧だとブレる。営業でも比較基準を先に合意しておくと、後半の迷いが減る。',
    combo: ['基準を決める', '重みを置く', '合意を残す'],
    script: '「今回の判断基準を、成果・工数・リスクの3つで置いてもよいですか？」',
    outcome: '比較軸固定 → 迷い減少 → 合意',
    research: '正式用語: 意思決定フレーミング / 評価基準｜メタ分析: プリンストン大学 / Daniel Kahneman教授',
  },
  リスク耐性: {
    hook: '導入後の失敗イメージを先に扱い、安心して進める地盤を固める。',
    lecture: '人材採用でも失敗リスクを先に扱うほど、意思決定しやすい。営業では不安を隠さず、対策込みで見せる。',
    combo: ['失敗を聞く', '対策を置く', '小さく始める'],
    script: '「失敗するとしたらどこだと思いますか？そこから先に潰します。」',
    outcome: '不安低下 → 安心材料 → 前進',
    research: '正式用語: リスク知覚 / 事前検死｜メタ分析: オレゴン大学 / Paul Slovic教授',
  },
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

          <div className="relative grid min-h-[auto] gap-5 px-4 pb-0 pt-6 sm:px-8 sm:pt-8 lg:min-h-[560px] lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pt-9">
            <div className="relative z-10 flex flex-col justify-center pb-8 lg:pb-10">
              <div className="mb-5 inline-flex w-fit max-w-full items-center gap-3 rounded-md border border-[#d7ad59]/35 bg-[#07111a]/78 px-3 py-2 text-[12px] font-black leading-5 text-[#fff3d8] shadow-[0_14px_28px_-26px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:mb-7 sm:px-4 sm:text-[13px]">
                <span className="h-1.5 w-7 shrink-0 rounded-full bg-[#d7ad59] sm:w-9" />
                論文と本の知見を、博士が現場の攻略カードに変換する。
              </div>

              <h1 className="font-display text-[2.45rem] font-black leading-[1.05] text-[#fffaf0] drop-shadow-[0_12px_34px_rgba(0,0,0,0.75)] min-[390px]:text-[2.75rem] sm:text-[4rem] lg:text-[4.2rem] xl:text-[4.7rem]">
                <span className="sm:whitespace-nowrap">はぐれ博士の</span>
                <span className="block text-[#f2cb77] sm:whitespace-nowrap">営業武器庫</span>
              </h1>

              <p className="mt-4 max-w-[700px] text-sm font-black leading-7 text-[#fff3d8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.7)] sm:mt-5 sm:text-lg sm:leading-8">
                アダム・グラント系の本や行動科学の知見を、商談・失注・稟議・信頼形成で使える攻略カードに変える営業エンタメメディア。
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href="#psychology-situations"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59] bg-[#061727] px-5 text-sm font-black text-[#f5d486] shadow-[0_18px_40px_-26px_rgba(6,23,39,0.8)] transition-transform hover:-translate-y-0.5 sm:h-16 sm:px-7 sm:text-base"
                >
                  <Target size={22} />
                  状況別攻略を見る
                  <ArrowRight size={20} />
                </a>
                <Link
                  href="/media/sales-dragon-academy"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59]/45 bg-[#07111a]/80 px-5 text-sm font-black text-[#fff3d8] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334] sm:h-16 sm:px-7 sm:text-base"
                >
                  <span className="text-2xl">竜</span>
                  営業竜学園を見る
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div id="psychology-professor" className="relative z-10 min-h-[430px] sm:min-h-[520px] lg:min-h-[540px]">
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

              <div className="absolute right-0 top-[112px] w-[292px] rounded-lg border border-[#d7ad59]/45 bg-[#061727]/95 p-4 text-[#fff3d8] shadow-[0_20px_50px_-32px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-5 max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:bottom-5 max-sm:w-auto">
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
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

const modalArtworkByTitle: Record<string, string> = {
  熱量点火: '/media/school/sabotage-reopen-dragon-modal-safe.png',
  決断ファイア: '/media/school/decision-fire-dragon-modal-full.png',
  価格分解: '/media/school/prep-semi-structure-dragon-modal-safe.png',
  稟議停滞: '/media/psychology/approval-maze-modal-fullbleed-v2.png',
  決裁者不在: '/media/psychology/decision-maker-absent-modal-v2.png',
  リスク耐性: '/media/school/sabotage-overquality-dragon-modal-safe.png',
}

const modalLeftTitleByTitle: Record<string, string> = {
  質問力: '水流の問いを放つ',
  傾聴スキル: '水温を合わせる',
  理解力: '構造を見抜く',
  影響力: '意味を反転する',
  初回商談: '警戒水位を下げる',
  価格抵抗: '高いの地層を掘る',
  稟議停滞: '社内迷宮を照らす',
  決裁者不在: '空席の王座を読む',
  価格交渉: '着地点を鍛える',
  クロージング: '迷いを火に変える',
  信頼形成: '信用の水路を作る',
  動機づけ: '動く理由を灯す',
  熱量点火: '変化の火種を入れる',
  先送り焼却: '先送りを燃やす',
  決断ファイア: '決断の炎を整える',
  反論ブースト: '反論を推進力に変える',
  水流ヒアリング: '本音の水路を開く',
  共感ミラー: '感情を映して返す',
  沈黙リカバリー: '沈黙を余白に変える',
  納得の水路: '合意まで流す',
  決裁サーチ: '決裁の雷脈を探る',
  優先度スパーク: '優先順位に電流を通す',
  要点圧縮: '一文へ圧縮する',
  次アクション雷鳴: '次の一手を鳴らす',
  価格分解: '価格の岩盤を割る',
  稟議地図: '承認ルートを刻む',
  合意の石板: '判断基準を刻む',
  リスク耐性: '不安の地盤を固める',
}

const modalStrategyCopyByTitle: Record<string, { title: string; technique: string; meaning: string }> = {
  質問力: {
    title: '水流の問いで、判断地図を開く',
    technique: '水流共鳴',
    meaning: '相手が「理解されている」と感じる聞き方で、信頼の入口を開く。',
  },
  傾聴スキル: {
    title: '水温を合わせ、本音の水路を開く',
    technique: '静水チューニング',
    meaning: '相手の言葉と感情を急かさず受け止め、話しやすい場を作る。',
  },
  理解力: {
    title: '発言の奥にある構造を見抜く',
    technique: '構造透視',
    meaning: '課題・感情・社内事情を分けて、次に扱うべき論点を浮かび上がらせる。',
  },
  影響力: {
    title: '意味を反転し、判断基準を動かす',
    technique: '意味変換炉',
    meaning: '押し切らず、相手の見え方を変えて自分で動きたくなる理由を作る。',
  },
  初回商談: {
    title: '最初の3分で警戒水位を下げる',
    technique: '温感フィールド',
    meaning: '提案前に安心して話せる空気を作り、敵ではなく伴走者として入る。',
  },
  価格抵抗: {
    title: '「高い」の地層を掘り分ける',
    technique: '価値採掘',
    meaning: '金額・不安・優先度・社内説明を分けて、値引き以外の攻略口を探す。',
  },
  稟議停滞: {
    title: '止まった稟議の迷宮を照らす',
    technique: '承認ルート照明',
    meaning: '関係者・反対理由・必要資料を地図化し、止まる前に通路を作る。',
  },
  決裁者不在: {
    title: '空席の王座から評価軸を読む',
    technique: '雷脈サーチ',
    meaning: '会えていない決裁者の不安と判断基準を、担当者の言葉から逆算する。',
  },
  価格交渉: {
    title: '値引き合戦を条件交換に変える',
    technique: '均衡鍛冶',
    meaning: '価格だけで削り合わず、範囲・時期・条件を組み替えて着地点を作る。',
  },
  クロージング: {
    title: '迷いを残さず、最後の一歩を渡す',
    technique: '決断点火',
    meaning: '未処理の不安を確認し、相手が自分で進める状態まで整える。',
  },
  信頼形成: {
    title: 'リスクを預けられる根拠を積む',
    technique: '信用結晶',
    meaning: '好感だけに頼らず、約束・根拠・先回りで安心材料を積み上げる。',
  },
  動機づけ: {
    title: '動く理由を本人の言葉にする',
    technique: '理由点火',
    meaning: '外から押すのではなく、相手の中にある変えたい未来を言語化する。',
  },
  熱量点火: {
    title: '変えたい未来に火種を入れる',
    technique: '未来点火',
    meaning: '課題ではなく、変化後の理想を聞き出して前へ進む熱量を作る。',
  },
  先送り焼却: {
    title: '「今じゃない」を静かに燃やす',
    technique: '延期焼却',
    meaning: '先送りの理由と放置コストを分け、着手できる小さな火口を作る。',
  },
  決断ファイア: {
    title: '迷いを、選べる状態まで整える',
    technique: '選択炉',
    meaning: '選択肢と比較軸を絞り、決める順番を作って判断負荷を下げる。',
  },
  反論ブースト: {
    title: '反論を前進エネルギーに変える',
    technique: '抵抗変換',
    meaning: '反論を拒絶と見なさず、不安の背景を聞いて前進条件へ変える。',
  },
  水流ヒアリング: {
    title: '本音が流れ出す水路を開く',
    technique: '水流開門',
    meaning: '質問攻めにせず、相手が自分の言葉で整理できる会話の流れを作る。',
  },
  共感ミラー: {
    title: '感情を映し、会話の水面を整える',
    technique: '共鳴鏡',
    meaning: '相手の言葉と感情を映し返し、話しながら整理できる状態を作る。',
  },
  沈黙リカバリー: {
    title: '沈黙を、考えが出る余白に変える',
    technique: '静寂保護',
    meaning: '沈黙を焦って埋めず、相手が言葉を探す時間として守る。',
  },
  納得の水路: {
    title: '押し切らず、合意まで流す',
    technique: '納得導流',
    meaning: '理解・合意・次アクションの順で、自然に進める会話の道を作る。',
  },
  決裁サーチ: {
    title: '決裁者の評価軸を雷で探る',
    technique: '決裁雷探',
    meaning: '担当者の言葉から、会えていない決裁者の関心と不安を探知する。',
  },
  優先度スパーク: {
    title: '後回し案件に電流を通す',
    technique: '優先度放電',
    meaning: '放置コストと今やる意味を並べ、優先順位の見え方を変える。',
  },
  要点圧縮: {
    title: '長い説明を、一撃の要点に圧縮する',
    technique: '一文圧縮',
    meaning: '決裁者が判断しやすいよう、目的・効果・リスク対策に絞る。',
  },
  次アクション雷鳴: {
    title: '曖昧な宿題に次の雷鳴を落とす',
    technique: '次手雷鳴',
    meaning: '誰が・いつまでに・何を確認するかを決めて停滞を防ぐ。',
  },
  価格分解: {
    title: '価格の岩盤を割り、抵抗を分解する',
    technique: '地層分解',
    meaning: '予算・比較先・不安・社内説明を掘り分け、打ち手を明確にする。',
  },
  稟議地図: {
    title: '承認ルートを石板に刻む',
    technique: '稟議刻印',
    meaning: '承認者・反対者・必要資料を見える化し、止まる場所を先に読む。',
  },
  合意の石板: {
    title: '判断基準を先に刻み、迷いを止める',
    technique: '基準刻印',
    meaning: '何で比較するかを先に合意し、後半で判断軸が揺れないようにする。',
  },
  リスク耐性: {
    title: '不安の地盤を固め、前進できる足場を作る',
    technique: '不安固化',
    meaning: '失敗イメージを先に扱い、対策込みで安心して進める状態を作る。',
  },
}

function PsychologyStrategyModal({
  card,
  onClose,
}: {
  card: PsychologyCard
  onClose: () => void
}) {
  const lesson = arsenalLessons[card.title] ?? {
    hook: card.copy,
    lecture: '現場で起きる違和感を観察し、顧客の判断軸・不安・優先順位に分けて攻略する。',
    combo: ['観察する', '分解する', '次の一手にする'] as [string, string, string],
    script: '「今の状況を一緒に整理すると、どこから手をつけるのが一番よさそうですか？」',
    outcome: '観察 → 仮説 → 次アクション',
    research: '正式用語: 行動科学 / 組織心理学｜メタ分析: ノースイースタン大学 / Judith A. Hall教授',
  }
  const modalImage = modalArtworkByTitle[card.title] ?? card.modalImage ?? card.image
  const leftTitle = modalLeftTitleByTitle[card.title] ?? `${card.label}を発動`
  const modalCopy = modalStrategyCopyByTitle[card.title] ?? {
    title: `${leftTitle}。現場の詰まりを突破する`,
    technique: card.label,
    meaning: lesson.hook,
  }
  const strategyRows = [
    { tag: '竜技名', text: modalCopy.technique },
    { tag: '技の意味', text: modalCopy.meaning },
    { tag: '使用例', text: lesson.script },
    { tag: '効果', text: lesson.outcome },
  ]
  const researchText = lesson.research.replace(/^正式用語:\s*/, '').replace('｜メタ分析: ', ' / ')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/80 px-4 py-5 text-[#fff3d8] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="psychology-strategy-card-title"
      onClick={onClose}
    >
      <div
        className="relative grid max-h-[88vh] w-full max-w-6xl overflow-y-auto overflow-x-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] shadow-[0_32px_90px_-34px_rgba(0,0,0,0.95)] md:grid-cols-[0.86fr_1.14fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="攻略カードを閉じる"
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-[#d7ad59]/35 bg-[#061727]/86 text-[#fff3d8] backdrop-blur-sm transition-colors hover:bg-[#102334] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d486]"
        >
          <X size={18} />
        </button>

        <div className="relative flex min-h-[390px] flex-col justify-between bg-[#030b12] sm:min-h-[430px] md:min-h-[500px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_36%,rgba(107,198,217,0.24),transparent_34%),linear-gradient(180deg,rgba(5,17,27,0.92),rgba(5,17,27,0.72))]" />
          <Image
            src={modalImage}
            alt={`${card.title}を象徴する戦略アート`}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover object-center opacity-95"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,17,27,0.02),rgba(5,17,27,0.16)_44%,rgba(5,17,27,0.97))]" />
          <div className="relative mt-auto p-5">
            <div className="w-fit rounded-full px-3 py-1 text-[11px] font-black text-[#04111d]" style={{ background: card.accent }}>
              {card.label}
            </div>
            <h2 className="mt-3 truncate whitespace-nowrap font-display text-3xl font-black leading-tight text-white drop-shadow-[0_10px_26px_rgba(0,0,0,0.9)] sm:text-4xl">
              {leftTitle}
            </h2>
            <p className="mt-2 max-w-[390px] truncate whitespace-nowrap text-[13px] font-black leading-6 text-[#fff3d8]">{lesson.hook}</p>
          </div>
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,212,134,0.04)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.035)_1px,transparent_1px)] bg-[length:34px_34px]" />
          <div className="relative flex h-full flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <div className="max-w-full truncate whitespace-nowrap rounded-full border border-[#6bc6d9]/45 bg-[#6bc6d9]/14 px-3 py-1 text-[11px] font-black text-[#bfefff]">
                はぐれ博士の営業武器庫 / {card.title}
              </div>
            </div>
            <h3
              id="psychology-strategy-card-title"
              className="mt-4 truncate whitespace-nowrap font-display text-[clamp(28px,2.7vw,40px)] font-black leading-tight text-[#fff3d8]"
            >
              {modalCopy.title}
            </h3>

            <div className="mt-5 grid gap-2.5">
              {strategyRows.map((row) => (
                <div
                  key={row.tag}
                  className="flex items-center gap-3 rounded-md border border-[#d7ad59]/20 bg-[#07111a]/76 px-3 py-3"
                >
                  <span className="shrink-0 rounded-full bg-[#d7ad59] px-2.5 py-1 text-[10px] font-black text-[#07111a]">
                    {row.tag}
                  </span>
                  <span className="min-w-0 flex-1 truncate whitespace-nowrap text-[13px] font-bold leading-6 text-[#fff3f5]">
                    {row.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-[#6bc6d9]/20 bg-[#020a10]/72 px-3.5 py-3 text-[11px] font-black leading-5 text-[#bfefff]">
              <div className="flex min-w-0 items-center gap-2">
                <BrainCircuit size={16} className="shrink-0" />
                <span className="shrink-0 rounded-full bg-[#6bc6d9] px-2.5 py-1 text-[10px] font-black leading-none text-[#04111d]">
                  メタ分析
                </span>
                <span className="min-w-0 flex-1 truncate">{researchText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
