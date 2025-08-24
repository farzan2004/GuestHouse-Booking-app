import express from "express"
import { AddRoomsByRange, BookingStatus, listBookedRoomsWithGuests, listRoomTypes, loginAdmin, listBookingRequests, getSingleGuest,
  deleteGuest, AddRoomType, submitComplaint, getAllComplaints } from "../controller/adminController.js"
import authAdmin from "../middleware/authAdmin.js"
import verifyGuestOrFirebaseToken from "../middleware/verifyGuestOrFirebaseToken.js"
import upload from "../middleware/multer.js"

const adminRouter = express.Router()

adminRouter.post('/loginAdmin',loginAdmin)
adminRouter.post('/add-rooms-range', /*authAdmin,*/ upload.array('images'), AddRoomsByRange);
adminRouter.post('/add-room-type', upload.array('images'), AddRoomType);
adminRouter.post('/bookingStatus/:id',authAdmin, BookingStatus)
adminRouter.get('/listBookedRoomsWithGuests',authAdmin, listBookedRoomsWithGuests)
adminRouter.get('/listRoomTypes',authAdmin, listRoomTypes)
adminRouter.get('/bookingRequests', authAdmin, listBookingRequests);
adminRouter.get('/guests/:id', authAdmin, getSingleGuest);
adminRouter.delete('/guests/:id', authAdmin, deleteGuest);
adminRouter.post('/complaints', verifyGuestOrFirebaseToken, submitComplaint);
adminRouter.get("/complaints", authAdmin, getAllComplaints);

export default adminRouter