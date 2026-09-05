import React from 'react'
import { AlertCircle, CheckCircle2, Moon, TrendingUp, Zap, Info } from 'lucide-react'

export default function EvidencePanel({ evidence = [], title = "Supporting Evidence & Rules" }) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400" />
        <span>No specific anomaly triggers recorded. Flow parameters normal.</span>
      </div>
    )
  }

  const getIcon = (item) => {
    const text = item.toLowerCase()
    if (text.includes('night')) return Moon
    if (text.includes('z-score') || text.includes('deviation')) return TrendingUp
    if (text.includes('spike') || text.includes('baseline')) return Zap
    return AlertCircle
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-cyan-600" />
        {title}
      </h4>
      <ul className="space-y-2">
        {evidence.map((item, idx) => {
          const Icon = getIcon(item)
          return (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="p-1 bg-cyan-50 text-cyan-700 rounded flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="leading-relaxed font-medium">{item}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
