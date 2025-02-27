"use client";
import { useEffect, useState } from "react";

import Header from "@/components/Header";
import AuthComponent from "@/components/AuthComponent";
import { useUser } from "@/contexts/userContext";

const About = () => {
  const { isLogined } = useUser();
  const [isUserLogined, setIsUserLogined] = useState(false);
  
  useEffect(() => {
    setIsUserLogined(isLogined);
  }, [isLogined]);


  console.log("isUserLogined", isUserLogined);
  console.log("isLogined", isLogined);
  
  

  return (
    <div className="flex flex-col ">
      <Header />
      <div className="w-screen px-5   flex  align-center justify-center">
        {!isUserLogined && <AuthComponent />}
      </div>
      <div className="w-screen px-5 mt-10  flex  align-center justify-center">
        <h1 className="text-5xl w-full text-center font-semibold">About Us</h1>
      </div>
    </div>
  );
};

export default About;
