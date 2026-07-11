'use client'

import { useState } from 'react'
import { ArrowRight, CalendarCheck, Sparkles } from 'lucide-react'
import { ConsultationCallButton } from '../ConsultationCallModal'
import { Eyebrow, NebulaBG, ParticleField, Section } from '../atoms'

type FaqItem = {
  id: string
  question: string
  aliases: string[]
  shortAnswer: string
  detail: string
  relatedQuestionIds: string[]
}

type FaqCategory = {
  id: string
  label: string
  summary: string
  questionIds: string[]
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'revenue-infra',
    question: 'AI/DXインフラ設計とは何ですか？',
    aliases: ['AI DXインフラ', '営業インフラ', 'レベニュー基盤', '何をしてくれる', 'サービス概要'],
    shortAnswer: '営業・マーケ・CSの売上接点を、AIとDXツールを使って一社ごとに設計・実装する支援です。',
    detail:
      'Obsidian、Notion、Google Workspace、Microsoft、Zoomなど、すでに社内にあるツールへAIを組み合わせ、売上につながる業務導線としてまとめて設計します。',
    relatedQuestionIds: ['service-portfolio', 'target-company', 'consultation'],
  },
  {
    id: 'service-portfolio',
    question: 'どの領域を構築できますか？',
    aliases: ['対応領域', '何が作れる', 'ポートフォリオ', '構築範囲', '提供内容'],
    shortAnswer: 'Obsidian、Notion、Google Workspace、Microsoft、Zoom、CRM、チャットボットなどを組み合わせて設計できます。',
    detail:
      '企業ごとの営業体制、マーケ施策、問い合わせ導線、既存ツールを確認し、必要な構成だけを選んで実装していきます。',
    relatedQuestionIds: ['crm-build', 'call-ai', 'notion-google'],
  },
  {
    id: 'company-service',
    question: '株式会社ルーキースマートジャパンはどのサービスを提供していますか？',
    aliases: ['ルーキースマートジャパン', '会社のサービス', '提供サービス', '沢坂', 'rookiesmart'],
    shortAnswer: '営業・マーケティング領域のAI/DXインフラを、設計から実装まで支援します。',
    detail:
      '単体ツールを売るのではなく、企業ごとの売上導線に合わせて、AI活用・DX化・外部ツール連携を組み合わせた基盤を設計します。',
    relatedQuestionIds: ['revenue-infra', 'consultation', 'pricing-model'],
  },
  {
    id: 'target-company',
    question: 'どんな会社に向いていますか？',
    aliases: ['向いている会社', '対象企業', 'どんな課題', '誰向け', '導入対象'],
    shortAnswer: '営業・マーケ・CSの情報が分断され、売上につながる次のアクションを設計したい会社に向いています。',
    detail:
      'CRM入力が定着しない、問い合わせが商談化しない、AIツールが点で散らばっている、営業施策を仕組み化したい企業と相性が良いです。',
    relatedQuestionIds: ['revenue-infra', 'custom-design', 'consultation'],
  },
  {
    id: 'small-start',
    question: '小さく試すことはできますか？',
    aliases: ['PoC', '試験導入', '小さく始める', 'トライアル', '無料相談'],
    shortAnswer: 'はい。まずは議事録整理、ナレッジ検索、問い合わせ導線など、効果が見えやすい一部から始められます。',
    detail:
      '最初から全社導入するより、現場の負担が少なく売上接点に近い領域から試す設計が現実的です。',
    relatedQuestionIds: ['consultation', 'implementation-time', 'pricing-model'],
  },
  {
    id: 'pricing-model',
    question: '料金や費用感は？',
    aliases: ['料金', '価格', '費用', '月額', 'いくら'],
    shortAnswer: '構築範囲、既存ツール、運用支援の有無によって変わるため、まずは相談内容に合わせて見積もります。',
    detail:
      'Obsidian、Notion、Google Workspace、Microsoft、Zoomなど、対象ツールと業務範囲によって必要工数が異なります。不要な機能まで一括導入しない前提で整理します。',
    relatedQuestionIds: ['scope-cost', 'consultation', 'small-start'],
  },
  {
    id: 'initial-cost',
    question: '初期費用はかかりますか？',
    aliases: ['初期費用', '立ち上げ費用', 'セットアップ', '導入費'],
    shortAnswer: '要件整理、設計、実装範囲に応じて発生します。まずは必要な範囲を切り分けます。',
    detail:
      '既存CRMやデータの状態、連携先、AI活用範囲によって変動します。小さな導入から始める選択も可能です。',
    relatedQuestionIds: ['pricing-model', 'implementation-time', 'data-import'],
  },
  {
    id: 'scope-cost',
    question: 'どこまでお願いできますか？',
    aliases: ['支援範囲', 'どこまで', '設計だけ', '実装まで', '運用まで'],
    shortAnswer: '設計だけでなく、実装、外部ツール設定、運用改善、コンテンツ設計まで相談できます。',
    detail:
      'ロードマップ作成だけで終えることも、社内ポータル、AIナレッジ、議事録要約、問い合わせ導線、メディアまでまとめて実装することもできます。',
    relatedQuestionIds: ['service-portfolio', 'custom-design', 'consultation'],
  },
  {
    id: 'tool-cost',
    question: '外部ツールの費用も含まれますか？',
    aliases: ['Obsidian費用', 'Microsoft費用', 'Zoom費用', 'Notion費用', 'SaaS費用'],
    shortAnswer: 'Obsidian、Notion、Google Workspace、Microsoft、Zoomなどの外部ツール費用は別途確認が必要です。',
    detail:
      '既存契約を活かすのか、新規契約するのか、別ツールへ寄せるのかを含めて、全体コストを見ながら設計します。',
    relatedQuestionIds: ['hubspot-salesforce', 'notion-google', 'pricing-model'],
  },
  {
    id: 'custom-design',
    question: '会社ごとにカスタマイズできますか？',
    aliases: ['カスタマイズ', '個別設計', '自社専用', '業務に合わせる', 'オーダーメイド'],
    shortAnswer: 'はい。既存業務、営業体制、利用中ツールに合わせて、個社専用の構成にします。',
    detail:
      'テンプレートを押し付けるのではなく、いまある運用を読み解いて、AIやDXで置き換えるべき箇所を見極めます。',
    relatedQuestionIds: ['revenue-infra', 'scope-cost', 'implementation-time'],
  },
  {
    id: 'call-ai',
    question: 'FDE形式では何をしてくれますか？',
    aliases: ['FDE', 'Forward Deployed Engineer', 'ヒアリング', '設計', '伴走'],
    shortAnswer: '私が現場の状況をヒアリングし、そのままAI/DXインフラの設計まで落とし込みます。',
    detail:
      '外部から一般論を提案するのではなく、実際の業務、使っているツール、情報の流れを確認しながら、現場で使える構成に変換します。',
    relatedQuestionIds: ['crm-build', 'agent-control', 'target-company'],
  },
  {
    id: 'crm-build',
    question: 'CRM構築も含まれますか？',
    aliases: ['CRM構築', '顧客管理', '商談管理', '営業管理', 'CRM'],
    shortAnswer: 'はい。CRMは売上インフラの中核として、入力設計、項目設計、外部連携まで扱います。',
    detail:
      '顧客情報を蓄積するだけでなく、次の営業アクションやマーケ施策に接続する設計を重視します。',
    relatedQuestionIds: ['existing-crm', 'hubspot-salesforce', 'revenue-infra'],
  },
  {
    id: 'chatbot',
    question: 'チャットボットも作れますか？',
    aliases: ['チャットボット', 'FAQ', '問い合わせ', 'AIチャット', 'サポート'],
    shortAnswer: 'はい。FAQ、問い合わせ対応、商談化導線に合わせたチャットボット設計ができます。',
    detail:
      '単なる右下常駐チャットではなく、FAQ、フォーム、営業相談、ナレッジ検索を統合した体験として設計します。',
    relatedQuestionIds: ['owned-media', 'human-escalation', 'crm-build'],
  },
  {
    id: 'owned-media',
    question: 'オウンドメディアやSEOも相談できますか？',
    aliases: ['オウンドメディア', 'SEO', '記事', 'コンテンツ', 'メディア'],
    shortAnswer: 'はい。AI活用やDXノウハウを発信するメディア設計も、売上インフラの一部として扱えます。',
    detail:
      '集客、問い合わせ、リード獲得、ナレッジ蓄積をつなげるため、SEOとCRM連携を前提に設計します。',
    relatedQuestionIds: ['growth-media', 'chatbot', 'target-company'],
  },
  {
    id: 'existing-crm',
    question: '既存のCRMと併用できますか？',
    aliases: ['既存CRM', '併用', '乗り換えずに使える', '既存ツール', '今のCRM'],
    shortAnswer: 'はい。今あるCRMを捨てる前提ではなく、既存運用を活かした併用設計ができます。',
    detail:
      '入力項目、運用ルール、連携先を確認し、移行・併用・部分改善のどれが現実的かを整理します。',
    relatedQuestionIds: ['hubspot-salesforce', 'crm-build', 'data-import'],
  },
  {
    id: 'hubspot-salesforce',
    question: 'HubSpotやSalesforceと併用できますか？',
    aliases: ['HubSpot', 'Salesforce', '外部CRM', 'SFA', 'MA'],
    shortAnswer: 'はい。HubSpotやSalesforceを使う前提で、設計・項目整理・自動化・連携導線を見直せます。',
    detail:
      'ツールの置き換えではなく、使いこなすための設計、業務フロー、AI活用を組み合わせます。',
    relatedQuestionIds: ['existing-crm', 'tool-cost', 'notion-google'],
  },
  {
    id: 'notion-google',
    question: 'ObsidianやNotion、Google Workspaceも対象ですか？',
    aliases: ['Obsidian', 'Notion', 'Google Workspace', 'Microsoft', 'Zoom', '社内ポータル'],
    shortAnswer: 'はい。Obsidian、Notion、Google Workspace、Microsoft、ZoomなどもAI/DX設計の対象です。',
    detail:
      '現場で使われている情報管理を無理に変えず、AIが参照・要約・検索・整理できる形へ整えることを重視します。',
    relatedQuestionIds: ['hubspot-salesforce', 'admin-operation', 'custom-design'],
  },
  {
    id: 'build-vs-tools',
    question: '単にツールを導入するのと何が違いますか？',
    aliases: ['違い', 'ツール導入', 'コンサル', '何が違う', '比較'],
    shortAnswer: 'ツール選定ではなく、売上につながる業務フローとデータ導線まで設計する点が違います。',
    detail:
      'SaaSを契約しても、入力されない、見られない、活用されない状態では成果につながりません。運用まで含めて設計します。',
    relatedQuestionIds: ['custom-design', 'revenue-infra', 'hubspot-salesforce'],
  },
  {
    id: 'security-data',
    question: 'データや権限はどう扱いますか？',
    aliases: ['セキュリティ', 'データ保護', '権限', '情報漏洩', 'アクセス制御'],
    shortAnswer: '利用ツールや社内ルールに合わせて、権限、データ保管、連携範囲を確認しながら設計します。',
    detail:
      '顧客情報や営業情報は重要な資産のため、外部ツール連携やAI利用範囲は事前に整理します。',
    relatedQuestionIds: ['agent-control', 'existing-crm', 'consultation'],
  },
  {
    id: 'implementation-time',
    question: '導入にはどれくらいかかりますか？',
    aliases: ['導入期間', 'いつ使える', '立ち上げ', 'オンボーディング', '開始時期'],
    shortAnswer: '範囲によりますが、まずは現状整理、設計、優先領域の実装という順番で進めます。',
    detail:
      'CRMだけなら短期で始めやすく、複数ツール連携やメディア設計を含める場合は段階的に進めます。',
    relatedQuestionIds: ['small-start', 'data-import', 'consultation'],
  },
  {
    id: 'data-import',
    question: '既存データの移行はできますか？',
    aliases: ['データ移行', 'CSV', 'インポート', '移行', '既存データ'],
    shortAnswer: 'はい。CSV、既存CRM、スプレッドシートなどの整理・移行も相談できます。',
    detail:
      '会社、担当者、商談、問い合わせ、活動履歴など、どの情報を残し、どう活用するかから設計します。',
    relatedQuestionIds: ['existing-crm', 'implementation-time', 'pricing'],
  },
  {
    id: 'admin-operation',
    question: '運用担当者が非エンジニアでも使えますか？',
    aliases: ['非エンジニア', '運用', '管理画面', '現場', '使いやすい'],
    shortAnswer: 'はい。営業・マーケ・CSの現場担当者が使える前提で、運用設計まで含めます。',
    detail:
      '高度な設定を現場に押し付けるのではなく、日々の入力、確認、改善が回る形を目指します。',
    relatedQuestionIds: ['custom-design', 'notion-google', 'implementation-time'],
  },
  {
    id: 'agent-control',
    question: 'AIは勝手に動くのですか？',
    aliases: ['勝手に動く', '自動実行', '承認', '人間が確認', 'AIエージェント'],
    shortAnswer: '重要な判断は人が確認できる前提で、承認・自動化の範囲を設計します。',
    detail:
      'メール、議事録、問い合わせ対応、ナレッジ検索など、どこまでAIに任せるかは業務リスクに合わせて決めます。',
    relatedQuestionIds: ['security-data', 'call-ai', 'admin-operation'],
  },
  {
    id: 'growth-media',
    question: 'AI活用やDXの情報発信も作れますか？',
    aliases: ['情報発信', 'メディア運営', 'ブログ', 'ノウハウ発信', 'チップス'],
    shortAnswer: 'はい。AI活用・DX化のノウハウを発信するオウンドメディアも、営業導線として設計できます。',
    detail:
      '単なる記事制作ではなく、検索流入、問い合わせ、CRM蓄積、営業フォローまでつなげる設計にします。',
    relatedQuestionIds: ['owned-media', 'chatbot', 'service-portfolio'],
  },
  {
    id: 'consultation',
    question: '導入相談はできますか？',
    aliases: ['相談したい', '問い合わせ', '導入相談', 'デモ', '話を聞きたい', '商談'],
    shortAnswer: 'はい。現在の営業・マーケ・CSの状況をもとに、最適なAI/DXインフラ構成を相談できます。',
    detail:
      '既存ツール、営業課題、AI活用の希望、メディア施策の有無を確認し、設計から実装までの進め方を整理します。',
    relatedQuestionIds: ['revenue-infra', 'pricing-model', 'small-start'],
  },
]

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'basic',
    label: '料金',
    summary: '費用感や相談前に確認したい前提をまとめています。',
    questionIds: ['pricing-model', 'initial-cost', 'scope-cost', 'tool-cost', 'consultation'],
  },
  {
    id: 'compare',
    label: '基本',
    summary: 'AI/DXインフラ設計の概要、対応領域、始め方を確認できます。',
    questionIds: ['revenue-infra', 'service-portfolio', 'company-service', 'target-company', 'small-start'],
  },
  {
    id: 'support',
    label: '強み',
    summary: 'FDE形式でヒアリングし、既存SaaSとAIを組み合わせる設計です。',
    questionIds: ['custom-design', 'call-ai', 'crm-build', 'chatbot', 'owned-media'],
  },
  {
    id: 'security',
    label: '比較',
    summary: '既存ツールとの関係、単なるツール導入との違いを確認できます。',
    questionIds: ['existing-crm', 'hubspot-salesforce', 'notion-google', 'build-vs-tools', 'security-data'],
  },
  {
    id: 'operation',
    label: '運用',
    summary: '導入、データ移行、現場運用、メディア運用を確認できます。',
    questionIds: ['implementation-time', 'data-import', 'admin-operation', 'agent-control', 'growth-media'],
  },
]

