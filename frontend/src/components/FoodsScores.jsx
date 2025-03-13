import React from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/contexts/userContext";

import ErrorComponent from "./ErrorComponent";
import LoadingComponent from "./LoadingComponent";
import NoDataFound from "./NoDataFound";
import FoodsScoreBarGraph from "./FoodsScoreBarGraph";


const FoodsScores = ({processedFoodsScore, handleSelectedItem}) => {
  const { isLogined, userDataLoading } = useUser();

 


  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-[20vh] h-full w-full">
      {userDataLoading ? (
        <LoadingComponent text={"Loading Foods Nutrients Score"} />
      ) : !isLogined ? (
        <NoDataFound
          isOpen={true}
          isModal={false}
          buttonText={"Create An Account"}
          heading={"User Data Not Found"}
          handleButtonClick={() => router.push("/about")}
        />
      ) : !processedFoodsScore  ? (
        <ErrorComponent
          heading={"Get Personalized Food Recommendations"}
          buttonText={"Update Biochemicals"}
          handleTryAgain={() => router.push("/profile")}
        />
      ) : (
        <div className="flex  w-full h-full">
          <FoodsScoreBarGraph data={processedFoodsScore} handleSelectedItem={handleSelectedItem}/>
        </div>
      )}
    </div>
  );
};

export default FoodsScores;
