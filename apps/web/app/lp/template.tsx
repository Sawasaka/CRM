// template.tsx はナビゲーションのたびに新しいインスタンスを生成するため、
// /lp 到着時に毎回フェードイン (.fo-page-enter) が走る。
// /media ↔ /lp のルート遷移の「ガクッ」を緩和する目的。
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="fo-page-enter">{children}</div>
}
