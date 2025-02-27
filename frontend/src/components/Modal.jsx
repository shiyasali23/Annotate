import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { AiOutlineCloseSquare } from "react-icons/ai";

const Modal = ({ isOpen, onClose }) => {
  const state = 2;

  const foodItems = ["Apple", "Orange", "Grapes", "Milk"];

  const [wantToTry, setWantToTry] = useState(false);
  const haveBiochemicals = false;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
      <div className="relative bg-white shadow-lg w-11/12 max-w-md sm:max-w-lg lg:max-w-xl p-6">
        <AiOutlineCloseSquare
          className="absolute right-5 top-2 cursor-pointer text-3xl bg-black text-white    hover:scale-110  transition duration-150"
          onClick={onClose}
        />

        {state === 1 ? (
          <div className="flex flex-col items-center gap-10">
            <h1 className="font-semibold text-1xl">
              <span className="font-bold text-2xl">Oops..</span>
              We couldn't find anything
            </h1>
            <CustomButton text="Try Again" className="w-1/2 xl:w-1/3" />
          </div>
        ) : state === 2 ? (
          <div className="flex flex-col gap-10">
            <div className="flex justify-between  w-full">
              <h1 className="font-bold  ml-6 text-5xl w-1/2">We found these</h1>
              <div className="flex  flex-col py-3  w-1/2">
                {foodItems.map((item, index) => (
                  <li key={index} className="ml-10 text-l font-semibold mb-1">
                    {item}
                  </li>
                ))}
              </div>
            </div>

            <div className="flex align-center items-center mx-auto xl:ml-7 gap-3">
              <h1 className="font-bold text-5xl">Try our</h1>
              <CustomButton
                text={"Food Recommendations"}
                className="px-1 py-1"
                onClick={() => setWantToTry(!wantToTry)}
              />
            </div>

            {wantToTry && !haveBiochemicals && (
              <div className={`flex flex-col gap-3 border-t animate-dropdown`}>
                <h1 className="mt-10 font-bold text-2xl text-center">
                  No biochemicals records found.
                </h1>
                <div className="flex flex-col align-center justify-center gap-5 mt-5">
                  <CustomButton text={"Create New"} className="w-1/2 mx-auto" />
                  <h1 className="font-bold text-center xl:text-xl text-l underline cursor-pointer">
                    Try with a dummy data
                  </h1>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>hello</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
