import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Building2, Gauge, Bell, AlertTriangle, Droplets, 
  CheckCircle, Waves, TrendingUp, ArrowRight, ShieldCheck,
  RefreshCw, Filter, Clock, Eye, CheckCircle2, XCircle, Clock3, Wrench, ShieldAlert
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts'
import StatCard from '../components/StatCard'
import AlertBadge from '../components/AlertBadge'
import ConfirmModal from '../components/ConfirmModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Filters
  const [buildingFilter, setBuildingFilter] = useState('All')
  const [riskFilter, setRiskFilter] = useState('All')
  
  // Modal state for quick actions
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [actionType, setActionType] = useState('confirm')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successToast, setSuccessToast] = useState('')

  const fetchDashboardData = () => {
    setIsRefreshing(true)
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
        setIsRefreshing(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
        setIsRefreshing(false)
      })
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleQuickAction = (alert, action) => {
    if (action === 'view') {
      navigate(`/alerts/${alert.alert_id}`)
      return
    }
    setSelectedAlert(alert)
    setActionType(action)
    setIsModalOpen(true)
  }

  const handleModalConfirm = async (payload) => {
    if (!selectedAlert) return
    const endpoint = `/api/alerts/${selectedAlert.alert_id}/${actionType}`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Action failed')
    }

    setSuccessToast(`Alert ${selectedAlert.alert_id} successfully updated to '${actionType}' by ${payload.staff_name}.`)
    setTimeout(() => setSuccessToast(''), 5000)
    fetchDashboardData()
  }

  if (loading || !data) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
          <Droplets className="w-6 h-6 text-cyan-600 absolute top-4 left-4 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loading Smart Water Operations Dashboard...</p>
      </div>
    )
  }

  const SEVERITY_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#10B981']

  const severityPieData = Object.keys(data.alert_severity_distribution).map(key => ({
    name: key.replace('_', ' '),
    value: data.alert_severity_distribution[key]
  }))

  const zoneBarData = Object.keys(data.zone_anomaly_distribution).map(key => ({
    zone: key.replace('_', ' '),
    alerts: data.zone_anomaly_distribution[key]
  }))

  const maintPieData = data.maintenance_status_overview ? Object.keys(data.maintenance_status_overview).map(key => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    value: data.maintenance_status_overview[key]
  })) : []

  const MAINT_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#64748B']

  // Filter recent alerts
  const filteredAlerts = (data.recent_alerts || []).filter(a => {
    if (buildingFilter !== 'All' && a.building_id !== buildingFilter) return false
    if (riskFilter !== 'All' && a.risk_level !== riskFilter) return false
    return true
  })

  return (
    <div className="space-y-6 pb-8">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 font-bold hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {/* Control Header & Live Status Ticker */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-navy-900 text-white p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Droplets className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Smart Building Water Operations Center</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                Live Sub-meter Stream Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Coastal Drainage Blockage & Early Leak Detection System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync Live Feed</span>
          </button>

          <Link
            to="/live-monitoring"
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <span>Live Stream Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 8 Top Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard title="Total Units" value={data.total_apartments} subtext="Apartments" icon={Building2} color="blue" />
        <StatCard title="Active Meters" value={data.active_meters} subtext="Sub-meters" icon={Gauge} color="cyan" />
        <StatCard title="Current Alerts" value={data.current_alerts} subtext="Open Anomalies" icon={Bell} color="amber" />
        <StatCard title="High Risk" value={data.high_risk_alerts} subtext="Requires Action" icon={AlertTriangle} color="orange" />
        <StatCard title="Suspected" value={data.suspected_leaks} subtext="Early Detection" icon={Droplets} color="purple" />
        <StatCard title="Confirmed" value={data.confirmed_leaks} subtext="Verified Leaks" icon={CheckCircle} color="red" />
        <StatCard title="Water Loss" value={`${data.estimated_water_loss_liters} L`} subtext="Est. Loss Rate" icon={Waves} color="teal" />
        <StatCard title="Detection Rate" value={`${data.detection_rate_percent}%`} subtext="Pre-billing KPI (≥80%)" icon={TrendingUp} color="green" />
      </div>

      {/* Filter Toolbar for Dashboard */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-cyan-600" />
          <span className="font-bold text-slate-800">Quick Dashboard Filter:</span>

          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500"
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
            className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="All">All Severity Levels</option>
            <option value="Critical">Critical</option>
            <option value="High_Risk">High Risk</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Watch">Watch</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredAlerts.length}</span> live alert items
        </div>
      </div>

      {/* Row 1: Main Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Actual vs Expected Water Consumption Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Water Consumption vs Expected Baseline Trend</h3>
              <p className="text-xs text-slate-500 font-medium">14-day aggregated flow monitoring across coastal building blocks</p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200">
              Expected vs Actual Overlay
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.consumption_trend}>
                <defs>
                  <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="actual" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#actualColor)" name="Actual Flow (Liters)" />
                <Line type="monotone" dataKey="expected" stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={2} name="Expected Baseline (Liters)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Severity Breakdown (Pie/Donut) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">Alert Severity Distribution</h3>
            <p className="text-xs text-slate-500 mb-2">Live anomaly classification breakdown</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs pt-3 border-t border-slate-100">
            {severityPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[idx % SEVERITY_COLORS.length] }}></span>
                <span className="truncate">{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Secondary Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 24-Hour Diurnal Pattern */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">24-Hour Diurnal Pattern</h3>
          <p className="text-xs text-slate-500 font-medium">Hourly flow profile (00:00–23:00)</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourly_pattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="consumption" stroke="#10B981" fill="#D1FAE5" name="Avg Flow (L)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone-wise Anomaly Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Zone Anomaly Breakdown</h3>
          <p className="text-xs text-slate-500 font-medium">Anomalies localized per sub-meter zone</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="alerts" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Open Alerts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Apartment Risk Ranking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Apartment Risk Ranking</h3>
          <p className="text-xs text-slate-500 font-medium">Top high-risk apartments requiring inspection</p>
          <div className="h-52 overflow-y-auto space-y-2 pr-1">
            {data.apartment_risk_ranking && data.apartment_risk_ranking.map((apt, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-900">Apt {apt.apartment_id}</span>
                  <span className="text-slate-500 text-[11px] block">Zone: {apt.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertBadge level={apt.risk_level} />
                  <span className="font-extrabold text-slate-900">{apt.risk_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Timeline & Maintenance Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Leak Detection Timeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Leak Detection & Resolution Timeline</h3>
          <p className="text-xs text-slate-500 font-medium">Tracking anomalies detected vs field repairs completed</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.leak_detection_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="detected" fill="#EF4444" radius={[4, 4, 0, 0]} name="Detected Anomalies" />
                <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} name="Resolved Leaks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Status Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Maintenance Status Overview</h3>
              <p className="text-xs text-slate-500 font-medium">Field plumbing dispatch & outcome breakdown</p>
            </div>
            <Link to="/maintenance" className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">
              View Log →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={maintPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={25}>
                    {maintPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MAINT_COLORS[index % MAINT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center space-y-2 text-xs">
              {maintPieData.map((m, idx) => (
                <div key={m.name} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MAINT_COLORS[idx % MAINT_COLORS.length] }}></span>
                    <span className="font-semibold text-slate-700">{m.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Environmental & Water-Saving Impact Summary Card */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">Environmental & Financial Water-Saving Impact</h3>
              <p className="text-xs text-emerald-300 font-medium">Cumulative savings achieved before monthly utility billing</p>
            </div>
          </div>

          <Link
            to="/cost-impact"
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
          >
            Full Impact Analysis →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <span className="text-emerald-300 font-semibold uppercase text-[10px]">Monthly Water Saved</span>
            <p className="text-2xl font-black text-white mt-1">{data.water_saving_impact.liters_saved_this_month.toLocaleString()} Liters</p>
            <span className="text-[11px] text-emerald-400">Avoided groundwater loss</span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <span className="text-emerald-300 font-semibold uppercase text-[10px]">Utility Bill Savings</span>
            <p className="text-2xl font-black text-white mt-1">₹{data.water_saving_impact.cost_saved_inr.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-400">Direct resident savings</span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <span className="text-emerald-300 font-semibold uppercase text-[10px]">Response Lead Time</span>
            <p className="text-2xl font-black text-white mt-1">-{data.water_saving_impact.response_time_reduction_hours} Hours</p>
            <span className="text-[11px] text-emerald-400">Faster leak resolution</span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <span className="text-emerald-300 font-semibold uppercase text-[10px]">Wastage Reduction</span>
            <p className="text-2xl font-black text-white mt-1">14.5%</p>
            <span className="text-[11px] text-emerald-400">Overall building reduction</span>
          </div>
        </div>
      </div>

      {/* Main Recent Live Alerts Table / Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-slate-900 text-base">Recent Live Anomaly Stream</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">Real-time alerts requiring operator review and human confirmation</p>
          </div>

          <Link to="/alerts" className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
            <span>View All Alerts ({data.current_alerts})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Alert & Apt</th>
                <th className="p-3.5">Building / Zone</th>
                <th className="p-3.5">Sub-Meter</th>
                <th className="p-3.5">Risk & Score</th>
                <th className="p-3.5">Flow vs Expected</th>
                <th className="p-3.5">Est. Loss Rate</th>
                <th className="p-3.5">Evidence & Action Rec</th>
                <th className="p-3.5">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAlerts.map((a) => (
                <tr key={a.alert_id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Alert & Apt */}
                  <td className="p-3.5">
                    <span className="font-extrabold text-slate-900 block">{a.apartment_id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{a.alert_id}</span>
                  </td>

                  {/* Building & Zone */}
                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 block">Bldg {a.building_id}</span>
                    <span className="text-cyan-700 font-semibold">{a.zone}</span>
                  </td>

                  {/* Meter */}
                  <td className="p-3.5 font-mono text-slate-600 text-[11px]">
                    {a.meter_id}
                  </td>

                  {/* Risk Level & Score */}
                  <td className="p-3.5">
                    <div className="space-y-1">
                      <AlertBadge level={a.risk_level} />
                      <span className="text-[11px] font-bold text-slate-800 block">Score: {a.risk_score}/100</span>
                    </div>
                  </td>

                  {/* Usage */}
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{a.consumption_current} L/15m</span>
                    <span className="text-slate-400 text-[11px]">Expected: {a.consumption_expected} L</span>
                    <span className="text-red-600 font-bold block text-[10px]">+{a.deviation_percent}%</span>
                  </td>

                  {/* Est Loss */}
                  <td className="p-3.5 font-extrabold text-teal-700 text-sm">
                    {a.estimated_loss_liters} L/hr
                  </td>

                  {/* Evidence & Action Rec */}
                  <td className="p-3.5 max-w-xs space-y-1">
                    <p className="text-slate-800 font-semibold line-clamp-1">{a.possible_cause}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-2">{a.recommendation}</p>
                  </td>

                  {/* Quick Actions */}
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1.5 min-w-[150px]">
                      <button
                        onClick={() => handleQuickAction(a, 'view')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        title="View Full Detail"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleQuickAction(a, 'confirm')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                        title="Confirm Investigation"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirm</span>
                      </button>

                      <button
                        onClick={() => handleQuickAction(a, 'reject')}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                        title="Reject Alert"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleQuickAction(a, 'defer')}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        title="Defer Alert"
                      >
                        <Clock3 className="w-3 h-3" />
                        <span>Defer</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Action Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alert={selectedAlert}
        actionType={actionType}
        onConfirm={handleModalConfirm}
      />

    </div>
  )
}
