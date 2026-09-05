import React, { useState, useEffect } from 'react'
import { Droplets, Info, MapPin, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import AlertBadge from '../components/AlertBadge'

export default function LeakLocalisation() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState(null)

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(data)
        if (data.length > 0) setSelectedAlert(data[0])
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zone & Sub-meter Leak Localisation"
        subtitle="Identifies the specific building block, apartment, and zone causing abnormal water flow"
      />

      {/* Mandatory Disclaimer Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl flex items-center gap-3 text-xs">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-bold uppercase tracking-wider">Operational Recommendation Disclaimer</p>
          <p className="text-blue-800 font-medium">Localisation estimates are recommendations generated via meter interval correlation. Physical inspection by maintenance staff is required before commencing invasive plumbing repair.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Suspected Localisation Targets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-sm">Active Localisation Targets</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {alerts.map((a) => (
              <div
                key={a.alert_id}
                onClick={() => setSelectedAlert(a)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedAlert?.alert_id === a.alert_id
                    ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">Apt {a.apartment_id} ({a.zone})</span>
                  <AlertBadge level={a.risk_level} />
                </div>
                <p className="text-xs text-slate-500 font-medium">{a.possible_cause}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>Flow: {a.consumption_current}L/15m</span>
                  <span className="text-cyan-700">{a.confidence_percent}% Confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detailed Localisation Summary */}
        {selectedAlert && (
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Localised Target</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Apartment {selectedAlert.apartment_id} — {selectedAlert.zone} Zone</h2>
                <p className="text-xs text-slate-500 font-medium">Building {selectedAlert.building_id} • Sub-meter {selectedAlert.meter_id}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">Confidence Rating</span>
                <p className="text-2xl font-extrabold text-cyan-600">{selectedAlert.confidence_percent}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Current Flow</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedAlert.consumption_current} L/15m</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Baseline Expected</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedAlert.consumption_expected} L/15m</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Deviation</span>
                <p className="font-bold text-red-600 text-sm mt-0.5">+{selectedAlert.deviation_percent}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Est. Loss Rate</span>
                <p className="font-bold text-teal-700 text-sm mt-0.5">{selectedAlert.estimated_loss_liters} L/hr</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Primary Evidence Trail</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedAlert.evidence && selectedAlert.evidence.map((ev, idx) => (
                  <li key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-cyan-900 uppercase">Recommended Staff Investigation</span>
              <p className="text-slate-800 font-medium leading-relaxed">{selectedAlert.recommendation}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
