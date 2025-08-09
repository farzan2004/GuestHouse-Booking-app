import React from "react";

const ProfileSkeleton = () => {
  const shimmer = "bg-gray-200 animate-pulse rounded";

  return (
    <div className="flex flex-col min-h-screen w-full md:flex-row gap-6">
      {/* Sidebar Skeleton */}
      <div className="w-full md:w-[30%] max-w-[250px] bg-[#f8e1c4] shadow-lg rounded-lg p-6 mx-auto md:ml-6 mt-4 h-[65vh] space-y-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className={`${shimmer} h-10 w-full`} />
        ))}
      </div>

      {/* Main Profile Skeleton */}
      <div className="bg-gray-100 p-6 shadow-lg rounded-lg w-full space-y-6 mt-4">
        {/* Heading */}
        <div className={`${shimmer} h-6 w-48`} />

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${shimmer} h-10 w-full`} />
          <div className={`${shimmer} h-10 w-full`} />
          <div className={`${shimmer} h-10 w-full`} />
        </div>

        {/* DOB, Gender, ID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${shimmer} h-10 w-full`} />
          <div className={`${shimmer} h-10 w-full`} />
          <div className={`${shimmer} h-10 w-full`} />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${shimmer} h-10 w-full`} />
          <div className={`${shimmer} h-10 w-full`} />
          <div className={`${shimmer} h-10 w-full`} />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${shimmer} h-10 w-full`} />
          <div className={`${shimmer} h-10 w-full`} />
          <div className={`${shimmer} h-10 w-full`} />
        </div>

        {/* Button */}
        <div className={`${shimmer} h-10 w-32 ml-auto`} />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
