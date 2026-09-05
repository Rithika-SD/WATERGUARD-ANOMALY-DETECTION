import React, { useState, useEffect } from 'react'
import { Wrench, CheckCircle, Clock, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function Maintenance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/maintenance')
      .then(res => res.json())
      .then(d => {
        setRecords(d)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Log & Field Repair Outcomes"
        subtitle="Tracks plumbing dispatches, repair status, parts costs, and resolution times"
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <th className="p-3.5">Record ID</th>
              <th className="p-3.5">Apartment</th>
              <th className="p-3.5">Zone</th>
              <th className="p-3.5">Assigned Lead</th>
              <th className="p-3.5">Outcome</th>
              <th className="p-3.5">Repair Cost (INR)</th>
              <th className="p-3.5">Resolution Time</th>
              <th className="p-3.5">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map(r => (
              <tr key={r.record_id} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">{r.record_id}</td>
                <td className="p-3.5 font-semibold text-slate-700">{r.apartment_id}</td>
                <td className="p-3.5 text-slate-600">{r.zone}</td>
                <td className="p-3.5 font-medium text-slate-800">{r.assigned_to}</td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                    r.outcome === 'Repaired' ? 'bg-emerald-100 text-emerald-800' :
                    r.outcome === 'AwaitingParts' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {r.outcome}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-slate-900">₹{r.repair_cost}</td>
                <td className="p-3.5 text-slate-600">{r.resolution_time_hours} hrs</td>
                <td className="p-3.5 text-slate-500 max-w-xs truncate">{r.notes || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
