import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { menuApi, orderApi } from '../api/apiServices';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  Send,
  Trash2,
  UtensilsCrossed,
  X,
  Volume2,
} from 'lucide-react';

const TABLES = Array.from({ length: 15 }, (_, i) => i + 1);

const WaiterTablet = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [selectedTable, setSelectedTable] = useState(4);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({}); // { [itemId]: { item, quantity, kitchenNote: '' } }
  const [readyAlerts, setReadyAlerts] = useState([]); // [{ orderNumber, tableNumber, id }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Keep tablet screen awake (Wake Lock API)
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

  // 2. Load menu items
  const fetchMenu = async () => {
    try {
      const res = await menuApi.getMenuItems();
      if (res.data?.success) {
        setMenuItems(res.data.data);
        const uniqueCats = ['All', ...new Set(res.data.data.map((d) => d.category))];
        setCategories(uniqueCats);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // 3. Socket event handling
  useEffect(() => {
    if (!socket) return;

    // Join room for waiters
    socket.emit('join_room', { role: 'waiter' });

    // Incoming "Food Ready for Delivery" from Kitchen
    const handleOrderReady = (order) => {
      console.log('Food Ready Alert received:', order);
      setReadyAlerts((prev) => [
        {
          id: order._id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);

      // Play chime if audio is supported
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    };

    // Real-time Item 86 (Out of Stock) or Restock toggle
    const handleStockUpdate = ({ itemId, isAvailable }) => {
      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isAvailable } : item
        )
      );

      // If an item in cart was marked out of stock, remove it
      if (!isAvailable) {
        setCart((prev) => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
      }
    };

    socket.on('order_ready', handleOrderReady);
    socket.on('item_stock_updated', handleStockUpdate);

    return () => {
      socket.off('order_ready', handleOrderReady);
      socket.off('item_stock_updated', handleStockUpdate);
    };
  }, [socket]);

  // Cart Adjustments
  const handleIncrease = (item) => {
    if (!item.isAvailable) return;
    setCart((prev) => {
      const existing = prev[item._id];
      if (existing) {
        return {
          ...prev,
          [item._id]: {
            ...existing,
            quantity: existing.quantity + 1,
          },
        };
      }
      return {
        ...prev,
        [item._id]: {
          item,
          quantity: 1,
          kitchenNote: '',
        },
      };
    });
  };

  const handleDecrease = (itemId) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return {
        ...prev,
        [itemId]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      };
    });
  };

  const handleNoteChange = (itemId, note) => {
    setCart((prev) => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          kitchenNote: note,
        },
      };
    });
  };

  // Submit Order (Strictly locks and clears cart)
  const handleSendToKitchen = async () => {
    const cartEntries = Object.values(cart);
    if (cartEntries.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        tableNumber: selectedTable,
        waiterName: user?.name || 'Alex Rivera (Waiter)',
        items: cartEntries.map(({ item, quantity, kitchenNote }) => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity,
          kitchenNote: kitchenNote || '',
        })),
      };

      const res = await orderApi.createOrder(orderPayload);
      if (res.data?.success) {
        const createdOrder = res.data.data;
        setLastSubmittedOrder(createdOrder.orderNumber);
        // Strict requirement: Immediately clear cart completely
        setCart({});
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to send order to kitchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissAlert = (id) => {
    setReadyAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Compute Cart Totals
  const cartList = Object.values(cart);
  const cartSubtotal = cartList.reduce(
    (sum, { item, quantity }) => sum + item.price * quantity,
    0
  );

  const filteredDishes =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP READY BANNER NOTIFICATION */}
      {readyAlerts.length > 0 && (
        <div className="sticky top-0 z-50 bg-emerald-600 text-white shadow-lg border-b-2 border-emerald-400">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-800 rounded-full animate-bounce">
                <Bell className="w-5 h-5 text-emerald-200" />
              </span>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                  🔔 Ready for Delivery:{' '}
                </span>
                <span className="font-black text-amber-300 text-base sm:text-lg">
                  Order {readyAlerts[0].orderNumber} (Table #{readyAlerts[0].tableNumber})
                </span>
                {readyAlerts.length > 1 && (
                  <span className="ml-2 text-xs bg-emerald-800 px-2 py-0.5 rounded-full">
                    +{readyAlerts.length - 1} more
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissAlert(readyAlerts[0].id)}
              className="bg-emerald-950 hover:bg-black text-white px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <span>Picked Up / Dismiss</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. TABLE SELECTOR BAR (1 to 15) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Table:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {TABLES.map((tableNum) => {
              const isSelected = selectedTable === tableNum;
              return (
                <button
                  key={tableNum}
                  onClick={() => setSelectedTable(tableNum)}
                  className={`w-11 h-11 rounded-xl font-bold text-base transition-all shrink-0 flex items-center justify-center border-2 ${
                    isSelected
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {tableNum}
                </button>
              );
            })}
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span>{isConnected ? 'Wi-Fi Live' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: MENU (LEFT) + ACTIVE CART (RIGHT) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: CATEGORIES + MENU ITEMS */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  activeCategory === cat
                    ? 'bg-slate-100 text-slate-900 border-white shadow'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto">
            {filteredDishes.map((dish) => {
              const inCart = cart[dish._id];
              const qty = inCart ? inCart.quantity : 0;
              const isAvailable = dish.isAvailable !== false;

              return (
                <div
                  key={dish._id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    !isAvailable
                      ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                      : qty > 0
                      ? 'bg-slate-900 border-amber-500/50 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-100">
                          {dish.name}
                        </h4>
                        {!isAvailable && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                            OUT OF STOCK
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {dish.category}
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-extrabold text-amber-400">
                      ₹{dish.price}
                    </span>
                  </div>

                  {/* High-Touch Touch Quantity Counters */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span className="text-xs text-slate-500 font-medium">
                      {qty > 0 ? `Selected: ${qty}` : 'Not in order'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrease(dish._id)}
                        disabled={qty === 0}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition ${
                          qty > 0
                            ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-95'
                            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-5 h-5" />
                      </button>

                      <span className="w-6 text-center font-bold text-base text-white">
                        {qty}
                      </span>

                      <button
                        onClick={() => handleIncrease(dish)}
                        disabled={!isAvailable}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition ${
                          isAvailable
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE ORDER / TABLE CART */}
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-full shadow-xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-2xl">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Current Table
              </span>
              <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <span>Table #{selectedTable}</span>
              </h3>
            </div>
            {cartList.length > 0 && (
              <button
                onClick={() => setCart({})}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Last Submitted Success Notice */}
          {lastSubmittedOrder && cartList.length === 0 && (
            <div className="m-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Order <strong className="text-white">{lastSubmittedOrder}</strong> sent to Kitchen! Cart locked & cleared.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="m-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {cartList.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                <UtensilsCrossed className="w-8 h-8 stroke-1 text-slate-600" />
                <p className="text-xs font-medium">
                  Tap <span className="text-amber-400 font-bold">+</span> on dishes to start order for Table #{selectedTable}
                </p>
              </div>
            ) : (
              cartList.map(({ item, quantity, kitchenNote }) => (
                <div
                  key={item._id}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-sm font-bold text-slate-200">{item.name}</h5>
                      <span className="text-xs text-slate-400">
                        {quantity} × ₹{item.price} = ₹{quantity * item.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrease(item._id)}
                        className="w-7 h-7 bg-slate-800 text-white rounded-lg flex items-center justify-center font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-sm font-bold">{quantity}</span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="w-7 h-7 bg-amber-500 text-slate-950 rounded-lg flex items-center justify-center font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* PLAIN-TEXT UNFORMATTED KITCHEN INSTRUCTIONS INPUT */}
                  <input
                    type="text"
                    value={kitchenNote}
                    onChange={(e) => handleNoteChange(item._id, e.target.value)}
                    placeholder="Kitchen note: e.g. extra spicy, no onion..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Big Action Button */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 rounded-b-2xl space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Table Subtotal</span>
              <span className="text-lg font-black text-white">₹{cartSubtotal}</span>
            </div>

            <button
              onClick={handleSendToKitchen}
              disabled={cartList.length === 0 || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                cartList.length > 0 && !isSubmitting
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-98'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'Sending to Kitchen...'
                  : `Send to Kitchen (Table #${selectedTable})`}
              </span>
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Order will lock immediately with an atomic ID (e.g. T{String(selectedTable).padStart(2, '0')}-#01).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterTablet;
