import React from 'react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ManagerSkeleton = () => {
  const cards = Array(7).fill(null);

  return (
    <div className="w-full min-h-screen bg-custom-color bg-[radial-gradient(circle_at_top_left,#fff8ef_20%,#fce8d5_50%,#fef2e3_90%)] px-6 py-10 space-y-8">
      
      {/* Top full-width skeleton (like banner or heading area) */}
      <div className="w-full md:h-[45vh] h-auto  bg-gray-300 animate-pulse rounded-lg shadow" />

      {/* Horizontal scrollable card skeletons */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {cards.map((_, index) => (
          <div
            key={index}
            className="min-w-[250px] max-w-[500px] animate-pulse bg-gray-300 rounded-lg shadow p-4 flex-shrink-0 space-y-4"
          >
            <div className="h-40 bg-gray-300 rounded-md" />
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-8 bg-gray-300 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerSkeleton;