import mongoose from "mongoose";

const roomTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Deluxe', 'Executive', 'Luxury', 'Standard', 'Family Suite'],
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  images: [String]
}, {
  timestamps: true
});

const roomTypeModel = mongoose.model('roomType', roomTypeSchema, 'roomTypes');
export default roomTypeModel;