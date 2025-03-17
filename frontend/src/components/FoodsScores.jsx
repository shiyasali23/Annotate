import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/contexts/userContext";

import ErrorComponent from "./ErrorComponent";
import LoadingComponent from "./LoadingComponent";
import NoDataFound from "./NoDataFound";
import FoodsScoreBarGraph from "./FoodsScoreBarGraph";
import { createFoodsscore } from "@/lib/foods-api";

const FoodsScores = ({
  processedFoodsScore,
  handleSelectedItem,
  setMessage,
}) => {
  const { latestBiometrics, userDataLoading, isLogined, handleAuthResponse } =
    useUser();
  const router = useRouter();

  const currentDate = new Date().toISOString();

  const expiredBiometrics =
    latestBiometrics?.filter(({ expiryDate }) => expiryDate < currentDate) ||
    null;

  const [foodsScoreLoading, setFoodsScoreLoading] = useState(false);

  useEffect(() => {
    if (expiredBiometrics?.length) {
      handleCreateFoodsScores();
    }
  }, [expiredBiometrics]);

  const handleCreateFoodsScores = async () => {
    setFoodsScoreLoading(true);
    const unExpiredBiometricsData =
      latestBiometrics
        ?.filter(({ expiryDate }) => expiryDate >= currentDate)
        .map(({ id, scaledValue }) => ({ id, value: scaledValue })) || null;

    const createdFoodsScoreData = await createFoodsscore(
      unExpiredBiometricsData
    );

    if (createdFoodsScoreData) {
      handleAuthResponse(createdFoodsScoreData);
    } else {
      setMessage("Something went wrong");
    }
    setFoodsScoreLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[20vh] h-full w-full">
      {userDataLoading ? (
        <LoadingComponent text={"Loading Foods Score"} />
      ) : foodsScoreLoading ? (
        <LoadingComponent
          text={"You Have Expired Biochemicals Creating New Foods Score"}
        />
      ) : !isLogined ? (
        <NoDataFound
          isOpen={true}
          isModal={false}
          buttonText={"Create An Account"}
          heading={"User Data Not Found"}
          handleButtonClick={() => router.push("/about")}
        />
      ) : !processedFoodsScore ? (
        <ErrorComponent
          heading={"Get Personalized Food Recommendations"}
          buttonText={"Update Biochemicals"}
          handleTryAgain={() => router.push("/profile")}
        />
      ) : (
        <div className="flex w-full h-full">
          <FoodsScoreBarGraph
            data={processedFoodsScore}
            handleSelectedItem={handleSelectedItem}
          />
        </div>
      )}
    </div>
  );
};

export default FoodsScores;
