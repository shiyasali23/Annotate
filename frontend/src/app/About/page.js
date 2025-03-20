"use client";
import { useEffect, useState } from "react";

import Header from "@/components/Header";
import AuthComponent from "@/components/AuthComponent";
import { useUser } from "@/contexts/userContext";
import AboutUs from "@/components/AboutUs";

const About = () => {
  const { isLogined } = useUser();
  const [isUserLogined, setIsUserLogined] = useState(false);

  useEffect(() => {
    setIsUserLogined(isLogined);
  }, [isLogined]);

  return (
    <div className="flex flex-col ">
     
      <div className="w-screen px-5 flex  align-center justify-center">
        {!isUserLogined && <AuthComponent />}
      </div>
      <div className="w-screen flex  align-center justify-center">
        <AboutUs />
      </div>
    </div>
  );
};

export default About;