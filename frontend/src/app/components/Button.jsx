// components/Button.js
import React from 'react';

const Button = ({ text, onClick, className = '', type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`whitespace-nowrap relative px-4 py-2 text-base sm:text-lg md:text-xl lg:text-2xl 
                  bg-black text-white rounded-md group overflow-hidden transition-colors 
                  duration-300 ease-out font-medium flex items-center justify-center ${className}`}
    >
      <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-300 ease-out"></span>
      <span className="font-semibold relative group-hover:text-black transition-colors duration-300 ease-out">
        {text}
      </span>
    </button>
  );
};

export default Button;
