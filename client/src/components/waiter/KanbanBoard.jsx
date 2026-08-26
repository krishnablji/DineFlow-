import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/apiServices';
import { useSocket } from '../../context/SocketContext';
import {
  Clock,
  ChefHat,
  BellRing,
  CheckCircle2,
  Filter,
  Search,
  Volume2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import OrderCard from './OrderCard';

const COLUMNS = [
  { id: 'placed', title: 'New Orders', icon: Clock, color: 'text-amber-400', badgeColor: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { id: 'prepping', title: 'Kitchen Prepping', icon: ChefHat, color: 'text-gold-400', badgeColor: 'bg-gold-500/20 border-gold-500/40 text-gold-300' },
  { id: 'ready', title: 'Ready to Serve', icon: BellRing, color: 'text-emerald-400', badgeColor: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  { id: 'served', title: 'Completed', icon: CheckCircle2, color: 'text-blue-400', badgeColor: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
];

const KanbanBoard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchTable, setSearchTable] = useState('');
  const { socket, playAlertSound } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders({ limit: 100 });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen for real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder) => {
      console.log('[Kanban] Received new order via socket:', newOrder);
      playAlertSound();
      setOrders((prev) => [newOrder, ...prev.filter((o) => o._id !== newOrder._id)]);
    };

    const handleStatusUpdate = (updatedOrder) => {
      console.log('[Kanban] Order updated via socket:', updatedOrder);
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);
    socket.on('order_milestone_changed', handleStatusUpdate);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
      socket.off('order_milestone_changed', handleStatusUpdate);
    };
  }, [socket]);

  const handleAdvanceStatus = async (orderId, newStatus) => {
    try {
      const res = await orderApi.updateOrderStatus(orderId, { status: newStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.data : o))
        );
      }
    } catch (err) {
      console.error('Status advance error:', err);
    }
  };

  const handleTogglePriority = async (orderId, priority) => {
    try {
      const res = await orderApi.updateOrderPriority(orderId, priority);
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.data : o))
        );
      }
    } catch (err) {
      console.error('Priority error:', err);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesPriority =
      filterPriority === 'All' || order.priority === filterPriority;
    const matchesTable =
      !searchTable || String(order.tableNumber).includes(searchTable);
    return matchesPriority && matchesTable;
  });

  return (
    <div className="space-y-5">
      {/* Top Filter & Action Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-dark-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority filter pills */}
          <div className="flex items-center gap-1.5 bg-dark-900 p-1 rounded-xl border border-dark-700 text-xs font-semibold">
            {['All', 'urgent', 'scheduled', 'normal'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterPriority === p
                    ? 'bg-gold-500 text-dark-900 shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Table search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter Table #..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              className="bg-dark-900 border border-dark-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 w-36"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-dark-800 border border-dark-700 text-slate-300 hover:text-gold-400 hover:border-gold-500/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 4-Column Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const colOrders = filteredOrders.filter((o) => o.servingStatus === col.id);

          return (
            <div
              key={col.id}
              className="glass-panel rounded-2xl border border-dark-700/80 bg-dark-900/50 p-4 flex flex-col min-h-[550px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-dark-700/80">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {col.title}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${col.badgeColor}`}
                >
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards Column List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colOrders.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                    <p>No active orders in this column</p>
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onAdvanceStatus={handleAdvanceStatus}
                      onTogglePriority={handleTogglePriority}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
