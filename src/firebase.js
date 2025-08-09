import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your project's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2Ccil92iORo2C3xxGgfxnLm6fHG9dQhs",
  authDomain: "bitproject-99fac.firebaseapp.com",
  projectId: "bitproject-99fac",
  storageBucket: "bitproject-99fac.firebasestorage.app",
  messagingSenderId: "437848530315",
  appId: "1:437848530315:web:16eae4887d5d132be0e38e",
  measurementId: "G-YPK3GCJPPX"
};

// Initialize Firebase ONCE
const app = initializeApp(firebaseConfig);

// Export the services you need from this central file
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();