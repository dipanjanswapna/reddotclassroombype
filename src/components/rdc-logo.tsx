import React from 'react';

export function RdcLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 130 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Red Dot Classroom Logo"
      {...props}
    >
      <defs>
        <clipPath id="rdc-clip-c">
          <rect x="105" y="0" width="25" height="50" />
        </clipPath>
      </defs>
      <g>
        {/* r */}
        <path d="M0 0 H18 V50 H0 Z" fill="#2196F3"/>
        <path d="M18 0 H33 C42.389 0 50 7.837 50 17.5 S42.389 35 33 35 H18 V0Z" fill="#2196F3"/>
        
        {/* d */}
        <rect x="55" y="0" width="18" height="50" fill="#2196F3"/>
        <circle cx="80" cy="25" r="22" fill="#FFC107"/>
        
        {/* c */}
        <circle cx="105" cy="25" r="25" fill="#F44336" clipPath="url(#rdc-clip-c)"/>
      </g>
    </svg>
  );
}
