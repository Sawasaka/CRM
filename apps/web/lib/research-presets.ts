// プリセットプロンプト定義（リサーチチャット用）
// id を入力すると、最終的なプロンプト文に展開される
export type ResearchPreset = {
  id: string
  label: string
  emoji: string
  description: string
  prompt: string
}

const PROMPT_PRE_PITCH =
  'この企業との商談前に、提案者として押さえておくべき情報をまとめてください。\n- 誰宛（部門・役職）に提案するのが効果的か\n- どの課題を切り口にするか\n- 当社のどの強みを推すか\n- 想定される反論と切り返し\n- 商談前に確認しておくべきチェックリスト（業界知識／直近ニュース／キーパーソン／アイスブレイク話題／リスク要因）'

const PROMPT_COMPANY_INTEL =
  'この企業について、営業活動の前提となる情報を収集してください。\n- 直近6ヶ月の事業動向（プレスリリース、新サービス、人事、組織変更、業績、提携、M&A）\n- 採用シグナル・公式SNS・IR情報から推察される経営課題（3〜5点／根拠付き）\n- 社長メッセージ・IR資料・公式SNSから読み取れる経営層の優先事項（3点／根拠引用）\n- キーパーソン（経営層、採用・人事責任者、各事業部責任者、技術顧問・社外取）— 氏名・役職・所属・経歴・情報源を併記'

const PROMPT_SERVICE_RESEARCH =
  'この企業が現在利用していそうなサービス・プロダクトを推察してください。\n- 競合・近接サービス（CRM、MA、SFA、業務システム等）\n- 公式サイトの言及／採用ポジションのスキル要件／SNS発信から得られる根拠\n- 当社サービスで置き換え可能か、置き換える際の論点\n- 既存サービスへの不満や乗り換え動機が読み取れるシグナル'

export const RESEARCH_PRESETS: ResearchPreset[] = [
  {
    id: 'all_in_one',
    label: 'すべて',
    emoji: '✨',
    description: '下記3プリセットを一括で実行',
    prompt:
      'この企業について、以下の3つの観点を一度にまとめてリサーチしてください。\n\n' +
      '【1. 商談前の提案におけるリサーチ】\n' +
      PROMPT_PRE_PITCH +
      '\n\n' +
      '【2. 企業に関する情報収集】\n' +
      PROMPT_COMPANY_INTEL +
      '\n\n' +
      '【3. サービスに関するリサーチ】\n' +
      PROMPT_SERVICE_RESEARCH +
      '\n\n' +
      '回答は上記の3セクションを見出し付きで整理し、それぞれの観点に対する回答を簡潔にまとめてください。',
  },
  {
    id: 'pre_pitch_research',
    label: '商談前の提案におけるリサーチ',
    emoji: '🎯',
    description: '商談前に押さえるべき提案の切り口・確認事項を整理',
    prompt: PROMPT_PRE_PITCH,
  },
  {
    id: 'company_intel',
    label: '企業に関する情報収集',
    emoji: '🏢',
    description: '事業動向・経営課題・キーパーソンなど企業の全体像を把握',
    prompt: PROMPT_COMPANY_INTEL,
  },
  {
    id: 'service_research',
    label: 'サービスに関するリサーチ',
    emoji: '🛠️',
    description: '利用中のサービス・競合プロダクト・置き換え余地を推察',
    prompt: PROMPT_SERVICE_RESEARCH,
  },
]
