"use client";

import Link from "next/link";
import Image from "next/image";
import CameraModule from "./components/CameraModule";

export default function Home() {
  const handleScanClick = (event) => {
    event.preventDefault();
    document.getElementById("vision-section").scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="w-full" style={{ scrollBehavior: "smooth" }}>
      <div className="fixed top-0  left-0 right-0 z-10 flex justify-center items-center w-full bg-white py-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Logo" width={70} height={70} />
          <h1 className="xl:text-6xl sm:text-xl font-bold text-right">Biolabs</h1>
        </Link>
      </div>

      {/* First full-screen section */}
      <section className="min-h-screen flex items-center justify-center xl:px-32 border-gray-300 bg-white relative overflow-hidden">
  <div className="w-full max-w-6xl mx-auto flex flex-col justify-center items-center text-right gap-5 lg:gap-10">
    <h1 className="text-5xl lg:text-9xl w-full text-center font-bold">
      {Array.from("Who we are?").map((char, i) => (
        <span
          key={i}
          className="animate-char-reveal text-white"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {char}
        </span>
      ))}
    </h1>

    <h2 className="w-full text-sm  lg:text-2xl font-semibold text-center">
      {Array.from("We help people to stay healthy. ").map((char, i) => (
        <span
          key={i}
          className="animate-char-reveal text-white"
          style={{ animationDelay: `${(i * 20) + 10}ms` }}
        >
          {char}
        </span>
      ))}
     <Link href="/About">
     {Array.from("Know more").map((char, i) => (
        <span
          key={i}
          className="animate-char-reveal lg:text-3xl underline  text-white"
          style={{ animationDelay: `${(i * 20) + 10}ms` }}
        >
          {char}
        </span>
      ))}
     </Link>
    </h2>

    <h3 className="text-md lg:text-2xl flex items-center gap-1 font-semibold text-center">
  {Array.from("To get started").map((char, i) => (
    <span
      key={i}
      className="animate-char-reveal text-white"
      style={{ animationDelay: `${i * 50 + 100}ms` }}
    >
      {char}
    </span>
  ))}
  <span
    onClick={handleScanClick}
    className="relative align-end px-3 py-1.5 sm:px-4 sm:py-2 bg-black text-white text-sm sm:text-base font-semibold cursor-pointer overflow-hidden group border border-2 border-black"
  >
    <span className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
    <span className="relative group-hover:text-black transition-colors duration-500 ease-out">
      Try  vision
    </span>
  </span>
</h3>

  </div>
</section>


      <section className="h-screen flex items-center" id="vision-section">
        <CameraModule />
      </section>
    </main>
  );
}
