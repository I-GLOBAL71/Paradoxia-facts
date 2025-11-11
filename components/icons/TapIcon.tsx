import React from 'react';

const TapIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.36 14.33L5.43 18.26C5.04 18.65 5.04 19.28 5.43 19.67L6.33 20.57C6.72 20.96 7.35 20.96 7.74 20.57L11.67 16.64M9.36 14.33L10.5 12.5C10.5 12.5 10.5 12.5 10.5 12.5L13.5 10.5M9.36 14.33L7.5 15.5M13.5 10.5L16.5 7.5L15 3L11.5 4.5L9 7L10.5 8.5L13.5 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 11.5L18.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M19.5 4.5L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export default TapIcon;
