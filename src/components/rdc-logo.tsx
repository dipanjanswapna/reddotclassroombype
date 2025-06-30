import React from 'react';

export function RdcLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* "r" shape */}
      <path
        d="M20,80 V30 A30,30 0 0,1 50,30 V80"
        fill="#007AFF"
      />

      {/* "d" shape */}
      <rect x="70" y="30" width="20" height="50" fill="#007AFF" />
      <circle cx="90" cy="55" r="25" fill="#FFC700" />

      {/* "c" shape */}
      <path
        d="M160,30 A25,25 0 1,0 160,80"
        fill="#FF3B30"
      />
    </svg>
  );
}
