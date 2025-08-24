import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const jwtToken = localStorage.getItem("guestToken");

    // Check authentication status
    useEffect(() => {
        if (currentUser || jwtToken) {
            setIsAuthenticated(true);
        }
    }, [currentUser]);

    const handleNavigation = (option) => {
        if (option === "Campus Guide") {
            navigate("/campus-guide");
        } else if (option === "Profile") {
            navigate(jwtToken || currentUser ? "/profile" : "/login");
        } else if (option === "Bus Service") {
            navigate("/bus-service");
        }
        else {
            navigate(`/${option.toLowerCase()}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 z-50 bg-custom-color flex justify-between items-center px-2 md:px-4 h-16 w-full border-b-2 border-gray-300 shadow-lg">
            {/* Left Logo & Name Section */}
            <div className="flex items-center border-r-2 h-full border-gray-300 px-2">
                <span className="font-semibold text-lg font-cinzel">BITStay</span>
            </div>

            {/* Right Navigation Menu */}
            <ul className="pl-2 flex items-center gap-6 text-gray-900">
                {["Home", "Profile"].map((item, index) => (
                    <li key={index} className="group relative w-[75px] text-center">
                        <button
                            onClick={() => handleNavigation(item)}
                            className="block px-3 py-2 transition-all duration-200 group-hover:font-semibold"
                        >
                            {item === "Profile" ? (isAuthenticated ? "Profile" : "Login") : item}
                        </button>
                        <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                    </li>
                ))}

                {/* Hamburger Icon (Toggles to Close Icon) */}
                <li className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="focus:outline-none transition-transform duration-300 ease-in-out"
                    >
                        <img
                            src={menuOpen ? "/close.svg" : "/hamburger.svg"}
                            alt="menu"
                            className={`w-6 h-6 transform transition-transform duration-500 ease-in-out ${menuOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    <div
                        className={`absolute right-0 mt-3 bg-custom-color shadow-lg rounded-lg mdl:w-[210px] w-36 text-gray-900 py-2 border border-gray-300 transition-all duration-500 ease-in-out ${menuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                        style={{ zIndex: 1000 }}
                    >
                        {["Campus Guide", "Bus Service"].map((option, index) => (
                            <div
                                key={index}
                                className="group px-4 py-2 relative cursor-pointer transition-colors duration-200 hover:bg-gray-200"
                                onClick={() => {
                                    handleNavigation(option);
                                    setMenuOpen(false);
                                }}

                            >
                                {option}
                                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                            </div>
                        ))}
                    </div>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;