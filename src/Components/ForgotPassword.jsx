import { useState } from "react";
import axios from "axios";
import eye from "/eye.png";
import eyecross from "/eyecross.png";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer, Slide } from "react-toastify";

export default function ForgotPassword() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [verified, setVerify] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showmailtip, setShowmailtip] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const navigate = useNavigate();


    const handleSendOtp = async () => {
        try {
            const res = await axios.post(backendUrl + "/api/user/forgot-password", { email });
            toast.info("OTP sent to your mail");
            setVerify(true);
        } catch (err) {
            toast.error("Failed to send OTP");
        }
    };

    const handleResetPassword = async () => {
        if (verified && newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            await axios.post(backendUrl + "/api/user/reset-password", {
                email,
                otp,
                newPassword,
            });
            toast.success("Password reset successful!");
            setVerify(false);
            setEmail("");
            setOtp("");
            setNewPassword("");
        } catch (err) {
            toast.error("Invalid OTP or expired");
        } finally {
            setIsResetting(false); // stop loading
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
            <img src="/Birla_Institute_of_Technology_Mesra_log.png" alt="bit_logo" className="absolute h-20 w-20 top-0 left-0 bg-transparent" />
            <img src="/70_yrs_logo-removebg-preview.png" alt="bit_logo" className="absolute h-20 w-20 top-0 right-0 bg-transparent" />
            <div className="bg-black bg-opacity-35 p-8 rounded-lg shadow-lg w-[30rem] h-fit text-center backdrop-blur-md">

                {/* Role Selection Buttons */}
                <div className="flex justify-center mb-4">
                    <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: "Poppins, playfair" }}>
                        Forgot Password
                    </h2>
                </div>

                {verified === false ? (
                    <div className="relative mb-3 group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            placeholder="Enter your registered email"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-gray-400"
                        />

                        <div
                            className="absolute right-2 top-1/4 -translate-y-1/2"
                            onMouseEnter={() => setShowmailtip(true)}
                            onMouseLeave={() => setShowmailtip(false)}
                        >
                            <span className="bg-black text-slate-300 rounded-full w-4 h-4 text-xs font-bold inline-flex items-center justify-center cursor-default">
                                ?
                            </span>

                            {showmailtip && (
                                <div className="absolute bottom-full right-0 mb-1 text-xs text-white bg-gray-800 px-2 py-1 rounded z-10 w-max max-w-[200px]">
                                    OTP will be sent on this Email.
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSendOtp}
                            disabled={!email.trim()}
                            className={`transform transition-transform duration-200 origin-center 
                                ${!email.trim() ? "bg-gray-400 cursor-not-allowed" : "hover:scale-x-105 bg-blue-600 text-white"}
                                px-4 py-2 rounded my-1`}
                        >
                            Send OTP
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            type="number"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-2 border mb-3 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-gray-400"
                        />
                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="current-password"
                                placeholder="Enter your valid new password"
                                className="w-full p-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-gray-400"
                            />
                            <img
                                src={showPassword ? eyecross : eye}
                                alt="Toggle visibility"
                                className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={() => setShowPassword(prev => !prev)}
                            />
                        </div>
                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                className="w-full p-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-gray-400"
                            />
                            <img
                                src={showPassword ? eyecross : eye}
                                alt="Toggle visibility"
                                className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={() => setShowPassword(prev => !prev)}
                            />
                        </div>
                        <button
                            onClick={handleResetPassword}
                            className="transform hover:scale-x-105 transition-transform duration-200 text-white mr-2 origin-center"
                            disabled={!otp || !newPassword || !confirmPassword}>
                            {isResetting ? "Resetting..." : "Reset Password"}
                        </button>
                    </>
                )}
                <button
                    onClick={() => navigate("/login")}
                    className="transform hover:scale-x-105 transition-transform duration-200 ml-2 origin-center bg-red-600 px-1 py-1 rounded text-white">
                    Cancel
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
}