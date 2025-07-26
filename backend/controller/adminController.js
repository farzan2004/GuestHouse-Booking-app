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
    const status = req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1).toLowerCase();// 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const room = await roomModel.findById(booking.room);
    if (!room) {
      return res.status(404).json({ error: 'Associated room not found' });
    }

    if (status === 'Approved') {
      if (room.status !== 'Available') {
        return res.status(400).json({ error: 'Room is not available' });
      }

      // Check for overlapping approved bookings
      const overlappingBooking = await bookingModel.findOne({
        room: booking.room,
        status: 'Approved',
        _id: { $ne: bookingId },
        $or: [
          {
            checkInDate: { $lt: booking.checkOutDate },
            checkOutDate: { $gt: booking.checkInDate }
          }
        ]
      });

      if (overlappingBooking) {
        return res.status(400).json({ error: 'Room already booked for selected dates' });
      }

      // Approve this booking
      booking.status = 'Approved';
      await booking.save();

      // Set room to booked
      room.status = 'Booked';
      await room.save();

      // OPTIONAL: Auto-reject overlapping pending bookings
      await bookingModel.updateMany(
        {
          room: booking.room,
          status: 'Pending',
          _id: { $ne: bookingId },
          $or: [
            {
              checkInDate: { $lt: booking.checkOutDate },
              checkOutDate: { $gt: booking.checkInDate }
            }
          ]
        },
        { $set: { status: 'Rejected' } }
      );

    } else if (status === 'Rejected') {
      booking.status = 'Rejected';
      await booking.save();

      // Optional: Set room to Available if no other approved booking exists
      const otherApproved = await bookingModel.findOne({
        room: booking.room,
        status: 'Approved'
      });

      if (!otherApproved) {
        room.status = 'Available';
        await room.save();
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
    const bookings = await bookingModel.find({ status: 'Approved' }).populate('room');

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
    const rooms = await roomModel.find();

    const summary = {};

    rooms.forEach(room => {
      const { type, status, price } = room;

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

      if (status === 'Available') summary[type].available += 1;
      if (status === 'Booked') summary[type].booked += 1;
    });

    const result = Object.values(summary);
    res.json(result);

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

      const room = await roomModel.findById(booking.room);
      if (room) {
        room.status = 'Available';
        await room.save();
      }

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





export {loginAdmin,AddRoomsByRange , BookingStatus , listRoomTypes , listBookedRoomsWithGuests, listBookingRequests}