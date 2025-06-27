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
      <path d="M0 50 V25 C0 11.19 11.19 0 25 0 H35 V12 H25 C17.82 12 12 17.82 12 25 V50 H0Z" fill="#177DFF"/>
      <circle cx="58" cy="25" r="25" fill="#FFC107"/>
      <rect x="71" y="0" width="12" height="50" fill="#177DFF"/>
      <path d="M118 0 C 103 0 93 10 93 25 C 93 40 103 50 118 50 H130 C 115 50 105 40 105 25 C 105 10 115 0 130 0 H118 Z" fill="#F93232"/>
    </svg>
  );
}
