import React, { useState, useEffect } from 'react'
import { ClipboardList, Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/audit-log')
      .then(res => res.json())
      .then(d => {
        setLogs(d)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Immutable Operational Audit Log"
        subtitle="Complete chronological audit trail capturing every human decision, override reason, and alert confirmation"
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <th className="p-3.5">Log ID</th>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Entity</th>
              <th className="p-3.5">User / Operator</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Event Details</th>
              <th className="p-3.5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {logs.map(l => (
              <tr key={l.log_id} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">{l.log_id}</td>
                <td className="p-3.5 font-bold text-cyan-700">{l.action}</td>
                <td className="p-3.5 text-slate-600">{l.entity_type} ({l.entity_id})</td>
                <td className="p-3.5 text-slate-800 font-bold">{l.user_name}</td>
                <td className="p-3.5 text-slate-500">{l.role}</td>
                <td className="p-3.5 text-slate-600 max-w-xs truncate">{JSON.stringify(l.details)}</td>
                <td className="p-3.5 text-slate-400 font-mono text-[11px]">{l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
