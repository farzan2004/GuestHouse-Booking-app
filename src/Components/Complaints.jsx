import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

// const complaintsData = [
//     {
//         id: 1,
//         name: "John Doe",
//         content: "The room was not clean when we arrived. The bed sheets were dirty and the bathroom was smelly. Please look into this matter immediately to ensure it doesn't happen again in the future.",
//     },
//     {
//         id: 2,
//         name: "Jane Smith",
//         content: "Wi-Fi was not working during our stay. We had to rely on mobile data which made work difficult. Please fix the connectivity issue.",
//     },
//     {
//         id: 3,
//         name: "Farhan",
//         content: "AC was making noise and not cooling properly. We had to switch rooms in the middle of the night. This was very inconvenient.",
//     },
//     {
//         id: 4,
//         name: "Test User",
//         content:
//             "The stay was overall decent but there were multiple issues that affected our experience. The washroom was not cleaned properly before our arrival. We also noticed that the bedsheets had some stains on them. Additionally, there were loud noises coming from the AC unit, which made it difficult to sleep peacefully during the night. We would appreciate it if these problems are addressed so future guests can have a better stay.The stay was overall decent but there were multiple issues that affected our experience. The washroom was not cleaned properly before our arrival. We also noticed that the bedsheets had some stains on them. Additionally, there were loud noises coming from the AC unit, which made it difficult to sleep peacefully during the night. We would appreciate it if these problems are addressed so future guests can have a better stay.The stay was overall decent but there were multiple issues that affected our experience. The washroom was not cleaned properly before our arrival. We also noticed that the bedsheets had some stains on them. Additionally, there were loud noises coming from the AC unit, which made it difficult to sleep peacefully during the night. We would appreciate it if these problems are addressed so future guests can have a better stay."
//     },
//     {
//     id: 5,
//     name: "Another User",
//     content: "Short complaint just to test page 2."
//   },
//   {
//     id: 6,
//     name: "More Feedback",
//     content: "The reception staff was unhelpful and not friendly. Please train them better."
//   },
// ];

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
                const res = await axios.get(backendUrl+"/api/admin/complaints", {
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
            {currentComplaints.map(({ _id, submittedBy , subject, message }) => (
                <div
                    key={_id}
                    className="shadow-lg bg-slate-200 p-4 rounded-lg flex flex-col gap-2"
                >
                    <button className="text-blue-600 font-semibold text-left hover:underline">
                        {submittedBy.name}
                    </button>

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
