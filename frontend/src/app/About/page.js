"use client";
import {  useEffect, useState } from "react";

import Header from "@/components/Header";
import AuthComponent from "@/components/AuthComponent";


const About = () => {
  const [isLogined, setIsLogined] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogined(true);
    }
  }, []);

  return (
    <div className="flex flex-col ">
      <Header />
      <div className="w-screen px-5   flex  align-center justify-center">
        {!isLogined && <AuthComponent setIsLogined={setIsLogined} />}
      </div>
      <div className="w-screen px-5 mt-10  flex  align-center justify-center">
        <h1 className="text-5xl w-full text-center font-semibold">About Us</h1>
      </div>
      
    </div>
  );
};

export default About;
