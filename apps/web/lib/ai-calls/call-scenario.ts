import { randomUUID } from 'crypto'
import { prisma } from '@bgm/db'

export type CallScenarioSettings = {
  id?: string
  key: string
  name: string
  objective: string
  openingTalk: string
  requiredQuestions: string[]
  optionalQuestions: string[]
  ngResponses: string[]
  schedulingPolicy: string
  handoffConditions: string[]
  completionCriteria: string
  ragSources: string[]
  enabled: boolean
  updatedAt?: string
}

export const INQUIRY_SCENARIO_KEY = 'inquiry-default'
export const BDR_OUTBOUND_SCENARIO_KEY = 'bdr-outbound'

export const DEFAULT_INQUIRY_CALL_SCENARIO: CallScenarioSettings = {
  key: INQUIRY_SCENARIO_KEY,
  name: 'HP問い合わせ後・未予約フォロー',
  objective:
    'ホームページの資料請求またはお問い合わせ後、約3分経っても日程調整が完了していない相手へ架電する。相談背景、検討温度感、次回商談で扱う議題を整理し、可能な限り電話口で日程を確定する。',
  openingTalk:
    'FDE CRMへのお問い合わせありがとうございます。日程調整がまだ完了していないようでしたので、確認と事前ヒアリングでお電話しました。いま1、2分だけお話ししてもよろしいでしょうか。',
  requiredQuestions: [
    '受付段階: まず本人確認として、資料請求またはお問い合わせをいただいたご本人かを確認する',
    '受付段階: いま短く話せるかを確認し、難しければ都合のよい時間帯を1つだけ聞く',
    'ファーストビュー: 問い合わせ背景を一言で聞く。例「今回お問い合わせいただいた背景を、簡単に教えていただけますか」',
    '課題確認: 問い合わせ対応、営業ヒアリング、商談化、日程調整、CRM活動履歴化のどこに一番課題があるか聞く',
    '次ステップ確認: 見積もり、サービス詳細、営業戦略相談、実行パートナー相談のどれに近いか聞く',
    '商談調整: 商談参加者の名前、メールアドレス、希望時間帯を確認する',
    '商談準備: 次回商談で必ず話したい議題を1つ確認する',
  ],
  optionalQuestions: [
    '不在時: 留守電なら、問い合わせのお礼、折り返し不要でも日程調整リンクから予約できる旨、再度連絡する可能性を短く残す',
    '担当者不在: 担当者が違う場合は、問い合わせまたは営業DXに関わる方へ取り次ぎ可能か確認する',
    '用件確認: すでにGoogleカレンダーで予約済みと言われた場合は、予定が取れている前提で事前ヒアリングだけ短く行う',
    '導入時期: 今すぐ、1か月以内、未定のどれに近いか確認する',
    '現状ツール: 現在使っているCRM、スプレッドシート、問い合わせ管理ツールを確認する',
    '意思決定: 次回商談に同席すべき決裁者または現場責任者がいるか確認する',
  ],
  ngResponses: [
    '今は不要: 「承知しました。今すぐ導入前提でなくても、問い合わせ対応や商談化の改善余地だけ15分で整理できます」と返し、短い相談枠を提案する',
    '資料だけでよい: 「資料はお送りします。御社に合うかだけ先に確認できると、見るべき箇所を絞れます」と返し、1問だけ背景を聞く',
    '忙しい: 「失礼しました。30秒だけ、折り返し希望の有無か日程候補だけ確認してもよろしいでしょうか」と返す',
    '担当ではない: 「失礼しました。営業管理や問い合わせ対応を見ている方におつなぎいただくことは可能でしょうか」と聞く',
    'AIへの不信感: AIであることを隠さず、日程調整と事前確認だけを行う補助であると説明する',
    '確定していない料金、成果、導入効果を断定しない',
    '医療、法律、税務など専門家判断が必要な助言は行わない',
  ],
  schedulingPolicy:
    '発火条件は、HPの資料請求またはお問い合わせ作成後、約3分経ってもGoogleカレンダーの予約完了が確認できない場合。Google Calendarの空き枠を確認し、平日10:00-18:00の30分枠を優先して2から3候補提示する。相手が合意した日時で予定を作成し、電話で日程確定済みであることを伝える。',
  handoffConditions: [
    '相手が強い不満やクレームを表明した',
    '料金交渉や契約条件の個別判断を求めた',
    'AIでは回答できない技術詳細や個別提案を求めた',
    '競合比較、代理店契約、個別見積もりなど人間の営業判断が必要になった',
    '通話継続を明確に拒否した',
  ],
  completionCriteria:
    'クロージングでは、確認した背景、求めている次ステップ、商談議題を復唱する。日程確定できた場合はGoogle Calendar予定を作成し、予定メモに「事前ヒアリング情報」として要約を残す。日程確定できない場合は、希望時間帯、折り返し可否、未確定理由をCRMに残す。',
  ragSources: [],
  enabled: true,
}

