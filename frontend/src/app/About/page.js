"use client";

import Header from "../components/Header";
import { useData } from "@/contexts/dataContexts";
import { useState } from "react";
import Button from "../components/Button";
import Message from "../components/Message";

const About = () => {
  const { companyName } = useData();
  const [isSignUp, setIsSignUp] = useState(true);
  const [message, setMessage] = useState("");

  const inputsArray = [
    ["First Name", "first_name"],
    ["Last Name", "last_name"],
    ["Email", "email"],
    ["Password", "password"],
  ];

  return (
    <div className="h-screen flex flex-col ">
      <Header />
      <div className="w-screen h-full xl:h-screen    flex  items-center justify-center xl:px-32">
        {/* Text Section */}
        <div className="w-full      flex items-center p-4 lg:p-9">
          <h1 className="tracking-tight   leading-snug text-left text-xs sm:text-sm md:text-base lg:text-xl font-medium">
            <span className="cursor-pointer font-bold text-sm sm:text-base">
              {companyName}
            </span>{" "}
            is designed to manage health. We offer various services from{" "}
            <span className="cursor-pointer font-semibold underline">
              Recommending Food
            </span>
            ,{" "}
            <span className="cursor-pointer font-semibold underline">
              Detection of diseases
            </span>{" "}
            by analyzing biochemicals. We also provide an{" "}
            <span className="cursor-pointer font-semibold underline">
              Analytics Platform
            </span>{" "}
            to get meaningful insights about health conditions. Additionally, we
            developed a{" "}
            <span className="cursor-pointer font-semibold underline">
              Diagnostics Center
            </span>{" "}
            which can detect illness based on symptoms and provide meaningful
            precautions. Our{" "}
            <span className="cursor-pointer font-semibold underline">
              Vision Model
            </span>{" "}
            can collect various data points.
          </h1>
        </div>

        {/* Form Section */}
        <div className="w-full h-screen  flex items-center justify-center p-2">
  <div className="w-full bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
    {/* Form */}
    <div className="p-6 space-y-4 sm:p-8 h-auto sm:h-[70%] md:h-auto">
      <h1 className="text-xl font-bold text-center md:text-2xl text-gray-900 dark:text-white">
        {isSignUp ? "Sign up " : "Login"}
      </h1>
      <form className="space-y-4">
        {inputsArray.map(([label, name]) => (
          <div key={name}>
            {isSignUp || (name !== "first_name" && name !== "last_name") ? (
              <input
                type={name === "password" ? "password" : "text"}
                name={name}
                id={name}
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                required
                placeholder={label}
              />
            ) : null}
          </div>
        ))}
        {isSignUp && (
          <div>
            <select
              id="gender"
              name="gender"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              required
            >
              <option value="" disabled selected>
                Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        )}
        <Button className="mx-auto" text={isSignUp ? "Sign Up" : "Login"} />
        <p className="text-sm text-center font-light text-gray-500 dark:text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            className="cursor-pointer font-bold text-primary-800 hover:underline dark:text-primary-500"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default About;
