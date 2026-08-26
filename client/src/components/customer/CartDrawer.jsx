import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuth } from '../../context/AuthContext';
import { paymentApi, orderApi } from '../../api/apiServices';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  CreditCard,
  Sparkles,
  CheckCircle,
  Loader2,
  Calendar,
  Flame,
} from 'lucide-react';
import RazorpaySimulatorModal from './RazorpaySimulatorModal';

const CartDrawer = () => {
  const {
    items,
    tableNumber,
    scheduledTime,
    setScheduledTime,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTaxes,
    getServiceFee,
    getTotalAmount,
  } = useCartStore();

  const { setActiveOrder } = useOrderStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState(null);

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const serviceFee = getServiceFee();
  const totalAmount = getTotalAmount();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      // 1. Create order on backend / payment gateway
      const res = await paymentApi.createRazorpayOrder({
        amount: totalAmount,
        currency: 'INR',
        receipt: `rcpt_tbl${tableNumber}_${Date.now()}`,
      });

      const paymentInfo = res.data;

      // If Razorpay live checkout is configured & window.Razorpay exists
      if (
        !paymentInfo.isSimulator &&
        window.Razorpay &&
        paymentInfo.key &&
        !paymentInfo.key.includes('dummy')
      ) {
        const options = {
          key: paymentInfo.key,
          amount: paymentInfo.amount,
          currency: paymentInfo.currency,
          name: 'DineFlow Gourmet',
          description: `Dine-In Order • Table #${tableNumber}`,
          order_id: paymentInfo.orderId,
          handler: async (response) => {
            await finalizeOrder({
              ...response,
              isSimulator: false,
            });
          },
          prefill: {
            name: user?.name || 'Guest Customer',
            email: user?.email || 'customer@dineflow.com',
            contact: user?.phone || '+919876543210',
          },
          theme: {
            color: '#F59E0B',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        // Use instant Test Simulator modal for zero-friction evaluation
        setPendingPaymentData({
          orderId: paymentInfo.orderId,
          amount: totalAmount,
          tableNumber,
        });
        setSimulatorOpen(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Fallback directly to simulator
      setPendingPaymentData({
        orderId: `order_fallback_${Date.now()}`,
        amount: totalAmount,
        tableNumber,
      });
      setSimulatorOpen(true);
      setLoading(false);
    }
  };

  const finalizeOrder = async (paymentResult) => {
    setLoading(true);
    try {
      // 2. Verify signature on backend
      await paymentApi.verifyPayment(paymentResult);

      // 3. Create persistent Order document
      const orderPayload = {
        tableNumber,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          spiceLevel: item.spiceLevel,
          addons: item.addons,
          specialInstructions: item.specialInstructions,
          itemTotal: item.itemTotal,
        })),
        subtotal,
        tax: taxes,
        serviceFee,
        totalAmount,
        customerName: user?.name || 'Guest Customer',
        customerPhone: user?.phone || '',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        razorpayOrderId: paymentResult.razorpay_order_id,
        razorpayPaymentId: paymentResult.razorpay_payment_id,
        scheduledTime,
        priority: scheduledTime === 'Immediate' ? 'normal' : 'scheduled',
      };

      const orderRes = await orderApi.createOrder(orderPayload);

      if (orderRes.data.success) {
        const createdOrder = orderRes.data.data;
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#FBBF24'],
        });

        // Set active order for live 4-stage tracking & clear cart
        setActiveOrder(createdOrder);
        clearCart();
        setIsCartOpen(false);
      }
    } catch (err) {
      console.error('Failed to finalize order:', err);
      alert('Order creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={() => setIsCartOpen(false)}
        />

        {/* Drawer Panel */}
        <div className="relative z-10 w-full max-w-md bg-dark-900 border-l border-dark-700/80 shadow-2xl flex flex-col h-full animate-slide-up text-slate-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-dark-700/80 flex items-center justify-between bg-dark-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-100">
                  Dine-In Order
                </h3>
                <span className="text-xs text-gold-400 font-semibold">
                  Table #{tableNumber}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center mb-3 text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-slate-300">Your Cart is Empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Explore our gourmet menu, customize your dishes with chef videos, and place your dine-in order.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-2xl bg-dark-800/90 border border-dark-700/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-dark-600 flex-shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-red-400 font-medium">
                            <Flame className="w-3 h-3" />
                            {item.spiceLevel}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-gold-400">₹{item.unitPrice}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Addons summary */}
                  {item.addons && item.addons.length > 0 && (
                    <div className="text-[10px] text-slate-400 bg-dark-900/60 px-2.5 py-1.5 rounded-lg border border-dark-700/60">
                      <span className="text-gold-400/90 font-medium">Add-ons: </span>
                      {item.addons.map((a) => `${a.name} (+₹${a.price})`).join(', ')}
                    </div>
                  )}

                  {/* Quantity & Item Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-dark-700/60">
                    <div className="flex items-center gap-2 bg-dark-900 border border-dark-700 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-gold-400">
                      ₹{item.itemTotal}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dine-In Scheduler & Checkout Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-dark-800/90 border-t border-dark-700/80 space-y-4">
              {/* Dining Time Slot Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" />
                  <span>Dine-In Serving Schedule:</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Immediate', 'In 15 Mins', 'In 30 Mins'].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setScheduledTime(slot)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                        scheduledTime === slot
                          ? 'bg-gold-500/20 text-gold-300 border-gold-500 shadow-glow'
                          : 'bg-dark-900 border-dark-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-dark-700">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service Fee (2%)</span>
                  <span>₹{serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-100 pt-1.5 border-t border-dark-700">
                  <span>Total Amount</span>
                  <span className="text-gold-400">₹{totalAmount}</span>
                </div>
              </div>

              {/* Razorpay CTA Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-900 font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 stroke-[2.5]" />
                    <span>Pay ₹{totalAmount} via Razorpay</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Razorpay Test Simulator Modal Fallback */}
      <RazorpaySimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        amount={totalAmount}
        orderData={pendingPaymentData}
        onSuccess={finalizeOrder}
      />
    </>
  );
};

export default CartDrawer;
