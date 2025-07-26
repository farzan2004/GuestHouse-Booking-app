import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js";
import roomModel from "../models/roomsSchema.js";
import roomTypeModel from '../models/roomTypeModel.js';
import bookingModel from "../models/bookingSchema.js";


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

// API to book room
// const checkAvailableRoom = async (req, res) => {
//   try {
//     const { roomType, checkInDate, checkOutDate } = req.body;

//     const rooms = await roomModel.find({ type: roomType, status: "Available" });

//     for (let room of rooms) {
//       const overlapping = await bookingModel.findOne({
//         room: room._id,
//         status: { $in: ["Pending", "Approved"] },
//         $or: [
//           {
//             checkInDate: { $lte: new Date(checkOutDate) },
//             checkOutDate: { $gte: new Date(checkInDate) }
//           }
//         ]
//       });

//       if (!overlapping) {
//         return res.json({ success: true, roomId: room._id });
//       }
//     }

//     res.json({ success: false, message: "No available room found." });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error checking room availability" });
//   }
// };

const findAvailableRoomsLogic = async (roomType, checkInDate, checkOutDate, roomCount = 1) => {
  try {
    const rooms = await roomModel.find({ type: roomType, status: "Available" });
    const availableRoomIds = [];

    for (let room of rooms) {
      const overlapping = await bookingModel.findOne({
        room: room._id,
        status: { $in: ["Pending", "Approved"] },
        $or: [
          {
            checkInDate: { $lte: new Date(checkOutDate) },
            checkOutDate: { $gte: new Date(checkInDate) }
          }
        ]
      });

      if (!overlapping) {
        availableRoomIds.push(room._id);
        // Important: Use '==' for type coercion as roomCount can be a string
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

// 2. Your original route handler, now simplified
const checkAvailableRoom = async (req, res) => {
  const { roomType, checkInDate, checkOutDate, roomCount } = req.body;
  const result = await findAvailableRoomsLogic(roomType, checkInDate, checkOutDate, roomCount);
  
  if (result.success) {
    return res.json(result);
  }
  return res.status(404).json(result);
};

// 3. Make sure to export the new logic function along with the others
export { 
    // ...,
    checkAvailableRoom, 
    findAvailableRoomsLogic // <-- Add this export
};

// const checkAvailableRoom = async (req, res) => {
//   try {
//     const { roomType, checkInDate, checkOutDate, roomCount } = req.body;

//     const rooms = await roomModel.find({ type: roomType, status: "Available" });
//     const availableRoomIds = [];

//     for (let room of rooms) {
//       const overlapping = await bookingModel.findOne({
//         room: room._id,
//         status: { $in: ["Pending", "Approved"] },
//         $or: [
//           {
//             checkInDate: { $lte: new Date(checkOutDate) },
//             checkOutDate: { $gte: new Date(checkInDate) }
//           }
//         ]
//       });

//       if (!overlapping) {
//         availableRoomIds.push(room._id);
//         if (availableRoomIds.length === roomCount) break;
//       }
//     }

//     if (availableRoomIds.length === roomCount) {
//       return res.json({ success: true, roomIds: availableRoomIds });
//     }

//     res.json({ success: false, message: "Not enough rooms available for the selected dates." });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error checking room availability" });
//   }
// };


// Create booking
// const createBooking = async (req, res) => {
//   try {
//     const {
//       guests,
//       checkInDate,
//       checkOutDate,
//       room, // ✅ This is room _id sent from frontend
//       category
//     } = req.body;

//     if (!guests || !checkInDate || !checkOutDate || !room || !category) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const selectedRoom = await roomModel.findById(room);
//     if (!selectedRoom) {
//       return res.status(404).json({ error: 'Room not found' });
//     }

//     // ❗ Check if room is already booked for that date range
//     const start = new Date(checkInDate);
//     const end = new Date(checkOutDate);

//     const conflictingBooking = await bookingModel.findOne({
//       room,
//       $or: [
//         { checkInDate: { $lte: end }, checkOutDate: { $gte: start } }
//       ],
//       status: { $in: ['Pending', 'Approved'] }
//     });

//     if (conflictingBooking) {
//       return res.status(400).json({ error: 'Room already booked for selected dates' });
//     }

//     // ❗ Capacity check
//     if (guests.length > selectedRoom.capacity) {
//       return res.status(400).json({
//         error: `Room capacity exceeded. Max: ${selectedRoom.capacity}`
//       });
//     }

//     // ✅ Create booking with "Pending" status
//     const booking = new bookingModel({
//       user: req.user._id,
//       guests,
//       checkInDate,
//       checkOutDate,
//       room,
//       room_type: selectedRoom.type,
//       category
//     });

//     await booking.save();

//     res.status(201).json({ message: 'Booking request sent. Awaiting admin approval.', booking });

//   } catch (err) {
//     console.error("Booking Error:", err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

const createBooking = async (req, res) => {
  try {
    const {
      guests,
      checkInDate,
      checkOutDate,
      rooms, // ✅ array of room IDs
      category
    } = req.body;

    if (!guests || !checkInDate || !checkOutDate || !rooms || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ error: 'Rooms array is invalid' });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    // 🔁 Split guests among rooms (round-robin)
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

      const conflict = await bookingModel.findOne({
        room: roomId,
        $or: [
          { checkInDate: { $lte: end }, checkOutDate: { $gte: start } }
        ],
        status: { $in: ['Pending', 'Approved'] }
      });

      if (conflict) {
        return res.status(400).json({ error: `Room ${roomId} is already booked.` });
      }

      if (roomGuests.length > selectedRoom.capacity) {
        return res.status(400).json({
          error: `Room capacity exceeded for Room ${roomId}. Max: ${selectedRoom.capacity}`
        });
      }

      const booking = new bookingModel({
        user: req.userId,
        guests: roomGuests,
        checkInDate,
        checkOutDate,
        room: roomId,
        room_type: selectedRoom.type,
        category
      });

      await booking.save();
      savedBookings.push(booking);
    }

    res.status(201).json({
      message: 'Bookings created successfully.',
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

    // Update booking status to Cancelled
    booking.status = 'Cancelled';
    await booking.save();

    // Set associated room to Available again
    const room = await roomModel.findById(booking.room);
    if (room) {
      room.status = 'Available';
      await room.save();
    }

    res.json({ message: 'Booking cancelled successfully', booking });
    if (['Cancelled', 'Rejected'].includes(booking.status)) {
      return res.status(400).json({ error: `Cannot cancel a ${booking.status.toLowerCase()} booking` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};





export { registerUser, loginUser, getProfileData, updateProfileData, createBooking, listBookings, cancelBooking, googleLogin }