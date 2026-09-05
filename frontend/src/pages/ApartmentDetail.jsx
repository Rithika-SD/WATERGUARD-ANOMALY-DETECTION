import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Building2, User, Gauge, AlertTriangle, ArrowLeft, Wrench, ShieldCheck, Waves } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader'
import AlertBadge from '../components/AlertBadge'
import RiskScore from '../components/RiskScore'

export default function ApartmentDetail() {
  const { id } = useParams()
  const [apt, setApt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetch(`/api/apartments/${id}`)
      .then(res => res.json())
      .then(data => {
        setApt(data)
        setLoading(false)
      })
      .catch(err => console.error(err))
  }, [id])

  if (loading || !apt) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-500">
        Loading Apartment {id} Details...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/apartments" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title={`Apartment ${apt.apartment_id}`}
          subtitle={`Building ${apt.building_id} • Floor ${apt.floor} • Occupancy Count: ${apt.occupancy_count} (${apt.occupancy_assumption})`}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <RiskScore score={apt.risk_score} size="lg" />
          <div>
            <span className="text-xs font-semibold text-slate-500">Current Risk Status</span>
            <div className="mt-1"><AlertBadge level={apt.risk_level} /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">Current Flow</span>
          <p className="text-2xl font-extrabold text-slate-900">{apt.current_consumption} L/15m</p>
          <p className="text-xs text-slate-400">Baseline Expected: {apt.expected_consumption} L</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">Leak Probability</span>
          <p className="text-2xl font-extrabold text-cyan-600">{(apt.leak_probability * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-400">ML + Rule Model</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">Occupancy Profile</span>
          <p className="text-lg font-bold text-slate-800">{apt.occupancy_count} Persons</p>
          <p className="text-xs text-slate-400">Category: {apt.occupancy_assumption}</p>
        </div>
      </div>

      {/* Action Recommendation Box */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/5 p-4 rounded-2xl border border-cyan-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Recommended Action</h4>
          <p className="text-slate-700 leading-relaxed font-medium">{apt.recommended_action}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        {['overview', 'intervals', 'anomalies', 'maintenance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold capitalize transition-colors ${
              activeTab === tab ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">24-Hour Interval Flow History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apt.meter_intervals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="consumption_liters" stroke="#06B6D4" strokeWidth={2.5} name="Flow (L)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'intervals' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Consumption (L)</th>
                <th className="p-3">Anomaly Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apt.meter_intervals.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">{m.timestamp}</td>
                  <td className="p-3 text-slate-600">{m.zone}</td>
                  <td className="p-3 font-bold text-slate-900">{m.consumption_liters} L</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">{m.anomaly_type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className="space-y-3">
          {apt.recent_alerts.map((a, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{a.alert_id}</span>
                  <AlertBadge level={a.risk_level} />
                </div>
                <p className="text-slate-600 font-medium">{a.recommendation}</p>
              </div>
              <span className="font-bold text-slate-900">{a.consumption_current}L</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Assigned Lead</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">Cost (INR)</th>
                <th className="p-3">Resolution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apt.maintenance_history.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{m.record_id}</td>
                  <td className="p-3 text-slate-600">{m.zone}</td>
                  <td className="p-3 font-medium text-slate-800">{m.assigned_to}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">{m.outcome}</span></td>
                  <td className="p-3 font-bold text-slate-900">₹{m.repair_cost}</td>
                  <td className="p-3 text-slate-600">{m.resolution_time_hours} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
