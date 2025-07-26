import React from 'react'

const Footer = () => {
    return (
        <div className='bg-[#303131] w-full min-h-[200px] md:h-[180px] flex flex-col md:flex-row justify-between items-start md:items-center px-6 md:px-16 md:py-8 py-2 text-white'>
            {/* Left Section */}
            <div className='w-full md:w-1/3 text-left space-y-1'>
                <h3 className='text-lg md:text-xl font-bold font-cinzel'>BITStayGo</h3>
                <p className='text-xs md:text-sm text-gray-300'>Birla Institute of Technology, Mesra</p>
                <p className='text-xs md:text-sm text-gray-300'>Main Campus, Ranchi</p>
            </div>

            {/* Middle Section */}
            <div className='w-full md:w-1/3 text-left md:text-center space-y-1 md:space-y-2 mt-2 md:mt-0'>
                <p className='text-base md:text-lg font-semibold'>Admin Email</p>
                <div className='flex justify-center space-x-3'>
                <p className='text-xs md:text-sm text-gray-300'>igh@bitmesra.ac.in</p>
                <p className='text-xs md:text-sm text-gray-300'>ar.ap@bitmesra.ac.in</p>
                </div>
                <p className='text-base md:text-lg font-semibold mt-2'>Contact</p>
                <div className='flex justify-center space-x-3'>
                <p className='text-xs md:text-sm text-gray-300'>+91 8084995830</p>
                <p className='text-xs md:text-sm text-gray-300'>+91 9163636375</p>
                </div>
            </div>

            {/* Right Section */}
            <div className='w-full md:w-1/3 text-left md:text-right space-y-1 mt-2 md:mt-0'>
                {/* FAQs & Virtual Assistant Link */}
                {/* <a href='faq-ai' className='relative md:text-sm text-xs text-gray-300 cursor-pointer hover:text-white transition inline-block group'>
                    FAQs & Virtual Assistant
                    <span className='absolute left-0 bottom-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full'></span>
                </a>
                <div className='md:h-1 h-[1px]'></div> */}

                {/* Terms and Conditions Link */}
                <a href='tnc' className='relative md:text-sm text-xs text-gray-300 cursor-pointer hover:text-white transition inline-block group'>
                    Terms and Conditions
                    <span className='absolute left-0 bottom-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full'></span>
                </a>
            </div>
        </div>
    )
}

export default Footer
