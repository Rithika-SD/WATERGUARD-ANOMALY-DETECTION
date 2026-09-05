import React from 'react'
import { Info, Droplets, ShieldCheck, Users, Wrench, FileText, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function About() {
  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="About Project & Complete Problem Documentation"
        subtitle="Apartment Water-Anomaly and Leak Localisation Assistant for Coastal Flood-Prone Towns"
      />

      {/* Problem Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Droplets className="w-4 h-4 text-cyan-600" />
          <span>1. Problem Analysis & Operational Objectives</span>
        </h3>
        <p className="text-slate-700 leading-relaxed font-medium">
          In coastal towns preparing for seasonal flooding and drainage blockages, apartment building water leaks and abnormal consumption are frequently noticed only after receiving monthly water utility bills. By that time, thousands of liters of treated water have been wasted, structural walls suffer dampness, and residents face unexpected financial shocks.
        </p>
        <p className="text-slate-700 leading-relaxed font-medium">
          Small organisations operate with limited technical staff and cannot afford high-overhead cloud infrastructure or unexplainable black-box AI systems. This solution delivers early detection (within 15-minute intervals) using an explainable statistical + rule-based pipeline, localising leaks down to specific apartment zones, requiring explicit human confirmation before dispatch.
        </p>
      </div>

      {/* User & Workflow Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-600" />
          <span>2. User & Workflow Map</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900">Apartment Manager</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Views high-level dashboard & loss metrics</li>
              <li>• Reviews evidence for suspicious alerts</li>
              <li>• Confirms or overrides investigation requests</li>
              <li>• Documents override reasons</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900">Maintenance Staff</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Receives localised zone recommendations</li>
              <li>• Performs physical plumbing inspection</li>
              <li>• Updates repair outcome & parts cost</li>
              <li>• Verifies flow normalization</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900">Building Supervisor</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Evaluates system precision vs baseline</li>
              <li>• Manages threshold settings & coastal risk</li>
              <li>• Audits operational decision log</li>
              <li>• Submits field validation feedback</li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-600" />
          <span>3. Technical Architecture & Field Setup</span>
        </h3>
        <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed">
          <pre>{`[Sub-meter IoT Sensors] ---> (15-min Readings) ---> [FastAPI REST Backend]
                                                                |
                                                     [Explainable ML Pipeline]
                                                     - Occupancy Baseline
                                                     - Z-score Deviation
                                                     - Night Flow Counter
                                                                |
                                                      [SQLite Data Store]
                                                                |
                                                 [React + Tailwind Dashboard]
                                                 - Live Anomaly Stream
                                                 - Zone Localisation
                                                 - Human Confirmation Modal`}</pre>
        </div>
      </div>

    </div>
  )
}
