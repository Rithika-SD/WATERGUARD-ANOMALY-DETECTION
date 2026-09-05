import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Search, Filter, ArrowUpDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import AlertBadge from '../components/AlertBadge'

export default function Apartments() {
  const [apts, setApts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('All')
  const [riskFilter, setRiskFilter] = useState('All')

  useEffect(() => {
    fetch('/api/apartments')
      .then(res => res.json())
      .then(d => {
        setApts(d)
        setLoading(false)
      })
  }, [])

  const filtered = apts.filter(a => {
    if (buildingFilter !== 'All' && a.building_id !== buildingFilter) return false
    if (riskFilter !== 'All' && a.risk_level !== riskFilter) return false
    if (search.trim() && !a.apartment_id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apartments Directory"
        subtitle="Manage building units, sub-meters, occupancy baselines and anomaly risk scores"
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search apartment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="All">All Buildings</option>
            <option value="B1">Building B1</option>
            <option value="B2">Building B2</option>
            <option value="B3">Building B3</option>
            <option value="B4">Building B4</option>
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Apartment</th>
                <th className="p-3.5">Building</th>
                <th className="p-3.5">Floor</th>
                <th className="p-3.5">Occupancy</th>
                <th className="p-3.5">Current Flow</th>
                <th className="p-3.5">Expected Baseline</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(a => (
                <tr key={a.apartment_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{a.apartment_id}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{a.building_id}</td>
                  <td className="p-3.5 text-slate-600">Floor {a.floor}</td>
                  <td className="p-3.5 font-medium text-slate-800">{a.occupancy_count} Persons ({a.occupancy_assumption})</td>
                  <td className="p-3.5 font-bold text-slate-900">{a.current_consumption} L/15m</td>
                  <td className="p-3.5 text-slate-500 font-medium">{a.expected_consumption} L/15m</td>
                  <td className="p-3.5 font-extrabold text-cyan-700">{a.risk_score}</td>
                  <td className="p-3.5"><AlertBadge level={a.risk_level} /></td>
                  <td className="p-3.5">
                    <Link
                      to={`/apartments/${a.apartment_id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                    >
                      View Detail
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
