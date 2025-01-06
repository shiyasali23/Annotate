import React from 'react';

const ResultComponent = ({ ResultsArray }) => {
  return (
    <div className='w-full h-full flex justify-center flex-col gap-3 sm:p-4 md:p-6 py-5'>
      {ResultsArray.map((result, index) => (
        <div key={index} className='flex p-2 sm:p-3 rounded-lg items-center justify-between w-full mx-auto h-full gap-4'>
            <h5 className='text-sm sm:text-base font-semibold'>{result[0]}</h5>
            <div
              className='w-[40%] sm:w-[50%] h-[8px] sm:h-[10px] bg-gray-300 rounded-full'
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