function getFaqById(id: string) {
  return FAQ_ITEMS.find((item) => item.id === id)
}

export const FAQ = () => {
  const [selectedId, setSelectedId] = useState<string>('pricing-model')
  const [activeCategoryId, setActiveCategoryId] = useState<string>('basic')

  const activeCategory = FAQ_CATEGORIES.find((category) => category.id === activeCategoryId) ?? FAQ_CATEGORIES[0]!
  const presetQuestions = activeCategory.questionIds.map(getFaqById).filter((item): item is FaqItem => Boolean(item))
  const selectedItem = getFaqById(selectedId) ?? presetQuestions[0]

  const selectCategory = (category: FaqCategory) => {
    const firstQuestion = category.questionIds.map(getFaqById).find((item): item is FaqItem => Boolean(item))

    setActiveCategoryId(category.id)
    if (firstQuestion) {
      setSelectedId(firstQuestion.id)
    }
  }

  const selectQuestion = (item: FaqItem) => {
    setSelectedId(item.id)
  }

  return (
    <Section tone="obsidian" screenLabel="18 FAQ">
      <div className="relative overflow-hidden">
        <NebulaBG intensity={0.62} />
        <ParticleField count={24} seed={73} />

        <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-12">
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <Eyebrow color="#abc7ff">Revenue AI/DX / FAQ</Eyebrow>
              <h2 className="mt-3 font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.025em] md:text-[2.9rem]">
                よくある質問を、<span className="fo-gradient-text-soft">整理。</span>
              </h2>
            </div>
          </div>

          <div
            className="relative mt-5 rounded-[22px] p-2.5 md:p-3 fo-glass-strong"
            style={{
              background: 'linear-gradient(180deg, rgba(31,31,33,0.74), rgba(12,14,19,0.78))',
              boxShadow:
                'inset 0 0 0 1px rgba(171,199,255,0.16), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 80px rgba(0,113,227,0.12)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-8 -top-px h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(171,199,255,0.72), transparent)' }}
            />

            <div
              className="mb-3 grid gap-1 rounded-[18px] p-1 sm:grid-cols-5"
              style={{
                background: 'rgba(7,9,14,0.42)',
                boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.08)',
              }}
            >
              {FAQ_CATEGORIES.map((category, index) => {
                const isActive = category.id === activeCategoryId
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className="group relative flex min-h-10 items-center justify-center gap-2 overflow-hidden rounded-[14px] px-3 py-2 transition-colors"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(171,199,255,0.2), rgba(0,113,227,0.12) 52%, rgba(31,31,33,0.72))'
                        : 'transparent',
                      color: isActive ? '#fcfbff' : '#a9a6ae',
                      boxShadow: isActive ? 'inset 0 0 0 1px rgba(171,199,255,0.3)' : 'none',
                    }}
                  >
                    {isActive ? (
                      <span
                        className="pointer-events-none absolute inset-x-4 top-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(171,199,255,0.92), transparent)' }}
                      />
                    ) : null}
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: isActive ? '#abc7ff' : '#70747e' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[0.9rem] font-bold leading-none">{category.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="grid gap-3 lg:grid-cols-[330px_1fr] lg:h-[282px]">
              <div className="flex h-full flex-col gap-2">
                {presetQuestions.map((item, index) => {
                  const isActive = selectedId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectQuestion(item)}
                      className="group flex min-h-0 flex-1 w-full items-center gap-3 rounded-[16px] px-3 py-2 text-left transition-colors"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(171,199,255,0.16), rgba(0,113,227,0.09) 58%, rgba(19,19,21,0.72))'
                          : 'linear-gradient(180deg, rgba(19,19,21,0.78), rgba(13,14,18,0.76))',
                        boxShadow: isActive
                          ? 'inset 0 0 0 1px rgba(171,199,255,0.3), 0 12px 34px rgba(0,113,227,0.08)'
                          : 'inset 0 0 0 1px rgba(171,199,255,0.08)',
                      }}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px]"
                        style={{
                          background: isActive ? 'rgba(171,199,255,0.2)' : 'rgba(7,9,14,0.56)',
                          color: isActive ? '#fcfbff' : '#abc7ff',
                        }}
                      >
                        Q{index + 1}
                      </span>
                      <span className="line-clamp-2 min-w-0 flex-1 text-[0.86rem] font-semibold leading-relaxed text-[#f1eff5]">
                        {item.question}
                      </span>
                      <ArrowRight
                        size={16}
                        className="shrink-0 text-aurora transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>

              <article
                className="flex h-full min-h-[282px] flex-col justify-between rounded-[18px] p-5 md:p-6"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(31,31,33,0.94), rgba(15,17,22,0.9)), radial-gradient(circle at 18% 0%, rgba(171,199,255,0.14), transparent 44%)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.16), 0 18px 60px rgba(0,113,227,0.08)',
                }}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: '#8dffc9', background: 'rgba(141,255,201,0.08)' }}
                    >
                      <Sparkles size={13} aria-hidden="true" />
                      Answer
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-aurora">
                      <span className="h-px w-6 bg-aurora/70" />
                      ひとことで言うと
                    </div>
                    <h3 className="mt-3 line-clamp-4 font-display text-[1.35rem] font-bold leading-[1.2] text-[#fcfbff] md:text-[1.72rem]">
                      {selectedItem?.shortAnswer}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <ConsultationCallButton
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold transition-transform hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)', color: '#ffffff' }}
                    source="landing_faq_answer"
                    ariaLabel="AI/DXインフラ設計の導入相談を予約する"
                  >
                    導入相談へ
                    <CalendarCheck size={15} aria-hidden="true" />
                  </ConsultationCallButton>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
