import React from 'react';

const SwipeLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 16C13.2386 16 11 13.7614 11 11C11 8.23858 13.2386 6 16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 11H3M3 11L6 8M3 11L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default SwipeLeftIcon;
