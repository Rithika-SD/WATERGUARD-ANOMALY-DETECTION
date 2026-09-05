import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Filter, Search, ShieldAlert, ArrowRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import AlertBadge from '../components/AlertBadge'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [riskFilter, setRiskFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('Open')
  const [zoneFilter, setZoneFilter] = useState('All')

  const fetchAlerts = () => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(d => {
        setAlerts(d)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const filtered = alerts.filter(a => {
    if (riskFilter !== 'All' && a.risk_level !== riskFilter) return false
    if (statusFilter !== 'All' && a.status !== statusFilter) return false
    if (zoneFilter !== 'All' && a.zone !== zoneFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Water Anomaly Alerts"
        subtitle="Review, investigate, confirm or override water anomaly alerts prior to dispatching maintenance"
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filters:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
            <option value="Deferred">Deferred</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High_Risk">High Risk</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Watch">Watch</option>
            <option value="Normal">Normal</option>
          </select>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="All">All Zones</option>
            <option value="Bathroom">Bathroom</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Utility">Utility</option>
            <option value="Common_Area">Common Area</option>
            <option value="Water_Tank">Water Tank</option>
            <option value="Plumbing">Plumbing</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Alert ID</th>
                <th className="p-3.5">Apartment</th>
                <th className="p-3.5">Zone</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Flow vs Expected</th>
                <th className="p-3.5">Est. Loss Rate</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(a => (
                <tr key={a.alert_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{a.alert_id}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{a.apartment_id} ({a.building_id})</td>
                  <td className="p-3.5 text-slate-600">{a.zone}</td>
                  <td className="p-3.5"><AlertBadge level={a.risk_level} /></td>
                  <td className="p-3.5 font-extrabold text-slate-800">{a.risk_score}</td>
                  <td className="p-3.5 font-semibold text-slate-900">
                    {a.consumption_current}L <span className="text-slate-400 font-normal">/ {a.consumption_expected}L</span>
                  </td>
                  <td className="p-3.5 font-bold text-teal-700">{a.estimated_loss_liters} L/h</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                      a.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      a.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Link
                      to={`/alerts/${a.alert_id}`}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg font-semibold border border-cyan-200 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
