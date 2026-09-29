import React, { useState, useEffect } from 'react'
import { Waves, Sliders, AlertTriangle, CheckCircle2, Info, RefreshCw, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CFISensitivityAnalyzer() {
  const [r, setR] = useState(0.75)
  const [s, setS] = useState(0.60)
  const [b, setB] = useState(0.50)
  
  const [alpha, setAlpha] = useState(0.40)
  const [beta, setBeta] = useState(0.35)
  const [gamma, setGamma] = useState(0.25)
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSensitivity = () => {
    setLoading(true)
    setError('')
    const url = `/api/cfi/sensitivity?r=${r}&s=${s}&b=${b}&alpha=${alpha}&beta=${beta}&gamma=${gamma}`
    fetch(url)
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.detail) })
        return res.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch CFI data')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchSensitivity()
  }, [r, s, b, alpha, beta, gamma])

  const weightSum = roundTwo(alpha + beta + gamma)
  const isValidWeights = Math.abs(weightSum - 1.0) < 0.001

  function roundTwo(val) {
    return Math.round(val * 100) / 100
  }

  const applyPreset = (preset) => {
    setR(preset.r)
    setS(preset.s)
    setB(preset.b)
  }

  const resetWeights = () => {
    setAlpha(0.40)
    setBeta(0.35)
    setGamma(0.25)
  }

  const SCENARIO_COLORS = ['#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
      {/* Title & Formula Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Coastal Flood Index (CFI) & Sensitivity Analyzer</h3>
              <p className="text-slate-500 font-medium text-[11px]">Mathematical Composite Risk Formula & Weight Sensitivity Engine</p>
            </div>
          </div>
        </div>

        {/* Formula Badge */}
        <div className="bg-slate-900 text-slate-100 px-4 py-2 rounded-xl font-mono text-xs flex items-center gap-2 border border-slate-800 shadow-sm">
          <span className="text-cyan-400 font-bold">CFI</span>
          <span>=</span>
          <span className="text-emerald-400">α·R</span>
          <span>+</span>
          <span className="text-amber-400">β·S</span>
          <span>+</span>
          <span className="text-purple-400">γ·B</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Synthetic Test Scenarios */}
      {data && data.synthetic_environmental_scenarios && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Synthetic Coastal Test Scenarios:</span>
            <span className="text-[10px] text-slate-400">Click a scenario to load normalized R, S, B inputs</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.synthetic_environmental_scenarios.map(sc => (
              <button
                key={sc.id}
                onClick={() => applyPreset(sc)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 text-slate-700 border border-slate-200 rounded-lg transition-colors font-medium text-[11px] flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span>{sc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Environmental Input Sliders */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-600" />
            <span>Normalized Environmental Risk Inputs (0.0 to 1.0)</span>
          </h4>

          {/* Rainfall R */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">Rainfall Risk Index (R)</span>
              <span className="font-bold text-emerald-600">{r.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={r}
              onChange={(e) => setR(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Storm Surge S */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">Storm Surge / Tide Risk Index (S)</span>
              <span className="font-bold text-amber-600">{s.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={s}
              onChange={(e) => setS(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Blockage B */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">Drainage Blockage Risk Index (B)</span>
              <span className="font-bold text-purple-600">{b.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Configurable Formula Weights */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-600" />
              <span>Configurable Formula Weights (Must Sum to 1.0)</span>
            </h4>
            <button onClick={resetWeights} className="text-[10px] text-cyan-600 font-bold hover:underline">
              Reset Default
            </button>
          </div>

          {/* Alpha */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">Rainfall Weight (α)</span>
              <span className="font-bold text-emerald-600">{alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Beta */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">Surge / Tide Weight (β)</span>
              <span className="font-bold text-amber-600">{beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Gamma */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">Blockage Weight (γ)</span>
              <span className="font-bold text-purple-600">{gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={gamma}
              onChange={(e) => setGamma(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Weight Validation Meter */}
          <div className={`p-2 rounded-lg text-center font-bold text-[11px] border ${
            isValidWeights ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            Weights Sum: {weightSum.toFixed(2)} {isValidWeights ? '✓ Valid (Sums to 1.0)' : '⚠ Invalid (Must sum to 1.0)'}
          </div>
        </div>

      </div>

      {/* Results Display */}
      {data && (
        <div className="space-y-6 pt-2">
          
          {/* Main CFI Result Card */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Calculated Coastal Flood Index (CFI)</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">CFI Score = {data.calculated_cfi} / 1.0</h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Math: ({alpha} × {r}) + ({beta} × {s}) + ({gamma} × {b}) = {data.calculated_cfi}
              </p>
            </div>

            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-right">
              <span className="text-[10px] text-slate-300 uppercase font-semibold">Impact on Risk Score</span>
              <p className="text-lg font-bold text-emerald-400">
                {data.sample_risk_impact.risk_level} (Score: {data.sample_risk_impact.risk_score})
              </p>
            </div>
          </div>

          {/* Sensitivity Scenario Comparison Table & Chart */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Weight Sensitivity Scenario Comparison</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Bar Chart */}
              <div className="h-60 bg-white p-3 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sensitivity_analysis.sensitivity_scenarios}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="profile_name" tick={{ fontSize: 9 }} interval={0} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="cfi_score" name="CFI Score" radius={[4, 4, 0, 0]}>
                      {data.sensitivity_analysis.sensitivity_scenarios.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SCENARIO_COLORS[index % SCENARIO_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-200/60 border-b border-slate-300 text-slate-700 font-bold uppercase">
                      <th className="p-2">Weight Profile</th>
                      <th className="p-2">α, β, γ Weights</th>
                      <th className="p-2">CFI Score</th>
                      <th className="p-2">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {data.sensitivity_analysis.sensitivity_scenarios.map((sc, idx) => (
                      <tr key={sc.profile_id} className="hover:bg-white">
                        <td className="p-2 font-bold text-slate-900">{sc.profile_name}</td>
                        <td className="p-2 text-slate-600 font-mono">α={sc.alpha}, β={sc.beta}, γ={sc.gamma}</td>
                        <td className="p-2 font-extrabold text-cyan-700">{sc.cfi_score}</td>
                        <td className="p-2"><span className="px-2 py-0.5 rounded bg-slate-200 font-semibold">{sc.risk_category}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* Data Limitation Explanation */}
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-2.5 text-xs">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider">Technical Limitation & Data Context</p>
              <p className="text-amber-800 font-medium leading-relaxed mt-0.5">
                {data.data_limitation_note}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
