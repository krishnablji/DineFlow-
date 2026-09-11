import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tablet, ChefHat, ShieldCheck, Check, Sparkles } from 'lucide-react';

const DemoLoginBar = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);

  const handleQuickSwitch = async (role, targetPath) => {
    setLoadingRole(role);
    try {
      const res = await demoLogin(role, 4);
      if (res.success) {
        navigate(targetPath);
      }
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-slate-900/95 border-b border-amber-500/20 px-4 py-2 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Role Switcher (Retail POS):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Waiter Tablet Button */}
          <button
            onClick={() => handleQuickSwitch('waiter', '/waiter')}
            disabled={loadingRole !== null}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border ${
              user?.role === 'waiter'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/40 hover:text-amber-300'
            }`}
          >
            <Tablet className="w-3.5 h-3.5 text-amber-400" />
            <span>Waiter Tablet (/waiter)</span>
            {user?.role === 'waiter' && <Check className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Kitchen Display Button */}
          <button
            onClick={() => handleQuickSwitch('kitchen', '/kitchen')}
            disabled={loadingRole !== null}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border ${
              user?.role === 'kitchen'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500/40 hover:text-emerald-300'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kitchen Display (/kitchen)</span>
            {user?.role === 'kitchen' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Manager Button */}
          <button
            onClick={() => handleQuickSwitch('manager', '/manager')}
            disabled={loadingRole !== null}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border ${
              user?.role === 'manager'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-500/40 hover:text-blue-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Manager Portal (/manager)</span>
            {user?.role === 'manager' && <Check className="w-3.5 h-3.5 text-blue-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoLoginBar;
