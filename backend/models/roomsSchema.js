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
    enum: ['Deluxe', 'Executive', 'Standard', 'Family'],
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
  ]
}, {
  timestamps: true
});

const roomModel = mongoose.models.room || mongoose.model('Room', roomSchema);
export default roomModel;
