import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { Sparkles, Utensils, ChefHat, ShieldCheck, Check } from 'lucide-react';

const DemoLoginBar = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();
  const { setTableNumber } = useCartStore();
  const [loadingRole, setLoadingRole] = useState(null);

  const handleQuickSwitch = async (role, tableNum = 4, targetPath = '/menu') => {
    setLoadingRole(role);
    try {
      setTableNumber(tableNum);
      const res = await demoLogin(role, tableNum);
      if (res.success) {
        if (role === 'customer') {
          navigate('/menu');
        } else if (role === 'waiter' || role === 'kitchen') {
          navigate('/kitchen');
        } else if (role === 'manager' || role === 'admin') {
          navigate('/manager');
        }
      }
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-dark-900/90 border-b border-gold-500/20 backdrop-blur-md px-4 py-2 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gold-400/90 font-medium">
          <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
          <span className="hidden sm:inline font-semibold">1-Click Zero-Friction Recruiter Demo:</span>
          <span className="sm:hidden font-semibold">Demo Switch:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Customer Button */}
          <button
            onClick={() => handleQuickSwitch('customer', 4, '/menu')}
            disabled={loadingRole !== null}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
              user?.role === 'customer'
                ? 'bg-gold-500/20 text-gold-300 border-gold-500/50 shadow-glow'
                : 'bg-dark-700/80 text-slate-300 border-dark-600 hover:border-gold-500/40 hover:text-gold-400'
            }`}
          >
            <span>🍔</span>
            <span>Demo Customer (Table 4)</span>
            {user?.role === 'customer' && <Check className="w-3.5 h-3.5 text-gold-400" />}
          </button>

          {/* Waiter Button */}
          <button
            onClick={() => handleQuickSwitch('waiter', 4, '/kitchen')}
            disabled={loadingRole !== null}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
              user?.role === 'waiter'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-glow-emerald'
                : 'bg-dark-700/80 text-slate-300 border-dark-600 hover:border-emerald-500/40 hover:text-emerald-400'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
            <span>Demo Waiter (Alex)</span>
            {user?.role === 'waiter' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Manager Button */}
          <button
            onClick={() => handleQuickSwitch('manager', 4, '/manager')}
            disabled={loadingRole !== null}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
              user?.role === 'manager'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                : 'bg-dark-700/80 text-slate-300 border-dark-600 hover:border-blue-500/40 hover:text-blue-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Demo Manager (Admin)</span>
            {user?.role === 'manager' && <Check className="w-3.5 h-3.5 text-blue-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoLoginBar;
