import React, { useState, useEffect } from 'react';
import Button from './Button';

const ServicesCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const ServicesArray = [
    ["Personalized", "food recommendations based on your biochemicals.", "Recommending Food"],
    ["Know", "about any disease inside you with your biochemicals", "Detection of diseases"],
    ["Get", "advanced analytics for your health and biochemicals to get insights", "Analytics Platform"],
    ["Feeling", "any symptoms? try our diagnostics center", "Diagnostics Center"],
    ["To", "know about what in your skin, face or body", "Vision Model"],
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === ServicesArray.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === ServicesArray.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? ServicesArray.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-full">
      <div className="relative h-full overflow-hidden">
        {ServicesArray.map((service, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-transform duration-700 ease-in-out transform ${
              index === currentSlide ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col justify-between h-full p-6">
            <h1 className="absolute text-xl font-normal leading-tight">
                  <span className="font-bold">{service[0]}</span> {service[1]}
                  <Button text={service[2]} className={'relative top-2 left-2'}/>
                </h1>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Next/Prev Navigation */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-0 -translate-y-1/2 z-30 p-4 text-black"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-0 -translate-y-1/2 z-30 p-4 text-black"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default ServicesCarousel;