import React from 'react'
import { Bell, RefreshCw, ShieldAlert, UserCheck } from 'lucide-react'

export default function TopBar({ title, onRefresh, isRefreshing }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
          Coastal Flood Ready
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium border border-slate-200"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
          <span>Refresh</span>
        </button>

        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            AM
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Apartment Manager</p>
            <p className="text-[10px] text-slate-500">Coastal Zone A</p>
          </div>
        </div>
      </div>
    </header>
  )
}
