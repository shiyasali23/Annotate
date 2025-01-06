"use client";

import Link from "next/link";
import { useState } from "react";
import Message from "./components/Message";
import CameraModule from "./components/CameraModule";
import Button from "./components/Button";
import Image from "next/image";

export default function Home() {
  const [cameraAllow, setCameraAllow] = useState(false);
  const [message, setMessage] = useState("");

  const handleScanClick = (event) => {
    event.preventDefault();
    document.getElementById("scan-section").scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleStartCamera = () => {
    setCameraAllow(!cameraAllow);
  };

  return (
    <main className="w-full" style={{ scrollBehavior: "smooth" }}>
      <div className="fixed top-0 left-0 right-0 z-10 flex justify-center items-center w-full bg-white py-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Logo" width={70} height={70} />
          <h1 className="xl:text-6xl sm:text-xl font-bold text-right">
            Biolabs
          </h1>
        </Link>
      </div>

      {message && <Message onClose={() => setMessage("")} message={message} />}
      {/* First full-screen section */}
      <section className="min-h-screen flex items-center justify-center xl:px-32 border-gray-300">
        <div className="w-full max-w-6xl mx-auto flex flex-col justify-center items-center text-right gap-5 lg:gap-10">
          <h1 className="text-5xl lg:text-9xl w-full text-center   font-bold ">
            Who we are?
          </h1>

          <h2 className="  w-full  text-sm lg:text-2xl font-semibold  text-center">
            We help people to stay healthy.{" "}
            <Link href="/about" className=" text-bold text-md lg:text-3xl underline">
              Know more
            </Link>
          </h2>

          <h3 className="text-md lg:text-2xl   flex items-center gap-2    font-semibold text-center">
            To get started{" "}
            <span
              onClick={handleScanClick}
              className=" relative align-end px-3 py-1.5 sm:px-4 sm:py-2 bg-black text-white text-sm sm:text-base font-semibold cursor-pointer overflow-hidden group border border-2 border-black"
            >
              <span className=" absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-300 ease-out"></span>
              <span className=" relative group-hover:text-black transition-colors duration-300 ease-out">
                Open Your Camera
              </span>
            </span>
          </h3>
        </div>
      </section>

      {/* Second full-screen section */}
      <section
        id="scan-section"
        className={`min-h-screen flex bg-white ${
          cameraAllow ? "bg-gray-100" : ""
        }`}
        style={{ scrollMarginTop: "0px" }}
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          {/* Camera module container with centered alignment */}
          <div className="w-full flex justify-center items-center">
            {/* Camera module with scaled dimensions */}
            <CameraModule
              cameraAllow={cameraAllow}
              setCameraAllow={setCameraAllow}
              isFromresult={false}
            />
          </div>
          <Button
            text={cameraAllow ? "Stop Camera" : "Start Camera"}
            onClick={handleStartCamera}
            className="relative px-8 py-3 bg-black text-white rounded-md group overflow-hidden transition-colors duration-300 ease-out font-medium border border-2 border-black"
          />
        </div>
      </section>
    </main>
  );
}
