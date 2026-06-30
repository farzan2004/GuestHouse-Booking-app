import { useState } from "react";
import axios from "axios";

const AddRoomsRangeForm = () => {
  const [type, setType] = useState("Suite");
  const [startNumber, setStartNumber] = useState("");
  const [endNumber, setEndNumber] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState("Available");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/add-rooms-range`,
        {
          type,
          startNumber: Number(startNumber),
          endNumber: Number(endNumber),
          capacity: Number(capacity),
          status,
        }
      );

      alert(res.data.message);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add rooms");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 flex flex-col gap-3 max-w-md mx-auto"
    >
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option>Suite</option>
        <option>Large</option>
        <option>Regular</option>
        <option>Small</option>
        <option>Mass Bookings</option>
      </select>

      <input
        type="number"
        placeholder="Start Room Number"
        value={startNumber}
        onChange={(e) => setStartNumber(e.target.value)}
      />

      <input
        type="number"
        placeholder="End Room Number"
        value={endNumber}
        onChange={(e) => setEndNumber(e.target.value)}
      />

      <input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>Available</option>
        <option>Maintenance</option>
        <option>Booked</option>
      </select>

      <button
        type="submit"
        className="bg-green-600 text-white py-2 rounded"
      >
        Add Rooms
      </button>
    </form>
  );
};

export default AddRoomsRangeForm;