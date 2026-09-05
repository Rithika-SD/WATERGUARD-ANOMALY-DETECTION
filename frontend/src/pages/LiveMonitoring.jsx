import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, RefreshCw, Filter, Building2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import AlertBadge from '../components/AlertBadge'

export default function LiveMonitoring() {
  const [apts, setApts] = useState([])
  const [loading, setLoading] = useState(true)
  const [buildingFilter, setBuildingFilter] = useState('All')
  const [riskFilter, setRiskFilter] = useState('All')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [countdown, setCountdown] = useState(15)

  const fetchData = () => {
    fetch('/api/apartments')
      .then(res => res.json())
      .then(data => {
        setApts(data)
        setLoading(false)
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let timer
    if (autoRefresh) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            fetchData()
            return 15
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [autoRefresh])

  const filtered = apts.filter(a => {
    if (buildingFilter !== 'All' && a.building_id !== buildingFilter) return false
    if (riskFilter !== 'All' && a.risk_level !== riskFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Meter & Zone Monitoring"
        subtitle="15-minute interval streaming feeds from building sub-meters"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors ${
              autoRefresh ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
            <span>{autoRefresh ? `Auto-Refresh (${countdown}s)` : 'Paused'}</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Now</span>
          </button>
        </div>
      </PageHeader>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter By:</span>
          
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
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
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High_Risk">High Risk</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Watch">Watch</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filtered.length}</span> of {apts.length} Apartments
        </div>
      </div>

      {/* Grid of Live Apartment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(a => (
          <Link
            key={a.apartment_id}
            to={`/apartments/${a.apartment_id}`}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-600" />
                  <span className="font-bold text-slate-900 text-sm group-hover:text-cyan-600 transition-colors">
                    {a.apartment_id}
                  </span>
                </div>
                <AlertBadge level={a.risk_level} />
              </div>
              <p className="text-xs text-slate-500 font-medium">Floor {a.floor} • Building {a.building_id} • Occ: {a.occupancy_count}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-medium">Current Flow</span>
                <p className="font-bold text-slate-900 text-sm">{a.current_consumption} L/15m</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-medium">Risk Score</span>
                <p className="font-bold text-cyan-700 text-sm">{a.risk_score}/100</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
