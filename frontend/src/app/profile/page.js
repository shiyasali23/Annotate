"use client";
import React from "react";

import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import { useUser } from "@/contexts/userContext";
import UserDataComponent from "@/components/UserDataComponent";
import LoadingComponent from "@/components/LoadingComponent";
import BiochemicalsUpdate from "@/components/BiochemicalsUpdate";
import ErrorComponent from "@/components/ErrorComponent";

const Profile = () => {
  const { isLogined, userDataLoading } = useUser();
  const router = useRouter();
  return (
    <div className="w-screen min-h-screen">
      <Header />
      <div className=" flex min-h-[78vh] xl:min-h-[88vh] flex-col">
        {userDataLoading ? (
          <LoadingComponent text={"Processing Data."} />
        ) : isLogined ? (
          <div>
            <UserDataComponent />
            <BiochemicalsUpdate />
          </div>
        ) : (
          <ErrorComponent heading={"User Data Not Found"} buttonText={"Login"} handleTryAgain={()=>router.push("/about")}/>
        )}
      </div>
    </div>
  );
};

export default Profile;
