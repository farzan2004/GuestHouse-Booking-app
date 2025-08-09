import React from 'react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const BookPageSkeleton = () => {
  const shimmer = "bg-gray-200 animate-pulse rounded";

  return (
    <div className="relative pt-[65px] min-h-screen flex flex-col">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#fff8ef_20%,#fce8d5_50%,#fef2e3_90%)]" />

      {/* Room Image + Greeting */}
      <div className="relative flex justify-center items-center md:h-[70vh] h-[50vh] md:px-[35px] px-[10px] py-[5px]">
        <div className="w-full h-full object-cover blur-[2px] bg-gray-300 animate-pulse" />

        <div className="absolute bottom-20 md:left-16 left-8 text-white p-4 text-right">
          <div className="h-10 w-32 md:h-20 md:w-64 bg-gray-300 animate-pulse rounded mb-2" />
          <div className="h-10 w-32 md:h-20 md:w-64 bg-gray-300 animate-pulse rounded" />
        </div>

        {/* Booking Box Skeleton */}
        <div className="absolute left-1/2 bottom-[-220px] md:bottom-[-50px] transform -translate-x-1/2 w-[90%] md:w-[80%] max-w-[900px] bg-white shadow-lg rounded-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-300 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-full md:w-1/4 p-4 space-y-2">
              <div className="h-4 w-24 bg-gray-300 animate-pulse rounded" />
              <div className="h-10 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
          <div className="w-full md:w-1/4 flex items-center justify-center p-4 bg-gray-300 animate-pulse rounded-b-2xl md:rounded-l-none md:rounded-r-2xl" />
        </div>
      </div>

      {/* Price Bottom Right */}
      <div className="flex justify-end mt-1 pr-4">
        <div className="bg-gray-300 animate-pulse h-6 w-24 rounded-md" />
      </div>

      {/* Optional Sidebar Skeleton */}
      <div className="fixed top-0 right-0 w-[80%] sm:w-[60%] md:w-[40%] lg:w-[30%] h-full bg-gray-100 p-4 z-50 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-40 bg-gray-300 animate-pulse rounded" />
          <div className="h-5 w-5 bg-gray-300 animate-pulse rounded-full" />
        </div>

        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-4 w-32 bg-gray-300 animate-pulse rounded mb-2" />
            <div className="h-10 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-10 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-10 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-10 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}

        <div className="w-full h-10 bg-green-300 animate-pulse rounded mt-4" />
      </div>
    </div>
  );
};

export default BookPageSkeleton;
