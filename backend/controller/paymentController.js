import Razorpay from "razorpay";
import crypto from "crypto";
import bookingModel from "../models/bookingSchema.js";
import paymentModel from "../models/paymentSchema.js";
import roomModel from "../models/roomsSchema.js";
import roomTypeModel from "../models/roomTypeModel.js";

export const createOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { bookingId } = req.body;
    const userId = req.userId;

    const booking = await bookingModel.findById(bookingId).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (booking.status !== 'Approved') return res.status(400).json({ success: false, message: 'Booking is not approved yet' });

    if (booking.paymentStatus === 'Paid') return res.status(400).json({ success: false, message: 'Already paid' });

    // Calculate amount: duration * room_price
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) diffDays = 1;

    if (!booking.room_type) {
      return res.status(400).json({ success: false, message: 'Room type not assigned to this booking' });
    }

    const roomTypeData = await roomTypeModel.findOne({ type: booking.room_type });
    if (!roomTypeData || !roomTypeData.price) {
      return res.status(400).json({ success: false, message: 'Room price is not available in the roomTypes database' });
    }
    console.log(roomTypeData.price);

    const basePrice = roomTypeData.price;

    const amount = basePrice * diffDays;

    // Create Razorpay Order
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_booking_${bookingId}`
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = new paymentModel({
      booking: bookingId,
      user: userId,
      razorpay_order_id: order.id,
      amount: amount,
      status: 'Created'
    });
    await payment.save();

    // Update booking amount
    booking.amount = amount;
    await booking.save();

    res.json({ success: true, order, amount, payment });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update payment record
      await paymentModel.findOneAndUpdate(
        { razorpay_order_id },
        { razorpay_payment_id, razorpay_signature, status: 'Success' }
      );

      // Update booking status
      await bookingModel.findByIdAndUpdate(bookingId, { paymentStatus: 'Paid' });

      res.json({ success: true, message: 'Payment successful' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};