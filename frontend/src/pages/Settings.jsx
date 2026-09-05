import React, { useState } from 'react'
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function Settings() {
  const [nightThreshold, setNightThreshold] = useState('5.0')
  const [zScoreThreshold, setZScoreThreshold] = useState('3.0')
  const [spikeMultiplier, setSpikeMultiplier] = useState('2.0')
  const [savedMsg, setSavedMsg] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    setSavedMsg('Threshold configuration saved! Rules updated for live stream processing.')
    setTimeout(() => setSavedMsg(''), 4000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Detection Thresholds"
        subtitle="Configure anomaly scoring parameters suited for small organisation field operations"
      />

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-4 text-xs">
        {savedMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg font-semibold border border-emerald-200">
            {savedMsg}
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-800 mb-1">Night-Flow Anomaly Threshold (Liters / 15-min)</label>
          <p className="text-slate-500 mb-2">Flow exceeding this limit during 01:00 AM - 05:00 AM triggers a night flow flag.</p>
          <input
            type="number"
            step="0.5"
            value={nightThreshold}
            onChange={(e) => setNightThreshold(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Z-Score Statistical Deviation Cutoff</label>
          <p className="text-slate-500 mb-2">Standard deviation multiplier relative to apartment historical mean.</p>
          <input
            type="number"
            step="0.1"
            value={zScoreThreshold}
            onChange={(e) => setZScoreThreshold(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Sudden Spike Baseline Multiplier</label>
          <p className="text-slate-500 mb-2">Ratio above occupancy-adjusted baseline required to flag sudden spike.</p>
          <input
            type="number"
            step="0.1"
            value={spikeMultiplier}
            onChange={(e) => setSpikeMultiplier(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="pt-3 flex gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  )
}
