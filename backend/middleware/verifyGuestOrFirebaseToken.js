// verifyGuestOrFirebaseToken.js
// Checks guest JWT or Firebase token
import jwt from "jsonwebtoken";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccountB64 = process.env.FIREBASE_CREDENTIALS_BASE64;
  const serviceAccountJson = Buffer.from(serviceAccountB64, 'base64').toString('utf8');
  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const verifyGuestOrFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized: No token" });

  try {
    // First try JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (jwtErr) {
    try {
      // Fallback to Firebase
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = { id: decoded.uid };
      return next();
    } catch (firebaseErr) {
      return res.status(401).json({ error: "Invalid token" });
    }
  }
};
export default verifyGuestOrFirebaseToken;
