import { ObsPageShell } from '@/components/obsidian'

// ─── 共通 loading.tsx ─────────────────────────────────────────────────────
// Next.js App Router の規約: ルートグループ直下に loading.tsx を置くと、
// 子セグメント間の遷移中にこの UI が即時表示される (React Suspense fallback)。
//
// 各ページが個別 loading.tsx を持たない場合のフォールバックとして、
// ヘッダ + 検索バー + テーブル行 風のスケルトンを軽量に表示し、
// 「クリック→白画面→データ表示」の体感ラグを消す。

export default function Loading() {
  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* Hero スケルトン */}
        <div className="pt-12 pb-10 flex flex-col gap-3">
          <Block w="76px" h="11px" radius="3px" opacity={0.6} />
          <Block w="220px" h="44px" radius="6px" />
          <Block w="420px" h="14px" radius="3px" opacity={0.6} />
        </div>

        {/* フィルタバー風スケルトン (横並び) */}
        <div className="flex items-center gap-3 mb-6">
          <Block w="320px" h="38px" radius="999px" />
          <Block w="120px" h="34px" radius="999px" opacity={0.7} />
          <Block w="110px" h="34px" radius="999px" opacity={0.7} />
          <Block w="100px" h="34px" radius="999px" opacity={0.7} />
        </div>

        {/* テーブルカード */}
        <div
          className="rounded-[var(--radius-obs-xl)] overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,21,26,0.6) 0%, rgba(14,15,19,0.65) 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.08)',
          }}
        >
          {/* ヘッダー行 */}
          <div
            className="grid grid-cols-[28px_minmax(280px,2fr)_120px_120px_100px_120px] gap-4 px-6 py-3"
            style={{ boxShadow: 'inset 0 -1px 0 rgba(171,199,255,0.08)' }}
          >
            <Block w="16px" h="16px" radius="3px" opacity={0.4} />
            <Block w="60px" h="11px" radius="2px" opacity={0.5} />
            <Block w="80px" h="11px" radius="2px" opacity={0.5} />
            <Block w="60px" h="11px" radius="2px" opacity={0.5} />
            <Block w="60px" h="11px" radius="2px" opacity={0.5} />
            <Block w="40px" h="11px" radius="2px" opacity={0.5} />
          </div>
          {/* ボディ行 (8 件) */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[28px_minmax(280px,2fr)_120px_120px_100px_120px] gap-4 px-6 py-4 items-center"
              style={{ boxShadow: 'inset 0 -1px 0 rgba(171,199,255,0.04)' }}
            >
              <Block w="16px" h="16px" radius="3px" opacity={0.35} />
              <div className="flex items-center gap-3">
                <Block w="36px" h="36px" radius="10px" />
                <div className="flex flex-col gap-1.5">
                  <Block w="180px" h="14px" radius="3px" />
                  <Block w="120px" h="11px" radius="2px" opacity={0.55} />
                </div>
              </div>
              <Block w="84px" h="22px" radius="999px" opacity={0.7} />
              <Block w="60px" h="13px" radius="3px" opacity={0.55} />
              <Block w="72px" h="13px" radius="3px" opacity={0.55} />
              <Block w="48px" h="13px" radius="3px" opacity={0.55} />
            </div>
          ))}
        </div>
      </div>
    </ObsPageShell>
  )
}

// Liquid Obsidian トーンに合わせたスケルトンブロック (シマー付き)
function Block({
  w,
  h,
  radius = '4px',
  opacity = 1,
}: {
  w: string
  h: string
  radius?: string
  opacity?: number
}) {
  return (
    <span
      className="inline-block align-middle shimmer-block"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        opacity,
        background:
          'linear-gradient(90deg, rgba(171,199,255,0.06) 0%, rgba(171,199,255,0.14) 50%, rgba(171,199,255,0.06) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerMove 1.6s linear infinite',
        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.05)',
      }}
    />
  )
}
