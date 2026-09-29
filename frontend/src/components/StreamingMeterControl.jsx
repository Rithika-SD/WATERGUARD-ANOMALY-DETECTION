import React, { useState, useEffect } from 'react'
import { Activity, Play, RotateCcw, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Cpu, ListFilter } from 'lucide-react'

export default function StreamingMeterControl({ onSimulationComplete }) {
  const [mode, setMode] = useState('normal')
  const [count, setCount] = useState(50)
  const [latenessWindow, setLatenessWindow] = useState(120)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/streaming/status')
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      console.error('Error fetching streaming status:', err)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleStartSimulation = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/streaming/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          count: parseInt(count) || 50,
          lateness_window_minutes: parseInt(latenessWindow) || 120
        })
      })
      const data = await res.json()
      setStatus(data)
      if (onSimulationComplete) onSimulationComplete()
    } catch (err) {
      console.error('Simulation launch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    try {
      const res = await fetch('/api/streaming/reset', { method: 'POST' })
      const data = await res.json()
      setStatus(data)
      if (onSimulationComplete) onSimulationComplete()
    } catch (err) {
      console.error('Buffer reset error:', err)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-700">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Streaming Meter Feed Simulator & Reading Buffer</h2>
            <p className="text-xs text-slate-500 font-medium">
              Simulates 15-min sub-meter streams, deduplicates events, sorts late arrivals, and enforces lateness limits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Buffer
          </button>
          <button
            onClick={handleStartSimulation}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loading ? 'Running Feed...' : 'Inject Stream'}
          </button>
        </div>
      </div>

      {/* Simulator Controls Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Simulation Feed Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="normal">Normal Chronological Feeds</option>
            <option value="delayed">Delayed Meter Feeds (30-90 min late)</option>
            <option value="out_of_order">Out-of-Order Arriving Streams</option>
            <option value="duplicate">Duplicate Meter Readings</option>
            <option value="edge_cases">Edge Cases (Bad stamps, nulls, window breach)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Stream Reading Count</label>
          <input
            type="number"
            min="5"
            max="200"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Lateness Window (Minutes)</label>
          <input
            type="number"
            min="15"
            max="720"
            value={latenessWindow}
            onChange={(e) => setLatenessWindow(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex flex-col justify-end">
          <div className="text-[11px] text-slate-500 font-medium leading-tight">
            Mode Active: <span className="font-bold text-cyan-700 uppercase">{status?.mode || mode}</span>
            <br />
            Status: <span className="font-bold text-emerald-600">{status?.status || 'READY'}</span>
          </div>
        </div>
      </div>

      {/* Live Statistics Cards */}
      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Feeds</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">{status.total_received}</p>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Processed</span>
            <p className="text-lg font-black text-emerald-700 mt-0.5">{status.processed_count}</p>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Delayed</span>
            <p className="text-lg font-black text-amber-700 mt-0.5">{status.delayed_count}</p>
          </div>

          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Out-Of-Order</span>
            <p className="text-lg font-black text-blue-700 mt-0.5">{status.out_of_order_count}</p>
          </div>

          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Duplicates</span>
            <p className="text-lg font-black text-purple-700 mt-0.5">{status.duplicate_count}</p>
          </div>

          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Rejected</span>
            <p className="text-lg font-black text-rose-700 mt-0.5">{status.rejected_count}</p>
          </div>
        </div>
      )}

      {/* Failure & Rejection Breakdown */}
      {status?.rejected_count > 0 && (
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-rose-900">Failure Rejection Breakdown & Reasons:</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(status.rejection_reasons || {}).map(([reason, cnt]) => cnt > 0 && (
              <span key={reason} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <span>{reason}</span>
                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-900 rounded-md text-[10px] font-black">{cnt}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live Stream Buffer Log */}
      {status?.recent_processed?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              Recent Reordered Buffer Log (Event Time vs Ingestion Time)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Sorted chronologically before baseline calculation</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Meter ID</th>
                  <th className="py-2.5 px-3">Apt / Zone</th>
                  <th className="py-2.5 px-3">Event Time (Sensor)</th>
                  <th className="py-2.5 px-3">Ingestion Time (Server)</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Flow (L)</th>
                  <th className="py-2.5 px-3">Buffer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {status.recent_processed.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-900">{r.meter_id}</td>
                    <td className="py-2 px-3">{r.apartment_id} • {r.zone}</td>
                    <td className="py-2 px-3 font-mono text-[11px]">{r.event_timestamp}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{r.ingestion_timestamp}</td>
                    <td className="py-2 px-3">
                      {r.delay_minutes > 0 ? (
                        <span className="text-amber-700 font-semibold">{r.delay_minutes} m late</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">&lt; 1 m</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-bold text-cyan-800">{r.consumption_liters} L</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACCEPTED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
