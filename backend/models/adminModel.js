// models/adminModel.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { // hashed password
    type: String,
    required: true,
  },
});

export default mongoose.model("Admin", adminSchema);
