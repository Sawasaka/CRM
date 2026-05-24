'use client'

type Block =
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'keyValue'; label: string; value: string }
  | { type: 'label'; text: string }
  | { type: 'paragraph'; text: string }

export function ChatAnswer({ content }: { content: string }) {
  const blocks = parseAnswerBlocks(content)

  return (
    <div className="space-y-3 text-[13.5px] leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h3
              key={`${block.type}-${index}`}
              className="pt-1 text-[13px] font-semibold tracking-normal"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {block.text}
            </h3>
          )
        }

        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul'
          return (
            <ListTag
              key={`${block.type}-${index}`}
              className={`space-y-1.5 pl-4 ${block.ordered ? 'list-decimal' : 'list-disc'}`}
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${itemIndex}-${item.slice(0, 20)}`} className="pl-1">
                  <FormattedInline text={item} />
                </li>
              ))}
            </ListTag>
          )
        }

        if (block.type === 'keyValue') {
          return (
            <div key={`${block.type}-${index}`} className="grid gap-1 sm:grid-cols-[96px_1fr]">
              <div
                className="text-[11.5px] font-medium"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                {block.label}
              </div>
              <div style={{ color: 'var(--color-obs-text-muted)' }}>
                <FormattedInline text={block.value} />
              </div>
            </div>
          )
        }

        if (block.type === 'label') {
          return (
            <div
              key={`${block.type}-${index}`}
              className="text-[12px] font-medium"
              style={{ color: 'var(--color-obs-primary)' }}
            >
              {block.text}
            </div>
          )
        }

        return (
          <p key={`${block.type}-${index}`} style={{ color: 'var(--color-obs-text-muted)' }}>
            <FormattedInline text={block.text} />
          </p>
        )
      })}
    </div>
  )
}

function parseAnswerBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: { items: string[]; ordered: boolean } | null = null

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    const text = paragraph.join(' ').trim()
    if (text) blocks.push({ type: 'paragraph', text: cleanInline(text) })
    paragraph = []
  }

  const flushList = () => {
    if (!list) return
    if (list.items.length > 0) blocks.push({ type: 'list', items: list.items, ordered: list.ordered })
    list = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = line.match(/^#{1,4}\s+(.+)$/)
    if (heading?.[1]) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', text: cleanInline(heading[1]) })
      continue
    }

    const bullet = line.match(/^[-*・]\s+(.+)$/)
    if (bullet?.[1]) {
      flushParagraph()
      const item = cleanInline(bullet[1])
      if (!list || list.ordered) list = { ordered: false, items: [] }
      list.items.push(item)
      continue
    }

    const numbered = line.match(/^\d+[.)]\s+(.+)$/)
    if (numbered?.[1]) {
      flushParagraph()
      const item = cleanInline(numbered[1])
      if (!list || !list.ordered) list = { ordered: true, items: [] }
      list.items.push(item)
      continue
    }

    const keyValue = line.match(/^([^:：]{1,18})[:：]\s*(.+)$/)
    if (keyValue?.[1] && keyValue?.[2] && isReadableLabel(keyValue[1])) {
      flushParagraph()
      flushList()
      blocks.push({
        type: 'keyValue',
        label: cleanInline(keyValue[1]),
        value: cleanInline(keyValue[2]),
      })
      continue
    }

    const labelOnly = line.match(/^([^:：]{1,18})[:：]$/)
    if (labelOnly?.[1] && isReadableLabel(labelOnly[1])) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'label', text: `${cleanInline(labelOnly[1])}:` })
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', text: content }]
}

function isReadableLabel(label: string): boolean {
  return /^(結論|根拠|推測|仮説|課題|理由|次|氏名|所属|役職|事業|補足|出典|確認|優先度|示唆|アクション|リスク)$/.test(
    label.trim()
  )
}

function FormattedInline({ text }: { text: string }) {
  const match = text.match(/^(根拠|推測|仮説|結論|次アクション|確認事項)[:：]\s*(.+)$/)
  if (!match) return <>{text}</>

  return (
    <>
      <span className="font-medium" style={{ color: 'var(--color-obs-text)' }}>
        {match[1]}:
      </span>{' '}
      {match[2]}
    </>
  )
}

function cleanInline(text: string): string {
  return text.replace(/\*\*/g, '').replace(/`/g, '').trim()
}
