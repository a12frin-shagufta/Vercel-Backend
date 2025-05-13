import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';

const currency = 'INR';
const deliveryCharge = 0; // Set to 0 to match frontend

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// COD Order Placement
export const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + (item.finalPrice || item.price) * item.quantity, 0);

    if (Math.abs(totalAmount - amount) > 0.01) {
      return res.status(400).json({ success: false, message: 'Amount mismatch' });
    }

    const orderData = {
      userId,
      items,
      address,
      amount: totalAmount,
      paymentMethod: 'COD',
      payment: false,
      date: Date.now(),
      status: 'Order Placed',
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cardData: {} });

    res.json({ success: true, message: 'Order Placed' });
  } catch (error) {
    console.error('Place order error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Razorpay Order
export const placeOrderRazorpay = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId;


    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: 'Razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'Pending',
      payment: false,
      date: Date.now(),
    });

    await newOrder.save();

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
  }
};

// Payment Verification
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const order = await orderModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        payment: true,
        status: 'Order Confirmed',
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await userModel.findByIdAndUpdate(order.userId, { cardData: {} });

    res.json({ success: true, message: 'Payment verified and order confirmed' });
  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Orders (Admin)
export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.error('All orders error:', error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Orders
export const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('User orders error:', error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Order Status (Admin)
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: 'Status Updated' });
  } catch (error) {
    console.error('Update status error:', error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

