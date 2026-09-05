import React, { useState, useEffect } from 'react'
import { TrendingUp, Droplets, Users, DollarSign, AlertCircle, ShieldAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function CostImpact() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cost-impact')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading || !data) {
    return <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading Cost & Impact Analysis...</div>
  }

  const { environmental, social, cost, maintenance_burden, unintended_consequences } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost vs Benefit & Impact Analysis"
        subtitle="Decision-support breakdown comparing environmental savings, social benefits, maintenance costs, and unintended consequences"
      />

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Environmental */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <Droplets className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Environmental Benefit</h3>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-900">{environmental.estimated_liters_saved.toLocaleString()} L</p>
            <p className="text-xs text-emerald-700 font-semibold">Water Wastage Avoided ({environmental.water_wastage_avoided_percent}%)</p>
          </div>
          <p className="text-xs text-slate-600 font-medium">Reduces groundwater extraction during dry coastal spells.</p>
        </div>

        {/* Social Benefit */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-800">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Social & Resident Benefit</h3>
          </div>
          <div>
            <p className="text-2xl font-black text-blue-900">{social.service_disruptions_prevented} Events</p>
            <p className="text-xs text-blue-700 font-semibold">Service Disruptions Prevented</p>
          </div>
          <p className="text-xs text-slate-600 font-medium">Faster response time (-{social.avg_investigation_lead_time_improvement_hours} hrs) reduces resident inconvenience.</p>
        </div>

        {/* Cost & ROI */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Financial Savings & ROI</h3>
          </div>
          <div>
            <p className="text-2xl font-black text-amber-900">₹{cost.net_financial_savings_inr.toLocaleString()}</p>
            <p className="text-xs text-amber-700 font-semibold">Net Savings (ROI: {cost.roi_multiplier})</p>
          </div>
          <p className="text-xs text-slate-600 font-medium">Avoids costly structural water seepage damage in coastal foundation walls.</p>
        </div>

        {/* Maintenance Burden */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-purple-800">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Staff Workload Burden</h3>
          </div>
          <div>
            <p className="text-2xl font-black text-purple-900">{maintenance_burden.false_positives_count} False Alarms</p>
            <p className="text-xs text-purple-700 font-semibold">False Positive Rate: {maintenance_burden.false_positive_rate_percent}%</p>
          </div>
          <p className="text-xs text-slate-600 font-medium">Avg inspection time: {maintenance_burden.avg_investigation_time_mins} mins per alert.</p>
        </div>

      </div>

      {/* Unintended Consequences Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm">Analysis of Unintended Consequences & Risk Mitigations</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="p-3.5">Unintended Risk / Consequence</th>
                <th className="p-3.5">Occurrences</th>
                <th className="p-3.5">Operational Impact</th>
                <th className="p-3.5">System Mitigation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unintended_consequences.map((uc, idx) => (
                <tr key={idx} className="hover:bg-slate-50 font-medium">
                  <td className="p-3.5 font-bold text-slate-900">{uc.consequence}</td>
                  <td className="p-3.5 text-slate-600">{uc.occurrences}</td>
                  <td className="p-3.5 text-slate-700">{uc.impact}</td>
                  <td className="p-3.5 text-emerald-800 font-bold">{uc.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
