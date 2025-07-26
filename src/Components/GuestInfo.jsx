import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GuestDetails from "./GuestDetails";

const GuestInfo = () => {
    const [guests, setGuests] = useState([]);
    const [selectedGuestId, setSelectedGuestId] = useState(null);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
    if (!token) {
        navigate("/login");
        return;
    }
        const fetchGuests = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/admin/listBookedRoomsWithGuests", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Flatten guests grouped by room into single array
                const flatGuests = res.data;
                console.log("Guests:", flatGuests);

                setGuests(flatGuests);
            } catch (err) {
                console.error("Failed to fetch guests:", err);
            }
        };

        fetchGuests();
    }, []);

    // const deleteGuest = async (id) => {
    //     await fetch(`/api/admin/guests/${id}`, {
    //         method: "DELETE",
    //     });

    //     setGuests(prev => prev.filter(g => g.id !== id));
    // };

    // const fetchGuestDetails = async (id) => {
    //     const res = await fetch(`/api/admin/guests/${id}`);
    //     const data = await res.json();
    //     console.log(data);
    // };

    const [sortBy, setSortBy] = useState("checkOutAsc");
    const [openMenu, setOpenMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const guestsPerPage = 3;

    const toggleMenu = (id) => {
        setOpenMenu(openMenu === id ? null : id);
    };

    // Sort guests based on selection
    const sortedGuests = [...guests].sort((a, b) => {
        switch (sortBy) {
            case "checkOutAsc": return (a.checkOutDate || "").localeCompare(b.checkOutDate || "");
            case "checkOutDesc": return (b.checkOutDate || "").localeCompare(a.checkOutDate || "");
            case "checkInAsc": return (a.checkInDate || "").localeCompare(b.checkInDate || "");
            case "checkInDesc": return (b.checkInDate || "").localeCompare(a.checkInDate || "");
            case "roomAsc": return a.room - b.room;
            case "roomDesc": return b.room - a.room;
            default: return 0;
        }
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedGuests.length / guestsPerPage);
    const startIndex = (currentPage - 1) * guestsPerPage;
    const paginatedGuests = sortedGuests.slice(startIndex, startIndex + guestsPerPage);

    return (
        <div className="p-4 flex flex-col gap-4">
            {selectedGuestId ? (
            <GuestDetails id={selectedGuestId} onBack={() => setSelectedGuestId(null)} />
        ) : (
            <>
            {/* Header & Sorting */}
            <div className="relative shadow-lg bg-slate-200 p-4 rounded-lg flex flex-col items-start md:items-center">
                <h2 className="md:text-xl text-base font-bold text-left md:text-center">Guest List</h2>
                <p className="md:text-lg text-sm mt-2 text-left md:text-center">Total Guests: {guests.length}</p>

                {/* Sort Dropdown - Adjusted for small screens */}
                <div className="absolute md:top-4 md:right-4 top-8 right-1 flex items-center">
                    <label className="md:font-bold font-medium mr-2 inline">Sort By:</label>
                    <select
                        className="border p-2 rounded-lg text-sm md:w-24 w-6 bg-slate-200"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option className="hidden" value="checkOutAsc">Check-out Date (Asc)</option>
                        <option value="checkOutDesc">Check-out Date (Desc)</option>
                        <option value="checkInAsc">Check-in Date (Asc)</option>
                        <option value="checkInDesc">Check-in Date (Desc)</option>
                        <option value="roomAsc">Room Number (Asc)</option>
                        <option value="roomDesc">Room Number (Desc)</option>
                    </select>
                </div>
            </div>

            {/* Guests List - Wrapped in a responsive container */}
            <div className="shadow-lg bg-slate-200 p-4 rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-300">
                                <th className="border p-2 text-xs md:text-base">Guest</th>
                                <th className="border p-2 text-xs md:text-base hidden md:block">Phone</th>
                                <th className="border p-2 text-xs md:text-base">Room</th>
                                <th className="border p-2 text-xs md:text-base">Check-in</th>
                                <th className="border p-2 text-xs md:text-base">Check-out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedGuests.map((guest) => (
                                <tr key={guest._id} className="text-center">
                                    <td className="border p-2 text-xs md:text-base">
                                        <button
                                            className="text-blue-700 underline"
                                             onClick={() => setSelectedGuestId(guest._id)}
                                        >
                                            {guest.fullName}
                                        </button>
                                    </td>
                                    <td className="border p-2 text-xs md:text-base hidden md:block">{guest.contact}</td>
                                    <td className="border p-2 text-xs md:text-base">{guest.room}</td>
                                    <td className="border p-2 text-xs md:text-base">{guest.checkInDate?.slice(0, 10)}</td>
                                    <td className="border p-2 text-xs md:text-base">{guest.checkOutDate?.slice(0, 10)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-start mt-4 gap-4">
                        <button
                            className="px-3 py-1 md:w-24 w-12 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>
                        <span className="font-bold md:text-lg text-xs">Page {currentPage} / {totalPages}</span>
                        <button
                            className="px-3 py-1 md:w-24 w-12 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            </>
        )}
    </div>
    )
}
export default GuestInfo;