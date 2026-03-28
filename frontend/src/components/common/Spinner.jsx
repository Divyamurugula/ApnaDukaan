import React from 'react';

const Spinner = ({ size = 'md', center = true }) => {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-14 h-14' };
  const spinner = (
    <div className={`${sizeMap[size]} border-4 border-green-200 border-t-green-600 rounded-full animate-spin`} />
  );
  if (center) return <div className="flex justify-center items-center min-h-[200px]">{spinner}</div>;
  return spinner;
};

export default Spinner;
