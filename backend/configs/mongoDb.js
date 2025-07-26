import mongoose from "mongoose";
import "dotenv/config"

const connectDb = async()=>{
    mongoose.connection.on("connected",()=>console.log("database connected")
    )
    await mongoose.connect(process.env.MONGODB_URI)
}

export default connectDb