import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { orderApi, menuApi } from '../api/apiServices';
import {
  ChefHat,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  Bell,
  Utensils,
  Ban,
  RotateCcw,
} from 'lucide-react';

const KitchenKanban = () => {
  const { socket, isConnected } = useSocket();

  const [activeOrders, setActiveOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItem86Drawer, setShowItem86Drawer] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // 1. Keep kitchen screen awake permanently
  useEffect(() => {
    let wakeLock = null;
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((lock) => {
        wakeLock = lock;
      }).catch((err) => console.log('Wake Lock error:', err));
    }
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, []);

  // 2. Fetch active orders & menu items
  const loadData = async () => {
    setLoading(true);
    try {
      const [orderRes, menuRes] = await Promise.all([
        orderApi.getActiveOrders(),
        menuApi.getMenuItems(),
      ]);

      if (orderRes.data?.success) {
        // Filter strictly orders that need cooking or ready for pickup
        setActiveOrders(
          orderRes.data.data.filter((o) => o.servingStatus !== 'settled' && o.servingStatus !== 'cancelled')
        );
      }
      if (menuRes.data?.success) {
        setMenuItems(menuRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load kitchen data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 3. Socket event subscriptions
  useEffect(() => {
    if (!socket) return;

    // Join room for kitchen
    socket.emit('join_room', { role: 'kitchen' });

    // Incoming new order from Waiter Tablet
    const handleNewOrder = (newOrder) => {
      console.log('Kitchen received new order:', newOrder);
      setActiveOrders((prev) => [...prev, newOrder]);

      // Sound notification for cooks
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    };

    // When an order status updates or is settled
    const handleOrderStatusUpdate = (updatedOrder) => {
      setActiveOrders((prev) =>
        prev
          .map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
          .filter((o) => o.servingStatus !== 'settled')
      );
    };

    // When an item stock status is toggled
    const handleStockUpdate = ({ itemId, isAvailable }) => {
      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isAvailable } : item
        )
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleOrderStatusUpdate);
    socket.on('order_settled', (order) => {
      setActiveOrders((prev) => prev.filter((o) => o._id !== order._id));
    });
    socket.on('item_stock_updated', handleStockUpdate);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleOrderStatusUpdate);
      socket.off('item_stock_updated', handleStockUpdate);
    };
  }, [socket]);

  // Single Action: Mark Ready / Start Delivery
  const handleStartDelivery = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const res = await orderApi.markOrderReady(orderId);
      if (res.data?.success) {
        // Update local order to ready state
        setActiveOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.data : o))
        );
      }
    } catch (err) {
      console.error('Failed to mark order ready:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Item 86 (Out-of-Stock) Toggle
  const handleToggleStock = async (itemId, currentAvailability) => {
    try {
      const newStatus = !currentAvailability;
      const res = await menuApi.toggleStock(itemId, newStatus);
      if (res.data?.success) {
        setMenuItems((prev) =>
          prev.map((i) => (i._id === itemId ? { ...i, isAvailable: newStatus } : i))
        );
      }
    } catch (err) {
      console.error('Failed to toggle stock:', err);
    }
  };

  // Helper to calculate minutes elapsed
  const getMinutesAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none p-3 sm:p-5">
      {/* 1. KITCHEN KDS TOP BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Kitchen Display System (KDS)</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {activeOrders.length} Active Tickets
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              High-visibility live cooking queue • Table-wise sequential IDs
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Toggle Item 86 Drawer */}
          <button
            onClick={() => setShowItem86Drawer(!showItem86Drawer)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border ${
              showItem86Drawer
                ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-red-500/50 hover:text-red-300'
            }`}
          >
            <Ban className="w-4 h-4 text-red-400" />
            <span>Item 86 (Out of Stock Manager)</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. ITEM 86 (OUT-OF-STOCK) QUICK DRAWER */}
      {showItem86Drawer && (
        <div className="bg-slate-900 border-2 border-red-500/40 rounded-2xl p-4 mb-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <h3 className="font-extrabold text-sm text-white">
                Item 86 Quick Toggle (Disables Item on all Waiter Tablets instantly)
              </h3>
            </div>
            <button
              onClick={() => setShowItem86Drawer(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {menuItems.map((dish) => {
              const isAvailable = dish.isAvailable !== false;
              return (
                <div
                  key={dish._id}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between text-xs transition ${
                    isAvailable
                      ? 'bg-slate-950/80 border-slate-800'
                      : 'bg-red-950/40 border-red-500/50'
                  }`}
                >
                  <div className="mb-2">
                    <p className="font-bold text-slate-200 line-clamp-1">{dish.name}</p>
                    <span className="text-[10px] text-slate-400">{dish.category}</span>
                  </div>

                  <button
                    onClick={() => handleToggleStock(dish._id, isAvailable)}
                    className={`w-full py-1 px-2 rounded-lg text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                      isAvailable
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TICKET CARDS GRID (FIFO QUEUE) */}
      <div className="flex-1">
        {activeOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500/40 mb-3" />
            <h3 className="text-xl font-bold text-slate-300">All Clear! Kitchen Queue Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Tickets sent from Waiter Tablets will pop up here in real time with table IDs (e.g. T04-#01).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeOrders.map((order) => {
              const minutesAgo = getMinutesAgo(order.createdAt);
              const isReady = order.servingStatus === 'ready';

              // Visual aging urgency: 0-10m normal, 10-18m amber, 18m+ red
              const urgencyColor =
                minutesAgo > 18
                  ? 'border-red-500/80 bg-red-950/10'
                  : minutesAgo > 10
                  ? 'border-amber-500/80 bg-amber-950/10'
                  : 'border-slate-800 bg-slate-900/90';

              return (
                <div
                  key={order._id}
                  className={`rounded-2xl border-2 flex flex-col justify-between shadow-xl transition-all ${
                    isReady ? 'border-emerald-500/70 bg-emerald-950/20' : urgencyColor
                  }`}
                >
                  {/* Card Header: Table Sequential Number */}
                  <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/70 rounded-t-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Table #{order.tableNumber}
                      </span>
                      <h2 className="text-2xl font-black text-amber-400 font-mono tracking-wide">
                        {order.orderNumber}
                      </h2>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{minutesAgo}m ago</span>
                      </div>
                      <span
                        className={`inline-block mt-0.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isReady
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isReady ? 'READY FOR DELIVERY' : 'COOKING'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Items with High-Contrast Plain Notes */}
                  <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-72">
                    {order.items.map((item, idx) => {
                      const note = (item.kitchenNote || item.specialInstructions || '').trim();
                      return (
                        <div
                          key={idx}
                          className="pb-2 border-b border-slate-800/50 last:border-0 last:pb-0"
                        >
                          <div className="flex justify-between items-baseline">
                            <span className="font-black text-base text-white">
                              {item.quantity} × {item.name}
                            </span>
                          </div>

                          {/* DIRECT UNFORMATTED PLAIN NOTE IN BOLD HIGH-CONTRAST */}
                          {note ? (
                            <div className="mt-1 px-2.5 py-1 bg-amber-500/10 border-l-4 border-amber-400 rounded-r text-amber-300 font-bold text-xs">
                              ⚠️ NOTE: {note}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-600 italic">Standard prep</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer: Single Simplified Action Button */}
                  <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/90 rounded-b-2xl">
                    <button
                      onClick={() => handleStartDelivery(order._id)}
                      disabled={isReady || actionLoadingId === order._id}
                      className={`w-full py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                        isReady
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-98 shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>
                        {actionLoadingId === order._id
                          ? 'Broadcasting...'
                          : isReady
                          ? 'Alert Sent to Waiters'
                          : 'Start Delivery (Mark Ready)'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenKanban;
