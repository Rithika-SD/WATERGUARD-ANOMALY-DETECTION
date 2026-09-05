import React from 'react'

export default function RiskScore({ score = 0, size = "md" }) {
  const getColor = (s) => {
    if (s >= 80) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500' }
    if (s >= 60) return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-500' }
    if (s >= 40) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500' }
    if (s >= 20) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500' }
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500' }
  }

  const { text, bg, border } = getColor(score)
  const sizeClasses = size === "lg" ? "w-20 h-20 text-2xl font-black" : "w-12 h-12 text-sm font-bold"

  return (
    <div className={`rounded-full border-4 ${border} ${bg} ${text} ${sizeClasses} flex flex-col items-center justify-center shadow-inner`}>
      <span>{Math.round(score)}</span>
      {size === "lg" && <span className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Score</span>}
    </div>
  )
}
