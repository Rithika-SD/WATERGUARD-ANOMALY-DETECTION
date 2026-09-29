import React, { useState, useEffect } from 'react'
import { TestTube2, CheckCircle2, XCircle, RefreshCw, Play } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function EdgeCases() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  const runTests = () => {
    setRunning(true)
    fetch('/api/edge-cases')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
        setRunning(false)
      })
  }

  useEffect(() => {
    runTests()
  }, [])

  if (loading || !data) {
    return <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading Edge Case Suite...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edge & Failure Case Suite"
        subtitle="Empirical validation of 8 critical edge cases: Legitimate Usage, Night Cleaning, Data Gaps, Sensor Stuck, Coastal Surge, Sudden Sensor Drops, Null Bursts, Tenant Turnover"
      >
        <button
          onClick={runTests}
          disabled={running}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2"
        >
          <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Executing Test Suite...' : 'Re-Run All Edge Case Tests'}</span>
        </button>
      </PageHeader>

      {/* Summary Scorecard */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <TestTube2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Edge Case Test Suite Results</h3>
            <p className="text-xs text-slate-500 font-medium">All 8 critical failure modes evaluated against system rules</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Passed</span>
            <p className="text-xl font-black text-emerald-700">{data.passed_cases}</p>
          </div>
          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Failed</span>
            <p className="text-xl font-black text-slate-700">{data.failed_cases}</p>
          </div>
        </div>
      </div>

      {/* Edge Case Cards */}
      <div className="space-y-4">
        {data.results.map((c) => (
          <div key={c.case_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-cyan-700 text-sm">{c.case_id}</span>
                  <h4 className="font-bold text-slate-900 text-sm">{c.case_name}</h4>
                </div>
                <p className="text-slate-500 font-medium mt-0.5">{c.description}</p>
              </div>

              <span className={`px-3 py-1 rounded-full font-black text-xs border ${
                c.status === 'PASS' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                STATUS: {c.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-500 uppercase">Input Scenario</span>
                <p className="text-slate-800 font-semibold mt-1">{c.input_scenario}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-500 uppercase">Expected System Behavior</span>
                <p className="text-slate-800 font-semibold mt-1">{c.expected_behavior}</p>
              </div>
            </div>

            <div className="p-3 bg-cyan-50/50 border border-cyan-200 rounded-xl flex items-start gap-2 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-900 font-bold">Actual Empirical Result: </strong>
                <span>{c.actual_result}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
