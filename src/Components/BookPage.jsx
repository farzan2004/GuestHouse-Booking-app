import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import BookPageSkeleton from '../Skeletons/bookpageSkeleton';


const BookPage = () => {
    const token = localStorage.getItem("guestToken");
    const [userData, setUserData] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();
    // const [roomId, setRoomId] = useState(null);
    const [roomIds, setRoomIds] = useState([]);

    const [room, setRoom] = useState(null);
    const [guestCount, setGuestCount] = useState(1);
    const [roomCount, setRoomCount] = useState(1);
    const [showDropdown, setShowDropdown] = useState(false);
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [msg1, setMsg1] = useState(false);
    const [msg2, setMsg2] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [category, setCategory] = useState("");
    const [extraGuests, setExtraGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookloading, setBookloading] = useState(false);
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user/room/${id}`);
                setLoading(false);
                setRoom(res.data);
            } catch (err) {
                console.error("Room fetch error:", err);
                toast.error("Room fetch error, please try after some time");
            }
        };
        fetchRoom();
    }, [id]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/user/getProfileData", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.success) {
                    const user = res.data.userData;
                    const calculateAge = (dobStr) => {
                        const dob = new Date(dobStr);
                        const ageDiffMs = Date.now() - dob.getTime();
                        return Math.floor(ageDiffMs / (1000 * 60 * 60 * 24 * 365.25));
                    };
                    setUserData({ ...user, infoupdate: !!(user.name && user.phone && user.gender && user.dob), age: calculateAge(user.dob) });
                }
            } catch (err) {
                console.error("Error fetching user data", err);
                toast.error("Error fetching user data, please try after some time");
            }
        };

        fetchProfile();
    }, []);

    const handleBooking = async () => {
        if (!userData.infoupdate) {
            setMsg2(true);
            setMsg1(false);
            toast.error("Please complete your account info before booking.");
            return;
        }
        setShowSidebar(true);


    };

    useEffect(() => {
        if (msg1 && !msg2) {
            toast.success("Booking request sent. Stay tuned.");
        }
    }, [msg1]);

    const handleCheckAvailability = async () => {
        if (!checkIn || !checkOut) {
            toast.error("Please select check-in and check-out dates.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/user/check-availability", {
                roomType: room.type,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                roomCount
            });

            if (res.data.success && res.data.roomIds?.length) {
                toast.success("Rooms available. Proceed to book.");
                setConfirmed(true);
                setRoomIds(res.data.roomIds);  // array of room IDs
            } else {
                toast.error(res.data.message || "No available rooms found.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while checking availability.");
        }
    };

    const handleGuestInput = (index, field, value) => {
        const updatedGuests = [...extraGuests];
        if (!updatedGuests[index]) updatedGuests[index] = {};
        updatedGuests[index][field] = value;
        setExtraGuests(updatedGuests);
    };

    if (loading) return <BookPageSkeleton />;
    if (!room) return <div className="text-center mt-10 text-gray-600">Loading room details...</div>;

    return (
        <div className='relative pt-[65px] min-h-screen flex flex-col'>
            {/* Background */}
            <div className='absolute inset-0 -z-10 bg-custom-color bg-[radial-gradient(circle_at_top_left,#fff8ef_20%,#fce8d5_50%,#fef2e3_90%)]'></div>

            {/* Room Image */}
            <div className='relative flex justify-center items-center md:h-[70vh] h-[50vh] md:px-[35px] px-[10px] py-[5px]'>
                <img src={room.images[0]} alt={room.title} className='w-full h-full object-cover blur-[2px]' />

                {/* Greeting Text */}
                <div className="absolute bottom-20 md:left-16 left-8  text-white p-4 rounded-lg text-right" style={{ fontFamily: 'monospace' }}>
                    <span className="block text-4xl md:text-8xl font-semibold">Hello,</span>
                    <span className="block text-4xl md:text-8xl font-semibold">Guest!</span>
                </div>


                {/* Booking Container */}
                <div className="absolute left-1/2 bottom-[-220px] md:bottom-[-50px] transform -translate-x-1/2 w-[90%] md:w-[80%] max-w-[900px] bg-white shadow-lg rounded-2xl p-0 flex flex-col md:flex-row justify-between divide-y md:divide-y-0 md:divide-x divide-gray-300 playfair">

                    {confirmed ? (
                        <>
                            <div className="flex flex-col w-full md:w-1/4 px-4 justify-center md:p-3 p-2">
                                <label className="text-gray-500 text-sm mb-1">Check-in</label>
                                <p className="p-2 border rounded-lg">{checkIn.toLocaleDateString()}</p>
                            </div>

                            <div className="w-full md:w-[1px] bg-gray-300"></div>

                            <div className="flex flex-col w-full md:w-1/4 px-4 justify-center md:p-3 p-2">
                                <label className="text-gray-500 text-sm mb-1">Check-out</label>
                                <p className="p-2 border rounded-lg">{checkOut.toLocaleDateString()}</p>
                            </div>

                            <div className="w-full md:w-[1px] bg-gray-300"></div>

                            <div className="w-full md:w-1/4 md:p-3 p-2">
                                <label className="text-gray-500 text-sm mb-1">Guests & Rooms</label>
                                <p className="p-2 border rounded-lg">{guestCount} Guests, {roomCount} Rooms</p>
                            </div>

                            <div className="w-full md:w-[1px] bg-gray-400"></div>

                            <button className="bg-[#ff9272] text-black font-semibold w-full md:w-1/4 md:p-6 p-4 rounded-b-2xl md:rounded-r-2xl md:rounded-l-none flex items-center justify-center 
                            transition-all duration-500 ease-in-out hover:bg-orange-900 hover:text-slate-200" onClick={handleBooking}>
                                Book
                            </button>

                            {msg2 && (
                                <div className="absolute md:top-[calc(100%+3px)] top-[calc(100%)] left-0 right-0 text-center px-4 md:px-10 flex justify-between items-center">
                                    <p className="text-sm font-normal md:font-semibold" style={{ color: "#3e3a37" }}>Hey! You need to complete your account info before booking.</p>
                                    <p className="text-sm md:text-lg font-normal md:font-semibold" style={{ color: "#3e3a37" }}>
                                        Please update it in
                                        <span
                                            className="text-blue-600 relative hover:text-blue-800 group cursor-pointer mx-1"
                                            onClick={() => navigate("/profile", { state: { section: "accountInfo" } })}
                                        >
                                            Account Information
                                            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                                        </span>
                                        to proceed.
                                    </p>
                                </div>
                            )}

                            {msg1 && (
                                <div className="absolute md:top-[calc(100%+3px)] top-[calc(100%)]  left-0 right-0 text-center px-4 md:px-10 flex justify-between items-center">
                                    <p className="text-sm font-normal md:font-semibold" style={{ color: "#3e3a37" }}>Great!! Your booking request has been sent.
                                    </p>
                                    <p className="text-sm md:text-lg font-normal md:font-semibold" style={{ color: "#3e3a37" }}>
                                        Please check
                                        <span
                                            className="text-blue-600 relative hover:text-blue-800 group cursor-pointer mx-1"
                                            onClick={() => navigate("/profile", { state: { section: "bookings" } })}
                                        >
                                            Your Bookings
                                            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                                        </span>
                                        for further updates.
                                    </p>
                                    <img src="/charl-illustration.webp" alt="Success" className="w-24 h-24 sh:w-16 sh:h-16 right-0 md:block hidden" />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Booking Inputs */}
                            <div className="flex flex-col w-full md:w-1/4 px-4 justify-center md:p-3 p-2">
                                <label className="text-gray-500 text-sm mb-1">Check-in</label>
                                <DatePicker
                                    selected={checkIn}
                                    onChange={(date) => setCheckIn(date)}
                                    minDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                                    popperPlacement="bottom"
                                    className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    placeholderText="Select date"
                                />
                            </div>

                            <div className="w-full md:w-[1px] bg-gray-300"></div>

                            <div className="flex flex-col w-full md:w-1/4 px-4 justify-center md:p-3 p-2">
                                <label className="text-gray-500 text-sm mb-1">Check-out</label>
                                <DatePicker
                                    selected={checkOut}
                                    onChange={(date) => setCheckOut(date)}
                                    minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
                                    popperPlacement="bottom-start"
                                    className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    placeholderText="Select date"
                                />
                            </div>

                            <div className="w-full md:w-[1px] bg-gray-300"></div>

                            <div className="relative w-full md:w-1/4 md:p-3 p-2">
                                <label className="text-gray-500 text-sm mb-1">Guests & Rooms</label>
                                <button
                                    className="p-2 border rounded-md w-full text-left focus:outline-none"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    {guestCount} Guests, {roomCount} Rooms
                                </button>

                                {showDropdown && (
                                    <div className={`w-full bg-white border shadow-md rounded-md z-10 p-2 md:p-3 ${showDropdown ? "block" : "hidden"} md:absolute md:left-0 md:mb-2 md:mt-0 mt-2`}>
                                        {/* Guests */}
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-600">Guests</span>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="px-2 py-1 bg-gray-200 rounded-md"
                                                    onClick={() => {
                                                        const newGuestCount = Math.max(1, guestCount - 1);
                                                        setGuestCount(newGuestCount);
                                                        setRoomCount(Math.max(1, Math.ceil(newGuestCount / 2)));
                                                    }}
                                                >-</button>

                                                <span>{guestCount}</span>

                                                <button
                                                    className="px-2 py-1 bg-gray-200 rounded-md"
                                                    onClick={() => {
                                                        const newGuestCount = guestCount + 1;
                                                        setGuestCount(newGuestCount);
                                                        setRoomCount(Math.ceil(newGuestCount / 2));
                                                    }}
                                                >+</button>
                                            </div>
                                        </div>

                                        {/* Rooms */}
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">Rooms</span>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="px-2 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                                                    disabled={roomCount === Math.ceil(guestCount / 2)}
                                                    onClick={() =>
                                                        setRoomCount(Math.max(1, roomCount - 1))
                                                    }
                                                >
                                                    -
                                                </button>
                                                <span>{roomCount}</span>
                                                <button className="px-2 py-1 bg-gray-200 rounded-md"
                                                    onClick={() => setRoomCount(roomCount + 1)}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-[1px] bg-gray-300"></div>

                            {/* Check Availability Button */}
                            <button className="bg-[#ff9272] text-black font-semibold w-full md:w-1/4 md:p-6 p-4 rounded-b-2xl md:rounded-r-2xl md:rounded-l-none flex items-center justify-center 
                    transition-all duration-500 ease-in-out hover:bg-orange-900 hover:text-slate-200" onClick={handleCheckAvailability}>
                                Check Availability
                            </button>
                        </>
                    )}
                </div>
                {showSidebar && (
                    <div className={`fixed top-0 right-0 w-[80%] sm:w-[60%] md:w-[40%] lg:w-[30%] h-full bg-slate-200 shadow-lg p-4 z-50 overflow-y-auto transform transition-transform duration-500 ease-in-out ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Guest Info & Category</h2>
                            <button onClick={() => { window.location.reload(); setShowSidebar(false) }} className="transition-transform duration-300 ease-in-out hover:scale-125">❌</button>
                        </div>

                        {/* Category Dropdown */}
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium">Booking Category</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select</option>
                                {[
                                    "Institute Guest",
                                    "Guests (Projects/Events)",
                                    "Employee",
                                    "Alumni",
                                    "Guardian",
                                    "Guests from Other Academic Institutions",
                                    "Others",
                                ].map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {[...Array(Math.max(0, guestCount - 1))].map((_, index) => (
                            <div key={index} className="mb-4 border-b pb-3">
                                <h3 className="flex items-center text-base font-semibold text-gray-700 mb-2">
                                    <span className="mr-2 text-orange-600">{'›'}</span> Guest {index + 2}
                                </h3>

                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full p-2 border rounded mb-2"
                                    onChange={(e) => handleGuestInput(index, "fullName", e.target.value)}
                                />

                                <select
                                    className="w-full p-2 border rounded mb-2"
                                    onChange={(e) => handleGuestInput(index, "gender", e.target.value)}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>

                                <input
                                    type="number"
                                    placeholder="Age"
                                    className="w-full p-2 border rounded mb-2"
                                    onChange={(e) => handleGuestInput(index, "age", e.target.value)}
                                />

                                <select
                                    className="w-full p-2 border rounded mb-2"
                                    onChange={(e) => handleGuestInput(index, "relation", e.target.value)}
                                >
                                    <option value="">Select Relation</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Family">Family</option>
                                    <option value="Colleague">Colleague</option>
                                    <option value="Other">Other</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="Contact Number"
                                    className="w-full p-2 border rounded mb-2"
                                    onChange={(e) => handleGuestInput(index, "contact", e.target.value)}
                                />
                            </div>
                        ))}


                        <button
                            onClick={async () => {
                                if (!category.trim()) {
                                    toast.error("Please select a booking category.");
                                    return;
                                }

                                for (let i = 0; i < guestCount - 1; i++) {
                                    const guest = extraGuests[i];
                                    if (
                                        !guest ||
                                        !guest.fullName?.trim() ||
                                        !guest.gender?.trim() ||
                                        !guest.age ||
                                        !guest.relation?.trim() ||
                                        !guest.contact?.trim()
                                    ) {
                                        toast.error(`Please fill all fields for Guest ${i + 2}`);
                                        return;
                                    }
                                }
                                setBookloading(true);

                                try {
                                    const res = await axios.post(
                                        "http://localhost:5000/api/user/createBooking",
                                        {
                                            rooms: roomIds,
                                            checkInDate: checkIn,
                                            checkOutDate: checkOut,
                                            guests: [
                                                {
                                                    fullName: userData.name || "Main Guest",
                                                    gender: userData.gender || "Not Specified",
                                                    age: userData.age || 0,
                                                    dob: userData.dob || "",
                                                    address: userData.address || "",
                                                    city: userData.city || "",
                                                    state: userData.state || "",
                                                    relation: "Self",
                                                    contact: userData.phone || "00000",
                                                },

                                                ...extraGuests,
                                            ],
                                            category,
                                            email: userData.email,
                                        },
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );

                                    toast.success("Booking created successfully!");
                                    setMsg1(true);

                                    setShowSidebar(false);
                                } catch (err) {
                                    console.error(err);
                                    toast.error("Booking failed!");
                                } finally {
                                    setBookloading(false);
                                }

                            }}
                            className={`w-full text-white p-2 mt-4 rounded transform transition-transform duration-500 ease-in-out ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:scale-105 hover:bg-green-800"
                                }`}
                        >
                            {bookloading ? "Sending.." : "Send Request"}
                        </button>
                        <span
                            onClick={() => navigate("/tnc")}
                            className="relative text-xs text-blue-700 mt-4 cursor-pointer group hover:text-blue-800"
                        >
                            Terms and Conditions
                            <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                        </span>
                        <span className='text-xs  mt-4'> applied.</span>

                    </div>
                )}

            </div>
            <div className='flex justify-end mt-1 pr-4'>
                <div className=' bg-opacity-50 text-custom-black text-base md:text-base px-5 rounded-md' style={{ fontFamily: 'monospace' }}>
                    ₹{room.price} /night
                </div>
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

export default BookPage;
