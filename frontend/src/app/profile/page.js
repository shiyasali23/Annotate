"use client";
import React from "react";


import { useUser } from "@/contexts/userContext";
import UserDataComponent from "@/components/UserDataComponent";
import LoadingComponent from "@/components/LoadingComponent";
import BiochemicalsUpdate from "@/components/BiochemicalsUpdate";
import NoDataFound from "@/components/NoDataFound";

const Profile = () => {
  const { isLogined, userDataLoading } = useUser();
  return (
    <div className="w-screen min-h-screen">
      <div className=" flex min-h-[78vh] xl:min-h-[88vh] flex-col">
        {userDataLoading ? (
          <LoadingComponent text={"Processing Data."} />
        ) : isLogined ? (
          <div>
            <UserDataComponent />
            <BiochemicalsUpdate />
          </div>
        ) : (
          <NoDataFound
          isOpen={true}
          isModal={false}
          route={'profile'}
          
        />
        )}
      </div>
    </div>
  );
};

export default Profile;
