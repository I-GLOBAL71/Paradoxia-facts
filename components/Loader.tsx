
import React from 'react';

const Loader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      {message && <p className="mt-4 text-slate-400 text-center">{message}</p>}
    </div>
  );
};

export default Loader;