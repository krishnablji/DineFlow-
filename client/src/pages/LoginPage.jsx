import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  ChefHat,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('waiter');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isRegister) {
      const res = await register({ name, email, password, role, phone });
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message || 'Registration successful!');
        setTimeout(() => {
          if (res.user.role === 'manager') navigate('/manager');
          else if (res.user.role === 'kitchen') navigate('/kitchen');
          else navigate('/waiter');
        }, 800);
      } else {
        setError(res.message || 'Registration failed');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (res.user.role === 'manager') navigate('/manager');
        else if (res.user.role === 'kitchen') navigate('/kitchen');
        else navigate('/waiter');
      } else {
        setError(res.message || 'Login failed');
      }
    }
  };

  const handle1ClickDemo = async (demoRole) => {
    setLoading(true);
    const res = await demoLogin(demoRole, 4);
    setLoading(false);
    if (res.success) {
      if (demoRole === 'manager') navigate('/manager');
      else if (demoRole === 'kitchen') navigate('/kitchen');
      else navigate('/waiter');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel-glow p-8 rounded-3xl border border-gold-500/30 bg-dark-800/90 text-slate-100 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-400 flex items-center justify-center shadow-glow mx-auto mb-2">
            <UtensilsCrossed className="w-6 h-6 text-dark-900 stroke-[2.5]" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-100">
            {isRegister ? 'Staff Account Registration' : 'DineFlow POS Sign In'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister
              ? 'Register as waiter, kitchen staff, or restaurant manager'
              : 'Sign in to access your retail POS station'}
          </p>
        </div>

        {/* 1-Click Quick Demo Helpers */}
        <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-dark-700 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gold-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Retail Demo Station:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handle1ClickDemo('waiter')}
              className="p-2 rounded-xl bg-dark-800 hover:bg-amber-500 hover:text-dark-900 border border-dark-600 text-[11px] font-semibold text-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <span>📱</span>
              <span>Waiter</span>
            </button>
            <button
              type="button"
              onClick={() => handle1ClickDemo('kitchen')}
              className="p-2 rounded-xl bg-dark-800 hover:bg-emerald-500 hover:text-dark-900 border border-dark-600 text-[11px] font-semibold text-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <ChefHat className="w-4 h-4 text-emerald-400" />
              <span>Kitchen</span>
            </button>
            <button
              type="button"
              onClick={() => handle1ClickDemo('manager')}
              className="p-2 rounded-xl bg-dark-800 hover:bg-blue-500 hover:text-white border border-dark-600 text-[11px] font-semibold text-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Manager</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Staff Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Waiter / Chef / Manager Name"
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Staff Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'waiter', label: 'Waiter' },
                    { id: 'kitchen', label: 'Kitchen' },
                    { id: 'manager', label: 'Manager' },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                        role === r.id
                          ? 'bg-gold-500/20 text-gold-300 border-gold-500'
                          : 'bg-dark-900 border-dark-600 text-slate-400'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dineflow.com"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-900 font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2"
          >
            {isRegister ? (
              <>
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle login / register */}
        <div className="text-center pt-2 border-t border-dark-700/80">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs text-slate-400 hover:text-gold-400 transition-colors"
          >
            {isRegister
              ? 'Already have an account? Sign in here'
              : "Don't have an account? Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
