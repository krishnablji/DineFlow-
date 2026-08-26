import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCartStore } from '../../store/useCartStore';
import { useOrderStore } from '../../store/useOrderStore';
import {
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  LayoutDashboard,
  LogOut,
  LogIn,
  Radio,
  Clock,
  Menu as MenuIcon,
  X,
  Sparkles,
} from 'lucide-react';
import TableSelectModal from '../customer/TableSelectModal';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isConnected } = useSocket();
  const { items, tableNumber, setIsCartOpen, getTotalItemsCount } = useCartStore();
  const { activeOrder, setIsTrackerOpen } = useOrderStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = getTotalItemsCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="glass-panel border-b border-dark-600/50 sticky top-[41px] z-30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Table Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 to-amber-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-dark-900 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-gold-400 to-amber-500 bg-clip-text text-transparent">
                  DineFlow
                </span>
                <span className="block text-[10px] tracking-widest uppercase text-slate-400 font-semibold -mt-1">
                  Gourmet POS & SaaS
                </span>
              </div>
            </Link>

            {/* Table Badge */}
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700/80 border border-dark-600 hover:border-gold-500/50 transition-all text-xs font-semibold text-slate-200 group"
              title="Click to switch table number or scan QR"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Table #{tableNumber}</span>
              <span className="text-[10px] text-gold-400 underline font-normal group-hover:text-gold-300">
                Change
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-dark-800/80 p-1 rounded-xl border border-dark-700">
            <Link
              to="/menu"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/menu'
                  ? 'bg-gold-500 text-dark-900 shadow-glow'
                  : 'text-slate-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Digital Menu</span>
            </Link>

            <Link
              to="/kitchen"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/kitchen'
                  ? 'bg-emerald-500 text-dark-900 shadow-glow-emerald'
                  : 'text-slate-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen Dispatch</span>
            </Link>

            <Link
              to="/manager"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/manager'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Manager Portal</span>
            </Link>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Live Socket indicator */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{isConnected ? 'Live Synced' : 'Reconnecting...'}</span>
            </div>

            {/* Active Order Tracker floating button if active order exists */}
            {activeOrder && (
              <button
                onClick={() => setIsTrackerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition-all animate-bounce"
                title="Live 4-Stage Serving Tracker"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Order #{activeOrder.orderNumber}</span>
                <span className="sm:hidden">Tracking</span>
              </button>
            )}

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-dark-700 border border-dark-600 hover:border-gold-500/50 text-slate-200 hover:text-gold-400 transition-all"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold-500 text-dark-900 font-bold text-[10px] flex items-center justify-center shadow-glow animate-scale">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-[10px] text-gold-400/90 font-medium capitalize">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-dark-700 border border-dark-600 hover:bg-red-500/20 hover:text-red-400 transition-all text-slate-400"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-900 font-semibold text-xs transition-all shadow-glow flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-dark-700 border border-dark-600 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-dark-700/80 mt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsTableModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-dark-700/60 border border-dark-600 text-xs font-semibold text-slate-200"
            >
              <span>Selected Table: #{tableNumber}</span>
              <span className="text-gold-400 underline">Change</span>
            </button>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-dark-700 text-slate-200 flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4 text-gold-400" />
              <span>Digital Menu & Video Previews</span>
            </Link>
            <Link
              to="/kitchen"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-dark-700 text-slate-200 flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4 text-emerald-400" />
              <span>Kitchen Dispatch Board (Kanban)</span>
            </Link>
            <Link
              to="/manager"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-dark-700 text-slate-200 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Manager Revenue & Staff Studio</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Table Selector Modal */}
      <TableSelectModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
