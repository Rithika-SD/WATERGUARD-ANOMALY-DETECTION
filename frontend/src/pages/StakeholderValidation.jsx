import React, { useState, useEffect } from 'react'
import { Users, CheckCircle, Info, Send } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function StakeholderValidation() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('Apartment Manager')
  const [ease, setEase] = useState(5)
  const [usefulness, setUsefulness] = useState(5)
  const [trust, setTrust] = useState(4)
  const [clarity, setClarity] = useState(5)
  const [alertUse, setAlertUse] = useState(5)
  const [workload, setWorkload] = useState(4)
  const [willingness, setWillingness] = useState(5)
  const [comments, setComments] = useState('')
  const [submittedMsg, setSubmittedMsg] = useState('')

  const fetchResults = () => {
    fetch('/api/stakeholder/results')
      .then(res => res.json())
      .then(d => {
        setResults(d)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchResults()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetch('/api/stakeholder/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        respondent_role: role,
        ease_of_use: ease,
        usefulness: usefulness,
        trust_in_recommendations: trust,
        explanation_clarity: clarity,
        alert_usefulness: alertUse,
        maintenance_workload_rating: workload,
        willingness_to_use: willingness,
        comments: comments
      })
    })
      .then(res => res.json())
      .then(d => {
        setSubmittedMsg('Feedback recorded successfully! Marked with live field response flag.')
        fetchResults()
      })
  }

  if (loading || !results) {
    return <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading Validation Data...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stakeholder Field Validation"
        subtitle="Qualitative evaluation template and feedback collection for Apartment Managers, Maintenance Staff, and Building Supervisors"
      />

      {/* Mandatory Demo Label Banner */}
      <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex items-center gap-3 text-xs">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="font-bold uppercase tracking-wider">Demo / Template Validation Mode</p>
          <p className="text-amber-800 font-medium">{results.disclaimer}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Interactive Field Evaluation Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Submit Field Feedback Response</span>
          </h3>

          {submittedMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg font-semibold border border-emerald-200">
              {submittedMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stakeholder Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Apartment Manager">Apartment Manager</option>
                <option value="Maintenance Staff">Maintenance Staff</option>
                <option value="Building Supervisor">Building Supervisor</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Ease of Use (1-5)</span>
                <span className="font-bold text-cyan-600">{ease}/5</span>
              </div>
              <input type="range" min="1" max="5" value={ease} onChange={(e) => setEase(Number(e.target.value))} className="w-full accent-cyan-600" />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Trust in Localisation Recommendations (1-5)</span>
                <span className="font-bold text-cyan-600">{trust}/5</span>
              </div>
              <input type="range" min="1" max="5" value={trust} onChange={(e) => setTrust(Number(e.target.value))} className="w-full accent-cyan-600" />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Explanation Clarity (1-5)</span>
                <span className="font-bold text-cyan-600">{clarity}/5</span>
              </div>
              <input type="range" min="1" max="5" value={clarity} onChange={(e) => setClarity(Number(e.target.value))} className="w-full accent-cyan-600" />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Willingness to Deploy in Field (1-5)</span>
                <span className="font-bold text-cyan-600">{willingness}/5</span>
              </div>
              <input type="range" min="1" max="5" value={willingness} onChange={(e) => setWillingness(Number(e.target.value))} className="w-full accent-cyan-600" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qualitative Field Comments</label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share feedback on alert clarity or workflow fit..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Submit Evaluation Feedback</span>
            </button>
          </form>
        </div>

        {/* Right: Collected Responses List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Collected Field Responses</h3>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {results.responses.map((r) => (
              <div key={r.feedback_id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.respondent_role}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.is_demo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {r.is_demo ? 'DEMO TEMPLATE' : 'LIVE RESPONSE'}
                  </span>
                </div>
                <p className="text-slate-600 font-medium italic">"{r.comments}"</p>
                <div className="flex gap-3 text-[11px] font-semibold text-slate-700 pt-1 border-t border-slate-200">
                  <span>Ease: {r.ease_of_use}/5</span>
                  <span>Trust: {r.trust_in_recommendations}/5</span>
                  <span>Clarity: {r.explanation_clarity}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
