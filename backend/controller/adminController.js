import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import roomModel from '../models/roomsSchema.js';
import bookingModel from '../models/bookingSchema.js';
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import Admin from '../models/adminModel.js';
import roomTypeModel from '../models/roomTypeModel.js';
import ComplaintModel from '../models/ComplaintModel.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const autoUpdateRoomStatus = async () => {
  try {
    const now = new Date();

    // Find bookings where checkout date is in the past and status is Approved
    const expiredBookings = await bookingModel.find({
      status: 'Approved',
      checkOutDate: { $lt: now }
    });

    const updatedRooms = new Set();

    for (const booking of expiredBookings) {
      const room = await roomModel.findById(booking.room);

      if (room && room.status === 'Booked') {
        // Check if there's another future booking for this room
        const futureBookingExists = await bookingModel.findOne({
          room: room._id,
          status: 'Approved',
          checkOutDate: { $gt: now }
        });

        if (!futureBookingExists) {
          room.status = 'Available';
          await room.save();
          updatedRooms.add(room.roomNumber);
        }
      }
    }

    if (updatedRooms.size > 0) {
      console.log("Room statuses auto-updated:", [...updatedRooms]);
    }
  } catch (err) {
    console.error("Error in autoUpdateRoomStatus:", err);
  }
};


const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};



// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const AddRoomsByRange = async (req, res) => {
  try {
    const { type, startNumber, endNumber, capacity, status, price, description } = req.body;

    if (!type || !startNumber || !endNumber || !price) {
      return res.status(400).json({ error: 'type, startNumber, endNumber, and price are required' });
    }

    if (endNumber < startNumber) {
      return res.status(400).json({ error: 'endNumber must be >= startNumber' });
    }

    // Upload images to Cloudinary
    const imageUploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, `guesthouse/roomTypes/${type}`)
    );
    const imageUrls = await Promise.all(imageUploadPromises);

    // Check and insert into roomTypeModel if not already exists
    const existingType = await roomTypeModel.findOne({ type });
    if (!existingType) {
      await roomTypeModel.create({
        type,
        price,
        description,
        images: imageUrls
      });
    }

    // Now insert actual rooms
    const newRooms = [];
    for (let roomNumber = startNumber; roomNumber <= endNumber; roomNumber++) {
      const roomExists = await roomModel.findOne({ roomNumber });
      if (roomExists) continue;

      newRooms.push({
        roomNumber,
        type,
        capacity: capacity || 2,
        status: status || 'Available'
      });
    }

    const inserted = await roomModel.insertMany(newRooms);
    res.status(201).json({ message: `${inserted.length} rooms added`, rooms: inserted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to bulk add rooms' });
  }
};

export const AddRoomType = async (req, res) => {
  try {
    const { type, price, description } = req.body;

    if (!type || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Room type and at least one image required" });
    }

    const imageUploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, `guesthouse/roomTypes/${type}`)
    );
    const imageUrls = await Promise.all(imageUploadPromises);

    let roomType = await roomTypeModel.findOne({ type });

    if (roomType) {
      // ✅ Update existing: only overwrite fields if provided
      if (price) roomType.price = price;
      if (description) roomType.description = description;
      roomType.images = imageUrls; // or append with: roomType.images.push(...imageUrls)
      await roomType.save();
      return res.status(200).json({ message: "Room type updated", data: roomType });
    }

    // 🆕 Create new if not found
    const newRoomType = await roomTypeModel.create({
      type,
      price: price || undefined,
      description: description || undefined,
      images: imageUrls,
    });

    res.status(201).json({ message: "Room type created", data: newRoomType });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// accept or reject 

const BookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const status =
      req.body.status.charAt(0).toUpperCase() +
      req.body.status.slice(1).toLowerCase(); // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find booking + user info
    const booking = await bookingModel
      .findById(bookingId)
      .populate("user", "email fullName");
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const userEmail = booking.user?.email;
    const userName = booking.user?.fullName || "Guest";

    const room = await roomModel.findById(booking.room);
    if (!room) {
      return res.status(404).json({ error: 'Associated room not found' });
    }

    if (status === 'Approved') {
      // Check for overlapping approved bookings
      const overlappingBooking = await bookingModel.findOne({
        room: booking.room,
        status: 'Approved',
        _id: { $ne: bookingId },
        checkInDate: { $lt: booking.checkOutDate },
        checkOutDate: { $gt: booking.checkInDate }
      });

      if (overlappingBooking) {
        return res.status(400).json({ error: 'Room already booked for selected dates' });
      }

      // Approve this booking
      booking.status = 'Approved';
      await booking.save();

      // Send approval email
      if (userEmail) {
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: userEmail,
          subject: 'Booking Confirmed - Guest House',
          html: ` 
            <h3>Hello ${userName},</h3>
            <p>Your booking has been <strong>approved</strong>.</p>
            <p><strong>Room:</strong> ${room.roomNumber} (${room.type})</p>
            <p><strong>Check-In:</strong> ${new Date(booking.checkInDate).toDateString()}</p>
            <p><strong>Check-Out:</strong> ${new Date(booking.checkOutDate).toDateString()}</p>
            <p>Thank you for choosing us!</p>`
        };
        await transporter.sendMail(mailOptions);
      }

      // Auto-reject overlapping pending bookings
      await bookingModel.updateMany(
        {
          room: booking.room,
          status: 'Pending',
          _id: { $ne: bookingId },
          checkInDate: { $lt: booking.checkOutDate },
          checkOutDate: { $gt: booking.checkInDate }
        },
        { $set: { status: 'Rejected' } }
      );

    } else if (status === 'Rejected') {
      booking.status = 'Rejected';
      await booking.save();

      // Send rejection email
      if (userEmail) {
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: userEmail,
          subject: 'Booking Rejected - Guest House',
          html: ` 
            <h3>Hello ${userName},</h3>
            <p>We regret to inform you that your booking request has been <strong>rejected</strong>.</p>
            <p><strong>Room Type:</strong> ${room.type}</p>
            <p><strong>Check-In:</strong> ${new Date(booking.checkInDate).toDateString()}</p>
            <p><strong>Check-Out:</strong> ${new Date(booking.checkOutDate).toDateString()}</p>
            <p>If you believe this was a mistake or wish to book again, please contact the Guest House admin.</p>
            <p>Thank you for understanding.</p>`
        };
        await transporter.sendMail(mailOptions);
      }
    }

    res.json({ message: `Booking ${status.toLowerCase()}`, booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};



// list guests

const listBookedRoomsWithGuests = async (req, res) => {
  try {
    const now = new Date();
    const bookings = await bookingModel.find({
      status: 'Approved',
      checkOutDate: { $gte: now }
    }).populate('room');
    const mainGuests = [];

    bookings.forEach((booking) => {
      if (!booking.room || booking.guests.length === 0) return;

      const guest = booking.guests[0]; // only main guest
      mainGuests.push({
        _id: guest._id,
        fullName: guest.fullName,
        gender: guest.gender,
        age: guest.age,
        relation: guest.relation,
        contact: guest.contact,
        room: booking.room.roomNumber,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        category: booking.category,
      });
    });

    res.status(200).json(mainGuests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booked rooms with guests' });
  }
};




// list roomsTypes

const listRoomTypes = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rooms = await roomModel.find().populate('bookings'); // assuming bookings is an array of booking refs

    const summary = {};

    rooms.forEach(room => {
      const { type, price, bookings } = room;

      if (!summary[type]) {
        summary[type] = {
          type,
          price,           // Price taken from the first room of this type
          total: 0,
          available: 0,
          booked: 0
        };
      }

      summary[type].total += 1;

      // Check if room is booked today
      const isBookedToday = bookings.some(b => {
        const checkIn = new Date(b.checkInDate);
        const checkOut = new Date(b.checkOutDate);
        return today >= checkIn && today <= checkOut;
      });

      if (isBookedToday) {
        summary[type].booked += 1;
      } else {
        summary[type].available += 1;
      }
    });

    res.json(Object.values(summary));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch room summary' });
  }
};

const listBookingRequests = async (req, res) => {
  try {
    const requests = await bookingModel
      .find()
      .populate('room')
      .sort({ createdAt: -1 });

    const simplified = requests
      .filter(req => req.guests && req.guests.length > 0)
      .map(req => {
        const mainGuest = req.guests.find(g => g.relation === "Self") || req.guests[0];
        const name = mainGuest.fullName || mainGuest.name || "Unknown Guest";

        return {
          _id: req._id,
          user_name: name,
          guests: req.guests,
          room_type: req.room?.type || "N/A",
          category: req.category,
          requested_date: `${req.checkInDate.toISOString().split("T")[0]} to ${req.checkOutDate.toISOString().split("T")[0]}`,
          status: req.status,
          createdAt: req.createdAt,
        };
      });

    res.status(200).json(simplified);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch booking requests' });
  }
};

export const getSingleGuest = async (req, res) => {
  try {
    const booking = await bookingModel.findOne({ "guests._id": req.params.id });
    if (!booking) return res.status(404).json({ error: "Guest not found" });

    const guest = booking.guests.id(req.params.id);
    const response = {
      ...guest.toObject(),
      room: booking.room,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      category: booking.category
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch guest" });
  }
};

export const deleteGuest = async (req, res) => {
  try {
    const booking = await bookingModel.findOne({ "guests._id": req.params.id });

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const isMainGuest = booking.guests[0]._id.toString() === req.params.id;

    if (isMainGuest) {
      // Delete entire booking and free the room
      await bookingModel.deleteOne({ _id: booking._id });

      return res.status(200).json({ message: "Main guest deleted; booking and all guests removed" });
    } else {
      // Just remove this guest
      booking.guests = booking.guests.filter(g => g._id.toString() !== req.params.id);
      await booking.save();

      return res.status(200).json({ message: "Guest removed from booking" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete guest" });
  }
};

export const submitComplaint = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. No user ID." });
    }
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newComplaint = new ComplaintModel({
      subject,
      message,
      submittedBy: userId
    });

    await newComplaint.save();

    res.status(201).json({ success: true, message: "Complaint submitted successfully." });

  } catch (err) {
    console.error("Complaint submission error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await ComplaintModel.find()
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, complaints });
  } catch (err) {
    console.error("Fetch complaints error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};




export { loginAdmin, AddRoomsByRange, BookingStatus, listRoomTypes, listBookedRoomsWithGuests, listBookingRequests }