export const DEFAULT_BDR_OUTBOUND_CALL_SCENARIO: CallScenarioSettings = {
  key: BDR_OUTBOUND_SCENARIO_KEY,
  name: 'BDRアウトバウンド初回接続',
  objective:
    'ターゲット企業へBDRとして架電し、営業組織、問い合わせ対応、商談化、CRM運用の課題仮説を短く提示する。受付突破、担当者接続、課題確認、15分商談化までを狙う。',
  openingTalk:
    '突然のお電話失礼いたします。FDE CRMの営業支援担当です。営業管理や問い合わせ対応の効率化について、御社に関係しそうな件で短くご連絡しました。営業企画または新規営業のご担当者様はいらっしゃいますでしょうか。',
  requiredQuestions: [
    '受付段階: 社名と用件を短く名乗り、営業企画、新規営業、マーケティング、問い合わせ対応の担当者につないでもらう',
    '受付段階: 担当部署が不明な場合は、営業数字や新規商談の管理を見ている部署を確認する',
    '担当接続: 30秒だけよいか確認し、長く話し始めない',
    'ファーストビュー: 「問い合わせや新規リードが来た後、初動対応や商談化率の改善余地がある企業様向けのご連絡です」と短く伝える',
    '課題確認: 問い合わせ後の初動、営業ヒアリング、日程調整、CRM入力、失注理由管理のどれに近い課題があるか聞く',
    '温度感確認: 今すぐ改善したい、情報収集、担当外のどれに近いか聞く',
    'クロージング: 15分だけ、御社の営業フローに当てはまるか確認する場を提案する',
  ],
  optionalQuestions: [
    '不在時: 担当者名、部署、戻り時間、再架電可能時間を確認する',
    '担当者不在: メール送付の許可を取り、送付先メールアドレスと担当者名を確認する',
    '用件深掘り: 現在のリード管理方法がCRM、スプレッドシート、MA、手作業のどれか確認する',
    '規模確認: 月間問い合わせ数、架電対象数、商談数を大まかに確認する',
    '既存ツール確認: Salesforce、HubSpot、kintone、スプレッドシートなど利用中ツールを確認する',
    '決裁導線: 現場責任者、営業責任者、経営者の誰が検討に関わるか確認する',
  ],
  ngResponses: [
    '今は不要: 「承知しました。営業組織によっては不要なケースもあります。今後見直すなら、問い合わせ後の初動と商談化率のどちらがテーマになりそうでしょうか」と1問だけ聞く',
    '資料だけ送って: 「承知しました。御社に関係しそうな箇所だけ絞って送るため、営業管理と問い合わせ対応のどちらに近いですか」と聞く',
    '担当者ではない: 「失礼しました。営業企画、新規営業、マーケティングのいずれかに近い部署はございますか」と聞く',
    '忙しい: 「失礼しました。再度ご連絡するなら、本日午後と明日午前のどちらがまだご迷惑でないでしょうか」と聞く',
    '営業電話お断り: 謝意を伝えて即終了し、再架電しないフラグを残す',
    '競合他社を断定的に否定しない',
    '個別の成果、費用対効果、導入効果を保証しない',
  ],
  schedulingPolicy:
    'BDRアウトバウンドでは、初回通話中に長い説明をしない。担当者が興味を示した場合のみ、平日10:00-18:00の15分または30分枠を2候補提示する。受付や担当外の場合は、再架電時間、担当者名、メール送付可否を取得してCRMに残す。',
  handoffConditions: [
    '担当者が具体的な導入相談、見積もり、セキュリティ確認を求めた',
    '代理店、提携、個別開発など通常BDR範囲外の相談になった',
    'クレーム、営業停止希望、個人情報に関する懸念が出た',
    '役員または決裁者と直接商談化できそうな強い関心が出た',
  ],
  completionCriteria:
    '通話後は、接続結果、担当者名、部署、課題仮説、温度感、次アクションをCRMに残す。商談化できた場合は予定を作成し、できない場合は再架電日、メール送付、NG理由のいずれかを明確にする。',
  ragSources: [],
  enabled: true,
}

