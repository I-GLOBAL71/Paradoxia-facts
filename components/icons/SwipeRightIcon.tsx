import React from 'react';

const SwipeRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 16C10.7614 16 13 13.7614 13 11C13 8.23858 10.7614 6 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 11H21M21 11L18 8M21 11L18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default SwipeRightIcon;
