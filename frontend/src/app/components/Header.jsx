"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaUser, FaCaretDown } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import Link from "next/link";
import { useData } from "@/contexts/dataContexts";

const Header = () => {
  const { servicesArray } = useData();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference for dropdown menu
  const buttonRef = useRef(null); // Reference for dropdown button

  // Toggle dropdown when clicking on the button
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Handle mouse enter and leave to open/close dropdown
  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };



  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setDropdownOpen(false);
    }
  };

  // Set up the event listener for clicks outside
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="  w-full   h-[8vh] xl:h-[12vh] xl:mb-2    flex justify-center items-center  relative">
      {/* Logo section */}
      <div className="text-xl font-semibold flex xl:justify-center xl:items-center w-full sm:text-left ">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Logo" width={70} height={70} />
          <h1 className="xl:text-6xl text-2xl font-semibold xl:font-bold text-right">
            Biolabs
          </h1>
        </Link>
      </div>

      {/* Right section */}
      <div className="absolute    right-4 flex items-center gap-5 xl:gap-20">
        <div
          className="relative   group"
          onMouseEnter={handleMouseEnter}
        >
          <button
            id="dropdownButton"
            onClick={toggleDropdown}
            ref={buttonRef}
            className={`group relative flex items-center justify-center rounded-md text-xs sm:text-xs md:text-base px-2 py-2 xl:px-4 xl:py-2  bg-black text-white font-semibold text-center overflow-hidden border-2 border-black transition-all duration-300 hover:bg-white`}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <span className="relative z-10 group-hover:text-black transition-colors duration-500 ease-out">
              Services
            </span>
            <FaCaretDown
              size={15}
              className="relative z-10 ml-1 group-hover:text-black transition-colors duration-500 ease-out"
            />
            <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500 ease-out"></span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              id="dropdownMenu"
              ref={dropdownRef}
              className="absolute right-0 mt-2 bg-white bg-opacity-90 text-black rounded-lg shadow-lg w-56 z-10 border border-gray-200"
              onMouseEnter={handleMouseEnter} 
            >
              <ul className="py-2">
                {servicesArray.map((service, index) => (
                  <Link
                  key={index}
                  href={`/${service[1]}`}
                  className="block px-4 py-2 hover:bg-gray-200 rounded transition duration-200"
                >
                  {service[0]}
                </Link>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center gap-5 sm:gap-0 md:gap-7">
          <FaUser size={25} />
          <MdLogout size={25} />
        </div>
      </div>
    </header>
  );
};

export default Header;
