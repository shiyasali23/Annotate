import React from 'react';

const ProbabilitiesGraphComponent = ({ probabilities }) => {

  const sortedProbabilities = Object.entries(probabilities)
    .filter(([_, probability]) => probability >= 1)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className='w-full h-full flex flex-col  gap-3 '>
      {sortedProbabilities.map(([result, probability], index) => (
        <div key={index} className='flex py-2 px-5 border rounded-full border-dashed  items-center justify-between w-full gap-10'>
          <h1 className='text-sm  font-semibold min-w-[25%]'>
          {result}
          </h1>
          <div
            className='w-[65%] sm:w-[55%] md:w-[50%] h-[6px] sm:h-[8px] md:h-[10px] bg-gray-300 rounded-full'
            style={{
              background: `linear-gradient(to right, #4caf50 ${probability}%, #e0e0e0 ${probability}%)`,
            }}
          >
            <div
              className="h-full"
              style={{
                width: `${probability}%`,
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

export default ProbabilitiesGraphComponent;
