import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  AlertTriangle,
  Calendar,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Badge from '../common/Badge';

const OrderCard = ({ order, onAdvanceStatus, onTogglePriority }) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const created = new Date(order.createdAt).getTime();
      const now = Date.now();
      const mins = Math.floor((now - created) / 60000);
      setElapsedMinutes(mins > 0 ? mins : 0);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 30000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const getNextStatus = (current) => {
    switch (current) {
      case 'placed':
        return { next: 'prepping', label: 'Accept & Start Prep', color: 'bg-amber-500 hover:bg-amber-400' };
      case 'prepping':
        return { next: 'ready', label: 'Mark Ready to Serve', color: 'bg-emerald-500 hover:bg-emerald-400' };
      case 'ready':
        return { next: 'served', label: 'Mark Served to Table', color: 'bg-blue-500 hover:bg-blue-400' };
      default:
        return null;
    }
  };

  const nextAction = getNextStatus(order.servingStatus);

  return (
    <div className="glass-panel p-4 rounded-2xl border border-dark-600/80 bg-dark-800/90 shadow-md space-y-3 hover:border-gold-500/40 transition-all">
      {/* Header: Table number & Order ID */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-gold-500 text-dark-900 font-extrabold text-xs shadow-glow">
            Table #{order.tableNumber}
          </span>
          <span className="text-xs font-mono font-bold text-slate-300">
            #{order.orderNumber}
          </span>
        </div>

        {/* Priority Badge / Toggle */}
        <button
          onClick={() =>
            onTogglePriority(
              order._id,
              order.priority === 'urgent' ? 'normal' : 'urgent'
            )
          }
          className="focus:outline-none"
          title="Click to toggle urgent priority"
        >
          {order.priority === 'urgent' ? (
            <Badge variant="urgent" size="xs">
              <AlertTriangle className="w-3 h-3" />
              <span>URGENT</span>
            </Badge>
          ) : order.priority === 'scheduled' ? (
            <Badge variant="scheduled" size="xs">
              <Calendar className="w-3 h-3" />
              <span>{order.scheduledTime}</span>
            </Badge>
          ) : (
            <Badge variant="default" size="xs">
              Normal
            </Badge>
          )}
        </button>
      </div>

      {/* Elapsed Time & Customer name */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-dark-700/60">
        <span className="font-medium text-slate-300 truncate max-w-[150px]">
          {order.customerName || 'Guest'}
        </span>
        <div className="flex items-center gap-1 text-gold-400 font-semibold">
          <Clock className="w-3 h-3" />
          <span>{elapsedMinutes}m ago</span>
        </div>
      </div>

      {/* Order Items List */}
      <div className="space-y-1.5 bg-dark-900/60 p-2.5 rounded-xl border border-dark-700 max-h-36 overflow-y-auto">
        {order.items?.map((item, idx) => (
          <div key={idx} className="text-xs space-y-0.5">
            <div className="flex items-center justify-between text-slate-200">
              <span className="font-semibold text-slate-100">
                <strong className="text-gold-400 mr-1.5">{item.quantity}x</strong>
                {item.name}
              </span>
              {item.spiceLevel && (
                <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" />
                  {item.spiceLevel}
                </span>
              )}
            </div>

            {/* Addons & Notes */}
            {item.addons && item.addons.length > 0 && (
              <div className="text-[10px] text-slate-400 pl-4">
                + {item.addons.map((a) => a.name).join(', ')}
              </div>
            )}

            {item.specialInstructions && (
              <div className="text-[10px] text-amber-300/80 italic pl-4">
                Note: "{item.specialInstructions}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer: Amount & 1-Click Advancement */}
      <div className="pt-2 border-t border-dark-700 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-300">
          ₹{order.totalAmount}
        </span>

        {nextAction && (
          <button
            onClick={() => onAdvanceStatus(order._id, nextAction.next)}
            className={`px-3 py-1.5 rounded-xl ${nextAction.color} text-dark-900 font-bold text-xs shadow-md transition-all flex items-center gap-1`}
          >
            <span>{nextAction.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {order.servingStatus === 'served' && (
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
