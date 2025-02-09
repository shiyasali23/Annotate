import React from 'react';

const ResultComponent = ({ ResultsArray }) => {
  return (
    <div className='w-full h-full flex flex-col gap-2 md:gap-3 lg:gap-5 py-2 px-4 md:px-8 xl:px-16'>
      {ResultsArray.map((result, index) => (
        <div key={index} className='flex border border-dashed py-2 px-3 sm:px-4 md:px-5 rounded-full items-center justify-between w-full gap-2 sm:gap-3 md:gap-4'>
          <h5 className='text-xs sm:text-sm md:text-base font-semibold min-w-[25%]'>
            {result[0]}
          </h5>
          <div
            className='w-[65%] sm:w-[55%] md:w-[50%] h-[6px] sm:h-[8px] md:h-[10px] bg-gray-300 rounded-full'
            style={{
              background: `linear-gradient(to right, #4caf50 ${result[1]}%, #e0e0e0 ${result[1]}%)`,
            }}
          >
            <div
              className="h-full"
              style={{
                width: `${result[1]}%`,
                backgroundColor: '#4caf50',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultComponent;