import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const Complaints = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    // const { token } = useAuth(); // Firebase or null
    const jwt = localStorage.getItem("adminToken");
    // const authToken = jwt || token;

    const [complaints, setComplaints] = useState([]);
    const [expandedCard, setExpandedCard] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const complaintsPerPage = 3;

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await axios.get(backendUrl + "/api/admin/complaints", {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                });
                setComplaints(res.data.complaints || []);
            } catch (err) {
                console.error("Error fetching complaints:", err);
            }
        };

        if (jwt) fetchComplaints();
    }, [jwt]);

    const totalPages = Math.ceil(complaints.length / complaintsPerPage);
    const startIndex = (currentPage - 1) * complaintsPerPage;
    const currentComplaints = complaints.slice(startIndex, startIndex + complaintsPerPage);

    const toggleExpand = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };


    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="relative shadow-lg bg-slate-200 p-4 rounded-lg flex flex-col items-start md:items-center">
                <h2 className="md:text-xl text-base font-bold text-center">Complaints</h2>
            </div>
            {currentComplaints.map(({ _id, submittedBy, subject, message }) => (
                <div
                    key={_id}
                    className=" shadow-lg bg-slate-200 p-4 rounded-lg flex flex-col gap-2"
                >
                    {/* name + tooltip */}
                    <div className="inline-flex items-center gap-1 group relative">
                        <button
                            className="text-blue-600 font-semibold text-left hover:underline focus:outline-none"
                            aria-describedby={`email-tooltip-${_id}`}
                        >
                            {submittedBy?.name || "Unknown"}
                        </button>

                        {/* tooltip */}
                        {/* <div
                            id={`email-tooltip-${_id}`}
                            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-10"
                        >
                            <div className="bg-slate-200 shadow rounded-md px-3 py-2 text-xs text-gray-800 whitespace-nowrap">
                                {submittedBy?.email || "No email"}
                            </div>
                        </div> */}
                    </div>

                    <div className="font-semibold text-gray-800 text-sm">
                        Subject: {subject}
                    </div>

                    <div
                        className={`text-sm break-words transition-all duration-300 ease-in-out ${expandedCard === _id ? '' : 'line-clamp-4'
                            }`}
                    >
                        {message}
                    </div>

                    {(message || "").length > 90 && (
                        <button
                            onClick={() => toggleExpand(_id)}
                            className="text-blue-600 text-sm mt-1 hover:underline self-end"
                        >
                            {expandedCard === _id ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>
            ))}
            {totalPages > 1 && (
                <div className="flex justify-start mt-4 gap-4">
                    <button
                        className="px-3 py-1 md:w-24 w-12 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    <span className="font-bold md:text-lg text-xs">
                        Page {currentPage} / {totalPages}
                    </span>
                    <button
                        className="px-3 py-1 md:w-24 w-12 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default Complaints
