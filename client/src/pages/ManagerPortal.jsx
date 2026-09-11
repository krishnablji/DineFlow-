import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { analyticsApi, menuApi, orderApi } from '../api/apiServices';
import {
  PackageCheck,
  Receipt,
  IndianRupee,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Check,
} from 'lucide-react';

const ManagerPortal = () => {
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [settledOrders, setSettledOrders] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'sales'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // 1. Fetch data from backend
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDashboardAnalytics();
      if (res.data?.success) {
        const { todayRevenue, todayOrdersCount, settledOrders, outOfStockItems } =
          res.data.data;
        setTodayRevenue(todayRevenue || 0);
        setTodayOrdersCount(todayOrdersCount || 0);
        setSettledOrders(settledOrders || []);
        setOutOfStockItems(outOfStockItems || []);
      }
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 2. Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_room', { role: 'manager' });

    // When an item's stock is updated (from kitchen or manager)
    const handleStockUpdate = ({ itemId, isAvailable, name }) => {
      if (isAvailable) {
        // Removed from out-of-stock list
        setOutOfStockItems((prev) => prev.filter((i) => i._id !== itemId));
      } else {
        // Added to out-of-stock list
        setOutOfStockItems((prev) => {
          if (prev.some((i) => i._id === itemId)) return prev;
          return [...prev, { _id: itemId, name, isAvailable: false }];
        });
      }
    };

    // When a new order arrives
    const handleNewOrder = (order) => {
      setTodayOrdersCount((prev) => prev + 1);
      setTodayRevenue((prev) => prev + (order.totalAmount || 0));
      setSettledOrders((prev) => [order, ...prev]);
    };

    // When an order is settled or marked ready
    const handleOrderStatusUpdate = (order) => {
      setSettledOrders((prev) =>
        prev.map((o) => (o._id === order._id ? order : o))
      );
    };

    socket.on('item_stock_updated', handleStockUpdate);
    socket.on('new_order', handleNewOrder);
    socket.on('order_ready', handleOrderStatusUpdate);
    socket.on('order_settled', handleOrderStatusUpdate);

    return () => {
      socket.off('item_stock_updated', handleStockUpdate);
      socket.off('new_order', handleNewOrder);
      socket.off('order_ready', handleOrderStatusUpdate);
      socket.off('order_settled', handleOrderStatusUpdate);
    };
  }, [socket]);

  // Panel 1 Action: Restock Item (Re-enables '+' button on Waiter Tablets)
  const handleRestockItem = async (itemId) => {
    setActionLoadingId(itemId);
    try {
      const res = await menuApi.toggleStock(itemId, true);
      if (res.data?.success) {
        setOutOfStockItems((prev) => prev.filter((i) => i._id !== itemId));
      }
    } catch (err) {
      console.error('Failed to restock item:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Optional Settle Action for running tabs
  const handleSettleOrder = async (orderId) => {
    try {
      const res = await orderApi.settleOrder(orderId, 'cash');
      if (res.data?.success) {
        setSettledOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.data : o))
        );
      }
    } catch (err) {
      console.error('Failed to settle order:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TOP HEADER & TAB SWITCHER (STRICTLY 2 PANELS) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Manager Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Restaurant Executive Oversight
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Panel 1: Inventory Restock Control</span>
              {outOfStockItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
                  {outOfStockItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border ${
                activeTab === 'sales'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Panel 2: Daily Sales & Summary</span>
            </button>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 ml-2"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PANEL 1: INVENTORY RESTOCK CONTROL                        */}
        {/* ========================================================= */}
        {activeTab === 'inventory' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-400" />
                  <span>Out-of-Stock Items (Flagged by Kitchen)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Restocking an item immediately broadcasts a socket event to re-enable the{' '}
                  <span className="text-amber-400 font-bold">+</span> button on all Waiter Tablets.
                </p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {outOfStockItems.length} Items Unavailable
              </span>
            </div>

            {outOfStockItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-slate-800 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400/50" />
                <h3 className="text-base font-bold text-slate-200">
                  Full Inventory Available
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  No items are currently 86'd. When the kitchen marks an item out of stock, it will appear here for 1-click restock.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {outOfStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="py-3.5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-base text-white">
                          {item.name}
                        </h4>
                        <span className="text-xs text-slate-400">
                          Category: {item.category || 'Kitchen Dish'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestockItem(item._id)}
                      disabled={actionLoadingId === item._id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {actionLoadingId === item._id
                          ? 'Restocking...'
                          : 'Restock & Re-Enable on Waiter Tablets'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 2: DAILY SALES & SUMMARY BREAKDOWN                  */}
        {/* ========================================================= */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
                  <IndianRupee className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Net Revenue (Today)
                  </span>
                  <h2 className="text-3xl font-black text-white">
                    ₹{todayRevenue.toLocaleString()}
                  </h2>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Orders Placed (Today)
                  </span>
                  <h2 className="text-3xl font-black text-white">
                    {todayOrdersCount} Orders
                  </h2>
                </div>
              </div>
            </div>

            {/* Chronological List of Today's Orders */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">
                    Today's Chronological Order Log
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clean plain breakdown of tickets (T04-#01, T04-#02) with item summaries and bill totals.
                  </p>
                </div>
              </div>

              {settledOrders.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No orders recorded today yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {settledOrders.map((order) => {
                    const isSettled = order.servingStatus === 'settled';
                    return (
                      <div
                        key={order._id}
                        className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-black text-amber-400">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-300">
                              (Table #{order.tableNumber})
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isSettled
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {order.servingStatus}
                            </span>
                          </div>

                          {/* Items Breakdown */}
                          <p className="text-xs text-slate-300 font-medium">
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' • ')}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>
                              Placed by: {order.waiterName || 'Staff'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Amount & Settle Control */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs text-slate-400">Total Bill</span>
                            <p className="text-lg font-black text-white">
                              ₹{order.totalAmount}
                            </p>
                          </div>

                          {!isSettled && (
                            <button
                              onClick={() => handleSettleOrder(order._id)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
                            >
                              Mark Settled
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPortal;
