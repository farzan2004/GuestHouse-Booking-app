import { useState, useEffect } from "react";
import { ForecastChart } from "./ForecastChart";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";

// Function to calculate total available rooms for a given date
// const getTotalAvailableRooms = (date) => {
//   return roomsData.reduce((total, room) => {
//     const booked = room.bookings[date] || 0;
//     return total + (room.total_rooms - booked);
//   }, 0);
// };

const Dashboard = () => {
  const [availableRooms, setAvailableRooms] = useState(0);
  const [roomsData, setRoomsData] = useState([]);
  const [forecast, setForecast] = useState([]);
  const today = "21032025"; // Simulating today's date

  const getTotalAvailableRooms = (rooms) => {
    return rooms.reduce((total, room) => {
      return total + room.available;
    }, 0);
  };

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        console.warn("No admin token found");
        window.location.href = "/login";
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/listRoomTypes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!Array.isArray(res.data)) {
          console.error("Invalid room data format:", res.data);
          return;
        }

        setRoomsData(res.data);
        const available = getTotalAvailableRooms(res.data);
        setAvailableRooms(available);
      } catch (err) {
        console.error("Failed to fetch room types", err);
      }
    };

    fetchRoomTypes();
  }, []);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/mock-demand`);
        setForecast(res.data.forecast);
      }
      catch (err) {
        toast.error("Analytics fetching failed..!!");
        console.error(err);
      }
    };
    fetchForecast();
  }, []);


  return (
    <div className="pb-6">
      {/* Box for displaying total available rooms */}
      <div className="w-full bg-slate-200 text-center flex-row shadow-lg p-3 rounded-lg mb-3">
        <h2 className="text-lg font-semibold">Rooms Available</h2>
        <p className="text-base font-normal">{availableRooms}</p>
      </div>

      {/* Extended Section - Room Details */}
      <div className="bg-slate-200 shadow-lg p-3 md:p-7 rounded-lg h-[40vh] mb-6">
        <h2 className="text-lg font-semibold mb-4">Room Types</h2>

        {/* Labels Row */}
        <div className="grid grid-cols-3 md:grid-cols-4 text-gray-700 font-semibold py-2 border-b border-gray-400">
          <span>Room Type</span>
          <span>Price Per Day</span>
          <span className="hidden md:inline">Total Rooms</span> {/* Hide on small screens */}
          <span>Available Rooms</span>
        </div>

        {/* Room Data Rows */}
        {roomsData.map((room, i) => {

          return (
            <div
              key={i}
              className="grid grid-cols-3 md:grid-cols-4 py-3 border-b border-gray-300 font-normal text-gray-800"
            >
              <span>{room.type}</span>
              <span>₹{room.price}</span>
              <span className="hidden md:inline">{room.total}</span>
              <span>{room.available}</span>
            </div>
          );
        })}
      </div>

      <div className="w-full bg-slate-200 text-center flex-row shadow-lg p-4 rounded-lg mb-3">
        <h2 className="text-lg font-semibold">Demand Forecast (Rooms Booked per Day)</h2>
      </div>

      <div className="bg-slate-200 shadow-lg p-2 md:p-7 rounded-lg h-[50vh] flex justify-center">
        <div><ForecastChart data={forecast} /></div>
          
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
export default Dashboard;
