"use client";
import React from "react";
import Header from "@/components/Header";
import { useUser } from "@/contexts/userContext";
import UserDataComponent from "@/components/UserDataComponent";
import NotLogined from "@/components/NotLogined";
import LoadingComponent from "@/components/LoadingComponent";

const Profile = () => {
  const { isLogined, userDataLoading } = useUser();

  return (
    <div className="w-screen min-h-screen">
      <Header />
      <div className=" flex min-h-[78vh] xl:min-h-[88vh] flex-col">
        {userDataLoading ? (
          <LoadingComponent text={"Processing Data. Please Wait"} />
        ) : isLogined ? (
          <UserDataComponent />
        ) : (
          <NotLogined />
        )}
      </div>
    </div>
  );
};

export default Profile;
