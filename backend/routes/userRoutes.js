import express from "express"
import { cancelBooking, createBooking, checkAvailableRoom, checkBulkAvailableRoom, getProfileData, listBookings, loginUser, registerUser, updateProfileData, getRoomTypes, googleLogin, getRoomById, getUserBookings, sendOtp, resetPassword, createBulkBooking } from "../controller/userController.js"
import authUser from "../middleware/authUser.js"

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/forgot-password', sendOtp); // send OTP
userRouter.post('/reset-password', resetPassword); 
userRouter.get('/getProfileData',authUser,getProfileData)
userRouter.get("/rooms", getRoomTypes)
userRouter.get("/room/:id", getRoomById);
userRouter.post("/check-availability", checkAvailableRoom);
userRouter.post("/check-bulk-availability", checkBulkAvailableRoom);
userRouter.post('/updateProfileData',authUser, updateProfileData)
userRouter.post('/createBooking',authUser,createBooking)
userRouter.post('/create-bulk-booking',authUser,createBulkBooking)
userRouter.get('/user/bookings', authUser, getUserBookings);
userRouter.get('/listBookings',/*authUser,*/listBookings)
userRouter.post("/google-login", googleLogin)
// userRouter.post('/cancelBooking',authUser,cancelBooking)
userRouter.delete('/Cancelbookings/:id', cancelBooking);


export default userRouter