export const DEFAULT_CALL_SCENARIOS = [
  DEFAULT_INQUIRY_CALL_SCENARIO,
  DEFAULT_BDR_OUTBOUND_CALL_SCENARIO,
]

type ScenarioRow = {
  id: string
  key: string
  name: string
  objective: string
  openingTalk: string
  requiredQuestions: string[]
  optionalQuestions: string[]
  ngResponses: string[]
  schedulingPolicy: string
  handoffConditions: string[]
  completionCriteria: string
  ragSources: string[]
  enabled: boolean
  updatedAt: Date
}

export async function getCallScenario(
  orgId: string,
  key = INQUIRY_SCENARIO_KEY,
): Promise<CallScenarioSettings> {
  const defaultScenario = defaultScenarioForKey(key)
  const rows = await prisma.$queryRaw<ScenarioRow[]>`
    SELECT
      "id",
      "key",
      "name",
      "objective",
      "openingTalk",
      "requiredQuestions",
      "optionalQuestions",
      "ngResponses",
      "schedulingPolicy",
      "handoffConditions",
      "completionCriteria",
      "ragSources",
      "enabled",
      "updatedAt"
    FROM "CallScenario"
    WHERE "orgId" = ${orgId} AND "key" = ${defaultScenario.key}
    LIMIT 1
  `.catch((error) => {
    console.warn('[call-scenario] read failed; falling back to default', error)
    return []
  })

  const row = rows[0]
  if (!row) return defaultScenario
  return rowToScenario(row)
}

export async function getCallScenarios(orgId: string): Promise<CallScenarioSettings[]> {
  const keys = DEFAULT_CALL_SCENARIOS.map((scenario) => scenario.key)
  const rows = await prisma.$queryRaw<ScenarioRow[]>`
    SELECT
      "id",
      "key",
      "name",
      "objective",
      "openingTalk",
      "requiredQuestions",
      "optionalQuestions",
      "ngResponses",
      "schedulingPolicy",
      "handoffConditions",
      "completionCriteria",
      "ragSources",
      "enabled",
      "updatedAt"
    FROM "CallScenario"
    WHERE "orgId" = ${orgId} AND "key" = ANY(${keys}::text[])
  `.catch((error) => {
    console.warn('[call-scenario] list failed; falling back to defaults', error)
    return []
  })

  const byKey = new Map(rows.map((row) => [row.key, rowToScenario(row)]))
  return DEFAULT_CALL_SCENARIOS.map((defaultScenario) => byKey.get(defaultScenario.key) ?? defaultScenario)
}

export async function getInquiryCallScenario(orgId: string): Promise<CallScenarioSettings> {
  return getCallScenario(orgId, INQUIRY_SCENARIO_KEY)
}

