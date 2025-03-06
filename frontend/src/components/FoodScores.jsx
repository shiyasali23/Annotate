import { useUser } from '@/contexts/userContext';
import React from 'react'
import { useRouter } from "next/navigation";
import NoDataFound from './NoDataFound';

const FoodScores = () => {
    const {isLogined, foodScores} = useUser();
    const router = useRouter();


    const handleCreateFoodScores = () => {
      alert("hi");
    }

  return (
    <div className='flex justify-center align-center h-full w-full'>
      {!isLogined?(
        <NoDataFound isOpen={true} isModal={false}  buttonText={"Create An Account"} heading={"Get Personalized Food Recommendations"} handleButtonClick={() => router.push("/about")}/>
      ):!foodScores?(
        <NoDataFound isOpen={true} isModal={false}  buttonText={"Create An Account"} heading={"Get Personalized Food Recommendations"} handleButtonClick={() => handleCreateFoodScores()}/>
      ):(
        <h1>hi</h1>
      )}
    </div>
  )
}

export default FoodScores
