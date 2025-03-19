import React from "react";
import { AiOutlineCloseSquare } from "react-icons/ai";
import BiochemicalLineGraph from "./BiochemicalLineGraph";

const BiochemicalLineGraphModal = ({
  isOpen,
  onClose,
  selectedBiochemical,
}) => {
  if (!isOpen || !selectedBiochemical) return null;

  const name = selectedBiochemical?.name || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg  p-6 flex w-[98vw] xl:w-[50vw]">
        <AiOutlineCloseSquare
          className="absolute right-5 top-2 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />

        {selectedBiochemical && name && (
          <div className="mt-10 h-full w-full mx-auto">
            <BiochemicalLineGraph
              biochemical={selectedBiochemical}
              name={name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BiochemicalLineGraphModal;
