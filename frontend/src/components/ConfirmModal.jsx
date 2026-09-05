import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, onClose, alert, actionType, onConfirm }) {
  const [staffName, setStaffName] = useState('')
  const [role, setRole] = useState('Apartment Manager')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !alert) return null

  const isOverride = actionType === 'override'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!staffName.trim()) {
      setError('Staff / Operator name is required.')
      return
    }
    if (!reason.trim()) {
      setError('Decision reason is required.')
      return
    }
    if (isOverride && !overrideReason.trim()) {
      setError('Override reason is strictly required for override actions.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await onConfirm({
        staff_name: staffName,
        role: role,
        reason: reason,
        notes: notes,
        override_reason: overrideReason
      })
      onClose()
    } catch (err) {
      setError('Failed to record action. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const actionTitles = {
    confirm: 'Confirm Maintenance Investigation',
    reject: 'Reject Alert',
    override: 'Override System Recommendation',
    defer: 'Defer Alert',
    escalate: 'Escalate to Senior Supervisor',
    'false-positive': 'Mark as False Positive'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base">{actionTitles[actionType] || 'Human Confirmation Required'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Context Summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex flex-col gap-1">
          <div className="flex justify-between font-semibold">
            <span>Alert ID: {alert.alert_id}</span>
            <span>Apt: {alert.apartment_id} ({alert.zone})</span>
          </div>
          <p className="text-slate-500">Risk Level: <span className="font-bold text-slate-800">{alert.risk_level}</span> | Risk Score: {alert.risk_score}/100</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Staff / User Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. Suresh Kumar"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="Apartment Manager">Apartment Manager</option>
              <option value="Maintenance Staff">Maintenance Staff</option>
              <option value="Building Supervisor">Building Supervisor</option>
              <option value="Plumbing Engineer">Plumbing Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decision Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State clear operational rationale for this decision..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          {isOverride && (
            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1">
                Override Reason (Mandatory for Overrides) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Resident notified manager about expected high water usage for scheduled cleaning."
                className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Field Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Plumber dispatched at 10:30 AM"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5"
            >
              {loading ? 'Processing...' : 'Confirm Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
