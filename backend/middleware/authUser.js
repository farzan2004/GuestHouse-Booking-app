import jwt from 'jsonwebtoken'

const authUser = async (req,res,next)=>{
    try {
        const authHeader = req.headers.authorization;

        // console.log("Auth header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.json({ success: false, message: "Invalid Credentials, please login again" });
        }

        const token = authHeader.split(" ")[1];
        // if(!token){
        //     res.json({success:false,message:"Invalid Credentials , please login again"})

        // }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decoded.id;
        next()
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export default authUser