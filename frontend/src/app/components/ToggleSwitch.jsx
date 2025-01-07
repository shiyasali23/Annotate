import React from "react";

const ToggleSwitch = ({ togglesList, selectedToggle, setSelectedToggle }) => {
  // Handle change and set the selected toggle
  const handleChange = (e) => {
    setSelectedToggle(e.target.value);
  };

  return (
    <div className="w-32 h-8 my-2 mx-auto  flex justify-center items-center bg-black  rounded-full p-1">
      {togglesList.map((label) => (
        <label
          key={label}
          htmlFor={label}
          className={`cursor-pointer w-1/2  rounded-full transition-colors duration-300 ${
            selectedToggle === label ? "bg-white" : "bg-black"
          }`}
        >
          <input
            type="radio"
            id={label}
            name="category"
            className="hidden"
            value={label}
            checked={selectedToggle === label}
            onChange={handleChange}
          />
          <div className="flex items-center justify-center py-1">
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                selectedToggle === label ? "text-black" : "text-white"
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
