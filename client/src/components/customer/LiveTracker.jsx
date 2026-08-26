import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { useSocket } from '../../context/SocketContext';
import { orderApi } from '../../api/apiServices';
import {
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  ChefHat,
  BellRing,
  Sparkles,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import Modal from '../common/Modal';

const stages = [
  { id: 'placed', label: 'Order Placed', desc: 'Sent to Kitchen', icon: Clock },
  { id: 'prepping', label: 'Kitchen Prepping', desc: 'Chef Crafting Dishes', icon: ChefHat },
  { id: 'ready', label: 'Ready to Serve', desc: 'Plated & Ready', icon: BellRing },
  { id: 'served', label: 'Served to Table', desc: 'Bon Appétit!', icon: UtensilsCrossed },
];

const LiveTracker = () => {
  const { activeOrder, isTrackerOpen, setIsTrackerOpen, updateOrderStatus } = useOrderStore();
  const { socket, joinTableRoom } = useSocket();
  const [timeline, setTimeline] = useState([]);

  // Subscribe to table room & listen for live serving milestones
  useEffect(() => {
    if (activeOrder?.tableNumber) {
      joinTableRoom(activeOrder.tableNumber);
    }
  }, [activeOrder?.tableNumber]);

  useEffect(() => {
    if (!socket) return;

    const handleServingUpdate = (updatedOrder) => {
      if (
        updatedOrder &&
        (updatedOrder.orderNumber === activeOrder?.orderNumber ||
          updatedOrder._id === activeOrder?._id)
      ) {
        updateOrderStatus(updatedOrder.servingStatus, updatedOrder);
      }
    };

    socket.on('serving_status_updated', handleServingUpdate);
    socket.on('order_milestone_changed', handleServingUpdate);

    return () => {
      socket.off('serving_status_updated', handleServingUpdate);
      socket.off('order_milestone_changed', handleServingUpdate);
    };
  }, [socket, activeOrder]);

  if (!isTrackerOpen || !activeOrder) return null;

  const currentStatus = activeOrder.servingStatus || 'placed';
  const currentIndex = stages.findIndex((s) => s.id === currentStatus);
  const activeStageIndex = currentIndex >= 0 ? currentIndex : 0;
  const progressPercent = (activeStageIndex / (stages.length - 1)) * 100;

  return (
    <Modal
      isOpen={isTrackerOpen}
      onClose={() => setIsTrackerOpen(false)}
      title={`Live Serving Pipeline • #${activeOrder.orderNumber}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Table & Schedule Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-900 border border-dark-700">
          <div>
            <span className="text-xs text-slate-400 font-medium">Table Assignment</span>
            <div className="text-xl font-bold text-slate-100">
              Table #{activeOrder.tableNumber}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Serving Slot</span>
            <div className="text-sm font-bold text-gold-400">
              {activeOrder.scheduledTime || 'Immediate'}
            </div>
          </div>
        </div>

        {/* 4-Stage Animated Serving Pipeline */}
        <div className="relative py-4 px-2">
          {/* Background Track */}
          <div className="absolute top-8 left-8 right-8 h-1 bg-dark-700 -z-0" />
          
          {/* Active Fill Track */}
          <div
            className="absolute top-8 left-8 h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-emerald-400 transition-all duration-700 -z-0"
            style={{ width: `calc(${progressPercent}% - 32px)` }}
          />

          <div className="flex items-start justify-between relative z-10">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isCompleted = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;

              return (
                <div key={stage.id} className="flex flex-col items-center text-center max-w-[85px]">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isCurrent
                        ? 'bg-gold-500 border-gold-400 text-dark-900 shadow-glow animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-dark-900 shadow-glow-emerald'
                        : 'bg-dark-900 border-dark-600 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-bold tracking-tight leading-tight ${
                      isCurrent
                        ? 'text-gold-400'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5 hidden sm:block">
                    {stage.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Highlight Card */}
        <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gold-500 text-dark-900 font-bold shadow-glow">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gold-300 uppercase tracking-wider">
              Serving Pipeline Status: {stages[activeStageIndex]?.label}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentStatus === 'placed' && 'Your order is queued in the kitchen dispatch queue.'}
              {currentStatus === 'prepping' && 'Our chefs are currently preparing your customized dishes.'}
              {currentStatus === 'ready' && 'Your dishes are freshly plated and waitstaff is delivering them!'}
              {currentStatus === 'served' && 'Dishes served to your table! Enjoy your gourmet meal.'}
            </p>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="space-y-2 border-t border-dark-700 pt-4">
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Items in this order:
          </h5>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {activeOrder.items?.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-dark-900/60 border border-dark-700"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gold-400">{item.quantity}x</span>
                  <span className="text-slate-200">{item.name}</span>
                  {item.spiceLevel && (
                    <span className="text-[10px] text-slate-400">({item.spiceLevel})</span>
                  )}
                </div>
                <span className="font-semibold text-slate-300">
                  ₹{item.itemTotal || item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-dark-700 text-xs">
          <span className="text-slate-400">
            Total Paid: <strong className="text-gold-400">₹{activeOrder.totalAmount}</strong>
          </span>
          <button
            onClick={() => setIsTrackerOpen(false)}
            className="px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-200 font-semibold transition-colors"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LiveTracker;
