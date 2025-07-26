import { useState, useEffect } from "react";
import axios from "axios";
import GuestDetails from "./GuestDetails";

const BookingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [selectedGuestId, setSelectedGuestId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        const fetchRequests = async () => {
            try {

                const res = await axios.get("http://localhost:5000/api/admin/bookingRequests", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setRequests(res.data);
            } catch (err) {
                console.error("Failed to fetch booking requests:", err);
            }
        };
        fetchRequests();
    }, []);
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 3;

    const filteredRequests = selectedStatus === "All"
        ? requests
        : requests.filter(req => req.status.toLowerCase() === selectedStatus.toLowerCase());

    const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
    const startIndex = (currentPage - 1) * requestsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + requestsPerPage);

    const handleAction = async (id, action) => {
        console.log("Clicked:", id, action);
        try {
            const token = localStorage.getItem("adminToken"); // or wherever you store JWT

            const res = await axios.post(
                `http://localhost:5000/api/admin/bookingStatus/${id}`,
                { status: action },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            // Update local state
            setRequests(prev =>
                prev.map(req =>
                    req._id === id ? { ...req, status: action } : req
                )
            );
        } catch (err) {
            console.error("Booking status update failed:", err);
        }
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            {selectedGuestId ? (
                <GuestDetails id={selectedGuestId} onBack={() => setSelectedGuestId(null)} />
            ) : (
                <>
                    {/* Header & Filter */}
                    <div className="relative shadow-lg bg-slate-200 p-4 rounded-lg flex flex-col items-start md:items-center">
                        <h2 className="md:text-xl text-base font-bold text-center">Booking Requests</h2>
                        <p className="md:text-lg text-sm mt-2 text-center">Total Requests: {filteredRequests.length}</p>

                        {/* Filter Dropdown - Adjusted for small screens */}
                        <div className="absolute md:top-8 md:right-4 top-8 right-1 flex items-center">
                            <label className="md:font-bold font-medium mr-2 inline">Filter:</label>
                            <select
                                className="border p-2 rounded-lg text-sm md:w-20 w-6 bg-slate-200"
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option className="md:block hidden" value="All">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Requests List - Wrapped in a responsive container */}
                    <div className="shadow-lg bg-slate-200 p-4 rounded-lg">
                        <div className="overflow-x-auto"> {/* Enables horizontal scrolling if needed */}
                            <table className="w-full table-auto border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-300">
                                        <th className="border p-2 text-xs md:text-base">Guest</th>
                                        <th className="border p-2 text-xs md:text-base">Room Type</th>
                                        <th className="border p-2 text-xs md:text-base">Category</th>
                                        <th className="border p-2 text-xs md:text-base">Date</th>
                                        <th className="border p-2 text-xs md:text-base">Status</th>
                                        <th className="border p-2 text-xs md:text-base">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRequests.map((req) => {
                                        console.log(req);
                                        return (
                                            <tr key={req._id} className="text-center">
                                                <td className="border p-2 text-xs md:text-base"><button
                                                    className="text-blue-700 underline"
                                                    onClick={() => {
                                                        if (req.guests && req.guests.length > 0) {
                                                            const mainGuest = req.guests.find(g => g.relation === "Self") || req.guests[0];
                                                            setSelectedGuestId(mainGuest._id);
                                                        } else {
                                                            console.warn("No guests found in request:", req);
                                                        }
                                                    }}
                                                // or req.user_id depending on your schema
                                                >
                                                    {req.user_name}
                                                </button></td>
                                                <td className="border p-2 text-xs md:text-base">{req.room_type}</td>
                                                <td className="border p-2 text-xs md:text-base">{req.category}</td>
                                                <td className="border p-2 text-xs md:text-base">{req.requested_date}</td>
                                                <td className={`border p-2 font-bold text-xs md:text-base ${req.status === "approved" ? "text-green-600" : req.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                                                    {req.status}
                                                </td>
                                                <td className="border p-2">
                                                    {req.status.toLowerCase() === "pending" && (
                                                        <div className="flex flex-col md:flex-row gap-2">
                                                            <button
                                                                onClick={() => handleAction(req._id, "approved")}
                                                                className="px-2 py-1 text-xs md:text-base bg-green-500 text-white rounded transition-transform duration-200 hover:bg-green-700 hover:scale-105">
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(req._id, "rejected")}
                                                                className="px-2 py-1 text-xs md:text-base bg-red-500 text-white rounded transition-transform duration-200 hover:bg-red-700 hover:scale-105">
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
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
    );
};

export default BookingRequests;
