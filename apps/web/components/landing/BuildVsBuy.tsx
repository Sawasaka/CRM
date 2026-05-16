'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Eyebrow, Section } from './atoms'

const TcoChart = () => {
  const data = [
    { name: '社内開発',  v: 105,  c: '#9b99a0' },
    { name: 'KikuCRM',   v: 10.8, c: '#abc7ff' },
  ]
  return (
    <div className="fo-recharts" style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 60, left: 50, bottom: 8 }}>
          <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => `¥${v}M`} />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={110} />
          <Bar dataKey="v" radius={[0, 8, 8, 0]}>
            {data.map((d, i) => (<Cell key={i} fill={d.c} />))}
            <LabelList dataKey="v" position="right" formatter={(v: number) => `¥${v}M`} fill="#e7e5ea" fontSize={13} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const BuildVsBuy = () => {
  return (
    <Section tone="obsidian" screenLabel="13-B Build vs Buy">
      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
        <div className="relative max-w-3xl">
          <Eyebrow color="#8dffc9">BUILD VS BUY ／ 3年TCO</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.04] mt-5">
            <span className="fo-gradient-text-soft">「自分たちで作ればいい」</span>
            <br />
            という選択肢の現実。
          </h2>
          <p className="mt-6 text-[#c7c5c9] text-[1.05rem] leading-relaxed max-w-2xl">
            社内で内製した場合と KikuCRM を導入した場合の 3年TCO（総保有コスト）を試算しました。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="rounded-3xl bg-dusk p-7 fo-glass-rim">
            <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-[#9b99a0]">社内開発</div>
            <div className="font-display font-bold text-[1.4rem] mt-2">3年TCO 約 ¥105M</div>
            <div className="mt-5 grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-[#7e7c83]">期間</div><div className="text-[#e7e5ea]">18-24ヶ月</div>
              <div className="text-[#7e7c83]">体制</div><div className="text-[#e7e5ea]">PM + Eng×3 + Designer×0.5</div>
              <div className="text-[#7e7c83]">初期</div><div className="text-[#e7e5ea] font-mono">¥80M</div>
              <div className="text-[#7e7c83]">年間運用</div><div className="text-[#e7e5ea] font-mono">¥12.5M</div>
              <div className="text-[#7e7c83]">年間インフラ</div><div className="text-[#e7e5ea] font-mono">¥0.47M</div>
            </div>
          </div>
          <div
            className="rounded-3xl p-[1px]"
            style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.5), rgba(0,113,227,0.3), transparent 70%)' }}
          >
            <div className="rounded-3xl bg-pitch p-7 fo-glass-rim relative overflow-hidden h-full">
              <div
                className="absolute -top-20 -right-20 w-56 h-56 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(171,199,255,0.20), transparent 60%)', filter: 'blur(40px)' }}
              />
              <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-aurora relative">KikuCRM</div>
              <div className="font-display font-bold text-[1.4rem] mt-2 fo-gradient-text relative">3年TCO 約 ¥10.8M</div>
              <div className="mt-5 grid grid-cols-2 gap-y-3 text-sm relative">
                <div className="text-[#7e7c83]">立ち上げ</div><div className="text-[#e7e5ea]">2週間</div>
                <div className="text-[#7e7c83]">体制</div><div className="text-[#e7e5ea]">追加採用 0名</div>
                <div className="text-[#7e7c83]">初期</div><div className="text-[#e7e5ea] font-mono">¥0</div>
                <div className="text-[#7e7c83]">月額 (Growth)</div><div className="text-[#e7e5ea] font-mono">¥298,000</div>
                <div className="text-[#7e7c83]">年間運用</div><div className="text-[#e7e5ea] font-mono">¥3.6M</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-dusk p-7 fo-glass-rim">
          <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#9b99a0] mb-3">3年TCO 比較</div>
          <TcoChart />
          <div className="mt-2 text-xs text-[#7e7c83]">
            PMフルタイム ¥1.2M/月、エンジニア ¥1M/月、デザイナー ¥1M/月、KikuCRM は Growth プラン仮価格 ¥298,000/月 想定。
          </div>
        </div>

        <div
          className="mt-8 rounded-3xl p-[1px]"
          style={{ background: 'linear-gradient(135deg, rgba(141,255,201,0.45), rgba(171,199,255,0.30), transparent 70%)' }}
        >
          <div className="rounded-3xl bg-pitch px-8 py-10 text-center fo-glass-rim">
            <div className="font-display font-bold text-[3rem] md:text-[5rem] leading-none fo-gradient-text">−約 90% 削減</div>
          </div>
        </div>

        <div className="mt-14 text-center max-w-3xl mx-auto">
          <div className="font-display font-bold text-[1.8rem] md:text-[2.4rem] leading-[1.15] fo-gradient-text">
            4ツール契約で 97% オフ。社内開発で 90% オフ。
          </div>
          <p className="mt-5 text-[#c7c5c9] text-[1.05rem] leading-relaxed">
            コスト削減の話ではありません。KikuCRM を使うことは、
            <br />
            <span className="text-aurora">レベニュー創出のための時間と資金を取り戻すこと</span>です。
          </p>
        </div>
      </div>
    </Section>
  )
}
