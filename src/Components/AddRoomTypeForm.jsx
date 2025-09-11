// AddRoomTypeForm.jsx
import React, { useState } from "react";
import axios from "axios";

const AddRoomTypeForm = () => {
  const [type, setType] = useState("Deluxe");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("type", type);
    formData.append("price", price);
    formData.append("description", description);
    images.forEach((img) => formData.append("images", img));

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/add-room-type`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Room Type Added");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 max-w-md mx-auto">
      <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Room Type" />
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input type="file" multiple onChange={(e) => setImages([...e.target.files])} />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
};

export default AddRoomTypeForm;
