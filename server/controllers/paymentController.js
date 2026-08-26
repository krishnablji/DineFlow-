const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance if keys are provided
let razorpay = null;
if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.includes('dummy')
) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required.',
      });
    }

    // Convert amount to paise (e.g. ₹500.00 -> 50000)
    const amountInPaise = Math.round(Number(amount) * 100);

    // If Razorpay instance is available, create live test order
    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
      };

      const rzpOrder = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        isSimulator: false,
      });
    }

    // Otherwise, provide instant Test Mode Simulator response
    const mockOrderId = `order_demo_${Date.now()}`;
    return res.status(200).json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key',
      isSimulator: true,
      message: 'Razorpay Test Simulator active (Seamless demo checkout).',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
// @access  Public
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSimulator,
    } = req.body;

    // Handle instant simulator verification
    if (isSimulator || (razorpay_order_id && razorpay_order_id.startsWith('order_demo_'))) {
      return res.status(200).json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id || `pay_demo_${Date.now()}`,
        message: 'Payment verified via Test Mode Simulator.',
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay verification credentials.',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_razorpay_secret_key_12345';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        message: 'Razorpay signature verified successfully!',
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
