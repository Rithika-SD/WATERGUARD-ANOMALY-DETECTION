import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'

import Dashboard from './pages/Dashboard'
import LiveMonitoring from './pages/LiveMonitoring'
import Apartments from './pages/Apartments'
import ApartmentDetail from './pages/ApartmentDetail'
import Zones from './pages/Zones'
import Alerts from './pages/Alerts'
import AlertDetail from './pages/AlertDetail'
import LeakLocalisation from './pages/LeakLocalisation'
import Analytics from './pages/Analytics'
import Maintenance from './pages/Maintenance'
import Evaluation from './pages/Evaluation'
import EdgeCases from './pages/EdgeCases'
import CostImpact from './pages/CostImpact'
import StakeholderValidation from './pages/StakeholderValidation'
import AuditLog from './pages/AuditLog'
import Settings from './pages/Settings'
import About from './pages/About'

export default function App() {
  const location = useLocation()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      window.location.reload()
    }, 500)
  }

  const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard Overview'
    if (path === '/live-monitoring') return 'Live Monitoring Stream'
    if (path.startsWith('/apartments/')) return 'Apartment Detail'
    if (path === '/apartments') return 'Apartments Directory'
    if (path === '/zones') return 'Building Zones'
    if (path.startsWith('/alerts/')) return 'Alert Investigation'
    if (path === '/alerts') return 'Anomaly Alerts'
    if (path === '/leak-localisation') return 'Leak Localisation'
    if (path === '/analytics') return 'Water Analytics'
    if (path === '/maintenance') return 'Maintenance Log'
    if (path === '/evaluation') return 'Model Evaluation'
    if (path === '/edge-cases') return 'Edge Case Suite'
    if (path === '/cost-impact') return 'Cost & Impact Analysis'
    if (path === '/stakeholder') return 'Stakeholder Validation'
    if (path === '/audit-log') return 'Audit Log'
    if (path === '/settings') return 'System Settings'
    if (path === '/about') return 'About & Architecture'
    return 'WaterGuard Assistant'
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={getPageTitle(location.pathname)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/live-monitoring" element={<LiveMonitoring />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/apartments/:id" element={<ApartmentDetail />} />
            <Route path="/zones" element={<Zones />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/alerts/:id" element={<AlertDetail />} />
            <Route path="/leak-localisation" element={<LeakLocalisation />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/edge-cases" element={<EdgeCases />} />
            <Route path="/cost-impact" element={<CostImpact />} />
            <Route path="/stakeholder" element={<StakeholderValidation />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
