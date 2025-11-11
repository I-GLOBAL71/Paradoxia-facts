
import React from 'react';

const StarSolidIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006a.42.42 0 0 0 .316.316l5.248.758c1.126.162 1.58 1.53.76 2.318l-3.8 3.674a.42.42 0 0 0-.12.39l.9 5.232c.192 1.118-.974 1.98-1.954 1.456L12 18.232l-4.715 2.48c-.98.524-2.146-.338-1.954-1.456l.9-5.232a.42.42 0 0 0-.12-.39L.93 11.608c-.82-.788-.366-2.156.76-2.318l5.248-.758a.42.42 0 0 0 .316-.316l2.082-5.006Z"
      clipRule="evenodd"
    />
  </svg>
);

export default StarSolidIcon;