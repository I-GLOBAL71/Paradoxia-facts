
import React from 'react';

const ShareIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
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
      d="M7.217 10.907a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.783 10.907a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.449 13.051 9.551 16.449"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.551 7.551 14.449 10.949"
    />
  </svg>
);

export default ShareIcon;
