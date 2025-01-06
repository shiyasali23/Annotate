"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaUser, FaCaretDown } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import Link from "next/link";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setDropdownOpen(false);
  };

  return (
    <header className="w-full h-[15%] flex border justify-between items-center">
    {/* Logo Section */}
    <div className="flex items-center justify-center sm:justify-start flex-grow sm:ml-4 md:justify-center">
      <Link href="/" className="flex items-center">
        <Image src="/logo.svg" alt="Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold ml-2">Biolabs</h1>
      </Link>
    </div>
  
    {/* Profile and Logout */}
    <section className="flex items-center gap-4">
      {/* Dropdown Button */}
      <div className="relative ml-4" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button
          id="dropdownButton"
          onClick={toggleDropdown}
          className="relative flex items-center justify-center rounded-md text-sm sm:text-base px-4 py-2 bg-black text-white font-semibold text-center overflow-hidden group border-2 border-black transition-all duration-300"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          <span className="relative z-10 group-hover:text-black transition-colors duration-300 ease-out">
            Services
          </span>
          <FaCaretDown className={`ml-2 text-sm sm:text-base transition-colors duration-300 ease-out ${dropdownOpen ? 'text-black' : 'text-white'}`} />
          <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></span>
        </button>
  
        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            id="dropdownMenu"
            className="absolute right-0 mt-2 bg-white bg-opacity-90 text-black rounded-lg shadow-lg w-56 z-10 border border-gray-200"
          >
            <ul className="py-2">
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-200 rounded transition duration-200"
                >
                  Food Recommendations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-200 rounded transition duration-200"
                >
                  Disease Detection
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-200 rounded transition duration-200"
                >
                  Analytics Platform
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-200 rounded transition duration-200"
                >
                  Diagnostics Center
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
      <FaUser size={35} />
      <MdLogout size={35} />
    </section>
  </header>
  
  
  );
};

export default Header;
