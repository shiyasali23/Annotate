import React from "react";
import Button from "@/components/CustomButton";
import { useRouter } from "next/navigation";


const NotLogined = () => {
  const router = useRouter();
  return (
    <div className="m-auto flex flex-col align-center gap-10 justify-center">
      <h1 className="text-3xl font-bold">User Data Not Found</h1>
      <Button text="Login" onClick={() => router.push("/about")} className="w-1/2 mx-auto"/>
    </div>
  );
};

export default NotLogined;
