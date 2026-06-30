import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userGuest',
    required: true
  },
  razorpay_order_id: {
    type: String,
    required: true
  },
  razorpay_payment_id: {
    type: String
  },
  razorpay_signature: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Created', 'Success', 'Failed'],
    default: 'Created'
  }
}, {
  timestamps: true
});

const paymentModel = mongoose.models.payment || mongoose.model('payment', paymentSchema);
export default paymentModel;
