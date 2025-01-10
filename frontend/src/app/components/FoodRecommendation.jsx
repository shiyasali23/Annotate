import React, { useState } from "react";
import CameraModule from "./CameraModule";
import Button from "./Button";
import ResultComponent from "./ResultComponent";
import { Loader } from "lucide-react";
import LoadingText from "./LoadingText";

const FoodRecommendation = ({setSelectedView}) => {
  const [wantToTry, setWantToTry] = useState(false);
  const [loading, setLoading] = useState(false);
  const haveBiochemicals = false;

  const foodResultsArray = [
    ["Apple", 45],
    ["Orange", 60],
    ["Grapes", 34],
    ["Milk", 50],
  ];
  return (
    <div className="w-screen h-[92vh] xl:h-[88vh] flex  align-center justify-center">
      <div className="w-full h-full   flex flex-col justify-center align-center">
        <div className="w-full h-full   flex justify-center align-center">
          <div className="w-1/2 h-full  flex flex-col align-center justify-center gap-5">
            <h1 className="text-5xl font-bold mx-auto">Try</h1>
            <Button text={"New"} className="w-1/2 mx-auto" onClick={()=>setSelectedView(null)} />
          </div>{" "}
          <div className="w-1/2 h-full  flex justify-center align-center">
            <ResultComponent ResultsArray={foodResultsArray} />
          </div>
        </div>
        <div className="w-full h-full  flex justify-center align-center">
          top-right
        </div>
      </div>

      <div className="xl:w-1/2 w-1/2 h-full p-2 flex flex-col items-center justify-center">
        
          {loading ? (
            <div className="flex flex-col align-center items-center  gap-3">
            <LoadingText
            text={"Processing your data"}
            className="w-full"
          />
            <Loader className="animate-spin" />
            </div>
          ):(
            <div className="flex    flex-col align-center items-center   gap-3">
            <h1 className="font-bold text-xl xl:text-5xl">Try our personalized</h1>
          <Button
            text={"Food Suggetions"}
            className="px-1 py-1"
            onClick={() => setWantToTry(!wantToTry)}
          />
          </div>
          )}
        

        {wantToTry && !haveBiochemicals && (
          <div className="flex  flex-col gap-3  animate-dropdown">
            <h1 className="mt-10  font-bold text-l xl:text-2xl text-center">
              No biochemicals records found!
            </h1>
            <div className="flex flex-col align-center justify-center gap-5 mt-3">
              <Button text={"Add"} className="w-1/2 mx-auto" />
              <h1 className="font-bold text-center xl:text-xl text-md underline cursor-pointer">
                Try with a dummy data
              </h1>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodRecommendation;
