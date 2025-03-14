import React from 'react';

const ProbabilitiesGraphComponent = ({ probabilities }) => {
  const sortedProbabilities = Object.entries(probabilities)
    .filter(([_, probability]) => probability >= 1)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className='w-full flex flex-col gap-3 m-auto border border-dashed p-2'>
      <h1 className='text-center w-full text-xs font-semibold'>Probability</h1>
      {sortedProbabilities.map(([result, probability], index) => (
        <div key={index} className='flex flex-col sm:flex-row py-2 px-5 items-start sm:items-center w-full gap-2 sm:gap-10 border-b'>
          <h1 className='text-xs font-semibold w-full sm:min-w-[25%] sm:max-w-[30%]'>
            {result}
          </h1>
          <div className='w-full sm:w-[55%] md:w-[50%] h-[6px] sm:h-[8px] md:h-[10px] bg-gray-300'>
            <div
              className="h-full"
              style={{
                width: `${probability}%`,
                backgroundColor: '#4caf50',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProbabilitiesGraphComponent;