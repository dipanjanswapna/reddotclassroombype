import React from 'react';

export function RdcLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Red Dot Classroom Logo"
      {...props}
    >
      <g>
        {/* r */}
        <path d="M0 50V0H35C35 13.8 24.7 25 12 25V50H0Z" fill="#177DFF"/>
        
        {/* d */}
        <circle cx="65" cy="25" r="25" fill="#FFC107"/>
        <rect x="78" y="0" width="12" height="50" fill="#177DFF"/>
        
        {/* c */}
        <path d="M120 0C106.193 0 95 11.1929 95 25C95 38.8071 106.193 50 120 50V0Z" fill="#F93232"/>
      </g>
    </svg>
  );
}
