import React, { useState } from 'react';
import AnalyticsDashboard from '../components/manager/AnalyticsDashboard';
import StaffVettingQueue from '../components/manager/StaffVettingQueue';
import MenuStudio from '../components/manager/MenuStudio';
import TableManager from '../components/manager/TableManager';
import {
  LayoutDashboard,
  TrendingUp,
  UserCheck,
  Utensils,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

const TABS = [
  { id: 'analytics', label: 'Sales & Revenue Analytics', icon: TrendingUp },
  { id: 'staff', label: 'Staff Vetting Queue', icon: UserCheck },
  { id: 'menu', label: 'Menu Studio', icon: Utensils },
  { id: 'tables', label: 'Table & QR Manager', icon: QrCode },
];

const ManagerPortal = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Tabs */}
      <div className="glass-panel p-5 rounded-2xl border border-dark-700 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-100">
              Manager Command Center & Sales Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Real-time revenue metrics, staff verification approvals, recipe studio, and smart table operations
            </p>
          </div>
        </div>

        {/* Manager Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-dark-700/80">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                  isActive
                    ? 'bg-blue-500 text-white border-blue-400 shadow-md'
                    : 'bg-dark-900/60 border-dark-700 text-slate-400 hover:text-slate-200 hover:bg-dark-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'analytics' && <AnalyticsDashboard />}
      {activeTab === 'staff' && <StaffVettingQueue />}
      {activeTab === 'menu' && <MenuStudio />}
      {activeTab === 'tables' && <TableManager />}
    </div>
  );
};

export default ManagerPortal;
