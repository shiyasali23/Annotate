"use client";

import Link from "next/link";
import { useState } from "react";
import Message from "./components/Message";
import CameraModule from "./components/CameraModule";

export default function Home() {
  const [cameraAllow, setCameraAllow] = useState(false);
  const [message, setMessage] = useState("");

  const handleScanClick = (event) => {
    event.preventDefault();
    document.getElementById("scan-section").scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="w-full" style={{ scrollBehavior: "smooth" }}>
      {message && <Message onClose={() => setMessage("")} message={message} />}
      {/* First full-screen section */}
      <section
        className={`min-h-screen w-full flex items-center justify-center p-4 bg-white`}
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4">
            What are we?
          </h1>

          <div className="flex flex-col gap-8 sm:gap-12 md:gap-16 lg:gap-20 p-4 sm:p-6 md:p-8 lg:p-9">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
              We are a platform that helps people stay healthy.{" "}
              <Link href="/about" className="text-blue-500 underline">
                Know more
              </Link>
            </h2>

            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl ml-4 sm:ml-6 md:ml-8">
              To get started we need to.{" "}
              <a
                id="scan-link"
                href="#scan-section"
                onClick={handleScanClick}
                className="inline-block px-2 py-1 sm:px-3 sm:py-2 border-2 sm:border-4 text-xs sm:text-sm md:text-base border-black font-semibold text-black rounded-sm hover:bg-black hover:text-white focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                Open Your Camera
              </a>
            </h3>
          </div>
        </div>
      </section>

      {/* Second full-screen section */}
      <section
        id="scan-section"
        className={`min-h-screen w-full flex items-center justify-center p-4 bg-white${
          cameraAllow ? " bg-gray-100" : ""
        }`}
        style={{ scrollMarginTop: "0px" }}
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-8">
          {/* Camera module container with centered alignment */}
          <div className="w-full flex justify-center items-center">
            {/* Camera module with scaled dimensions */}
            <CameraModule
              cameraAllow={cameraAllow}
              setCameraAllow={setCameraAllow}
              isFromresult={false}
            />
          </div>
          <button
            className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-lg font-medium"
            onClick={() => setCameraAllow(!cameraAllow)}
          >
            {cameraAllow ? "Stop Camera" : "Start Camera"}
          </button>
        </div>
      </section>
    </main>
  );
}
