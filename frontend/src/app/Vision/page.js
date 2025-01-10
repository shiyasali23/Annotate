"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import ToggleSwitch from "../components/ToggleSwitch";
import CameraModule from "../components/CameraModule";
import ResultComponent from "../components/ResultComponent";
import FoodRecommendation from "../components/FoodRecommendation";


export default function Vision() {
  const viewList = ["Bio", "Food"];

  const [selectedView, setSelectedView] = useState(viewList[1]);

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
      <div className="flex  w-full justify-center items-center">
        {selectedView === viewList[0] ? (
          <div className=" w-full        flex flex-col xl:flex-row justify-center  items-center  ">
            <div className="flex w-full h-1/2   flex-col justify-center align-center p-20">
              <CameraModule />
            </div>
            <div className="flex w-full  xl:w-full flex-col justify-center items-center ">
              <ResultComponent
                ResultsArray={
                  skinResultsArray
                }
              />
              
            </div>
          </div>
        ):selectedView === viewList[1] ?(
          <div>
            <FoodRecommendation setSelectedView={setSelectedView}/>
          </div>
        ):(
          <div className="flex  w-full justify-center items-center">
            <CameraModule />
          </div>
        )}
      </div>
     
      
    </div>
  );
}
