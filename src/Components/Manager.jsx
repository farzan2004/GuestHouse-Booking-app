import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ManagerSkeleton from '../Skeletons/managerSkeleton';


const Manager = () => {

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/rooms");
      if (res.data.success) {
        setLoading(false);
        setRooms(res.data.rooms);
      } else {
        console.error("Error:", res.data.message);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };
  fetchRooms();
}, []);


  const handleBooking = (room) => {
    navigate(`/bookpage/${room._id}`); // Pass room ID in URL
  };

  const [startIndex, setStartIndex] = useState(0);
  const visibleRooms = 3;

  const handleNext = () => {
    if (startIndex + visibleRooms < rooms.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };
  if(loading){
    return(
      <ManagerSkeleton/>
    )
  }
  return (
    <div className='relative pt-[65px]'>
      <div className='flex justify-center absolute inset-0 -z-10 min-h-screen w-full bg-custom-color bg-[radial-gradient(circle_at_top_left,#fff8ef_20%,#fce8d5_50%,#fef2e3_90%)]' style={{ pointerEvents: "none", zIndex: -1 }}></div>
      <img src='/background_img.jpg' alt='BIT Guest_House' className='w-[calc(100%-70px)] mx-auto md:h-[75vh] h-auto  object-cover filter md:blur-[2px] blur-[1px]' />
      <span
        className='absolute md:top-[16rem] top-32 left-1/2 transform -translate-x-1/2 text-center md:text-7xl text-3xl md:font-extrabold font-bold tracking-wider'
        style={{
          color: '#fff8dc',
          fontFamily: 'monospace',
          textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
          letterSpacing: '0.1em',
        }}
      >
        Welcome to IGH
      </span>
      <div className='flex items-start max-w-[1380px] md:text-4xl text-xl drop-shadow-md md:ml-[72px] ml-4 md:p-[54px] p-5'>
        <span className='playfair text-custom-black'>Our Guest Rooms</span>
      </div>

      {/* Grid for small screens, no slider */}
      <div className='md:hidden grid grid-cols-1 gap-6 px-10 pb-10 rounded-lg'>
        {rooms.map((room) => (
          <div key={room._id} className='group relative cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-500'>
            <div className='overflow-hidden'>
              <img
                src={room.images[0] || "/fallback.jpg"}
                alt={room.title}
                className='w-full h-60 object-cover transform rounded-xl  transition-transform duration-500 group-hover:scale-110' onClick={() => handleBooking(room)}
              />
            </div>
            <div className='p-4 bg-custom-color text-center' onClick={() => handleBooking(room)}>

              <h3 className='text-lg font-semibold text-custom-black'>{room.type}</h3>
              <p className='text-sm font-normal text-custom-black mt-1'>₹{room.price} / night</p>
              <p className='text-gray-500 text-sm mt-2'>{room.description}</p>
              <button onClick={() => handleBooking(room)} className="block mt-3 text-gray-500 text-sm font-medium relative w-max mx-auto no-underline hover: text-black transition inline-block group">
                Book Now
                <span className='absolute left-0 bottom-0 h-[1px] w-full bg-black transition-all duration-500 group-hover:w-0'></span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slider for larger screens */}
      <div className='hidden md:block relative px-10 pb-10 overflow-hidden'>
        {/* Left Button */}
        <button
          onClick={handlePrev}
          className='absolute left-20 top-1/2 transform -translate-y-1/2 bg-gray-600 rounded-full shadow-md p-3 text-white hover:shadow-lg transition-shadow duration-300 z-10 disabled:opacity-50'
          disabled={startIndex === 0}
        >
          ‹
        </button>

        {/* Slider Content */}
        <div className='overflow-hidden'>
          <div
            className='flex gap-6 md:ml-[82px] transition-transform rounded-lg duration-500 ease-in-out'
            style={{ transform: `translateX(-${startIndex * (100 / visibleRooms)}%)` }}
          >
            {rooms.map((room) => (
              <div key={room._id} className='md:min-w-[calc(100%/3)] min-w-full group relative cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-500'>
                <div className='overflow-hidden'>
                  <img
                    src={room.images[0] || "/fallback.jpg"}
                    alt={room.type}
                    className='w-full h-60 object-cover rounded-lg transform transition-transform duration-500 group-hover:scale-110' onClick={() => handleBooking(room)}
                  />
                </div>
                <div className='p-4 bg-custom-color text-center' onClick={() => handleBooking(room)}>
                  <h3 className='text-xl font-semibold text-custom-black'>{room.type}</h3>
                  <p className='text-base font-medium text-custom-black mt-1'>₹{room.price} /night</p>
                  <p className='text-gray-600 mt-2'>{room.description}</p>
                  <button onClick={() => handleBooking(room)} className="block mt-3 text-black text-lg font-medium relative w-max mx-auto no-underline hover: text-gray-600 transition inline-block group">
                    Book Now
                    <span className='absolute left-0 bottom-0 h-[1px] w-full bg-black transition-all duration-500 group-hover:w-0'></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Button */}
        <button
          onClick={handleNext}
          className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-600 rounded-full shadow-md p-3 text-white hover:shadow-lg transition-shadow duration-300 z-10 disabled:opacity-50'
          disabled={startIndex + visibleRooms >= rooms.length}
        >
          ›
        </button>
      </div>
    </div>

  );
}

export default Manager;
