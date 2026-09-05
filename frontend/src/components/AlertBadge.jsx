import React from 'react'

export default function AlertBadge({ level }) {
  const styles = {
    Critical: 'bg-red-100 text-red-700 border-red-300 dot-red-600',
    High_Risk: 'bg-orange-100 text-orange-700 border-orange-300 dot-orange-600',
    Suspicious: 'bg-amber-100 text-amber-700 border-amber-300 dot-amber-600',
    Watch: 'bg-blue-100 text-blue-700 border-blue-300 dot-blue-600',
    Normal: 'bg-emerald-100 text-emerald-700 border-emerald-300 dot-emerald-600',
  }

  const dotColors = {
    Critical: 'bg-red-600 animate-ping',
    High_Risk: 'bg-orange-600',
    Suspicious: 'bg-amber-500',
    Watch: 'bg-blue-500',
    Normal: 'bg-emerald-500',
  }

  const currentStyle = styles[level] || styles.Watch
  const dotColor = dotColors[level] || 'bg-blue-500'
  const displayLabel = level ? level.replace('_', ' ') : 'Watch'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {displayLabel}
    </span>
  )
}
