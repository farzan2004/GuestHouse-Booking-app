import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import BookingRequests from "./BookingRequests";
import GuestInfo from "./GuestInfo";
import { useAuth } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { getAuth, signOut } from "firebase/auth";


export default function Admin() {

    // State to manage selected section
    const [selectedSection, setSelectedSection] = useState("dashboard");
    const [adminEmail, setAdminEmail] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            toast.error("Please log in as admin");
            navigate("/login");
        }else {
        const decoded = jwtDecode(token);
        setAdminEmail(decoded.email); // or whatever you put in the token payload
    }
    }, []);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const auth = getAuth();
    // const { currentUser } = useAuth();


    return (
        <div className="relative pt-[65px] min-h-screen flex flex-col md:flex-row">

            {/* Background */}
            <div className="absolute inset-0 -z-10 w-full h-full bg-custom-color bg-[radial-gradient(circle_at_top_left,#fff8ef_20%,#fce8d5_50%,#fef2e3_90%)]" />

            {/* Top Header inside reserved space */}
            <div className="absolute top-0 left-0 w-full flex justify-between h-16 items-center px-6 mb-2 bg-custom-color border-b-2 border-gray-300 shadow-lg playfair">
                <div className="flex items-center border-r-2 h-full border-gray-300 px-4">
                    <span className="font-semibold text-lg">BITStayGo</span>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Administrator</p>
                    <p className="text-lg font-semibold text-gray-700 font-mono bg-gray-200 px-3 py-1 rounded-md">
                        {adminEmail}

                    </p>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-[30%] max-w-[250px] bg-[#f8e1c4] shadow-lg rounded-lg p-6 mx-auto md:ml-6 mt-6 md:h-[65vh] playfair">

                <ul className="space-y-3">
                    <li
                        className={`text-lg group relative font-semibold cursor-pointer hover:text-gray-700 hover:bg-gray-200 p-2 rounded-md ${selectedSection === "dashboard" ? "bg-gray-300" : ""
                            }`}
                        onClick={() => setSelectedSection("dashboard")}
                    >
                        Dashboard
                    </li>
                    <li
                        className={`text-lg group relative font-semibold cursor-pointer hover:text-gray-700 hover:bg-gray-200 p-2 rounded-md ${selectedSection === "bookingRequests" ? "bg-gray-300" : ""
                            }`}
                        onClick={() => setSelectedSection("bookingRequests")}
                    >
                        Booking Requests
                    </li>
                    <li
                        className={`text-lg group relative font-semibold cursor-pointer hover:text-gray-700 hover:bg-gray-200 p-2 rounded-md ${selectedSection === "guestinfo" ? "bg-gray-300" : ""
                            }`}
                        onClick={() => setSelectedSection("guestinfo")}
                    >
                        Guests Info
                    </li>
                    <li
                        className={`text-lg group relative font-semibold cursor-pointer hover:text-gray-700 hover:bg-gray-200 p-2 rounded-md ${selectedSection === "complaints" ? "bg-gray-300" : ""
                            }`}
                        onClick={() => setSelectedSection("complaints")}
                    >
                        Complaints
                    </li>
                    <li
                        className="text-lg font-semibold cursor-pointer hover:text-red-500 p-2 rounded-md"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        Log Out
                    </li>
                </ul>
            </div>

            {/* Right Side - Display selected section */}
            <div className="flex-1 p-6 mt-6 md:mt-0" style={{ fontFamily: "monospace" }}>
                {selectedSection === "dashboard" && <Dashboard />}
                {selectedSection === "bookingRequests" && <BookingRequests />}
                {selectedSection === "guestinfo" && <GuestInfo />}
                {showLogoutModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex justify-center items-center">
                        <div className="bg-slate-200 rounded-xl p-6 shadow-xl w-[90%] max-w-md text-center">
                            <h2 className="text-xl font-bold mb-4">Are you sure you want to logout?</h2>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => {
                                        setShowLogoutModal(false);
                                        // TODO: Add actual logout function here
                                    }}
                                    className="px-4 mx-2 py-2 bg-gray-300 rounded transition-transform duration-200 hover:bg-gray-400 hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        //TODO: Add logout for jwt tokens also.

                                        signOut(auth)
                                            .then(() => {
                                                localStorage.removeItem("adminToken"); // 🧹 clear JWT
                                                console.log("Manager signed out");
                                                navigate("/login");
                                                // redirect if needed
                                            })
                                            .catch((err) => console.error("Sign-out failed:", err));
                                    }}
                                    className="px-4 mx-2 py-2 bg-red-600 text-white rounded transition-transform duration-200 hover:bg-red-700 hover:scale-105"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
