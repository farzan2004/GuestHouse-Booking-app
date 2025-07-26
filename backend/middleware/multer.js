import multer from "multer";

// Memory storage: keeps files in memory as buffer (no disk write)
const storage = multer.memoryStorage();
const upload = multer({ storage });
export default upload;




