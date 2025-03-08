import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NoDataFound from "./NoDataFound";
import ErrorComponent from "./ErrorComponent";
import { useFood } from "@/contexts/foodContext";
import { useUser } from "@/contexts/userContext";
import { createFoodScores } from "@/lib/foods-api";
import { Loader } from "lucide-react";

const FoodScores = ({ setMessage }) => {
  const { isLogined } = useUser();
  const { foodScores, processFoodScores } = useFood();
  const router = useRouter();
  const [foodScoreCreationLoading, setFoodScoreCreationLoading] =
    useState(false);

  const handleCreateFoodScores = async () => {
    setFoodScoreCreationLoading(true);
    const { response, message } = await createFoodScores();
    if (response) {
      processFoodScores(response);
    }
    if (message) {
      setMessage(message);
    }
    setFoodScoreCreationLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-full w-full">
      {!isLogined ? (
        <NoDataFound
          isOpen={true}
          isModal={false}
          buttonText={"Create An Account"}
          heading={"User Data Not Found"}
          handleButtonClick={() => router.push("/about")}
        />
      ) : !foodScores ? (
        <ErrorComponent
          heading={"Get Personalized Food Recommendations"}
          buttonText={
            foodScoreCreationLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span>Calculating</span>
                <Loader className="animate-spin" />
              </div>
            ) : (
              "Create Food Scores"
            )
          }
          handleTryAgain={handleCreateFoodScores}
        />
      ) : (
        <h1>Food scores are available!</h1>
      )}
    </div>
  );
};

export default FoodScores;
