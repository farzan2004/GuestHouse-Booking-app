import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    },
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  address: { type: String },
  gender: { type: String, default: "Not Selected" },
  dob: { type: String, default: "Not Selected" },
  phone: { type: String, default: "00000-00000" },
  pincode: { type: Number },
  city: { type: String },
  state: { type: String },
  idFileUrl: { type: String, default: "" }
});

const userModel = mongoose.models.user || mongoose.model("userGuest", userSchema);

export default userModel;
