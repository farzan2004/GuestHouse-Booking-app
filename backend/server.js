import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDb from "./configs/mongoDb.js"
import connectCloudinary from "./configs/cloudinary.js"
import adminRouter from "./routes/adminRoutes.js"
import userRouter from "./routes/userRoutes.js"
import chatRouter from "./routes/chatRoutes.js"
import path from 'path';
import cron from "node-cron";
import { autoUpdateRoomStatus } from "./controller/adminController.js";

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(path.resolve(), 'public')));
const port = process.env.PORT || 7000
connectDb();
connectCloudinary();


//middleware

// app.use(cors({
//   origin: "http://192.168.191.205:5173", // your frontend Vite dev server
//   credentials: true
// }));
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use('/api/admin/',adminRouter)
//localhost:5000/api/admin/add-doctor
app.use('/api/user',userRouter)
app.use('/api/chat', chatRouter);

app.get('/',(req,res)=>{
    res.send("API working")
})
cron.schedule("5 0 * * *", async () => {
  console.log("⏰ Nightly cleanup started...");
  await autoUpdateRoomStatus();
});
app.listen(port, '0.0.0.0', () => {
  console.log(`server connected at http://localhost:${port}`);
});
