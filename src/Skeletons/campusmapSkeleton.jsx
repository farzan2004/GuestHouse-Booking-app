import React from 'react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const CampusSkeleton = () => {
    const shimmer = "bg-gray-200 animate-pulse rounded";

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8ef_20%,#fce8d5_50%,#fef2e3_90%)] px-4 py-6">
            <div className="max-w-5xl mx-auto flex flex-col items-center space-y-3 mt-12">

                {/* Title shimmer */}
                <div className="animate-pulse bg-white rounded-lg shadow h-40 w-full mb-8" />

                {/* Input box shimmer */}
                <div className="bg-slate-200 p-6 shadow-lg rounded-lg w-full flex flex-col space-y-3 items-center">
                    <div className={`${shimmer} h-10 w-full max-w-md`} />
                </div>

                {/* AI suggestions shimmer */}
                <div className={`${shimmer} w-full relative max-w-md h-36 p-4`} />

                {/* Dropdown shimmer */}
                <div className={`${shimmer} w-full max-w-sm h-10`} />

                {/* Search input in dropdown shimmer */}
                <div className={`${shimmer} sticky top-0 h-10 w-full max-w-sm`} />

                {/* Map shimmer */}
                <div className={`${shimmer} w-full h-[400px]`} />
            </div>
        </div>
    );
};

export default CampusSkeleton;
