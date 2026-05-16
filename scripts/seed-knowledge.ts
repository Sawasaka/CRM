/**
 * チームFAQ・Driveフォルダ連携の動作確認用ダミーデータ投入スクリプト。
 *
 * 使い方:
 *   tsx scripts/seed-knowledge.ts                # 既存の最初の Organization に投入
 *   tsx scripts/seed-knowledge.ts --org=<orgId>  # 指定 Organization に投入
 *   tsx scripts/seed-knowledge.ts --reset        # 既存の FaqEntry / DriveFolderConnection を全削除して再投入
 *
 * 部門 > カテゴリ の2階層で投入する。
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['error'] })

function arg(name: string): string | true | undefined {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return undefined
  if (!hit.includes('=')) return true
  return hit.split('=', 2)[1]
}

async function main() {
  const orgArg = arg('org')
  const reset = arg('reset') === true

  // 1) 対象 Organization 決定
  let orgId: string
  if (typeof orgArg === 'string') {
    const o = await prisma.organization.findUnique({ where: { id: orgArg } })
    if (!o) throw new Error(`Organization not found: ${orgArg}`)
    orgId = o.id
  } else {
    const first = await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } })
    if (!first) throw new Error('Organization が1件も存在しません。先に Organization を作ってください。')
    orgId = first.id
  }
  console.log(`🏢 Organization: ${orgId}`)

  if (reset) {
    console.log('🧹 既存のナレッジデータを削除...')
    await prisma.faqEntry.deleteMany({ where: { orgId } })
    await prisma.driveFolderConnection.deleteMany({ where: { orgId } })
  }

  // 2) ユーザー取得（必要ならダミー作成）
  const existingUsers = await prisma.user.findMany({
    where: { orgId },
    orderBy: { createdAt: 'asc' },
    take: 4,
  })
  let users = existingUsers
  if (users.length === 0) {
    console.log('👥 User が居ないのでダミー2名作成します')
    const dummies = [
      { email: 'sawasaka@example.com', name: '澤坂 寛之', role: 'ADMIN' as const },
      { email: 'tanaka@example.com', name: '田中 美和', role: 'MANAGER' as const },
    ]
    users = await Promise.all(
      dummies.map((d) =>
        prisma.user.create({
          data: { ...d, orgId },
        }),
      ),
    )
  }
  const [u1, u2] = [users[0]!, users[1] ?? users[0]!]

  // 3) FaqEntry 投入
  console.log('📚 FaqEntry を投入...')
  const faqSeeds: Array<{
    title: string
    body: string
    department: string
    category: string
    status: 'PUBLISHED' | 'CANDIDATE' | 'ARCHIVED'
    sourceType: 'MANUAL' | 'SLACK' | 'DRIVE' | 'GOOGLE_CHAT'
    sourceUrl?: string
    hits?: number
    approvedById?: string
  }> = [
    // ─── 営業 ───
    {
      title: '初回商談で必ず聞くヒアリング項目（5W2H＋導入時期）',
      body: 'Who/What/Why now/How much/How/When の5W2H。初回でヒアリングは①Whoと⑤Whenを必須、②③④は次回MTGで掘る運用が現実的。',
      department: '営業',
      category: 'ヒアリング',
      status: 'PUBLISHED',
      sourceType: 'SLACK',
      sourceUrl: 'https://example.slack.com/archives/C0127/p1234567895',
      hits: 28,
      approvedById: u1.id,
    },
    {
      title: '失注理由トップ3 と 切り返しトーク',
      body: '1) 「他システムと連携できない」→ REST API/Zapierテンプレ集を提示。2) 「現場が変えたがらない」→ 段階導入＋ベテラン2名先行のパイロット。3) 「価格が高い」→ ROI 表を提示。',
      department: '営業',
      category: '失注分析',
      status: 'PUBLISHED',
      sourceType: 'SLACK',
      sourceUrl: 'https://example.slack.com/archives/C0128/p1234567896',
      hits: 19,
      approvedById: u1.id,
    },
    {
      title: '営業日報の提出締切',
      body: '営業日報は当日 19:00 までに Salesforce の活動オブジェクトに登録。マネージャーレビューは翌朝。',
      department: '営業',
      category: 'オペレーション',
      status: 'PUBLISHED',
      sourceType: 'SLACK',
      sourceUrl: 'https://example.slack.com/archives/C0126/p1234567893',
      hits: 5,
      approvedById: u1.id,
    },
    {
      title: 'コール一発目で「いつ電話したらいい？」を必ず聞く',
      body: '朝イチ(9:00-9:30)と夕方(17:00-18:30)が最も繋がる。「●●様、5分でも10分でも構いません」と必ず聞く運用でコネクト率28%→41%。',
      department: '営業',
      category: 'コール',
      status: 'CANDIDATE',
      sourceType: 'SLACK',
      sourceUrl: 'https://example.slack.com/archives/C0129/p1234567897',
      hits: 0,
    },
    // ─── 人事 ───
    {
      title: '健康診断の予約方法',
      body: 'e健康診断ナビ（https://e-kenko.example.com）から予約。社員番号と Okta SSO でログイン可能。実施期間は5/15〜7/31。',
      department: '人事',
      category: '健診',
      status: 'PUBLISHED',
      sourceType: 'SLACK',
      sourceUrl: 'https://example.slack.com/archives/C0123/p1234567890',
      hits: 6,
      approvedById: u2.id,
    },
    {
      title: '育休復帰後の人事面談タイミング',
      body: '直属マネージャー面談=復帰後3週間以内、人事面談=4週間以内（2026年4月改定）。HR Botから自動招待。届かない場合は @人事 にメンション。',
      department: '人事',
      category: '育休',
      status: 'PUBLISHED',
      sourceType: 'GOOGLE_CHAT',
      sourceUrl: 'https://chat.google.com/room/dummy-hr',
      hits: 3,
      approvedById: u1.id,
    },
    // ─── 経理 ───
    {
      title: '請求書はいつ発行される？',
      body: '月末締め・翌月5営業日以内に経理部から発行。発行希望日指定は前月20日までに #legal-q で申請。',
      department: '経理',
      category: '請求',
      status: 'PUBLISHED',
      sourceType: 'DRIVE',
      sourceUrl: 'https://drive.google.com/file/d/dummy-keiri-rules',
      hits: 14,
      approvedById: u1.id,
    },
    {
      title: '出張時の宿泊費上限',
      body: '国内15,000円/泊（東京・大阪は18,000円）、海外25,000円/泊（NY/LA/London は35,000円）。深夜便前後泊は事前申請で50%まで超過可（経理規程 Article 8.3）。',
      department: '経理',
      category: '経費精算',
      status: 'PUBLISHED',
      sourceType: 'DRIVE',
      sourceUrl: 'https://drive.google.com/file/d/dummy-keihi',
      hits: 22,
      approvedById: u1.id,
    },
    // ─── 法務 ───
    {
      title: '契約書の押印フロー（電子と紙）',
      body: '取引金額500万円以下はクラウドサイン、超過は紙押印（法務レビュー → 代表印申請 → スキャン保管）。',
      department: '法務',
      category: '契約',
      status: 'PUBLISHED',
      sourceType: 'DRIVE',
      sourceUrl: 'https://drive.google.com/file/d/dummy-legal-flow',
      hits: 8,
      approvedById: u2.id,
    },
    {
      title: '業務委託の発注書テンプレ',
      body: 'Drive「法務 / 標準契約 / 業務委託」配下の `発注書_業務委託_v2.docx` が最新。記入後は #legal-q でレビュー依頼。500万円以下なら電子締結可能。',
      department: '法務',
      category: '業務委託',
      status: 'CANDIDATE',
      sourceType: 'SLACK',
      sourceUrl: 'https://example.slack.com/archives/C0124/p1234567891',
      hits: 0,
    },
    {
      title: '【旧】押印申請書の紙運用',
      body: '紙の押印申請書フローは2024年に廃止済み。すべてクラウドサインに移行しました。',
      department: '法務',
      category: '契約',
      status: 'ARCHIVED',
      sourceType: 'MANUAL',
      hits: 0,
      approvedById: u2.id,
    },
    // ─── IT ───
    {
      title: 'VPN接続手順（社外からSalesforceアクセス）',
      body: 'Cisco AnyConnect → vpn.bgm.example.com → Okta SSO 認証。初回はIT に MFA 登録依頼が必要。',
      department: 'IT',
      category: 'ネットワーク',
      status: 'PUBLISHED',
      sourceType: 'MANUAL',
      hits: 11,
      approvedById: u2.id,
    },
    {
      title: 'Slack 連携のトークン更新方法',
      body: 'Slack Workspace 管理画面 → App 管理 → 該当 Bot → 「Reissue Token」で再発行。再発行後は Drive `/IT/secrets/slack-tokens.txt` を更新し、対象システムを再起動。',
      department: 'IT',
      category: 'Slack運用',
      status: 'CANDIDATE',
      sourceType: 'GOOGLE_CHAT',
      sourceUrl: 'https://chat.google.com/room/dummy-it-helpdesk',
      hits: 0,
    },
    // ─── プロダクト ───
    {
      title: 'Salesforce との同期失敗時の対応',
      body: 'BGM 設定 → 連携設定 → Salesforce → 「再認証」を試す。復旧しない場合は @プロダクト 桑原にメンション。直近1時間の sync ログは Datadog `bgm-sync-errors`。',
      department: 'プロダクト',
      category: 'インテグレーション',
      status: 'CANDIDATE',
      sourceType: 'SLACK',
      sourceUrl: 'https://example.slack.com/archives/C0125/p1234567892',
      hits: 0,
    },
  ]
  for (const s of faqSeeds) {
    await prisma.faqEntry.create({
      data: {
        ...s,
        orgId,
        approvedAt: s.status === 'PUBLISHED' ? new Date() : null,
        sourceMeta: s.sourceType === 'SLACK' ? { channel: 'C01' } : undefined,
      },
    })
  }
  console.log(`   ✅ FaqEntry ${faqSeeds.length} 件投入`)

  // 4) DriveFolderConnection 投入（ダミー1件）
  console.log('💾 DriveFolderConnection を投入...')
  await prisma.driveFolderConnection.create({
    data: {
      orgId,
      folderId: 'dummy-folder-shared-bgm',
      folderName: '共有ドライブ / BGM / 社内ナレッジ',
      folderUrl: 'https://drive.google.com/drive/folders/dummy-folder-shared-bgm',
      enabled: true,
      lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastSyncStat: { fileCount: 12, indexedCount: 9, skippedCount: 3, errorCount: 0 } as never,
    },
  })
  console.log(`   ✅ DriveFolderConnection 1 件投入`)

  console.log('\n🎉 シード完了。BGM の /knowledge を開いてください。')
}

main()
  .catch((e) => {
    console.error('❌ seed-knowledge error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
