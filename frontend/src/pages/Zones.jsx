import React, { useState, useEffect } from 'react'
import { Map, Gauge, AlertTriangle, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function Zones() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/zones')
      .then(res => res.json())
      .then(d => {
        setZones(d)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Building Zones & Sub-meter Distribution"
        subtitle="Localised water flow monitoring across Bathroom, Kitchen, Utility, Common Area, Water Tank, and Plumbing Shafts"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((z, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-200">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{z.zone_name.replace('_', ' ')}</h3>
                  <p className="text-xs text-slate-500 font-medium">{z.meter_count} Sub-meters Active</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                z.status === 'Critical' ? 'bg-red-100 text-red-700 border-red-300' :
                z.status === 'Warning' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                'bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}>
                {z.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs py-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-medium">Open Alerts</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{z.open_alerts}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">High Risk</span>
                <p className="font-bold text-red-600 text-sm mt-0.5">{z.high_risk_alerts}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Avg Flow</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{z.avg_consumption_liters} L</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
