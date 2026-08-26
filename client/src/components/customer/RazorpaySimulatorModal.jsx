import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';

const RazorpaySimulatorModal = ({
  isOpen,
  onClose,
  amount,
  orderData,
  onSuccess,
}) => {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess({
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_order_id: orderData?.orderId || `order_test_${Date.now()}`,
        razorpay_signature: 'simulated_valid_hmac_signature',
        isSimulator: true,
      });
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Razorpay Secure Checkout (Test Mode)"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Razorpay Banner */}
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Razorpay Test Gateway Simulator</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
            TEST MODE
          </span>
        </div>

        {/* Amount Summary */}
        <div className="text-center p-4 bg-dark-900 rounded-2xl border border-dark-700">
          <span className="text-xs text-slate-400 font-medium">Total Amount Payable</span>
          <div className="text-3xl font-bold text-gold-400 mt-1">₹{amount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Table #{orderData?.tableNumber || 4} • DineFlow Gourmet
          </span>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Select Test Method:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'card', label: 'Credit Card', icon: '💳' },
              { id: 'upi', label: 'UPI / QR', icon: '📱' },
              { id: 'netbanking', label: 'Netbanking', icon: '🏦' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === m.id
                    ? 'bg-gold-500/20 border-gold-500 text-gold-300'
                    : 'bg-dark-700/60 border-dark-600 text-slate-300 hover:bg-dark-700'
                }`}
              >
                <span className="text-base">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 bg-dark-900/50 p-2.5 rounded-lg border border-dark-700 flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            Test mode enabled. No real money will be charged. Clicking below triggers instant HMAC-verified order dispatch to the kitchen dispatch board.
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 py-2.5 rounded-xl border border-dark-600 text-slate-400 hover:text-white text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSimulatePayment}
            disabled={processing}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-dark-900 font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing ₹{amount}...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Pay ₹{amount}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RazorpaySimulatorModal;
