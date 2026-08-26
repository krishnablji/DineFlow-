import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/apiServices';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Award,
  Sparkles,
  ArrowUpRight,
  Flame,
  Layers,
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getDashboardAnalytics();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-dark-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const { summary, tableStats, hourlyOrders, topDishes, categoryDistribution, recentActivity } =
    data || {};

  // Find max hourly orders for scaling peak hours bar chart
  const maxHourlyOrders = Math.max(...(hourlyOrders?.map((h) => h.orders) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-dark-700 bg-dark-800/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</span>
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-100 font-sans">
              ₹{summary?.totalRevenue?.toLocaleString('en-IN') || 0}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Razorpay
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-panel p-5 rounded-2xl border border-dark-700 bg-dark-800/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Dine-In Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-100">
              {summary?.totalOrdersCount || 0}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">All Time</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="glass-panel p-5 rounded-2xl border border-dark-700 bg-dark-800/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value (AOV)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gold-400">
              ₹{summary?.averageOrderValue || 0}
            </div>
            <span className="text-[11px] text-purple-400 font-semibold">Per Table</span>
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="glass-panel p-5 rounded-2xl border border-dark-700 bg-dark-800/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Table Turnover</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-emerald-400">
              {tableStats?.available || 0} / {tableStats?.total || 8}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Tables Free</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Table Turnover Hours Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-dark-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400" />
                <span>Peak Table Turnover Hours (24h Distribution)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hourly dining order volume across peak lunch & dinner services
              </p>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 flex items-end gap-1.5 pt-6 pb-2 px-2 overflow-x-auto">
            {hourlyOrders?.filter((_, i) => i >= 11 && i <= 23).map((item, idx) => {
              const heightPercent = maxHourlyOrders > 0 ? (item.orders / maxHourlyOrders) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 min-w-[28px] group">
                  <div className="text-[10px] font-bold text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.orders}
                  </div>
                  <div className="w-full bg-dark-700/60 rounded-t-lg h-36 flex items-end p-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-gold-600 to-amber-400 rounded-t-md transition-all duration-700 group-hover:from-gold-400 group-hover:to-amber-300 shadow-glow"
                      style={{ height: `${Math.max(heightPercent, item.orders > 0 ? 15 : 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.hour.split(':')[0]}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Revenue Breakdown (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-700 space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Category Revenue Share</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sales contribution by menu department
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryDistribution &&
              Object.entries(categoryDistribution).map(([cat, rev]) => {
                const totalCatRev = Object.values(categoryDistribution).reduce((a, b) => a + b, 1);
                const percent = Math.round((rev / totalCatRev) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-gold-400 font-mono">₹{rev.toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat === 'Mains'
                            ? 'bg-gold-500'
                            : cat === 'Starters'
                            ? 'bg-emerald-500'
                            : cat === 'Desserts'
                            ? 'bg-purple-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(percent, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Top 5 Best-Selling Dishes & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Dishes */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-400" />
              <span>Top 5 Best-Selling Gourmet Dishes</span>
            </h3>
          </div>

          <div className="space-y-3">
            {topDishes?.map((dish, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-dark-900/60 border border-dark-700"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{dish.name}</h4>
                    <span className="text-[11px] text-slate-400">{dish.quantity} orders fulfilled</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gold-400 font-mono">
                    ₹{dish.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Recent Activity Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-700 space-y-4">
          <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Recent Dine-In Order Activity</span>
          </h3>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {recentActivity?.map((act, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-dark-900/60 border border-dark-700 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">#{act.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 text-[10px] font-semibold">
                      Table #{act.tableNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {act.customerName} • {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gold-400 font-mono block">
                    ₹{act.totalAmount}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">
                    {act.servingStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
