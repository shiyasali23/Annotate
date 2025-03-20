"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import { RiMentalHealthFill } from "react-icons/ri";
import { HiUserGroup } from "react-icons/hi";

import { useUser } from "@/contexts/userContext";
import ServicesDropDown from "./ServicesDropDown";

const Header = () => {
  const { logOutUser, isLogined } = useUser();
  const router = useRouter();

  return (
    <header className="w-full sticky z-50 top-0 h-[8vh] xl:h-[12vh] xl:mb-2 flex justify-center items-center bg-white">
      {/* Logo section */}
      <div className="text-xl font-semibold flex xl:justify-center xl:items-center w-full sm:text-left">
        <Link href="/" className="flex items-center">
          <Image src="images/logo.svg" alt="Logo" width={75} height={75} />
          <h1 className="xl:text-6xl text-2xl font-semibold xl:font-bold text-right">
            Biolabs
          </h1>
        </Link>
      </div>

      {/* Right section */}
      <div className="absolute right-8 flex items-center gap-3 gap-5 xl:gap-16">
        <ServicesDropDown isLogined={isLogined} />
        <div className="flex items-center gap-5 xl:gap-10">
          <HiUserGroup
            className="cursor-pointer text-3xl xl:text-4xl font-bold"
            onClick={() => router.push("/about")}
          />
          {isLogined && (
            <RiMentalHealthFill
              className="cursor-pointer text-3xl xl:text-4xl font-bold"
              onClick={() => router.push("/profile")}
            />
          )}
          {isLogined && (
            <FaSignOutAlt
              className="cursor-pointer text-3xl xl:text-4xl font-bold"
              onClick={() => logOutUser()}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
