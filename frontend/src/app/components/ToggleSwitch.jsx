import React from "react";

const ToggleSwitch = ({ viewList, selectedView, setSelectedView }) => {
  // Handle change and set the selected toggle
  const handleChange = (e) => {
    setSelectedView(e.target.value);
  };

  return (
    <div className="w-32 h-8 my-2 mx-auto  flex justify-center items-center bg-black  rounded-full p-1">
      {viewList.map((label) => (
        <label
          key={label}
          htmlFor={label}
          className={`cursor-pointer w-1/2  rounded-full transition-colors duration-300 ${
            selectedView === label ? "bg-white" : "bg-black"
          }`}
        >
          <input
            type="radio"
            id={label}
            name="category"
            className="hidden"
            value={label}
            checked={selectedView === label}
            onChange={handleChange}
          />
          <div className="flex items-center justify-center py-1">
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                selectedView === label ? "text-black" : "text-white"
              }`}
            >
              {label}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
};

export default ToggleSwitch;
