import React, { useState, useEffect } from 'react'
import { FlaskConical, CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function Evaluation() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/evaluation')
      .then(res => res.json())
      .then(d => {
        setReport(d)
        setLoading(false)
      })
  }, [])

  if (loading || !report) {
    return <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading Evaluation Report...</div>
  }

  const { baseline, proposed, kpi, error_analysis } = report

  return (
    <div className="space-y-6">
      <PageHeader
        title="Model Evaluation & Baseline Comparison"
        subtitle="Rigorous empirical evaluation comparing threshold baseline against explainable proposed anomaly pipeline"
      />

      {/* KPI Target Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        kpi.status === 'PASS' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl text-white ${kpi.status === 'PASS' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm uppercase tracking-wider">Primary Field KPI Target</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                kpi.status === 'PASS' ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
              }`}>
                STATUS: {kpi.status}
              </span>
            </div>
            <p className="text-base font-extrabold mt-1">{kpi.target_description}</p>
            <p className="text-xs text-slate-700 mt-1 font-medium">{kpi.explanation}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center min-w-[140px]">
          <span className="text-xs text-slate-500 font-semibold uppercase">Measured Pre-billing KPI</span>
          <p className="text-3xl font-black text-emerald-700 mt-0.5">{kpi.measured_value_percent}%</p>
          <span className="text-[10px] text-slate-400 font-medium">Target: ≥ {kpi.target_value_percent}%</span>
        </div>
      </div>

      {/* Baseline vs Proposed Metrics Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Quantitative Evaluation Metrics</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="p-3.5">Metric</th>
                <th className="p-3.5">Simple Threshold Baseline</th>
                <th className="p-3.5">Explainable Hybrid System (Proposed)</th>
                <th className="p-3.5">Improvement Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Precision</td>
                <td className="p-3.5 text-slate-600">{(baseline.precision * 100).toFixed(1)}%</td>
                <td className="p-3.5 font-bold text-emerald-700">{(proposed.precision * 100).toFixed(1)}%</td>
                <td className="p-3.5 font-bold text-emerald-600">+{(proposed.precision - baseline.precision) * 100}%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Recall</td>
                <td className="p-3.5 text-slate-600">{(baseline.recall * 100).toFixed(1)}%</td>
                <td className="p-3.5 font-bold text-emerald-700">{(proposed.recall * 100).toFixed(1)}%</td>
                <td className="p-3.5 font-bold text-emerald-600">+{(proposed.recall - baseline.recall) * 100}%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">F1 Score</td>
                <td className="p-3.5 text-slate-600">{baseline.f1}</td>
                <td className="p-3.5 font-bold text-cyan-700">{proposed.f1}</td>
                <td className="p-3.5 font-bold text-emerald-600">+{(proposed.f1 - baseline.f1).toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">False Positive Rate</td>
                <td className="p-3.5 text-red-600">{(baseline.false_positive_rate * 100).toFixed(1)}%</td>
                <td className="p-3.5 font-bold text-emerald-700">{(proposed.false_positive_rate * 100).toFixed(1)}%</td>
                <td className="p-3.5 font-bold text-emerald-600">-{(baseline.false_positive_rate - proposed.false_positive_rate) * 100}% (Reduction)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Avg Lead Time Before Billing</td>
                <td className="p-3.5 text-slate-600">{baseline.avg_detection_lead_time_hours} hours</td>
                <td className="p-3.5 font-bold text-cyan-700">{proposed.avg_detection_lead_time_hours} hours</td>
                <td className="p-3.5 font-bold text-emerald-600">+{(proposed.avg_detection_lead_time_hours - baseline.avg_detection_lead_time_hours)} hours earlier</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Analysis Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Error Analysis & False Positives Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <h4 className="font-bold text-amber-900">False Positive Analysis ({proposed.false_positives} cases)</h4>
            {error_analysis.false_positives.map((fp, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                <p className="font-bold text-slate-800">{fp.case_id}: Apt {fp.apartment_id} ({fp.zone})</p>
                <p className="text-slate-600 mt-0.5">Reason: {fp.reason}</p>
                <p className="text-emerald-700 font-semibold mt-1">Mitigation: {fp.mitigation}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
            <h4 className="font-bold text-red-900">False Negative Analysis</h4>
            {error_analysis.false_negatives.map((fn, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 shadow-2xs">
                <p className="font-bold text-slate-800">{fn.case_id}: Apt {fn.apartment_id} ({fn.zone})</p>
                <p className="text-slate-600 mt-0.5">Reason: {fn.reason}</p>
                <p className="text-emerald-700 font-semibold mt-1">Mitigation: {fn.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
