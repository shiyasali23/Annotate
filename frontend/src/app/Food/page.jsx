"use client";

import React, { useState } from "react";
import Header from "../components/Header";


export default function Food({isHeader=true}) {


  return (
    <div id="food-section" className=" flex flex-col w-full h-full">
      {isHeader && <Header />}
      
      <div className="flex w-full h-full justify-center  items-center ">
        <div className="flex w-full  h-full flex-col justify-center items-center p-3">
          <div className="flex w-full  h-full  justify-center items-center p-3">
            <div className="flex w-full  h-full flex-col justify-center items-center p-3">
              left-top-left
            </div>
            <div className="flex w-full  h-full flex-col justify-center items-center p-3">
              left-top-right
            </div>
          </div>
          <div className="flex w-full  h-full flex-col justify-center items-center p-3">
            left-bottom
          </div>
        </div>
        <div className="flex w-1/4 h-full flex-col justify-center items-center ">
          food score
        </div>
      </div>
    </div>
  );
}
