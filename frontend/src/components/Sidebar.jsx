import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, Activity, Building2, Map, Bell, 
  Droplets, BarChart3, Wrench, FlaskConical, TestTube2, 
  TrendingUp, Users, ClipboardList, Settings, Info 
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/live-monitoring', label: 'Live Monitoring', icon: Activity },
  { path: '/apartments', label: 'Apartments', icon: Building2 },
  { path: '/zones', label: 'Zones', icon: Map },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/leak-localisation', label: 'Leak Localisation', icon: Droplets },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/evaluation', label: 'Evaluation', icon: FlaskConical },
  { path: '/edge-cases', label: 'Edge Case Testing', icon: TestTube2 },
  { path: '/cost-impact', label: 'Cost & Impact', icon: TrendingUp },
  { path: '/stakeholder', label: 'Stakeholder Validation', icon: Users },
  { path: '/audit-log', label: 'Audit Log', icon: ClipboardList },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/about', label: 'About Project', icon: Info },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20">
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-white shadow-md shadow-cyan-500/20">
          <Droplets className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-lg">WaterGuard</h1>
          <p className="text-xs text-cyan-400 font-medium">Coastal Leak Assistant</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border-l-4 border-cyan-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span>Field Ready v1.0</span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
      </div>
    </aside>
  )
}
