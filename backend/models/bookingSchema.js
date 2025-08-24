import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    age: Number,
    relation: String,
    contact: { type: String, required: true },
    dob: String,
    city: String,
    state: String,
    address: String,
    idProofUrl: { type: String /*, required: true*/ }, // e.g. cloudinary image url
}, { _id: true });

const bookingSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    room_type: { type: String },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guests: [guestSchema],
    category: {
        type: String,
        enum: [
            'Institute Guest',
            'Guests (Projects/Events)',
            'Employee',
            'Alumni',
            'Guardian',
            'Guests from Other Academic Institutions',
            'Others'
        ],
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'userGuest', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'], default: 'Pending' }
}, {
    timestamps: true // <-- ✅ Add this line here
});

const bookingModel = mongoose.models.booking || mongoose.model('booking', bookingSchema);
export default bookingModel;
