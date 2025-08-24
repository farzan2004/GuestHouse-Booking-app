// src/components/GuestDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GuestDetails = ({ id, onBack }) => {
    const [guest, setGuest] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        const fetchGuest = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/admin/guests/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                setGuest(data);
            } catch (error) {
                console.error("Error fetching guest details:", error);
            }
        };

        fetchGuest();
    }, [id]);
    const handleDelete = async () => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            window.location.href = "/login";
            return;
        }
    if (!window.confirm("Are you sure you want to delete this guest?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/admin/guests/${id}`, {
            method: "DELETE",
            headers: {
                        Authorization: `Bearer ${token}`
                    }
        });

        const data = await res.json();
        if (res.ok) {
            alert("Guest deleted successfully");
            onBack(); // go back to list
        } else {
            alert(data.error || "Failed to delete guest");
        }
    } catch (err) {
        console.error("Error deleting guest:", err);
        alert("Something went wrong.");
    }
};


    if (!guest) return <div className="p-6">Loading guest details...</div>;

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="relative shadow-lg bg-slate-200 p-4 rounded-lg flex flex-col items-start md:items-center">
                <h2 className="md:text-xl text-base font-bold text-left md:text-center">Guest Details</h2>
                <p className="md:text-lg text-sm mt-2 text-left md:text-center">{guest.fullName}</p>
            </div>
            <div className="shadow-lg bg-slate-200 p-4 rounded-lg">
                <div className="overflow-x-auto">
                    <table className="table-auto w-full border border-gray-300 text-sm md:text-base">
                        <tbody>
                            <tr><td className="p-2 font-semibold">Full Name</td><td className="p-2">{guest.fullName}</td></tr>
                            <tr><td className="p-2 font-semibold">Contact</td><td className="p-2">{guest.contact}</td></tr>
                            <tr><td className="p-2 font-semibold">Room Number</td><td className="p-2">{guest.room || "N/A"}</td></tr>
                            <tr><td className="p-2 font-semibold">Check-in Date</td><td className="p-2">{guest.checkInDate?.slice(0, 10) || "N/A"}</td></tr>
                            <tr><td className="p-2 font-semibold">Check-out Date</td><td className="p-2">{guest.checkOutDate?.slice(0, 10) || "N/A"}</td></tr>
                            <tr><td className="p-2 font-semibold">Gender</td><td className="p-2">{guest.gender}</td></tr>
                            <tr><td className="p-2 font-semibold">Age</td><td className="p-2">{guest.age || "N/A"}</td></tr>
                            <tr><td className="p-2 font-semibold">Date of Birth</td><td className="p-2">{guest.dob || "N/A"}</td></tr>
                            <tr><td className="p-2 font-semibold">Address</td><td className="p-2">{guest.address || "N/A"}</td></tr>
                            <tr><td className="p-2 font-semibold">City</td><td className="p-2">{guest.city || "N/A"}</td></tr>
                            <tr><td className="p-2 font-semibold">State</td><td className="p-2">{guest.state || "N/A"}</td></tr>
                            {guest.idProofUrl && (
                                <tr>
                                    <td className="p-2 font-semibold">ID Proof</td>
                                    <td className="p-2">
                                        <a href={guest.idProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                                            View ID
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
                    onClick={handleDelete}
                >
                    Delete Guest
                </button>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                    onClick={onBack}
                >
                    Back
                </button>
            </div>
        </div>
    );
};
export default GuestDetails;
