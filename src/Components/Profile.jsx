import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { getAuth, signOut } from "firebase/auth";

export default function Profile() {
    // Dummy user data for frontend testing
    // const dummyUserData = {
    //     firstName: "John",
    //     lastName: "Doe",
    //     dob: "1995-06-15",
    //     gender: "Male",
    //     id: "",
    //     address: "123 Street Name",
    //     city: "New York",
    //     state: "NY",
    //     pinCode: "10001",
    //     email: "testuser@example.com",
    //     mobile: "9876543210",
    //     bookings: [
    //         { _id: "req_1", user_name: "John Doe", category: "Deluxe", requested_date: "26.03.2025", status: "approved" },
    //         { _id: "req_2", user_name: "John Doe", category: "Standard", requested_date: "26.03.2025", status: "approved" },
    //         { _id: "req_3", user_name: "John Doe", category: "Deluxe", requested_date: "25.03.2025", status: "rejected" },
    //         { _id: "req_4", user_name: "John Doe", category: "Standard", requested_date: "27.03.2025", status: "pending" },
    //     ],
    //     infoupdate: "true"
    // };

    const token = localStorage.getItem("guestToken");
    const [bookings, setBookings] = useState([]);
    // const userData = dummyUserData;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

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
    const auth = getAuth();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!token) return;

                const res = await axios.get("http://localhost:5000/api/user/getProfileData", {
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

            const res = await axios.post("http://localhost:5000/api/user/updateProfileData", updatedData, {
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
    const fetchUserBookings = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/user/user/bookings", {
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
            <div className="pt-[65px] flex justify-center items-center h-screen text-xl font-semibold">
                Loading...
            </div>
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
                        Your Bookings
                        <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                    </li>
                    <li
                        className={`text-lg group relative font-semibold cursor-pointer hover:text-gray-700 hover:bg-gray-200 p-2 rounded-md ${selectedSection === "helpCenter" ? "bg-gray-300" : ""
                            }`}
                        onClick={() => setSelectedSection("helpCenter")}
                    >
                        Help Center
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
                                        selected={formData.dob}  // Ensure dob is a Date object
                                        onChange={(date) => handleChange({ target: { name: "dob", value: date } })}
                                        dateFormat="dd/MM/yyyy"  // Display format
                                        showYearDropdown  // Enables year dropdown
                                        scrollableYearDropdown  // Makes year selection scrollable
                                        yearDropdownItemNumber={100}  // Show a wider range of years
                                        showMonthDropdown  // Enables month selection dropdown
                                        popperPlacement="bottom-start"
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
                    <div className="bg-slate-200 p-6 shadow-lg rounded-lg w-full">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 text-gray-700 text-lg md:font-medium mdl:font-normal font-light py-2 border-b border-gray-400">
                            <span className="px-2">Room Type</span>
                            <span className="px-1">CheckIn Date</span>
                            <span className="px-1">CheckOut Date</span>
                            <span className="px-2">Status</span>
                        </div>

                        {/* Table Data */}
                        {bookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="grid grid-cols-4 py-1 border-b border-gray-300 md:font-normal mdl:font-light font-extralight text-gray-800"
                            >
                                <span>{booking.room_type}</span>
                                <span>{new Date(booking.checkInDate).toLocaleDateString("en-GB")}</span>
                                <span>{new Date(booking.checkOutDate).toLocaleDateString("en-GB")}</span>
                                <span
                                    className={`px-3 py-1 font-semibold rounded-lg text-base ${booking.status === "Approved"
                                        ? "text-green-600"
                                        : booking.status === "Pending"
                                            ? "text-yellow-600"
                                            : "text-red-500"
                                        }`}
                                >
                                    {booking.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}



                {selectedSection === "helpCenter" && (
                    <div className="bg-slate-200 p-6 shadow-lg rounded-lg w-full">
                        <h1 className="text-2xl font-bold mb-4">Help Center</h1>
                        <p>Need assistance? Contact our support team.</p>
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
                                    onClick={() => {
                                        if(token){
                                            localStorage.removeItem("guestToken")
                                            console.log("JWT user logged out");
                                            toast.success("Logged Out Successfully")
                                            navigate("/home"); 
                                        }
                                        else{
                                            signOut(auth)
                                            .then(() => {
                                                console.log("User signed out");
                                                navigate("/home"); // redirect if needed
                                            })
                                            .catch((err) => console.error("Sign-out failed:", err));
                                        }  
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
