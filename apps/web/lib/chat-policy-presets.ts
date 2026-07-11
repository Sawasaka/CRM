export type ChatPolicyPresetId =
  | 'standard'
  | 'company_research'
  | 'pre_meeting'
  | 'account_strategy'

export type ChatPolicyPreset = {
  id: ChatPolicyPresetId
  label: string
  premises: string
  policies: string
}

export type ChatPolicyState = {
  selectedPresetId: ChatPolicyPresetId
  premises: string
  policies: string
}

export const CHAT_POLICY_PRESETS: ChatPolicyPreset[] = [
  {
    id: 'standard',
    label: '標準',
    premises: '',
    policies:
      '回答は簡潔に構造化する。\n根拠がある情報、推測、仮説を分けて書く。\n不明な点は断定せず、次に確認すべき情報を示す。',
  },
  {
    id: 'company_research',
    label: '企業リサーチ',
    premises:
      '目的は営業前の企業理解を深め、初回接点や商談準備に使える材料を整理すること。\n対象企業について、公式サイト、採用情報、IR/ニュース、プレスリリース、導入サービスの兆候、業界動向を優先して見る。\nFDE CRMの営業支援・企業DB・インテント情報と接続できる論点を探す。',
    policies:
      '出力は以下の順でまとめる。\n1. 企業概要\n2. 直近の事業動向\n3. 課題仮説\n4. キーパーソン/接点仮説\n5. 営業アプローチ案\n6. 次に確認すべき情報\n各項目で「根拠」「推測」「仮説」を分ける。\n情報が不足している場合は、不足している情報名を明記する。\n長くなりすぎる場合は、営業判断に効く内容を優先する。',
  },
  {
    id: 'pre_meeting',
    label: '商談準備',
    premises:
      '目的は商談前に、相手の関心・想定課題・提案切り口・確認事項を短時間で把握すること。\n自社サービスの強み、相手企業の直近変化、既存接点、競合/代替手段を合わせて見る。',
    policies:
      '出力は「提案切り口」「刺さりそうな課題」「想定反論」「確認質問」「次アクション」で整理する。\n商談でそのまま使える質問文を3つ入れる。\n断定できない内容は仮説として扱う。',
  },
  {
    id: 'account_strategy',
    label: '攻略方針',
    premises:
      '目的はターゲット企業に対する営業攻略方針を作ること。\n部門、役職、導入決裁、既存ツール、予算化タイミング、関係者の関心を推定する。',
    policies:
      '出力は「狙う部門」「初回接点」「決裁者仮説」「訴求軸」「リスク」「30日アクション」で整理する。\n優先度を High / Middle / Low で付ける。\n次に取得すべきデータを明記する。',
  },
]

export const DEFAULT_CHAT_POLICY_STATE: ChatPolicyState = {
  selectedPresetId: 'company_research',
  premises: CHAT_POLICY_PRESETS.find((p) => p.id === 'company_research')?.premises ?? '',
  policies: CHAT_POLICY_PRESETS.find((p) => p.id === 'company_research')?.policies ?? '',
}

export function resolveChatPolicyPreset(id: string | undefined): ChatPolicyPreset {
  return (
    CHAT_POLICY_PRESETS.find((preset) => preset.id === id) ??
    CHAT_POLICY_PRESETS.find(
      (preset) => preset.id === DEFAULT_CHAT_POLICY_STATE.selectedPresetId
    ) ??
    CHAT_POLICY_PRESETS[0]!
  )
}
