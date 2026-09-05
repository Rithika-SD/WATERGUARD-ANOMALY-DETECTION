import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, ShieldAlert, CheckCircle, XCircle, Clock, 
  ChevronRight, Wrench, AlertTriangle, FileText, Lock
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import AlertBadge from '../components/AlertBadge'
import RiskScore from '../components/RiskScore'
import EvidencePanel from '../components/EvidencePanel'
import ConfirmModal from '../components/ConfirmModal'

export default function AlertDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alertData, setAlertData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalAction, setModalAction] = useState(null) // 'confirm', 'reject', 'override', etc.
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchDetail = () => {
    fetch(`/api/alerts/${id}`)
      .then(res => res.json())
      .then(d => {
        setAlertData(d)
        setLoading(false)
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const openActionModal = (action) => {
    setModalAction(action)
    setIsModalOpen(true)
  }

  const handleModalConfirm = async (payload) => {
    const endpoint = `/api/alerts/${id}/${modalAction}`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Action failed')
    }

    setSuccessMsg(`Action recorded successfully as '${modalAction}' by ${payload.staff_name}. Audit log updated.`)
    fetchDetail()
  }

  if (loading || !alertData) {
    return <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading Alert Details...</div>
  }

  const isHighImpact = alertData.risk_level === 'Critical' || alertData.risk_level === 'High_Risk'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/alerts" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title={`Alert ${alertData.alert_id}`}
          subtitle={`Apartment ${alertData.apartment_id} • ${alertData.zone} Zone • Building ${alertData.building_id}`}
        />
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 font-bold">Dismiss</button>
        </div>
      )}

      {/* Human Confirmation Mandatory Warning Banner */}
      {isHighImpact && alertData.status === 'Open' && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Human Confirmation Required for High-Impact Action</p>
              <p className="text-amber-700">This alert is classified as <strong className="uppercase">{alertData.risk_level}</strong>. Automated physical dispatch is disabled. An authorised operator must confirm or override with documented rationale.</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Details Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <RiskScore score={alertData.risk_score} size="lg" />
          <div>
            <span className="text-xs font-semibold text-slate-500">Risk Assessment</span>
            <div className="mt-1"><AlertBadge level={alertData.risk_level} /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">Current Flow</span>
          <p className="text-2xl font-extrabold text-slate-900">{alertData.consumption_current} L/15m</p>
          <p className="text-xs text-red-500 font-semibold">+{alertData.deviation_percent}% above baseline</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">Estimated Water Loss</span>
          <p className="text-2xl font-extrabold text-teal-700">{alertData.estimated_loss_liters} L/hr</p>
          <p className="text-xs text-slate-400">Confidence: {alertData.confidence_percent}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">Decision Status</span>
          <p className="text-lg font-bold text-slate-800">{alertData.status}</p>
          <p className="text-xs text-slate-400">Meter ID: {alertData.meter_id}</p>
        </div>
      </div>

      {/* Cause & Recommendation Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <div>
          <span className="font-bold text-slate-500 uppercase tracking-wider">Suspected Cause</span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">{alertData.possible_cause}</h3>
        </div>
        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
          <span className="font-bold text-cyan-900 uppercase tracking-wider">Localised Action Recommendation</span>
          <p className="text-cyan-950 font-medium leading-relaxed mt-1 text-sm">{alertData.recommendation}</p>
        </div>
      </div>

      {/* Supporting Evidence Panel */}
      <EvidencePanel evidence={alertData.evidence} />

      {/* Human-in-the-Loop Action Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Human Confirmation & Operational Decisions</h3>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openActionModal('confirm')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirm Investigation</span>
          </button>

          <button
            onClick={() => openActionModal('reject')}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Alert</span>
          </button>

          <button
            onClick={() => openActionModal('override')}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Override System</span>
          </button>

          <button
            onClick={() => openActionModal('defer')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
          >
            <span>Defer</span>
          </button>

          <button
            onClick={() => openActionModal('escalate')}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-semibold text-xs transition-colors"
          >
            <span>Escalate</span>
          </button>

          <button
            onClick={() => openActionModal('false-positive')}
            className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl font-semibold text-xs transition-colors"
          >
            <span>Mark False Positive</span>
          </button>
        </div>
      </div>

      {/* Decision Trail History */}
      {alertData.decisions && alertData.decisions.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Decision Audit Trail</h3>
          <div className="space-y-2 text-xs">
            {alertData.decisions.map((d) => (
              <div key={d.decision_id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span>{d.decision_type}</span>
                    <span className="font-normal text-slate-500">by {d.staff_name} ({d.role})</span>
                  </div>
                  <p className="text-slate-600 mt-1">Reason: <strong className="text-slate-800">{d.reason}</strong></p>
                  {d.override_reason && (
                    <p className="text-amber-800 font-semibold mt-1">Override Reason: {d.override_reason}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{d.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alert={alertData}
        actionType={modalAction}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}
