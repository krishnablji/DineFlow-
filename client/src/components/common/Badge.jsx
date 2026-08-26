import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variantStyles = {
    default: 'bg-dark-600 text-slate-300 border-dark-500',
    gold: 'bg-gold-500/10 text-gold-400 border-gold-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ruby: 'bg-red-500/10 text-red-400 border-red-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    urgent: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
    scheduled: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold',
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
