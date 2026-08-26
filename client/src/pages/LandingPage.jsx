import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../store/useCartStore';
import {
  UtensilsCrossed,
  ChefHat,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio,
  Flame,
  CreditCard,
  Layers,
  Clock,
} from 'lucide-react';

const LandingPage = () => {
  const { demoLogin } = useAuth();
  const { setTableNumber } = useCartStore();
  const navigate = useNavigate();

  const handleLaunchDemo = async (role, tableNum = 4, targetPath = '/menu') => {
    setTableNumber(tableNum);
    await demoLogin(role, tableNum);
    navigate(targetPath);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold tracking-wide animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full-Stack Real-Time MERN • Socket.io • Razorpay Test Mode</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight sm:leading-none">
          Next-Gen Gourmet POS & <br />
          <span className="bg-gradient-to-r from-amber-200 via-gold-400 to-amber-500 bg-clip-text text-transparent">
            Dine-In Real-Time SaaS
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Engineered for high-concurrency culinary venues. Featuring interactive chef video teasers, dynamic dish customizations, live 4-stage serving progress pipelines, waiter Kanban boards, staff vetting queues, and manager sales analytics.
        </p>

        {/* 1-Click Zero Friction Demo Launchpad */}
        <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-gold-500/30 bg-dark-800/90 text-left space-y-4 max-w-3xl mx-auto mt-8">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div>
              <span className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-gold-400" />
                Zero-Friction Recruiter & Interviewer Demo Launchpad
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Launch any role in 1-click without manual credential entry:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            {/* Customer Role Launch */}
            <button
              onClick={() => handleLaunchDemo('customer', 4, '/menu')}
              className="p-4 rounded-2xl bg-dark-900 border border-dark-700 hover:border-gold-500/60 hover:bg-dark-800 transition-all text-left group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🍔</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                    Table #4
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-gold-400 transition-colors mt-2">
                  Customer Experience
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Video menu, spice selectors, Razorpay checkout, live 4-stage tracker.
                </p>
              </div>
              <div className="mt-4 text-xs font-bold text-gold-400 flex items-center gap-1">
                <span>Launch View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Waiter Role Launch */}
            <button
              onClick={() => handleLaunchDemo('waiter', 4, '/kitchen')}
              className="p-4 rounded-2xl bg-dark-900 border border-dark-700 hover:border-emerald-500/60 hover:bg-dark-800 transition-all text-left group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <ChefHat className="w-6 h-6 text-emerald-400" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Staff
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors mt-2">
                  Kitchen Dispatch
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Real-time Kanban board, urgent priority alerts, 1-click status advances.
                </p>
              </div>
              <div className="mt-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>Launch View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Manager Role Launch */}
            <button
              onClick={() => handleLaunchDemo('manager', 4, '/manager')}
              className="p-4 rounded-2xl bg-dark-900 border border-dark-700 hover:border-blue-500/60 hover:bg-dark-800 transition-all text-left group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Admin
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors mt-2">
                  Manager Portal
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Revenue analytics, peak hours turnover charts, staff vetting queue.
                </p>
              </div>
              <div className="mt-4 text-xs font-bold text-blue-400 flex items-center gap-1">
                <span>Launch View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Multi-Tab Real-Time Sync Showcase Guide */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-700 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-serif text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
              <Radio className="w-6 h-6 text-gold-400 animate-pulse" />
              <span>Multi-Tab Real-Time Sync Interview Showcase</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Follow these 4 steps to experience zero-latency bidirectional synchronization across customer and staff views:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-dark-900/80 border border-dark-700 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-gold-500/20 text-gold-400 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-200">Open Tab 1 (Customer)</h4>
              <p className="text-[11px] text-slate-400">
                Click Demo Customer (Table 4) to enter the interactive digital menu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-900/80 border border-dark-700 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-200">Open Tab 2 (Kitchen)</h4>
              <p className="text-[11px] text-slate-400">
                In another window/tab, launch the Waiter Kanban Dispatch Board.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-900/80 border border-dark-700 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-200">Place Order in Tab 1</h4>
              <p className="text-[11px] text-slate-400">
                Customize a dish & pay. Watch Tab 2 receive the order in real-time with audio alert!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-900/80 border border-dark-700 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h4 className="text-xs font-bold text-slate-200">Advance Status in Tab 2</h4>
              <p className="text-[11px] text-slate-400">
                Click 'Accept & Start Prep' and watch Tab 1's live 4-stage pipeline advance instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-dark-700 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-lg font-bold text-slate-100">
            Interactive Video Menus
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-res imagery with short chef prep video teasers, multi-level spice selections, and dynamic gourmet topping add-ons.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-dark-700 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-lg font-bold text-slate-100">
            Razorpay Test Checkout
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Full payment gateway integration with SHA256 HMAC signature verification and smart test simulator fallback.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-dark-700 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-lg font-bold text-slate-100">
            Executive Analytics & Vetting
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time sales revenue metrics, peak turnover hours distribution, top dishes, and staff clearance approval queues.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
