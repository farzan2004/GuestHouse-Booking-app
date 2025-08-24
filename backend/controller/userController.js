import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import userModel from "../models/userModel.js";
import roomModel from "../models/roomsSchema.js";
import roomTypeModel from '../models/roomTypeModel.js';
import bookingModel from "../models/bookingSchema.js";

const otpStore = new Map();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Email and Password are required" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "Incorrect email" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
      return res.json({ success: true, token })
    } else {
      return res.json({ success: false, message: "incorrect password" })
    }
  } catch (error) {
    console.log(error);

    return res.json({ success: false, message: error.message })
  }
}

const googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.json({ success: false, message: "Email is required" });

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({ email, authProvider: "google" }); // placeholder pw
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return res.json({ success: true, token });

  } catch (err) {
    console.error("Google login error:", err);
    return res.json({ success: false, message: err.message });
  }
};

const getProfileData = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select('-password')

    res.json({ success: true, userData })

  } catch (error) {
    console.log(error);

    return res.json({ success: false, message: error.message })
  }
}

export const getRoomTypes = async (req, res) => {
  try {
    const rooms = await roomTypeModel.find();
    res.json({ success: true, rooms });
  } catch (err) {
    console.error("Room types fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch room types" });
  }
};
export const getRoomById = async (req, res) => {
  try {
    const room = await roomTypeModel.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Error fetching room" });
  }
};


const updateProfileData = async (req, res) => {
  try {
    const { name, phone, address, dob, gender, pincode, state, city } = req.body;
    const userId = req.userId;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" })
    }
    await userModel.findByIdAndUpdate(userId, { name, phone, address, dob, gender, pincode, state, city })

    res.json({ success: true, message: "Profile updated" })

  } catch (error) {
    console.log(error);

    return res.json({ success: false, message: error.message })
  }
}


// Updated availability logic: scan all rooms (except permanent maintenance) and
// determine availability by checking bookings in the requested date range
const findAvailableRoomsLogic = async (roomType, checkInDate, checkOutDate, roomCount = 1) => {
  try {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    // Fetch candidate rooms (exclude permanently unavailable rooms like "Maintenance")
    const rooms = await roomModel.find({
      type: roomType,
      status: { $ne: "Maintenance" }
    });

    if (!rooms || rooms.length === 0) {
      return { success: false, message: "No rooms found for the selected type." };
    }

    // Fetch bookings that overlap the requested range for any of these rooms
    // Overlap condition uses inclusive bounds as before: booking.checkInDate <= end && booking.checkOutDate >= start
    const overlappingBookings = await bookingModel.find({
      room: { $in: rooms.map(r => r._id) },
      status: { $in: ["Pending", "Approved"] },
      checkInDate: { $lte: end },
      checkOutDate: { $gte: start }
    }).select("room").lean();

    // Build a set of room IDs that are blocked for the requested range
    const bookedRoomIds = new Set(overlappingBookings.map(b => b.room.toString()));

    const availableRoomIds = [];

    // Collect rooms not present in the booked set, stop early when we have enough
    for (const room of rooms) {
      if (!bookedRoomIds.has(room._id.toString())) {
        availableRoomIds.push(room._id);
        // allow roomCount to be a string by using '==' for comparison
        if (availableRoomIds.length == roomCount) break;
      }
    }

    if (availableRoomIds.length == roomCount) {
      return { success: true, roomIds: availableRoomIds };
    }

    return { success: false, message: "Not enough rooms available for the selected dates." };

  } catch (err) {
    console.error(err);
    return { success: false, message: "Error checking room availability" };
  }
};

// Route handler (kept the same interface for direct replacement)
const checkAvailableRoom = async (req, res) => {
  const { roomType, checkInDate, checkOutDate, roomCount } = req.body;
  const result = await findAvailableRoomsLogic(roomType, checkInDate, checkOutDate, roomCount);

  if (result.success) {
    return res.json(result);
  }
  return res.status(404).json(result);
};

export {
  checkAvailableRoom,
  findAvailableRoomsLogic
};


const createBooking = async (req, res) => {
  try {
    const {
      guests,
      checkInDate,
      checkOutDate,
      rooms, // array of room IDs
      category,
      email
    } = req.body;

    // Basic validations
    if (!guests || !checkInDate || !checkOutDate || !rooms || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ error: 'Rooms array is invalid' });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    // Round-robin distribute guests into rooms
    const guestGroups = Array(rooms.length).fill().map(() => []);
    guests.forEach((guest, i) => {
      guestGroups[i % rooms.length].push(guest);
    });

    const savedBookings = [];

    for (let i = 0; i < rooms.length; i++) {
      const roomId = rooms[i];
      const roomGuests = guestGroups[i];

      const selectedRoom = await roomModel.findById(roomId);
      if (!selectedRoom) {
        return res.status(404).json({ error: `Room not found: ${roomId}` });
      }

      // Safety: check for booking conflict in case another user booked just before this request
      const conflict = await bookingModel.findOne({
        room: roomId,
        status: { $in: ['Pending', 'Approved'] },
        checkInDate: { $lte: end },
        checkOutDate: { $gte: start }
      });

      if (conflict) {
        return res.status(400).json({ error: `Room ${roomId} is already booked.` });
      }

      if (roomGuests.length > selectedRoom.capacity) {
        return res.status(400).json({
          error: `Room capacity exceeded for Room ${roomId}. Max: ${selectedRoom.capacity}`
        });
      }

      // Create booking request with status 'Pending' for admin approval
      const booking = new bookingModel({
        user: req.userId,
        guests: roomGuests,
        checkInDate,
        checkOutDate,
        room: roomId,
        room_type: selectedRoom.type,
        category,
        status: 'Pending'
      });

      await booking.save();
      savedBookings.push(booking);
    }

    // Optional confirmation email to guest
    if (email) {
      const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: email,
        subject: "Booking Request Received",
        html: `
          <h2>Your booking request has been received</h2>
          <p><strong>Check-in:</strong> ${checkInDate}</p>
          <p><strong>Check-out:</strong> ${checkOutDate}</p>
          <p><strong>Rooms:</strong> ${rooms.length} room(s) requested.</p>
          <p>We will notify you once your booking is approved by our admin.</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Confirmation email sent to:", email);
      } catch (err) {
        console.error("Email sending failed:", err);
      }
    }

    res.status(201).json({
      message: 'Booking requests submitted successfully. Awaiting admin approval.',
      bookings: savedBookings
    });

  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({ user: req.userId }) // only current user's bookings
      .populate('room', 'type') // populate room info if needed
      .sort({ checkInDate: -1 }); // newest first

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
};

// list bookings

const listBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.find().populate('room');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// export default listBookings;

// cancel booking

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (['Cancelled', 'Rejected'].includes(booking.status)) {
      return res
        .status(400)
        .json({ error: `Cannot cancel a ${booking.status.toLowerCase()} booking` });
    }

    // Update booking status to Cancelled
    booking.status = 'Cancelled';
    await booking.save();

    // Set associated room to Available again
    const room = await roomModel.findById(booking.room);

    return res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  const expiresAt = Date.now() + 5 * 60 * 1000; // expires in 5 min

  otpStore.set(email, { otp, expiresAt });

  // Send mail
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Your OTP for password reset',
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
    });

    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const stored = otpStore.get(email);

  if (!stored || stored.otp != otp || Date.now() > stored.expiresAt) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    otpStore.delete(email);

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating password' });
  }
};





export { registerUser, loginUser, getProfileData, updateProfileData, createBooking, listBookings, cancelBooking, googleLogin }