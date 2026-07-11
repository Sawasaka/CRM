(function () {
  const data = window.FDE_PORTAL_DATA || {}

  const tabs = [
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'call', label: 'Call' },
  ]

  const serviceFilters = ['すべて', '法人サービス', '業務委託', '野球チーム']

  const state = {
    activeTab: 'pipeline',
    activeDealsView: 'dashboard',
    search: '',
    activeServiceFilter: 'すべて',
    activeModalDealId: '',
    activeModalTab: 'detail',
    activeAddModalType: '',
    activeRecordType: '',
    activeRecordId: '',
    activeCallTestModal: false,
    activeCallScenarioKey: 'inquiry-followup',
    draggingDealId: '',
    suppressCardClick: false,
    callConnectionTest: {
      status: 'idle',
      message: '未実行',
      steps: [],
    },
    portalCall: {
      status: 'idle',
      message: '接続するとログが表示されます。',
      logs: [],
      ws: null,
      audioContext: null,
      playbackSources: [],
      playbackTime: 0,
      recognition: null,
      recognitionActive: false,
      recognitionPaused: false,
      lastTranscript: '',
      interimTimer: null,
    },
    deletedRecords: new Set(),
    addedRecords: {},
  }

  const $ = (selector, root = document) => root.querySelector(selector)
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector))
  const money = (value) => {
    const amount = Number(value || 0)
    if (amount < 1000000) return `¥${amount.toLocaleString('ja-JP')}`
    return `¥${Math.round(amount / 1000000).toLocaleString('ja-JP')}.0M`
  }
  const companyById = (id) => (data.companies || []).find((company) => company.id === id) || {}
  const contactById = (id) => (data.contacts || []).find((contact) => contact.id === id) || {}
  const stageById = (id) => (data.pipelineStages || []).find((stage) => stage.id === id) || {}
  const healthClass = (value) => String(value || '').toLowerCase()
  const cardMode = (deal) => (['mql', 'sql'].includes(deal.stage) ? 'contact' : 'deal')
  const recordKey = (type, id) => `${type}:${id}`

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  function includesQuery(parts) {
    if (!state.search) return true
    return parts.join(' ').toLowerCase().includes(state.search.toLowerCase())
  }

  function renderNav() {
    $('#tabNav').innerHTML = tabs
      .map(
        (tab) => `
          <button class="tab-button ${tab.id === state.activeTab ? 'is-active' : ''}" data-tab="${tab.id}" type="button">
            ${tab.label}
          </button>
        `,
      )
      .join('')
  }

  function pageHead(title, kicker, action = '') {
    return `
      <div class="page-head">
        <div>
          <h1>${title}</h1>
          <p>${kicker}</p>
        </div>
        ${action}
      </div>
    `
  }

  function miniChart(seed = 0) {
    const variants = [
      '4,45 36,38 64,22 96,26 128,14 160,8 192,4',
      '4,40 36,33 64,37 96,24 128,18 160,10 192,5',
      '4,43 36,35 64,30 96,32 128,22 160,15 192,8',
      '4,46 36,42 64,28 96,20 128,27 160,15 192,11',
    ]
    return `
      <svg class="sparkline" viewBox="0 0 196 52" aria-hidden="true">
        <defs>
          <linearGradient id="sparkFill${seed}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#3f8cff" stop-opacity="0.52"></stop>
            <stop offset="100%" stop-color="#3f8cff" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <path d="M${variants[seed % variants.length]} L192,52 L4,52 Z" fill="url(#sparkFill${seed})"></path>
        <polyline points="${variants[seed % variants.length]}" fill="none" stroke="#3f8cff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <circle cx="192" cy="${[4, 5, 8, 11][seed % 4]}" r="3.2" fill="#dce9ff"></circle>
      </svg>
    `
  }

  function filteredDeals() {
    return (data.deals || []).filter((deal) => {
      const company = companyById(deal.companyId)
      const contact = contactById(deal.contactId)
      const filterMatch = state.activeServiceFilter === 'すべて' || deal.serviceType === state.activeServiceFilter
      const queryMatch = includesQuery([deal.name, deal.memo, deal.nextAction, deal.serviceType, deal.category, company.name, contact.name, deal.owner])
      return filterMatch && queryMatch
    })
  }

  function dealRow(deal, compact = false) {
    const company = companyById(deal.companyId)
    const contact = contactById(deal.contactId)
    const stage = stageById(deal.stage)
    const health = healthClass(deal.health)

    return `
      <tr>
        <td>
          <div class="deal-name">
            <span class="logo-tile">${escapeHtml((company.name || deal.name).slice(0, 1))}</span>
            <span><strong>${escapeHtml(deal.name)}</strong>${compact ? '' : `<small>${escapeHtml(deal.memo)}</small>`}</span>
          </div>
        </td>
        ${compact ? '' : `<td><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(company.industry)} / Intent ${escapeHtml(company.intent)}</small></td>`}
        ${compact ? '' : `<td><strong>${escapeHtml(contact.name)}</strong><small>${escapeHtml(contact.title)} / ${escapeHtml(contact.email)}</small></td>`}
        <td><span class="stage-pill">${escapeHtml(stage.label || deal.stage)}</span></td>
        <td>${money(deal.amount)}</td>
        <td>
          <div class="certainty"><strong>${deal.probability}%</strong><span><i style="width:${deal.probability}%"></i></span></div>
        </td>
        <td><span class="health-dot ${health}"></span>${escapeHtml(deal.health)}</td>
        <td>${escapeHtml(deal.nextAction)}</td>
        <td>${deal.closeDate}</td>
      </tr>
    `
  }

  function marketSummaryHtml() {
    const segments = data.marketSegments || []
    const deals = filteredDeals()
    const monthAmount = deals.reduce((sum, deal) => sum + deal.amount, 0)
    const wonAmount = deals.filter((deal) => deal.stage === 'won').reduce((sum, deal) => sum + deal.amount, 0)

    return `
      <section class="panel market-panel">
        <div class="panel-head">
          <h2>市場規模サマリ</h2>
          <span>最終更新: ${escapeHtml(data.meta?.updatedAt || '2026-06-28')} 10:30</span>
        </div>
        <div class="market-grid">
          ${segments
            .map(
              (segment, index) => `
                <article class="market-card">
                  <div class="market-title">
                    <span class="market-icon">${escapeHtml(segment.name.slice(0, 1))}</span>
                    <strong>${escapeHtml(segment.name)}</strong>
                  </div>
                  <small>市場規模</small>
                  <div class="market-size">${escapeHtml(segment.marketSize)}</div>
                  <small>前年比</small>
                  <strong class="growth">+${escapeHtml(segment.growthRate || segment.growth)}</strong>
                  ${miniChart(index)}
                  <div class="month-labels"><span>1月</span><span>2月</span><span>3月</span><span>4月</span><span>5月</span><span>6月</span></div>
                </article>
              `,
            )
            .join('')}
        </div>
      </section>

      <section class="panel deals-preview">
        <div class="panel-head">
          <h2>取引プレビュー</h2>
          <div class="panel-actions">
            <button class="secondary-button" data-deals-view="list" type="button">すべての取引を見る</button>
            <button class="icon-button small" type="button" aria-label="Filter">≡</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table preview-table">
            <thead>
              <tr><th>取引名</th><th>ステージ</th><th>金額</th><th>確度</th><th>ヘルス</th><th>次のアクション</th><th>クローズ予定日</th></tr>
            </thead>
            <tbody>${deals.slice(0, 6).map((deal) => dealRow(deal, true)).join('') || '<tr><td colspan="7">該当する取引がありません。</td></tr>'}</tbody>
          </table>
        </div>
        <div class="kpi-strip">
          <div><small>今月の新規取引</small><strong>${deals.length * 3 - 1}件</strong><span>+5件</span></div>
          <div><small>今月のパイプライン金額</small><strong>${money(monthAmount)}</strong><span>+18%</span></div>
          <div><small>今月の受注金額（確定）</small><strong>${money(wonAmount || 13000000)}</strong><span>+21%</span></div>
        </div>
      </section>
    `
  }

  function renderDeals() {
    const rows = filteredDeals().map((deal) => dealRow(deal)).join('')
    const content =
      state.activeDealsView === 'dashboard'
        ? marketSummaryHtml()
        : `
          <section class="panel">
            <div class="panel-head">
              <h2>取引一覧</h2>
              <span>会社・コンタクトは取引に内包</span>
            </div>
            <div class="table-wrap">
              <table class="data-table full-table">
                <thead><tr><th>取引</th><th>会社</th><th>コンタクト</th><th>ステージ</th><th>金額</th><th>確度</th><th>ヘルス</th><th>次アクション</th><th>クローズ予定</th></tr></thead>
                <tbody>${rows || '<tr><td colspan="9">該当する取引がありません。</td></tr>'}</tbody>
              </table>
            </div>
          </section>
        `

    $('#deals').innerHTML = `
      ${pageHead(
        'Deals',
        '市場、取引、会社、コンタクトをひとつの営業画面で見る。',
        `<div class="head-actions"><span>最終更新: 2026/06/28 10:30</span><button class="icon-button small" type="button" aria-label="Refresh">↻</button><button class="select-button" type="button">今月⌄</button></div>`,
      )}
      <div class="segment-tabs">
        <button class="segment-tab ${state.activeDealsView === 'dashboard' ? 'is-active' : ''}" data-deals-view="dashboard" type="button">ダッシュボード</button>
        <button class="segment-tab ${state.activeDealsView === 'list' ? 'is-active' : ''}" data-deals-view="list" type="button">取引一覧</button>
      </div>
      ${content}
    `
  }

  function leadSource(deal, company) {
    if (deal.stage === 'mql') return '資料DL / Web流入'
    if (deal.stage === 'sql') return '営業確認済みリード'
    return company.signal || '既存商談 / 紹介'
  }

  function proposalSummary(deal) {
    if (deal.stage === 'mql' || deal.stage === 'sql') return '初回接続と課題確認'
    if (deal.stage === 'first_meeting') return '現状課題の整理と導入仮説'
    if (deal.stage === 'demo_proposal') return 'HTMLポータルと営業ナレッジ統合'
    if (deal.stage === 'poc') return '小規模検証と運用設計'
    if (deal.stage === 'contract') return '契約条件と導入スケジュール'
    return '継続提案 / アップセル設計'
  }

  function renderServiceFilters(deals) {
    return `
      <div class="service-filter" aria-label="提供先の絞り込み">
        <span>提供先</span>
        <div>
          ${serviceFilters
            .map((filter) => {
              const count = filter === 'すべて' ? deals.length : deals.filter((deal) => deal.serviceType === filter).length
              return `
                <button class="${state.activeServiceFilter === filter ? 'is-active' : ''}" data-service-filter="${filter}" type="button">
                  ${filter}<small>${count}</small>
                </button>
              `
            })
            .join('')}
        </div>
      </div>
    `
  }

  function renderCall() {
    const portalCall = state.portalCall || {}
    const callConnected = portalCall.status === 'connected'
    const callConnecting = portalCall.status === 'connecting'

    $('#call').innerHTML = `
      <section class="call-lab-hero" aria-label="AIモデル試験">
        <div>
          <div class="ai-call-kicker"><span></span>CALL AI MODEL</div>
          <h1>AIモデル試験</h1>
          <p>Gemini 3.1 Liveで、日本語の自然さ、応答速度、割り込みを検証。</p>
        </div>
        <div class="call-lab-actions">
          <span class="ai-call-status ${escapeHtml(portalCall.status || 'idle')}">${escapeHtml(portalCallStatusLabel(portalCall.status))}</span>
          <button class="primary-button" data-portal-call-toggle type="button">${escapeHtml(portalCallActionLabel(portalCall.status))}</button>
        </div>
      </section>

      <section class="call-profile-strip" aria-label="AIモデル試験プロファイル">
        <button class="call-profile-card is-active" type="button">
          <span>Gemini 3.1 Live</span>
          <strong>Gemini 3.1 Flash Live / Charon Japanese</strong>
          <small>採用モデル</small>
        </button>
      </section>

      <section class="call-model-grid">
        <div class="call-live-panel">
          <div class="call-section-head">
            <h2>ライブ通話</h2>
            <button class="secondary-button" type="button">マイク</button>
          </div>
          <div class="call-live-body">
            <button class="call-live-card ${callConnected ? 'is-connected' : ''} ${callConnecting ? 'is-connecting' : ''}" data-portal-call-toggle type="button">
              <span class="call-bot-orb">▣</span>
              <strong>gemini-3.1-flash-live-preview</strong>
              <small>voice: Charon</small>
              <em>${escapeHtml(portalCallActionLabel(portalCall.status))}</em>
              <small>採用モデル</small>
            </button>
            <div class="call-log-panel">
              ${renderPortalCallLogs()}
            </div>
          </div>
          <div class="call-live-message ${escapeHtml(portalCall.status || 'idle')}">${escapeHtml(portalCall.message || '接続するとログが表示されます。')}</div>
        </div>

        <div class="call-settings-panel">
          <div class="call-section-head">
            <h2>モデル設定</h2>
          </div>
          <div class="call-model-note">
            <strong>Gemini 3.1 Flash Live / Charon Japanese</strong>
            <p>低遅延で自然に返答できるGemini Live APIの採用モデルです。</p>
          </div>
          <div class="call-model-form">
            <label><span>モデル</span><input value="gemini-3.1-flash-live-preview"></label>
            <label><span>音声</span><input value="Charon"></label>
            <label><span>シナリオ</span><textarea>ホームページから相談申し込みをした相手に、30秒から2分で自然にヒアリングする。
最初に短く名乗り、今少し話せるか確認する。
お問い合わせ背景を聞く。
次に求めていることを1つだけ聞く。
次回商談で話すべき議題を確認する。</textarea></label>
            <label><span>参照情報</span><textarea>FDE CRMは、問い合わせ後の即時AIコール、営業ヒアリング、日程調整、CRM活動履歴化を支援する。
強みは、コールネイティブなCRMとして商談化率と受注率を上げること。</textarea></label>
          </div>
        </div>
      </section>

      ${renderCallScenarioDesign()}
    `
  }

  function callScenarioDesigns() {
    return [
      {
        key: 'inquiry-followup',
        title: 'HP問い合わせ後・未予約フォロー',
        badge: '3分後コール条件',
        summary: '資料請求・お問い合わせ後、約3分経っても日程調整が完了していない相手へ架電し、背景確認から商談確定まで進める。',
        trigger: 'HPフォーム送信または資料請求から約3分後、Googleカレンダー予約が未完了の場合に発火。',
        opening: 'FDE CRMへのお問い合わせありがとうございます。日程調整がまだ完了していないようでしたので、確認と事前ヒアリングでお電話しました。いま1、2分だけお話ししてもよろしいでしょうか。',
        flow: [
          '本人確認: 資料請求またはお問い合わせをいただいたご本人か確認',
          '通話許可: 今1、2分だけ話せるか確認。難しければ希望時間帯を1つ聞く',
          '背景確認: 問い合わせ背景を一言で聞く',
          '課題確認: 問い合わせ対応、営業ヒアリング、商談化、日程調整、CRM履歴化のどこが課題か聞く',
          '次ステップ確認: 見積もり、サービス詳細、営業戦略相談、実行パートナー相談のどれに近いか確認',
          '日程調整: 空き枠を2、3候補提示し、合意した日時で予定作成',
          '事前メモ: 背景、温度感、次回議題をカレンダー/CRMへ残す',
        ],
        objections: [
          '今は不要: 導入前提でなくても15分で改善余地だけ整理できると伝える',
          '資料だけでよい: 資料は送る前提で、見るべき箇所を絞るため背景を1問だけ聞く',
          '忙しい: 30秒だけ折り返し希望か日程候補を確認する',
          '担当ではない: 営業管理や問い合わせ対応を見ている方へ取り次ぎ可能か確認する',
          'AIへの不信感: AIであることを隠さず、日程調整と事前確認の補助であると説明する',
        ],
        completion: '日程確定できた場合は予定を作成し、事前ヒアリング情報を保存。未確定の場合は希望時間帯、折り返し可否、未確定理由を保存。',
      },
      {
        key: 'bdr-outbound',
        title: 'BDRアウトバウンド初回接続',
        badge: 'BDR',
        summary: 'ターゲット企業へBDRとして架電し、受付突破、担当者接続、課題仮説提示、15分商談化を狙う。',
        trigger: '企業DBやISリストでHOT/MID判定された企業、または営業対象リストから発火。',
        opening: '突然のお電話失礼いたします。FDE CRMの営業支援担当です。営業管理や問い合わせ対応の効率化について、御社に関係しそうな件で短くご連絡しました。営業企画または新規営業のご担当者様はいらっしゃいますでしょうか。',
        flow: [
          '受付突破: 社名と用件を短く名乗り、営業企画・新規営業・マーケ担当者につないでもらう',
          '担当接続: 30秒だけよいか確認し、長く説明しない',
          '仮説提示: 問い合わせ後の初動や商談化率の改善余地がある企業向けの連絡だと伝える',
          '課題確認: 初動対応、営業ヒアリング、日程調整、CRM入力、失注理由管理のどれが近いか聞く',
          '温度感確認: 今すぐ改善、情報収集、担当外のどれに近いか確認',
          '商談化: 関心があれば15分だけ営業フローに当てはまるか確認する場を提案',
          '記録: 接続結果、担当者、部署、課題仮説、温度感、次アクションをCRMに残す',
        ],
        objections: [
          '今は不要: 今後見直すなら初動と商談化率のどちらがテーマになりそうか1問だけ聞く',
          '資料だけ送って: 関係しそうな箇所を絞るため、営業管理と問い合わせ対応のどちらに近いか聞く',
          '担当者ではない: 営業企画、新規営業、マーケティングの近い部署を確認する',
          '忙しい: 本日午後と明日午前のどちらがまだ迷惑でないか確認する',
          '営業電話お断り: 謝意を伝えて終了し、再架電しないフラグを残す',
        ],
        completion: '商談化できた場合は予定作成。できない場合は再架電日、メール送付、NG理由のいずれかを明確にする。',
      },
    ]
  }

  function renderCallScenarioDesign() {
    const scenarios = callScenarioDesigns()
    const active = scenarios.find((scenario) => scenario.key === state.activeCallScenarioKey) || scenarios[0]
    return `
      <section class="call-scenario-panel" aria-label="フロー・トークスクリプト確認">
        <div class="call-section-head">
          <div>
            <h2>フロー・トークスクリプト確認</h2>
            <p>AIコールが参照する会話設計を、条件別に確認できます。</p>
          </div>
        </div>
        <div class="call-scenario-tabs" role="tablist" aria-label="コールシナリオ">
          ${scenarios
            .map(
              (scenario) => `
                <button
                  class="${scenario.key === active.key ? 'is-active' : ''}"
                  data-call-scenario-key="${escapeHtml(scenario.key)}"
                  type="button"
                  role="tab"
                  aria-selected="${scenario.key === active.key ? 'true' : 'false'}"
                >
                  <strong>${escapeHtml(scenario.title)}</strong>
                  <span>${escapeHtml(scenario.badge)}</span>
                </button>
              `,
            )
            .join('')}
        </div>
        <div class="call-scenario-detail">
          <div class="call-scenario-summary">
            <span>${escapeHtml(active.badge)}</span>
            <h3>${escapeHtml(active.title)}</h3>
            <p>${escapeHtml(active.summary)}</p>
            <div class="call-scenario-meta-grid">
              ${renderScenarioMeta('発火条件', active.trigger)}
              ${renderScenarioMeta('冒頭トーク', active.opening)}
            </div>
          </div>
          <div class="call-scenario-columns">
            ${renderScenarioList('基本フロー', active.flow)}
            ${renderScenarioList('切り返し', active.objections)}
          </div>
          <div class="call-scenario-completion">
            <strong>完了条件</strong>
            <p>${escapeHtml(active.completion)}</p>
          </div>
        </div>
      </section>
    `
  }

  function renderScenarioList(title, items) {
    return `
      <div class="call-scenario-list">
        <h3>${escapeHtml(title)}</h3>
        <ol>
          ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ol>
      </div>
    `
  }

  function renderScenarioMeta(label, text) {
    return `
      <section class="call-scenario-meta-card">
        <div class="call-scenario-meta-label">${escapeHtml(label)}</div>
        <p>${escapeHtml(text)}</p>
      </section>
    `
  }

  function createdDate(deal) {
    const day = String(Math.max(1, Number(deal.id.replace(/\D/g, '')) + 10)).padStart(2, '0')
    return `2026-06-${day}`
  }

  function temperatureLabel(deal) {
    const value = String(deal.health || '').toLowerCase()
    if (value === 'hot') return 'ホット'
    if (value === 'mid') return 'ミドル'
    if (value === 'low') return 'ロー'
    if (value === 'won') return '受注'
    return deal.health || '-'
  }

  function stageTone(stageId) {
    if (['mql', 'sql', 'nurturing'].includes(stageId)) return 'scout'
    if (['first_meeting', 'demo_proposal', 'poc'].includes(stageId)) return 'quest'
    if (stageId === 'contract') return 'boss'
    if (stageId === 'won') return 'clear'
    return 'risk'
  }

  function stageLevel(stageId) {
    const index = (data.pipelineStages || []).findIndex((stage) => stage.id === stageId)
    return `Lv.${String(Math.max(index + 1, 1)).padStart(2, '0')}`
  }

  function dealXp(deal) {
    const base = Number(deal.probability || 0) * 8
    const amount = Math.min(Math.round(Number(deal.amount || 0) / 1000), 240)
    return Math.max(80, base + amount)
  }

  function renderPipelineHud(deals) {
    const total = deals.length
    const won = deals.filter((deal) => deal.stage === 'won').length
    const hot = deals.filter((deal) => String(deal.health).toLowerCase() === 'hot').length
    const amount = deals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0)
    const clearRate = total ? Math.round((won / total) * 100) : 0
    const nextBoss = deals.find((deal) => deal.stage === 'contract') || deals.find((deal) => String(deal.health).toLowerCase() === 'hot') || deals[0]
    return `
      <section class="pipeline-hud" aria-label="Pipeline mission status">
        <div class="hud-quest">
          <span class="hud-kicker">SALES QUEST</span>
          <strong>成約クエスト ${clearRate}%</strong>
          <p>今月の攻略対象: ${escapeHtml(nextBoss ? companyById(nextBoss.companyId).name || nextBoss.name : '案件登録待ち')}</p>
          <div class="hud-track"><span style="width:${clearRate}%"></span></div>
        </div>
        <div class="hud-stat"><span>総案件</span><strong>${total}</strong><small>Active cards</small></div>
        <div class="hud-stat"><span>受注</span><strong>${won}</strong><small>Cleared</small></div>
        <div class="hud-stat"><span>ホット</span><strong>${hot}</strong><small>Priority</small></div>
        <div class="hud-stat"><span>金額</span><strong>${money(amount)}</strong><small>Pipeline value</small></div>
      </section>
    `
  }

  function cardDetailRows(deal, company) {
    const stage = stageById(deal.stage)
    return [
      ['提供先', deal.serviceType || '未分類'],
      ['カテゴリー', deal.category || proposalSummary(deal)],
      ['ステータス', stage.label || deal.stage],
      ['タスク', `${deal.owner} / ${deal.nextAction}`],
      ['ネクストアクション', deal.nextAction],
      ['リード元', leadSource(deal, company)],
      ['提案内容', proposalSummary(deal)],
      ['作成日', createdDate(deal)],
      ['契約内容', deal.category || proposalSummary(deal)],
      ['温度感', temperatureLabel(deal)],
    ]
  }

  function pipelineCard(deal) {
    const company = companyById(deal.companyId)
    const contact = contactById(deal.contactId)
    const mode = cardMode(deal)
    const minutes = modalMinutes(deal, company, contact)
    const memos = modalMemos(deal, contact)
    const title = company.name || deal.name
    const detailRows = cardDetailRows(deal, company)
    const summaryRows = detailRows.filter(([label]) => ['ステータス', 'ネクストアクション', 'タスク', '作成日', '契約内容'].includes(label))
    const contractLabel = deal.category || proposalSummary(deal)
    return `
      <button class="pipeline-card ${mode === 'contact' ? 'contact-card' : 'deal-card'} health-${healthClass(deal.health)}" data-open-card="${deal.id}" data-drag-deal="${deal.id}" draggable="true" type="button">
        <div class="pipeline-card-meta">
          <span class="card-contract">${escapeHtml(contractLabel)}</span>
        </div>
        <h3>${escapeHtml(title)}</h3>
        <div class="quest-progress" aria-hidden="true"><span style="width:${Number(deal.probability || 0)}%"></span></div>
        <dl class="card-fields">
          ${summaryRows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
        </dl>
        <div class="pipeline-card-footer">
          <span>詳細を見る</span>
        </div>
      </button>
    `
  }

  function modalMinutes(deal, company, contact) {
    const base = [
      {
        id: `${deal.id}-minutes-001`,
        title: '初回ヒアリング',
        date: createdDate(deal),
        body: `${company.name || '企業'}は${deal.memo} 次回は${deal.nextAction}を確認する。`,
      },
      {
        id: `${deal.id}-minutes-002`,
        title: '営業メモ共有',
        date: contact.lastTouch || deal.closeDate,
        body: `${contact.name || '担当者'}には、${proposalSummary(deal)}を中心に説明する。`,
      },
    ]
    return [...base, ...(state.addedRecords[`${deal.id}:minutes`] || [])].filter((item) => !state.deletedRecords.has(recordKey('minutes', item.id)))
  }

  function modalMemos(deal, contact) {
    const base = [
      { id: `${deal.id}-memo-001`, title: '営業メモ', date: createdDate(deal), body: deal.memo },
      { id: `${deal.id}-memo-002`, title: 'コンタクトメモ', date: contact.lastTouch || deal.closeDate, body: contact.nextAction || '次回接点で課題と導入時期を確認する。' },
    ]
    return [...base, ...(state.addedRecords[`${deal.id}:memo`] || [])].filter((item) => !state.deletedRecords.has(recordKey('memo', item.id)))
  }

  function recordDetailHtml(type, records) {
    const current = records.find((item) => item.id === state.activeRecordId)
    if (!current || state.activeRecordType !== type) return ''
    const label = type === 'minutes' ? '議事録詳細' : 'メモ詳細'
    return `
      <article class="record-detail">
        <div class="record-detail-head">
          <span>${label}</span>
          <button class="icon-button" data-close-record type="button" aria-label="閉じる">×</button>
        </div>
        <label class="edit-field"><span>タイトル</span><input value="${escapeHtml(current.title)}"></label>
        <label class="edit-field"><span>日付</span><input value="${escapeHtml(current.date || '')}"></label>
        <label class="edit-field"><span>本文</span><textarea>${escapeHtml(current.body)}</textarea></label>
      </article>
    `
  }

  function recordListHtml(type, records) {
    const emptyLabel = type === 'minutes' ? '議事録はありません' : 'メモはありません'
    if (!records.length) return `<p class="empty">${emptyLabel}</p>`
    return records
      .map(
        (item) => `
          <article class="record-item ${state.activeRecordId === item.id && state.activeRecordType === type ? 'is-active' : ''}">
            <button class="record-open" data-open-record="${escapeHtml(item.id)}" data-record-type="${type}" type="button">
              <span>${escapeHtml(item.date || '')}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.body)}</small>
            </button>
            <button class="record-delete" data-delete-record="${escapeHtml(item.id)}" data-record-type="${type}" type="button">削除</button>
          </article>
        `,
      )
      .join('')
  }

  function renderModal() {
    const root = $('#modalRoot')
    if (!root) return
    if (state.activeCallTestModal) {
      root.innerHTML = renderCallTestModal()
      return
    }
    const deal = (data.deals || []).find((item) => item.id === state.activeModalDealId)
    if (!deal) {
      root.innerHTML = ''
      return
    }

    const company = companyById(deal.companyId)
    const contact = contactById(deal.contactId)
    const mode = cardMode(deal)
    const tabs = [
      { id: 'detail', label: '取引詳細' },
      { id: 'contact', label: 'コンタクト情報' },
      { id: 'company', label: '企業情報' },
      { id: 'minutes', label: '議事録' },
      { id: 'memo', label: 'メモ' },
    ]
    const body =
      state.activeModalTab === 'detail'
        ? `
          <div class="editable-grid detail-list">
            ${cardDetailRows(deal, company)
              .map(
                ([label, value]) => `
                  <label class="edit-field">
                    <span>${escapeHtml(label)}</span>
                    <textarea>${escapeHtml(value)}</textarea>
                  </label>
                `,
              )
              .join('')}
            <label class="edit-field span-2">
              <span>取引名</span>
              <textarea>${escapeHtml(deal.name)}</textarea>
            </label>
            <label class="edit-field span-2">
              <span>商談メモ</span>
              <textarea>${escapeHtml(deal.memo)}</textarea>
            </label>
          </div>
        `
        : state.activeModalTab === 'contact'
        ? `
          <div class="modal-list">
            <article>
              <span>主担当</span>
              <div class="editable-grid compact">
                <label class="edit-field"><span>氏名</span><input value="${escapeHtml(contact.name || '-')}"></label>
                <label class="edit-field"><span>役職</span><input value="${escapeHtml(contact.title || '-')}"></label>
                <label class="edit-field"><span>Email</span><input value="${escapeHtml(contact.email || '-')}"></label>
                <label class="edit-field"><span>Phone</span><input value="${escapeHtml(contact.phone || '-')}"></label>
                <label class="edit-field"><span>Last touch</span><input value="${escapeHtml(contact.lastTouch || '-')}"></label>
              </div>
            </article>
          </div>
        `
        : state.activeModalTab === 'company'
        ? `
          <div class="modal-list">
            <article>
              <span>取引に紐づく企業</span>
              <div class="editable-grid compact">
                <label class="edit-field"><span>企業名</span><input value="${escapeHtml(company.name || '-')}"></label>
                <label class="edit-field"><span>業種</span><input value="${escapeHtml(company.industry || '-')}"></label>
                <label class="edit-field"><span>従業員数</span><input value="${company.employees ? company.employees.toLocaleString('ja-JP') : '-'}"></label>
                <label class="edit-field"><span>Intent</span><input value="${escapeHtml(company.intent || '-')}"></label>
                <label class="edit-field"><span>Priority</span><input value="${escapeHtml(company.priority || '-')}"></label>
                <label class="edit-field"><span>最終接点</span><input value="${escapeHtml(contact.lastTouch || deal.closeDate || '-')}"></label>
                <label class="edit-field span-2"><span>Signal</span><textarea>${escapeHtml(company.signal || '-')}</textarea></label>
              </div>
            </article>
          </div>
        `
        : state.activeModalTab === 'minutes'
          ? `
            <div class="modal-action-row"><button class="secondary-button" data-add-modal="minutes" type="button">議事録を追加</button></div>
            <div class="modal-list record-list">
              ${recordListHtml('minutes', minutes)}
              ${recordDetailHtml('minutes', minutes)}
            </div>
          `
          : `
            <div class="modal-action-row"><button class="secondary-button" data-add-modal="memo" type="button">メモを追加</button></div>
            <div class="modal-list memo-list record-list">
              ${recordListHtml('memo', memos)}
              ${recordDetailHtml('memo', memos)}
            </div>
          `

    const addModal = state.activeAddModalType
      ? `
        <div class="sub-modal-backdrop" data-close-add-modal>
          <section class="sub-modal" role="dialog" aria-modal="true" aria-label="${state.activeAddModalType === 'minutes' ? '議事録を追加' : 'メモを追加'}">
            <div class="modal-head small-head">
              <div>
                <span class="modal-type">${state.activeAddModalType === 'minutes' ? '議事録' : 'メモ'}</span>
                <h2>${state.activeAddModalType === 'minutes' ? '議事録を追加' : 'メモを追加'}</h2>
              </div>
              <button class="modal-close" data-close-add-modal type="button" aria-label="Close">×</button>
            </div>
            <div class="editable-grid add-form">
              <label class="edit-field"><span>タイトル</span><input value="${state.activeAddModalType === 'minutes' ? '新規議事録' : '新規メモ'}"></label>
              <label class="edit-field"><span>日付</span><input value="${new Date().toISOString().slice(0, 10)}"></label>
              <label class="edit-field span-2"><span>本文</span><textarea placeholder="内容を入力"></textarea></label>
            </div>
            <div class="sub-modal-actions">
              <button class="secondary-button" data-close-add-modal type="button">キャンセル</button>
              <button class="primary-button" data-close-add-modal type="button">追加</button>
            </div>
          </section>
        </div>
      `
      : ''

    root.innerHTML = `
      <div class="modal-backdrop" data-close-modal>
        <section class="detail-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(deal.name)}">
          <div class="modal-head">
            <div>
              <span class="modal-type">${mode === 'contact' ? 'コンタクトカード' : '取引カード'}</span>
              <h2>${escapeHtml(company.name || deal.name)}</h2>
              <p>${escapeHtml(deal.name)} / ${escapeHtml(proposalSummary(deal))}</p>
            </div>
            <button class="modal-close" data-close-modal type="button" aria-label="Close">×</button>
          </div>
          <div class="modal-tabs">
            ${tabs.map((tab) => `<button class="${state.activeModalTab === tab.id ? 'is-active' : ''}" data-modal-tab="${tab.id}" type="button">${tab.label}</button>`).join('')}
          </div>
          ${body}
        </section>
        ${addModal}
      </div>
    `
  }

  function renderCallTestModal() {
    const aiCall = data.aiCall || {}
    const test = state.callConnectionTest || {}
    const steps = test.steps || []
    const stepRows = steps.length
      ? steps.map((step) => `<li class="${escapeHtml(step.state || '')}"><span>${escapeHtml(step.label)}</span><strong>${escapeHtml(step.value)}</strong></li>`).join('')
      : '<li><span>接続テスト</span><strong>未実行</strong></li>'

    return `
      <div class="modal-backdrop" data-close-call-test>
        <section class="detail-modal call-test-modal" role="dialog" aria-modal="true" aria-label="コール接続テスト">
          <div class="modal-head">
            <div>
              <span class="modal-type">VOICE CHECK</span>
              <h2>コール接続テスト</h2>
              <p>ポータルからGemini Live Relayへ接続し、AI音声応答の疎通を確認します。</p>
            </div>
            <button class="modal-close" data-close-call-test type="button" aria-label="Close">×</button>
          </div>
          <div class="call-test-summary">
            <div><span>Model</span><strong>${escapeHtml(aiCall.voice || 'Gemini 3.1 Live')}</strong></div>
            <div><span>Relay</span><strong>ws://127.0.0.1:8787/gemini-live</strong></div>
            <div><span>Status</span><strong class="${escapeHtml(test.status || 'idle')}">${escapeHtml(test.message || '未実行')}</strong></div>
          </div>
          <ol class="call-test-steps">${stepRows}</ol>
          <div class="call-test-actions">
            <button class="primary-button" data-run-call-test type="button">接続テスト</button>
            <a class="secondary-button" href="http://localhost:3002/call-settings/model-test" target="_blank" rel="noreferrer">AIモデル試験を開く</a>
          </div>
        </section>
      </div>
    `
  }

  function renderPipeline() {
    const stages = data.pipelineStages || []
    const deals = filteredDeals()
    $('#pipeline').innerHTML = `
      ${pageHead('Pipeline', 'MQLからLOSTまで、案件の現在地を横断で見る。')}
      ${renderPipelineHud(deals)}
      ${renderServiceFilters(deals)}
      <div class="pipeline-board">
        ${stages
          .map((stage) => {
            const stageDeals = deals.filter((deal) => deal.stage === stage.id)
            return `
              <section class="stage-column stage-${stageTone(stage.id)} stage-${stage.id}">
                <div class="stage-head"><div><em>${stageLevel(stage.id)}</em><strong>${stage.label}</strong><small>${stage.hint}</small></div><span>${stageDeals.length}</span></div>
                <div class="stage-deals" data-drop-stage="${stage.id}">${stageDeals.map(pipelineCard).join('') || '<p class="empty">No deals</p>'}</div>
              </section>
            `
          })
          .join('')}
      </div>
    `
  }

  function renderPipelineKeepingPosition() {
    const board = $('.pipeline-board')
    const scrollLeft = board ? board.scrollLeft : 0
    renderPipeline()
    const restore = () => {
      const nextBoard = $('.pipeline-board')
      if (nextBoard) nextBoard.scrollLeft = scrollLeft
    }
    window.requestAnimationFrame(restore)
    window.setTimeout(restore, 0)
  }

  function renderAll() {
    renderNav()
    renderPipeline()
    renderCall()
    renderDeals()
    activateTab(state.activeTab)
    renderModal()
  }

  function activateTab(id) {
    state.activeTab = id
    $$('.view').forEach((view) => view.classList.toggle('is-active', view.dataset.view === id))
    $$('.tab-button').forEach((button) => button.classList.toggle('is-active', button.dataset.tab === id))
    if (location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`)
  }

  function updateCallTest(status, message, steps) {
    state.callConnectionTest = {
      status,
      message,
      steps: steps || state.callConnectionTest.steps || [],
    }
    renderModal()
  }

  function buildGeminiRelayUrl() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//127.0.0.1:8787/gemini-live`
  }

  function portalCallStatusLabel(status) {
    if (status === 'connected') return '通話中'
    if (status === 'connecting') return '接続中'
    if (status === 'failed') return 'エラー'
    return '待機'
  }

  function portalCallActionLabel(status) {
    if (status === 'connected') return '切断'
    if (status === 'connecting') return '接続中'
    return 'ここを押して接続'
  }

  function addPortalCallLog(role, text) {
    const trimmed = String(text || '').trim()
    if (!trimmed) return
    state.portalCall.logs = [
      ...(state.portalCall.logs || []).slice(-60),
      {
        role,
        text: trimmed,
        at: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]
    if (state.activeTab === 'call') renderCall()
  }

  function renderPortalCallLogs() {
    const logs = state.portalCall.logs || []
    if (!logs.length) {
      return '<div class="call-log-empty">接続するとログが表示されます。</div>'
    }
    return logs
      .map((log) => `<div class="call-log ${escapeHtml(log.role)}"><span>${escapeHtml(log.role.toUpperCase())} · ${escapeHtml(log.at)}</span><p>${escapeHtml(log.text)}</p></div>`)
      .join('')
  }

  async function startPortalCall() {
    if (state.portalCall.status === 'connecting' || state.portalCall.status === 'connected') return
    state.portalCall.status = 'connecting'
    state.portalCall.message = 'Gemini Live Relayへ接続しています。'
    state.portalCall.logs = []
    renderCall()

    try {
      state.portalCall.audioContext = new AudioContext()
      await state.portalCall.audioContext.resume()
      state.portalCall.playbackTime = state.portalCall.audioContext.currentTime

      const ws = new WebSocket(buildGeminiRelayUrl())
      state.portalCall.ws = ws
      const timeout = window.setTimeout(() => {
        if (state.portalCall.ws !== ws) return
        stopPortalCall('Gemini Live Relayに接続できませんでした。', 'failed')
      }, 7000)

      ws.onopen = () => {
        window.clearTimeout(timeout)
        addPortalCallLog('system', 'Gemini Live relay connected.')
        ws.send(
          JSON.stringify({
            type: 'start',
            model: 'gemini-3.1-flash-live-preview',
            voice: 'Charon',
            systemInstruction: [
              'あなたは株式会社ルーキースマートジャパンの日本語コールAIです。',
              '日本語の電話として自然に、短く、落ち着いて話します。',
              '相手の発話が終わったら間を空けすぎず、すぐに返答を始めます。',
              '一度に質問は1つだけです。',
              '返答は原則1文です。',
            ].join('\\n'),
          }),
        )
      }
      ws.onerror = () => {
        window.clearTimeout(timeout)
        stopPortalCall('Gemini Live Relay接続でエラーが発生しました。', 'failed')
      }
      ws.onmessage = (event) => {
        const message = parseJson(event.data)
        if (!message || state.portalCall.ws !== ws) return
        if (message.type === 'error' || message.type === 'closed') {
          stopPortalCall(message.message || message.reason || 'Gemini Live接続が終了しました。', 'failed')
          return
        }
        handlePortalGeminiEvent(message.event)
      }
      ws.onclose = () => {
        if (state.portalCall.ws !== ws) return
        if (state.portalCall.status === 'connected' || state.portalCall.status === 'connecting') {
          stopPortalCall('Gemini Live接続が終了しました。', 'idle')
        }
      }
    } catch (error) {
      stopPortalCall(error instanceof Error ? error.message : 'コール接続に失敗しました。', 'failed')
    }
  }

  function stopPortalCall(message = '切断しました。', status = 'idle') {
    const call = state.portalCall
    const ws = call.ws
    call.ws = null
    call.recognitionActive = false
    call.recognitionPaused = false
    if (call.interimTimer) {
      window.clearTimeout(call.interimTimer)
      call.interimTimer = null
    }
    try {
      call.recognition?.abort()
    } catch {}
    try {
      ws?.close()
    } catch {}
    stopPortalPlayback()
    try {
      call.audioContext?.close()
    } catch {}
    call.audioContext = null
    call.playbackSources = []
    call.playbackTime = 0
    call.recognition = null
    call.lastTranscript = ''
    call.status = status
    call.message = message
    addPortalCallLog('system', message)
    if (state.activeTab === 'call') renderCall()
  }

  function handlePortalGeminiEvent(event) {
    if (event?.setupComplete) {
      state.portalCall.status = 'connected'
      state.portalCall.message = 'Gemini Live APIに接続しました。'
      addPortalCallLog('system', 'Gemini Live setup complete.')
      startPortalSpeechRecognition()
      state.portalCall.ws?.send(JSON.stringify({ type: 'client_content', text: '最初に短く名乗り、今少し話せるかだけ確認してください。' }))
      if (state.activeTab === 'call') renderCall()
      return
    }
    const content = event?.serverContent
    if (!content) return
    if (content.interrupted) {
      stopPortalPlayback()
      addPortalCallLog('system', 'Gemini response interrupted.')
    }
    if (typeof content.outputTranscription?.text === 'string') addPortalCallLog('assistant', content.outputTranscription.text)
    const parts = content.modelTurn?.parts || []
    for (const part of parts) {
      if (typeof part.text === 'string') addPortalCallLog('assistant', part.text)
      if (part.inlineData?.data) playPortalPcmAudio(part.inlineData.data, sampleRateFromMimeType(part.inlineData.mimeType) || 24000)
    }
  }

  function startPortalSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      addPortalCallLog('system', 'Browser speech recognition is unavailable.')
      state.portalCall.message = 'このブラウザでは音声認識が使えません。'
      if (state.activeTab === 'call') renderCall()
      return
    }

    const call = state.portalCall
    call.recognitionActive = true
    call.recognitionPaused = false
    call.lastTranscript = ''

    const recognition = new SpeechRecognition()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    call.recognition = recognition

    recognition.onstart = () => {
      if (state.portalCall.recognition !== recognition) return
      addPortalCallLog('system', 'Browser speech recognition started.')
    }

    recognition.onresult = (event) => {
      if (state.portalCall.recognition !== recognition || !state.portalCall.recognitionActive) return
      let transcript = ''
      let hasFinal = false
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript || ''
        if (event.results[index].isFinal) hasFinal = true
      }
      transcript = transcript.trim()
      if (!transcript || transcript === state.portalCall.lastTranscript) return

      if (hasPortalPlayback()) {
        stopPortalPlayback()
        addPortalCallLog('system', 'User speech interrupted AI playback.')
      }

      if (state.portalCall.interimTimer) window.clearTimeout(state.portalCall.interimTimer)
      state.portalCall.interimTimer = window.setTimeout(() => {
        sendPortalUserTranscript(transcript, hasFinal ? 'final' : 'interim')
      }, hasFinal ? 80 : 220)
    }

    recognition.onerror = (event) => {
      if (state.portalCall.recognition !== recognition) return
      if (event.error === 'no-speech' || event.error === 'aborted') return
      addPortalCallLog('system', `Speech recognition error: ${event.error || 'unknown'}`)
    }

    recognition.onend = () => {
      if (state.portalCall.recognition !== recognition) return
      if (!state.portalCall.recognitionActive || state.portalCall.recognitionPaused || state.portalCall.status !== 'connected') return
      window.setTimeout(() => {
        try {
          recognition.start()
        } catch {}
      }, 80)
    }

    try {
      recognition.start()
    } catch (error) {
      addPortalCallLog('system', error instanceof Error ? error.message : 'Speech recognition start failed.')
    }
  }

  function sendPortalUserTranscript(transcript, source = 'final') {
    const text = String(transcript || '').trim()
    const call = state.portalCall
    if (!text || !call.ws || call.status !== 'connected') return
    if (text === call.lastTranscript) return
    call.lastTranscript = text
    if (call.interimTimer) {
      window.clearTimeout(call.interimTimer)
      call.interimTimer = null
    }
    addPortalCallLog('user', text)
    try {
      call.ws.send(JSON.stringify({ type: 'client_content', text }))
      call.message = source === 'interim' ? '発話を検知しました。返答を生成しています。' : '返答を生成しています。'
      if (state.activeTab === 'call') renderCall()
    } catch {
      stopPortalCall('発話送信に失敗しました。', 'failed')
    }
  }

  function pausePortalSpeechRecognition() {
    const call = state.portalCall
    call.recognitionPaused = true
    try {
      call.recognition?.abort()
    } catch {}
  }

  function resumePortalSpeechRecognition() {
    const call = state.portalCall
    if (!call.recognition || !call.recognitionActive || call.status !== 'connected') return
    call.recognitionPaused = false
    window.setTimeout(() => {
      try {
        call.recognition?.start()
      } catch {}
    }, 60)
  }

  function playPortalPcmAudio(base64, sampleRate = 24000) {
    const call = state.portalCall
    const audioContext = call.audioContext
    if (!audioContext) return

    const samples = base64ToInt16Array(base64)
    if (!samples.length) return
    const buffer = audioContext.createBuffer(1, samples.length, sampleRate)
    const channel = buffer.getChannelData(0)
    for (let index = 0; index < samples.length; index += 1) {
      channel[index] = Math.max(-1, Math.min(1, samples[index] / 32768))
    }

    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.onended = () => {
      call.playbackSources = (call.playbackSources || []).filter((item) => item !== source)
    }

    const startAt = Math.max(audioContext.currentTime + 0.01, call.playbackTime || audioContext.currentTime)
    source.start(startAt)
    call.playbackTime = startAt + buffer.duration
    call.playbackSources = [...(call.playbackSources || []), source]
  }

  function stopPortalPlayback() {
    const call = state.portalCall
    for (const source of call.playbackSources || []) {
      try {
        source.stop()
      } catch {}
      try {
        source.disconnect()
      } catch {}
    }
    call.playbackSources = []
    call.playbackTime = call.audioContext?.currentTime || 0
  }

  function hasPortalPlayback() {
    return Boolean(state.portalCall.playbackSources?.length)
  }

  function base64ToInt16Array(base64) {
    const binary = window.atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    return new Int16Array(bytes.buffer)
  }

  function sampleRateFromMimeType(mimeType) {
    const match = String(mimeType || '').match(/rate=(\d+)/)
    return match ? Number(match[1]) : 24000
  }

  function runCallConnectionTest() {
    const steps = [
      { label: 'Relay接続', value: '確認中', state: 'running' },
      { label: 'Gemini setup', value: '待機', state: '' },
      { label: 'AI応答', value: '待機', state: '' },
    ]
    updateCallTest('running', '接続確認中', steps)

    let audioChunks = 0
    let setupComplete = false
    const ws = new WebSocket(buildGeminiRelayUrl())
    const timer = window.setTimeout(() => {
      steps[0] = { label: 'Relay接続', value: 'タイムアウト', state: 'failed' }
      updateCallTest('failed', 'RelayまたはGeminiの応答がありません', steps)
      try {
        ws.close()
      } catch {}
    }, 12000)

    ws.onopen = () => {
      steps[0] = { label: 'Relay接続', value: 'OK', state: 'ok' }
      steps[1] = { label: 'Gemini setup', value: '確認中', state: 'running' }
      updateCallTest('running', 'Gemini Liveへ接続中', steps)
      ws.send(
        JSON.stringify({
          type: 'start',
          model: 'gemini-3.1-flash-live-preview',
          voice: 'Charon',
          systemInstruction: '日本語で短く自然に返答してください。これは接続テストです。',
        }),
      )
    }
    ws.onerror = () => {
      window.clearTimeout(timer)
      steps[0] = { label: 'Relay接続', value: 'エラー', state: 'failed' }
      updateCallTest('failed', 'Gemini Live Relayへ接続できません', steps)
    }
    ws.onmessage = (event) => {
      const message = parseJson(event.data)
      if (!message) return
      if (message.type === 'error' || message.type === 'closed') {
        window.clearTimeout(timer)
        steps[2] = { label: 'AI応答', value: message.message || message.reason || 'エラー', state: 'failed' }
        updateCallTest('failed', '接続テストでエラーが発生しました', steps)
        return
      }
      const googleEvent = message.event || {}
      if (googleEvent.setupComplete && !setupComplete) {
        setupComplete = true
        steps[1] = { label: 'Gemini setup', value: 'OK', state: 'ok' }
        steps[2] = { label: 'AI応答', value: '確認中', state: 'running' }
        updateCallTest('running', 'テスト発話を送信中', steps)
        ws.send(JSON.stringify({ type: 'client_content', text: '接続テストです。短く一言だけ返答してください。' }))
        return
      }

      const parts = googleEvent.serverContent?.modelTurn?.parts || []
      audioChunks += parts.filter((part) => part.inlineData?.data).length
      if (audioChunks > 0) {
        window.clearTimeout(timer)
        steps[2] = { label: 'AI応答', value: `OK / audio ${audioChunks}`, state: 'ok' }
        updateCallTest('ok', '接続テスト成功', steps)
        try {
          ws.close()
        } catch {}
      }
    }
  }

  document.addEventListener('dragstart', (event) => {
    const card = event.target.closest('[data-drag-deal]')
    if (!card) return
    state.draggingDealId = card.dataset.dragDeal
    card.classList.add('is-dragging')
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-fde-deal', state.draggingDealId)
  })

  document.addEventListener('dragend', () => {
    state.draggingDealId = ''
    $$('.pipeline-card.is-dragging').forEach((card) => card.classList.remove('is-dragging'))
    $$('.stage-deals.is-drop-target').forEach((column) => column.classList.remove('is-drop-target'))
  })

  document.addEventListener('dragover', (event) => {
    if (!state.draggingDealId) return
    event.preventDefault()
    const dropTarget = event.target.closest('[data-drop-stage]')
    if (!dropTarget) {
      event.dataTransfer.dropEffect = 'none'
      return
    }
    dropTarget.classList.add('is-drop-target')
    event.dataTransfer.dropEffect = 'move'
  })

  document.addEventListener('dragleave', (event) => {
    const dropTarget = event.target.closest('[data-drop-stage]')
    if (!dropTarget || dropTarget.contains(event.relatedTarget)) return
    dropTarget.classList.remove('is-drop-target')
  })

  document.addEventListener('drop', (event) => {
    if (!state.draggingDealId) return
    event.preventDefault()
    const dropTarget = event.target.closest('[data-drop-stage]')
    if (!dropTarget) {
      state.suppressCardClick = true
      $$('.stage-deals.is-drop-target').forEach((column) => column.classList.remove('is-drop-target'))
      window.setTimeout(() => {
        state.suppressCardClick = false
      }, 120)
      return
    }
    const deal = (data.deals || []).find((item) => item.id === state.draggingDealId)
    if (deal) {
      deal.stage = dropTarget.dataset.dropStage
      state.suppressCardClick = true
      renderPipelineKeepingPosition()
      window.setTimeout(() => {
        state.suppressCardClick = false
      }, 120)
    }
    state.draggingDealId = ''
    $$('.stage-deals.is-drop-target').forEach((column) => column.classList.remove('is-drop-target'))
  })

  document.addEventListener('click', (event) => {
    const portalCallToggle = event.target.closest('[data-portal-call-toggle]')
    if (portalCallToggle) {
      if (state.portalCall.status === 'connected' || state.portalCall.status === 'connecting') {
        stopPortalCall('切断しました。', 'idle')
      } else {
        startPortalCall()
      }
      return
    }

    const callScenarioTab = event.target.closest('[data-call-scenario-key]')
    if (callScenarioTab) {
      state.activeCallScenarioKey = callScenarioTab.dataset.callScenarioKey
      renderCall()
      return
    }

    const openCallTest = event.target.closest('[data-open-call-test]')
    if (openCallTest) {
      state.activeCallTestModal = true
      state.callConnectionTest = {
        status: 'idle',
        message: '未実行',
        steps: [],
      }
      renderModal()
      return
    }

    const runCallTest = event.target.closest('[data-run-call-test]')
    if (runCallTest) {
      runCallConnectionTest()
      return
    }

    const closeCallTest = event.target.closest('[data-close-call-test]')
    if (closeCallTest && (event.target === closeCallTest || closeCallTest.classList.contains('modal-close'))) {
      state.activeCallTestModal = false
      renderModal()
      return
    }

    const tab = event.target.closest('[data-tab]')
    if (tab) {
      activateTab(tab.dataset.tab)
      return
    }

    const dealsView = event.target.closest('[data-deals-view]')
    if (dealsView) {
      state.activeDealsView = dealsView.dataset.dealsView
      renderDeals()
      return
    }

    const serviceFilter = event.target.closest('[data-service-filter]')
    if (serviceFilter) {
      state.activeServiceFilter = serviceFilter.dataset.serviceFilter
      renderPipeline()
      return
    }

    const openCard = event.target.closest('[data-open-card]')
    if (openCard) {
      if (state.suppressCardClick) return
      state.activeModalDealId = openCard.dataset.openCard
      state.activeModalTab = 'contact'
      renderModal()
      return
    }

    const modalTab = event.target.closest('[data-modal-tab]')
    if (modalTab) {
      state.activeModalTab = modalTab.dataset.modalTab
      state.activeAddModalType = ''
      state.activeRecordType = ''
      state.activeRecordId = ''
      renderModal()
      return
    }

    const deleteRecord = event.target.closest('[data-delete-record]')
    if (deleteRecord) {
      state.deletedRecords.add(recordKey(deleteRecord.dataset.recordType, deleteRecord.dataset.deleteRecord))
      if (state.activeRecordId === deleteRecord.dataset.deleteRecord && state.activeRecordType === deleteRecord.dataset.recordType) {
        state.activeRecordType = ''
        state.activeRecordId = ''
      }
      renderModal()
      return
    }

    const openRecord = event.target.closest('[data-open-record]')
    if (openRecord) {
      state.activeRecordType = openRecord.dataset.recordType
      state.activeRecordId = openRecord.dataset.openRecord
      renderModal()
      return
    }

    const closeRecord = event.target.closest('[data-close-record]')
    if (closeRecord) {
      state.activeRecordType = ''
      state.activeRecordId = ''
      renderModal()
      return
    }

    const addModal = event.target.closest('[data-add-modal]')
    if (addModal) {
      state.activeAddModalType = addModal.dataset.addModal
      renderModal()
      return
    }

    const closeAddModal = event.target.closest('[data-close-add-modal]')
    if (closeAddModal && closeAddModal.classList.contains('primary-button')) {
      const form = closeAddModal.closest('.sub-modal')
      const inputs = $$('input', form)
      const bodyField = $('textarea', form)
      const type = state.activeAddModalType
      const dealId = state.activeModalDealId
      const storeKey = `${dealId}:${type}`
      const item = {
        id: `${dealId}-${type}-${Date.now()}`,
        title: inputs[0]?.value || (type === 'minutes' ? '新規議事録' : '新規メモ'),
        date: inputs[1]?.value || new Date().toISOString().slice(0, 10),
        body: bodyField?.value || '',
      }
      state.addedRecords[storeKey] = [...(state.addedRecords[storeKey] || []), item]
      state.activeRecordType = type
      state.activeRecordId = item.id
      state.activeAddModalType = ''
      renderModal()
      return
    }

    if (closeAddModal && (event.target === closeAddModal || closeAddModal.tagName === 'BUTTON')) {
      state.activeAddModalType = ''
      renderModal()
      return
    }

    const closeModal = event.target.closest('[data-close-modal]')
    if (closeModal && (event.target === closeModal || closeModal.classList.contains('modal-close'))) {
      state.activeModalDealId = ''
      state.activeAddModalType = ''
      renderModal()
    }

  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.activeModalDealId) {
      if (state.activeAddModalType) {
        state.activeAddModalType = ''
      } else {
        state.activeModalDealId = ''
      }
      renderModal()
    }
  })

  $('#globalSearch').addEventListener('input', (event) => {
    state.search = event.target.value.trim()
    renderPipeline()
    renderDeals()
  })

  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '')
    if (tabs.some((tab) => tab.id === hash)) activateTab(hash)
  })

  const initial = location.hash.replace('#', '')
  if (tabs.some((tab) => tab.id === initial)) state.activeTab = initial
  if (initial === 'dashboard') {
    state.activeTab = 'pipeline'
    state.activeDealsView = 'dashboard'
  }
  renderAll()
})()
