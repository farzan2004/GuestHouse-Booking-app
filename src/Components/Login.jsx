import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import eye from "/eye.png";
import eyecross from "/eyecross.png";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Firebase config (Replace with actual credentials)
const firebaseConfig = {
  apiKey: "AIzaSyD2Ccil92iORo2C3xxGgfxnLm6fHG9dQhs",
  authDomain: "bitproject-99fac.firebaseapp.com",
  projectId: "bitproject-99fac",
  storageBucket: "bitproject-99fac.firebasestorage.app",
  messagingSenderId: "437848530315",
  appId: "1:437848530315:web:16eae4887d5d132be0e38e",
  measurementId: "G-YPK3GCJPPX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const Login = () => {
  const [activeRole, setActiveRole] = useState("guest"); // Default to Guest Login
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showmailtip, setShowmailtip] = useState(false);
  const [showlogtip, setShowlogtip] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFormSubmit = async () => {
  if (activeRole === "manager") {
    try {
      const res = await fetch("http://localhost:5000/api/admin/loginAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("adminToken", data.token); // store token
        toast.success("Admin Login Successful");
        setTimeout(() => navigate("/admin", { replace: true }), 1500); // 🟢 navigate to admin
      } else {
        toast.error(data.message || "Invalid Credentials");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      toast.error("Something went wrong");
    }
  } else {
  const endpoint = isSignup
  ? "http://localhost:5000/api/user/register"
  : "http://localhost:5000/api/user/login";

  const payload = {
    role: activeRole,
    email,
    password,
    ...(isSignup && { confirmPassword }),
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
  localStorage.setItem("guestToken", data.token);
  toast.success("Guest Login Successful", {
    onClose: () => navigate("/profile", { replace: true }),
    autoClose: 1500, // shorter toast duration
  });
} else {
      toast.error(data.message || "Login failed");
    }
  } catch (err) {
    console.error("Guest auth error:", err);
    toast.error("Something went wrong");
  }
}
};

  useEffect(() => {
    if (activeRole !== "guest") {
      setIsSignup(false); // Reset signup state when role is not guest
    }
  }, [activeRole]);

const handleLogin = async (provider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    // ⬇️ Send Gmail to backend to store and get JWT
    const res = await fetch("http://localhost:5000/api/user/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("guestToken", data.token);
      toast.success("Google Login Successful", {
        onClose: () => navigate("/profile", { replace: true }),
        autoClose: 1000,
      });
    } else {
      toast.error(data.message || "Google login failed");
    }
  } catch (error) {
    console.error("Google login error:", error);
    toast.error("Google login failed");
  }
};


  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center backdrop-blur-lg"
      style={{
        backgroundImage: "url('/bit_mesra.jpeg')",
        fontFamily: "monospace"
      }}
    >
      <div className="bg-black bg-opacity-35 p-8 rounded-lg shadow-lg w-[30rem] h-fit text-center backdrop-blur-md">

        {/* Role Selection Buttons */}
        <div className="flex justify-between mb-4">
          <button
            className={`w-1/2 py-2 font-semibold ${activeRole === "guest" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              } rounded-lg transition duration-300`}
            onClick={() => setActiveRole("guest")}
          >
            Guest Login
          </button>
          <button
            className={`w-1/2 py-2 font-semibold ${activeRole === "manager" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              } rounded-lg transition duration-300`}
            onClick={() => setActiveRole("manager")}
          >
            Manager Login
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: "Poppins, playfair" }}>
          {activeRole === "guest" ? "Guest Login" : "Manager Login"}
        </h2>

        {/* Login Form */}
        <div className="relative mb-3 group">
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="Enter your valid email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-gray-400"
          />

          {/* Question Mark Icon */}
          {activeRole === "guest" && (
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onMouseEnter={() => setShowmailtip(true)}
              onMouseLeave={() => setShowmailtip(false)}
            >
              <span className="bg-black text-slate-300 rounded-full w-4 h-4 text-xs font-bold inline-flex items-center justify-center cursor-default">
                ?
              </span>

              {showmailtip && (
                <div className="absolute bottom-full right-0 mb-1 text-xs text-white bg-gray-800 px-2 py-1 rounded z-10 w-max max-w-[200px]">
                  Further notifications will be sent on this Email.
                </div>
              )}
            </div>
          )}
        </div>
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your valid password"
            className="w-full p-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-gray-400"
          />
          <img
            src={showPassword ? eyecross : eye}
            alt="Toggle visibility"
            className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword(prev => !prev)}
          />
        </div>
        {isSignup && (
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full p-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-gray-400"
            />
            <img
              src={showPassword ? eyecross : eye}
              alt="Toggle visibility"
              className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
            />
          </div>
        )}

        <button onClick={handleFormSubmit} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300">
          {isSignup ? "Signup" : "Login"}
        </button>
        {activeRole === "guest" && (
          <div className="mt-3 flex justify-center items-center gap-1 text-sm text-white">
            {isSignup ? (
              <button
                onClick={() => setIsSignup(false)}
                className="transform hover:scale-x-105 transition-transform duration-200 origin-left"
              >
                Login
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsSignup(true)}
                  className="transform hover:scale-x-105 transition-transform duration-200 origin-left"
                >
                  Signup
                </button>
                <div className="relative group cursor-pointer" onMouseEnter={() => setShowlogtip(true)}
                  onMouseLeave={() => setShowlogtip(false)}>
                  <span className="bg-white text-black rounded-full w-4 h-4 font-bold inline-flex items-center justify-center">
                    ?
                  </span>
                  {showlogtip && (
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-max max-w-[200px] text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      If this is your first time, click here to sign up.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <p className="text-gray-300 my-3">or</p>

        {/* Google Login */}
        <button
          onClick={() => handleLogin(googleProvider)}
          className="w-full bg-red-500 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-red-600 transition duration-300"
        >
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <img src="/google.webp" alt="Google" className="w-4 h-4" />
          </div>
          <span>Sign in with Google</span>
        </button>
      </div>
      <ToastContainer
                      position="top-right"
                      autoClose={3500}
                      hideProgressBar={false}
                      newestOnTop={true}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                      transition={Slide}
                  />
    </div>
  );
};

export default Login;
