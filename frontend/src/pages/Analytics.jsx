import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, Map } from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import PageHeader from '../components/PageHeader'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => {
        setAnalytics(d)
        setLoading(false)
      })
  }, [])

  if (loading || !analytics) {
    return <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading Analytics...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Water Consumption Analytics"
        subtitle="Long-term historical trends, diurnal flow curves, expected vs actual comparisons"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 24-hour Diurnal curve */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Average 24-Hour Diurnal Flow Curve</h3>
          <p className="text-xs text-slate-500 mb-4">Averaged across all 80 apartment meters</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.hourly_pattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="avg_liters" stroke="#06B6D4" fill="#CFFAFE" name="Avg Flow (L)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Zone Consumption Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Total consumption in kL by zone</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.zone_comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total_consumption_kL" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Consumption (kL)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 30-Day Expected vs Actual */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-1">30-Day Expected vs Actual Consumption</h3>
        <p className="text-xs text-slate-500 mb-4">Tracking monthly water consumption against occupancy baseline</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.expected_vs_actual}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="actual" stroke="#EF4444" strokeWidth={2.5} name="Actual Usage (L)" />
              <Line type="monotone" dataKey="expected" stroke="#10B981" strokeDasharray="4 4" strokeWidth={2} name="Expected Baseline (L)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
