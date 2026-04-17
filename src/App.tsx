import { useEffect, useState } from 'react'

const EXAM_DATE = new Date('2026-08-01T00:00:00+09:00')

function daysUntil(target: Date): number {
  const now = new Date()
  const ms = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

function App() {
  const [days, setDays] = useState(() => daysUntil(EXAM_DATE))

  useEffect(() => {
    const id = setInterval(() => setDays(daysUntil(EXAM_DATE)), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6">
      <p className="text-sm uppercase tracking-widest text-slate-400">
        gaipass
      </p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight">
        生成AIパスポート試験まで
      </h1>
      <div className="mt-10 flex items-baseline gap-3">
        <span className="text-8xl font-black tabular-nums">{days}</span>
        <span className="text-2xl text-slate-400">日</span>
      </div>
      <p className="mt-6 text-slate-400 text-sm">
        目標日: {EXAM_DATE.getFullYear()}-
        {String(EXAM_DATE.getMonth() + 1).padStart(2, '0')}-
        {String(EXAM_DATE.getDate()).padStart(2, '0')}
      </p>
    </main>
  )
}

export default App
