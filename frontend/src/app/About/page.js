"use client";

import Header from "../components/Header";
import { useData } from "@/contexts/dataContexts";
import { useState } from "react";
import Button from "../components/Button";

const About = () => {
  const { companyName } = useData();
  const [isSignUp, setIsSignUp] = useState(true);

  const inputsArray = [
    ["First Name", "first_name"],
    ["Last Name", "last_name"],
    ["Email", "email"],
    ["Password", "password"],
    ["Gender", "gender"],
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="w-screen h-screen flex flex-col xl:flex-row items-center justify-center xl:px-32">
        <div className="    w-full h-screen flex items-center justify-center p-9 xl:p-0">
          <h1 className="my-auto tracking-wider leading-loose font-medium text-justify xl:text-xl text-sm">
            <span className="cursor-pointer font-bold text-3xl">
              {companyName}
            </span>{" "}
            is designed to manage health. We offer various services from{" "}
            <span className="cursor-pointer font-semibold text-l underline">
              Recommending Food
            </span>
            ,{" "}
            <span className="cursor-pointer font-semibold text-l underline">
              Detection of diseases
            </span>{" "}
            by analyzing biochemicals. We also provide an{" "}
            <span className="cursor-pointer font-semibold text-l underline">
              Analytics Platform
            </span>{" "}
            to get meaningful insights about health conditions. Additionally, we
            developed a{" "}
            <span className="cursor-pointer font-semibold text-l underline">
              Diagnostics Center
            </span>{" "}
            which can detect illness based on symptoms and provide meaningful
            precautions.Our{" "}
            <span className="cursor-pointer font-semibold text-l underline">
              Vision Model
            </span>{" "}
            can collect various data points.
          </h1>
        </div>
        <div className="w-full h-screen flex items-center justify-center">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" action="#">
                <div className="flex gap-4">
                  <input
                    type="name"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    placeholder="First Name"
                  />

                  <input
                    type="name"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Last Name"
                    required
                  />
                </div>

                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Email"
                  required
                />

                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />

                <select
                  id="gender"
                  name="gender"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                >
                  <option value="" disabled selected>
                    Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>


                <Button
                  className="mx-auto"
                  text={isSignUp ? "Sign Up" : "Sign In"}
                />
                <p className="text-sm mx-auto font-light text-gray-500 dark:text-gray-400">
                  {isSignUp?"Already":"Don't"} have an account?
                  <span
                    className="cursor-pointer font-bold text-primary-800 hover:underline dark:text-primary-500"
                  >
                    Sign up
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
