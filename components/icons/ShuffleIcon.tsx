
import React from 'react';

const ShuffleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5c1.24 0 2.25-1.01 2.25-2.25V6.75M16.5 3 21 7.5m0 0L16.5 12M21 7.5H7.5c-1.24 0-2.25 1.01-2.25 2.25v6.75"
    />
  </svg>
);

export default ShuffleIcon;