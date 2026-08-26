import React, { useState } from 'react';
import KanbanBoard from '../components/waiter/KanbanBoard';
import TableGrid from '../components/waiter/TableGrid';
import { ChefHat, LayoutGrid, Kanban, Bell, Sparkles } from 'lucide-react';

const KitchenKanban = () => {
  const [activeTab, setActiveTab] = useState('kanban');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-dark-700/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-100">
              Kitchen Dispatch & Serving Operations
            </h1>
            <p className="text-xs text-slate-400">
              Real-time multi-column order dispatch pipeline with live Socket.io sync and milestone advancement
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-dark-900 p-1.5 rounded-xl border border-dark-700">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'kanban'
                ? 'bg-emerald-500 text-dark-900 shadow-glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Dispatch Board</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tables'
                ? 'bg-emerald-500 text-dark-900 shadow-glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Table Floor Map</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {activeTab === 'kanban' ? <KanbanBoard /> : <TableGrid />}
    </div>
  );
};

export default KitchenKanban;
