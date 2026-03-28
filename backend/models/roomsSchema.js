import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    default: 2000,
    required: true
  },
  type: {
    type: String,
    enum: ['Mass Bookings' ,'Suite','Large', 'Regular', 'Small'],
    required: true
  },
  capacity: {
    type: Number,
    default: 2
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Maintenance'],
    default: 'Available'
  },
  images: [
    {
      type: String
    }
  ],
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking" // <-- Reference to booking model
    }
  ]
}, {
  timestamps: true
});

const roomModel = mongoose.models.room || mongoose.model('Room', roomSchema);
export default roomModel;