function rowToScenario(row: ScenarioRow): CallScenarioSettings {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    objective: row.objective,
    openingTalk: row.openingTalk,
    requiredQuestions: row.requiredQuestions,
    optionalQuestions: row.optionalQuestions,
    ngResponses: row.ngResponses,
    schedulingPolicy: row.schedulingPolicy,
    handoffConditions: row.handoffConditions,
    completionCriteria: row.completionCriteria,
    ragSources: row.ragSources,
    enabled: row.enabled,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function upsertCallScenario(
  orgId: string,
  input: CallScenarioSettings,
): Promise<CallScenarioSettings> {
  const scenario = normalizeScenarioInput(input)
  const rows = await prisma.$queryRaw<ScenarioRow[]>`
    INSERT INTO "CallScenario" (
      "id",
      "orgId",
      "key",
      "name",
      "objective",
      "openingTalk",
      "requiredQuestions",
      "optionalQuestions",
      "ngResponses",
      "schedulingPolicy",
      "handoffConditions",
      "completionCriteria",
      "ragSources",
      "enabled",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${randomUUID()},
      ${orgId},
      ${scenario.key},
      ${scenario.name},
      ${scenario.objective},
      ${scenario.openingTalk},
      ${scenario.requiredQuestions}::text[],
      ${scenario.optionalQuestions}::text[],
      ${scenario.ngResponses}::text[],
      ${scenario.schedulingPolicy},
      ${scenario.handoffConditions}::text[],
      ${scenario.completionCriteria},
      ${scenario.ragSources}::text[],
      ${scenario.enabled},
      NOW(),
      NOW()
    )
    ON CONFLICT ("orgId", "key") DO UPDATE SET
      "name" = EXCLUDED."name",
      "objective" = EXCLUDED."objective",
      "openingTalk" = EXCLUDED."openingTalk",
      "requiredQuestions" = EXCLUDED."requiredQuestions",
      "optionalQuestions" = EXCLUDED."optionalQuestions",
      "ngResponses" = EXCLUDED."ngResponses",
      "schedulingPolicy" = EXCLUDED."schedulingPolicy",
      "handoffConditions" = EXCLUDED."handoffConditions",
      "completionCriteria" = EXCLUDED."completionCriteria",
      "ragSources" = EXCLUDED."ragSources",
      "enabled" = EXCLUDED."enabled",
      "updatedAt" = NOW()
    RETURNING
      "id",
      "key",
      "name",
      "objective",
      "openingTalk",
      "requiredQuestions",
      "optionalQuestions",
      "ngResponses",
      "schedulingPolicy",
      "handoffConditions",
      "completionCriteria",
      "ragSources",
      "enabled",
      "updatedAt"
  `
  const row = rows[0]
  if (!row) throw new Error('CallScenario upsert returned no rows')
  return rowToScenario(row)
}

export async function upsertInquiryCallScenario(
  orgId: string,
  input: CallScenarioSettings,
): Promise<CallScenarioSettings> {
  return upsertCallScenario(orgId, { ...input, key: INQUIRY_SCENARIO_KEY })
}

export function buildInquiryCallScript(scenario: CallScenarioSettings) {
  return [
    `目的: ${scenario.objective}`,
    `冒頭トーク: ${scenario.openingTalk}`,
    '',
    '必須ヒアリング:',
    ...scenario.requiredQuestions.map((item) => `- ${item}`),
    '',
    '任意ヒアリング:',
    ...scenario.optionalQuestions.map((item) => `- ${item}`),
    '',
    'NG/制約:',
    ...scenario.ngResponses.map((item) => `- ${item}`),
    '',
    `日程調整方針: ${scenario.schedulingPolicy}`,
    '',
    '人間引継ぎ条件:',
    ...scenario.handoffConditions.map((item) => `- ${item}`),
    '',
    `完了条件: ${scenario.completionCriteria}`,
    '',
    formatRagSourcesForPrompt(scenario.ragSources),
  ].join('\n')
}

function formatRagSourcesForPrompt(sources: string[]) {
  const text = sources.find((source) => source.startsWith('text:'))?.slice('text:'.length)
  const pdfs = sources
    .filter((source) => source.startsWith('pdf:'))
    .map((source) => source.slice('pdf:'.length))
    .filter(Boolean)
  return [
    '事前学習データ:',
    `- テキスト: ${text || '未設定'}`,
    `- PDF: ${pdfs.length ? pdfs.join(', ') : '未設定'}`,
  ].join('\n')
}

function normalizeScenarioInput(input: CallScenarioSettings): CallScenarioSettings {
  const defaultScenario = defaultScenarioForKey(input.key)
  return {
    ...defaultScenario,
    ...input,
    key: defaultScenario.key,
    name: cleanText(input.name, defaultScenario.name, 120),
    objective: cleanText(input.objective, defaultScenario.objective, 4000),
    openingTalk: cleanText(input.openingTalk, defaultScenario.openingTalk, 3000),
    requiredQuestions: cleanList(input.requiredQuestions, 40),
    optionalQuestions: cleanList(input.optionalQuestions, 40),
    ngResponses: cleanList(input.ngResponses, 40),
    schedulingPolicy: cleanText(
      input.schedulingPolicy,
      defaultScenario.schedulingPolicy,
      4000,
    ),
    handoffConditions: cleanList(input.handoffConditions, 40),
    completionCriteria: cleanText(
      input.completionCriteria,
      defaultScenario.completionCriteria,
      4000,
    ),
    ragSources: cleanList(input.ragSources, 40),
    enabled: Boolean(input.enabled),
  }
}

function defaultScenarioForKey(key: string) {
  return DEFAULT_CALL_SCENARIOS.find((scenario) => scenario.key === key) ?? DEFAULT_INQUIRY_CALL_SCENARIO
}

function cleanText(value: unknown, fallback: string, max: number) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback
}

function cleanList(value: unknown, max = 20) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, max)
}
