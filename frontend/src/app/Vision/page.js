"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import ToggleSwitch from "../components/ToggleSwitch";
import CameraModule from "../components/CameraModule";
import ResultComponent from "../components/ResultComponent";
import Food from "../Food/page";
import LoadingText from "../components/LoadingText";

export default function Vision() {
  const togglesList = ["Body", "Food"];

  const [selectedToggle, setSelectedToggle] = useState(togglesList[0]);
  const [togglePage, setTogglePage] = useState(false);

  const skinResultsArray = [
    ["Dryness", 26],
    ["Pimples", 40],
    ["Wrinkles", 64],
    ["Dark Circles", 20],
  ];
  const foodResultsArray = [
    ["Apple", 45],
    ["Orange", 60],
    ["Grapes", 34],
    ["Milk", 50],
  ];

  return (
    <div id="vision-section" className=" flex flex-col w-ful h-screen">
      <Header />
      <ToggleSwitch
        togglesList={togglesList}
        selectedToggle={selectedToggle}
        setSelectedToggle={setSelectedToggle}
      />
      <div className="flex  w-full justify-center items-center">
        {togglePage ? (
          <CameraModule />
        ) : (
          <div className=" w-full        flex flex-col xl:flex-row justify-center  items-center  ">
            <div className="flex w-full h-1/2   flex-col justify-center align-center p-1">
              <CameraModule />
            </div>
            <div className="flex w-full  xl:w-full flex-col justify-center items-center ">
              <ResultComponent
                ResultsArray={
                  selectedToggle === togglesList[0]
                    ? skinResultsArray
                    : foodResultsArray
                }
              />
              
            </div>
          </div>
        )}
      </div>
     
      
    </div>
  );
}
