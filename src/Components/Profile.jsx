import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
// import { getAuth, signOut } from "firebase/auth";
import ProfileSkeleton from "../Skeletons/profileSkeleton";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

export default function Profile() {
    const token = localStorage.getItem("guestToken");
    const [bookings, setBookings] = useState([]);
    // const userData = dummyUserData;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();
    const handleLogout = async () => {
        await logout(); // Call the single, powerful logout function
        toast.success("Logged Out Successfully");
        navigate("/login");
    };

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dob: null,
        gender: "",
        idFile: null,
        address: "",
        city: "",
        state: "",
        pinCode: "",
        mobile: "",
    });

    // State to manage selected section
    const location = useLocation();
    const [selectedSection, setSelectedSection] = useState(location.state?.section || "accountInfo");
    const [isEditing, setIsEditing] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { currentUser, token: firebaseToken } = useAuth();
    const navigate = useNavigate();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!token) return;

                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/getProfileData`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    setUserData(res.data.userData);
                    setFormData({
                        firstName: res.data.userData.name?.split(" ")[0] || "",
                        lastName: res.data.userData.name?.split(" ")[1] || "",
                        dob: res.data.userData.dob && !isNaN(new Date(res.data.userData.dob))
                            ? new Date(res.data.userData.dob)
                            : null,
                        gender: res.data.userData.gender || "",
                        idFile: null,
                        address: res.data.userData.address || "",
                        city: res.data.userData.city || "",
                        state: res.data.userData.state || "",
                        pinCode: res.data.userData.pincode || "",
                        mobile: res.data.userData.phone || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchUserBookings();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleIdUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                idFile: file,
            }));
        }
    };

    // Handle Edit Button - Show input fields again
    const handleEdit = () => {
        setIsEditing(true);
    };
    const isValidMobile = (num) => /^[6-9]\d{9}$/.test(num);
    const isValidPinCode = (pin) => /^\d{6}$/.test(pin);

    const areRequiredFieldsFilled = () => {
        return (
            formData.firstName.trim() &&
            formData.lastName.trim() &&
            formData.gender.trim() &&
            formData.mobile.trim()
            // formData.idFile &&
            // isValidMobile(formData.mobile)
        );
    };

    const handleUpdate = async () => {
        if (!areRequiredFieldsFilled()) return;

        try {
            const updatedData = {
                name: `${formData.firstName} ${formData.lastName}`,
                dob: formData.dob,
                gender: formData.gender,
                phone: formData.mobile,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pinCode,
            };

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/updateProfileData`, updatedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.success) {
                alert("Profile updated successfully!");
                setIsEditing(false);
            } else {
                alert("Failed to update profile: " + res.data.message);
            }

        } catch (err) {
            console.error("Update error:", err);
            alert("Something went wrong");
        }
    };
    const handleInputSubmit = async (e) => {
        e.preventDefault();

        try {
            const tokenToSend = token || firebaseToken;

            if (!subject.trim() || !message.trim()) {
                toast.error("Please fill in both subject and message.");
                return;
            }

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/complaints`,
                { subject: subject.trim(), message: message.trim() },
                { headers: { Authorization: `Bearer ${tokenToSend}` } }
            );

            if (res.data.success) {
                toast.success("Feedback submitted!");
                setSubject(""); // clear form
                setMessage("");
            } else {
                toast.error(res.data.message || "Submission failed.");
            }
        } catch (err) {
            console.error("Submission error:", err);
            toast.error("Something went wrong.");
        }
    };
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
    const handlePayment = async (bookingId) => {
        const res = await loadRazorpayScript();
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return;
        }
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-order`,
                { bookingId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!data.success) {
                toast.error(data.message || "Failed to create order");
                return;
            }
            const options = {
                key: "rzp_test_SlblTgELqzKdN5",
                amount: data.order.amount,
                currency: "INR",
                name: "Guest House Booking",
                description: "Room Booking Payment",
                order_id: data.order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post(
                            `${import.meta.env.VITE_BACKEND_URL}/api/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId: bookingId
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (verifyRes.data.success) {
                            toast.success("Payment Successful!");
                            fetchUserBookings();
                        } else {
                            toast.error(verifyRes.data.message || "Payment verification failed");
                        }
                    } catch (error) {
                        console.error(error);
                        toast.error("Error verifying payment");
                    }
                },
                prefill: {
                    name: userData?.name || "",
                    email: userData?.email || "",
                    contact: userData?.phone || ""
                },
                theme: {
                    color: "#3399cc"
                }
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong with payment");
        }
    };
    const generateInvoice = (booking) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text("BIT Guest House", 14, 22);

        doc.setFontSize(10);
        doc.text("Invoice / Receipt", 14, 30);

        // Guest Details
        doc.setFontSize(12);
        doc.text(`Name: ${userData?.name || ""}`, 14, 45);
        doc.text(`Email: ${userData?.email || ""}`, 14, 52);
        doc.text(`Phone: ${userData?.phone || ""}`, 14, 59);

        // Calculate Days and Price Per Day
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const diffTime = Math.abs(checkOut - checkIn);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) diffDays = 1;
        const pricePerDay = booking.amount / diffDays;

        // Booking Info Table
        autoTable(doc, {
            startY: 65,
            head: [['Room Type', 'Check-In', 'Check-Out', 'Nights', 'Price/Night', 'Total']],
            body: [
                [
                    booking.room_type,
                    checkIn.toLocaleDateString("en-GB"),
                    checkOut.toLocaleDateString("en-GB"),
                    diffDays,
                    `Rs. ${pricePerDay}`,
                    `Rs. ${booking.amount}`
                ]
            ],
            theme: 'striped',
            headStyles: { fillColor: [51, 153, 204] }
        });

        // Payment Info
        const finalY = doc.lastAutoTable?.finalY || 85;
        doc.setFontSize(12);
        doc.text(`Payment Status: Paid`, 14, finalY + 15);
        doc.setFontSize(14);
        doc.text(`Amount Paid: Rs. ${booking.amount || "N/A"}`, 14, finalY + 25);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Thank you for booking with BIT Guest House!", 14, finalY + 45);

        // Download
        doc.save(`Invoice_${booking._id}.pdf`);
    };
    const fetchUserBookings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/user/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setBookings(res.data.bookings); // ✅ set to state
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
        }
    };


    if (loading) {
        return (
            <ProfileSkeleton />
        );
    }
    return (
        <div className="relative pt-[65px] min-h-screen flex flex-col md:flex-row">
            {/* Background */}
            <div className="absolute inset-0 -z-10 w-full h-full bg-custom-color bg-[radial-gradient(circle_at_top_left,#fff8ef_20%,#fce8d5_50%,#fef2e3_90%)]" />

            {/* Sidebar */}
            <div className="w-full md:w-[30%] max-w-[250px] bg-[#f8e1c4] shadow-lg rounded-lg p-6 mx-auto md:ml-6 mt-4 h-[65vh] playfair">
                <ul className="space-y-4">
                    <li
                        className={`text-lg group relative font-semibold cursor-pointer hover:text-gray-700 hover:bg-gray-200 p-2 rounded-md ${selectedSection === "accountInfo" ? "bg-gray-300" : ""
                            }`}
                        onClick={() => setSelectedSection("accountInfo")}
                    >
                        Account Information
                        <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                    </li>
                    <li
                        className={`text-lg group relative font-semibold cursor-pointer hover:text-gray-700 hover:bg-gray-200 p-2 rounded-md ${selectedSection === "bookings" ? "bg-gray-300" : ""
                            }`}
                        onClick={() => setSelectedSection("bookings")}
                    >
                        My Bookings
                        <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                    </li>
                    <li
                        className={`text-lg group relative font-semibold cursor-pointer hover:text-gray-700 hover:bg-gray-200 p-2 rounded-md ${selectedSection === "helpCenter" ? "bg-gray-300" : ""
                            }`}
                        onClick={() => setSelectedSection("helpCenter")}
                    >
                        Feedback
                        <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                    </li>
                    <li
                        className="text-lg font-semibold cursor-pointer hover:text-red-500 p-2 rounded-md"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        Log Out
                    </li>
                </ul>
            </div>

            {/* Profile Content - Conditionally Rendered */}
            <div className="flex flex-col flex-1 min-h-screen p-6" style={{ fontFamily: "monospace" }}>
                {selectedSection === "accountInfo" && (
                    <div className="bg-slate-200 p-6 shadow-lg rounded-lg w-full">
                        <h1 className="text-2xl font-bold mb-4">General Details</h1>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {isEditing ? (
                                <>
                                    <div className="flex flex-col mb-4">
                                        <label htmlFor="firstName" className="text-black mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            placeholder="First Name"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="border p-2 rounded-md w-full"
                                        />
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label htmlFor="lastName" className="text-black mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            placeholder="Last Name"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="border p-2 rounded-md w-full"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="border p-2 rounded-md w-full bg-gray-100">{formData.firstName}</p>
                                    <p className="border p-2 rounded-md w-full bg-gray-100">{formData.lastName}</p>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {isEditing ? (
                                <div className="flex flex-col">
                                    <label className="text-black mb-1">D.O.B</label>
                                    <DatePicker
                                        selected={formData.dob}
                                        onChange={(date) =>
                                            handleChange({ target: { name: "dob", value: date } })
                                        }
                                        dateFormat="dd/MM/yyyy"
                                        showYearDropdown
                                        scrollableYearDropdown
                                        yearDropdownItemNumber={100}
                                        showMonthDropdown
                                        popperPlacement="bottom-start"
                                        maxDate={new Date()}          // Prevent future dates
                                        className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        placeholderText="Date of Birth"
                                    />
                                </div>
                            ) : (
                                <p className="border p-2 rounded-md w-full bg-gray-100">
                                    {formData.dob ? formData.dob.toLocaleDateString("en-GB") : "N/A"}
                                </p>
                            )}

                            {isEditing ? (
                                <div className="flex flex-col">
                                    <label htmlFor="gender" className="text-black mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        required
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="border p-2 rounded-md w-full"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            ) : (
                                <p className="border p-2 rounded-md w-full bg-gray-100">
                                    {formData.gender || "N/A"}
                                </p>
                            )}


                            {/* ID Upload field */}
                            {isEditing ? (
                                <div className="flex flex-col">
                                    <label className="text-black mb-1 flex items-center gap-1">
                                        Upload ID *
                                        <span className="relative group">
                                            <span className="bg-blue-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold cursor-pointer">
                                                ?
                                            </span>
                                            <div className="absolute hidden group-hover:block bg-white border p-3 rounded-xl shadow-md text-sm w-64 z-10 top-7 left-0">
                                                Upload institute ID (Student) or Aadhar card (Others) or passport (NRI).
                                            </div>
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        name="idUpload"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleIdUpload} // You can define this function to store the file in state
                                        className="p-2 border rounded-md w-full"
                                    />
                                </div>
                            ) : (
                                <p className="border p-2 rounded-md w-full bg-gray-100">
                                    {formData.idFile?.name || "ID not uploaded"}
                                </p>
                            )}

                        </div>

                        <h2 className="text-xl font-bold mb-4">Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {isEditing ? (
                                <>
                                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="border p-2 rounded-md w-full" />
                                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="border p-2 rounded-md w-full" />
                                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="border p-2 rounded-md w-full" />
                                </>
                            ) : (
                                <>
                                    <p className="border p-2 rounded-md w-full bg-gray-100">{formData.address}</p>
                                    <p className="border p-2 rounded-md w-full bg-gray-100">{formData.city}</p>
                                    <p className="border p-2 rounded-md w-full bg-gray-100">{formData.state}</p>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {isEditing ? (
                                <input type="text" name="pinCode" placeholder="Pin Code" value={formData.pinCode} onChange={handleChange} className="border p-2 rounded-md w-full" />
                            ) : (
                                <p className="border p-2 rounded-md w-full bg-gray-100">{formData.pinCode}</p>
                            )}
                        </div>

                        <h2 className="text-xl font-bold mb-4">Contact Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <p className="border p-2 rounded-md w-full bg-gray-100">{currentUser?.email || userData?.email}</p>
                            {isEditing ? (
                                <div className="flex flex-col mb-4">
                                    <label htmlFor="mobile" className="text-black mb-1">
                                        Mobile No *
                                    </label>
                                    <input
                                        type="text"
                                        id="mobile"
                                        name="mobile"
                                        placeholder="Mobile No"
                                        required
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="border p-2 rounded-md w-full"
                                    />
                                </div>
                            ) : (
                                <p className="border p-2 rounded-md w-full bg-gray-100">{formData.mobile}</p>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="relative group w-fit float-right">
                                <button
                                    onClick={handleUpdate}
                                    disabled={!areRequiredFieldsFilled()}
                                    className={`px-6 py-2 rounded-md transition-all ${areRequiredFieldsFilled()
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-400 text-white cursor-not-allowed"
                                        }`}
                                >
                                    Update
                                </button>
                                {!areRequiredFieldsFilled() && (
                                    <div className="absolute -top-12 right-0 bg-slate-50 text-black text-sm rounded-xl shadow-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64 z-10">
                                        Please fill all (*) marked fields before updating.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className="bg-gray-600 text-white px-6 py-2 rounded-md float-right hover:bg-gray-700 transition-all"
                            >
                                Edit
                            </button>
                        )}

                    </div>
                )}

                {selectedSection === "bookings" && (
                    <div className="flex justify-center bg-slate-200 p-6 shadow-lg rounded-lg w-full mb-4">
                        <h1 className="text-2xl font-bold">Your Bookings</h1>
                    </div>
                )}

                {selectedSection === "bookings" && (
                    <>
                        {/* Table Wrapper */}
                        <div className="bg-slate-200 p-2 md:p-4 shadow-lg rounded-lg w-full">
                            {bookings.length === 0 ? (
                                <div className="flex justify-center items-center py-16">
                                    <p className="text-gray-600 text-lg font-medium">
                                        No past bookings found.
                                    </p>
                                </div>

                            ) : (
                                <>
                                    {/* HEADER: Only visible on medium screens and up (mdl) */}
                                    <div className="hidden mdl:grid grid-cols-5 gap-4 text-gray-700 font-medium py-2 border-b border-gray-400">
                                        <span className="px-1">Room Type</span>
                                        <span className="px-1">Check-In Date</span>
                                        <span className="px-1">Check-Out Date</span>
                                        <span className="px-1">Status</span>
                                        <span className="px-1">Action</span>
                                    </div>

                                    {/* Table Data: Maps over your bookings */}
                                    <div>
                                        {bookings.map((booking) => (
                                            <div
                                                key={booking._id}
                                                className="border-b border-gray-300 p-3 text-sm mdl:grid mdl:grid-cols-5 mdl:gap-4 mdl:items-center mdl:p-2 mdl:border-b"
                                            >
                                                {/* Column 1: Room Type */}
                                                <div className="flex justify-between items-center mdl:block">
                                                    <span className="font-medium text-gray-500 mdl:hidden">Room</span>
                                                    <span className="font-semibold text-gray-800">{booking.room_type}</span>
                                                </div>

                                                {/* Column 2: Check-In Date */}
                                                <div className="flex justify-between items-center mt-1 mdl:mt-0 mdl:block">
                                                    <span className="font-medium text-gray-500 mdl:hidden">Check-In</span>
                                                    <span>{new Date(booking.checkInDate).toLocaleDateString("en-GB")}</span>
                                                </div>

                                                {/* Column 3: Check-Out Date */}
                                                <div className="flex justify-between items-center mt-1 mdl:mt-0 mdl:block">
                                                    <span className="font-medium text-gray-500 mdl:hidden">Check-Out</span>
                                                    <span>{new Date(booking.checkOutDate).toLocaleDateString("en-GB")}</span>
                                                </div>

                                                {/* Column 4: Status */}
                                                <div className="flex justify-between items-center mt-2 mdl:mt-0 mdl:block">
                                                    <span className="font-medium text-gray-500 mdl:hidden">Status</span>
                                                    <span
                                                        className={`px-3 py-1 font-semibold rounded-lg text-xs ${booking.status === "Approved"
                                                            ? "text-green-700 bg-green-100"
                                                            : booking.status === "Pending"
                                                                ? "text-yellow-700 bg-yellow-100"
                                                                : "text-red-700 bg-red-100"
                                                            }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                {/* Column 5: Payment Action */}
                                                <div className="flex justify-between items-center mt-2 mdl:mt-0 mdl:block">
                                                    <span className="font-medium text-gray-500 mdl:hidden">Action</span>
                                                    {booking.status === "Approved" && booking.paymentStatus !== "Paid" && (
                                                        <button
                                                            onClick={() => handlePayment(booking._id)}
                                                            className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md hover:bg-blue-700 transition"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )}
                                                    {booking.paymentStatus === "Paid" && (
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-green-700 font-semibold text-xs">Paid</span>
                                                            <button
                                                                onClick={() => generateInvoice(booking)}
                                                                className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md hover:bg-gray-900 transition"
                                                            >
                                                                Download Invoice
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}



                {selectedSection === "helpCenter" && (
                    <div className="flex flex-col items-center justify-end bg-slate-200 p-4 shadow-lg rounded-lg w-full mb-2">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Help Us Improve</h2>
                        <p className="text-sm text-gray-600 mb-2">
                            Have a complaint, suggestion, or feedback? Let us know — we’re here to help!
                        </p>
                    </div>
                )}

                {selectedSection === "helpCenter" && (
                    <div className="bg-slate-200 p-4 md:p-6 shadow-xl rounded-2xl w-full mx-auto mt-2">
                        <form className="space-y-4 " onSubmit={handleInputSubmit}>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Short title or concern"
                                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    id="message"
                                    rows="5"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your issue or feedback in detail...Provide your room number too if you are a guest."
                                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Submit Feedback
                            </button>
                        </form>
                    </div>
                )}

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
                                    onClick={handleLogout}
                                    className="px-4 mx-2 py-2 bg-red-600 text-white rounded transition-transform duration-200 hover:bg-red-700 hover:scale-105"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
        </div >
    );
}
