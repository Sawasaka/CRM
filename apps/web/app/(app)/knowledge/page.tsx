'use client'

import { ObsHero, ObsPageShell } from '@/components/obsidian'
import { SourcesView } from '@/components/knowledge/SourcesView'

export default function KnowledgePage() {
  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Knowledge"
          title="ナレッジ"
          caption="商談議事録（Google Meet / Zoom）から、営業ナレッジを自動でQ&A化。"
        />

        <SourcesView />
      </div>
    </ObsPageShell>
  )
}
