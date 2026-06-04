// /media 到着時に毎回フェードインを走らせ、/lp からのルート遷移を滑らかにする。
// (図鑑↔心理学のタブ切替は同一ページ内 state なので、ここは再マウントされず影響しない)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="fo-page-enter">{children}</div>
}
