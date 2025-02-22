"use client";
import React, { useState } from "react";
import CameraModule from "../components/CameraModule";
import ResultComponent from "../components/ResultComponent";
import ServicesModal from "../components/ServicesModal";
import Button from "../components/Button";
import Header from "../components/Header";
import LoadingComponent from "../components/LoadingComponent";

const Food = () => {
  const [loading, setLoading] = useState(false);
  const [haveResult, setHaveResult] = useState(false);
  const [wantToTry, setWantToTry] = useState(false);
  const haveBiochemicals = false;

  const foodResultsArray = [
    ["Apple", 45],
    ["Orange", 60],
    ["Grapes", 34],
    ["Milk", 50],
  ];

  return (
    <div className="w-screen  flex flex-col  align-center justify-center">
      <Header />
      {wantToTry && !haveBiochemicals && (
        <ServicesModal isOpen={wantToTry} onClose={() => setWantToTry(false)} />
      )}
      {haveResult ? (
        <div className="w-screen h-[78vh] xl:h-[88vh]  flex  align-center justify-center">
          <div className="w-full  h-full  flex flex-col justify-center align-center">
            <div className="w-full  h-full  flex justify-center align-center">
              <div className="w-1/2 h-full  flex flex-col align-center justify-center p-3">
                <CameraModule />
              </div>
              <div className="w-1/2  h-full flex justify-center items-center align-center">
                {loading ? (
                  <LoadingComponent text={"Detecting Items"} />
                ) : (
                  <ResultComponent  ResultsArray={foodResultsArray} />
                )}
              </div>
            </div>
            <div className="w-full h-1/2   flex justify-center align-center">
              left-bottom
            </div>
          </div>

          <div className="xl:w-1/2 w-1/2  p-2 flex flex-col items-center justify-center">
            {loading ? (
              <LoadingComponent text={"Processing Food Score"} />
            ) : (
              <div className="flex    flex-col align-center items-center   gap-3">
                <h1 className="font-bold text-xl xl:text-5xl">
                  Try our personalized
                </h1>
                <Button
                  text={"Food Suggetions"}
                  className="px-1 py-1"
                  onClick={() => setWantToTry(!wantToTry)}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-screen h-[70vh] xl:h-[88vh] flex  items-center justify-center">
          <div className=" w-1/2  flex  items-center justify-center">
            <CameraModule setHaveResult={setHaveResult}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Food;
