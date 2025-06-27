import React from 'react';

export function RdcLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 105 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Red Dot Classroom Logo"
      {...props}
    >
      {/* r */}
      <path d="M24 0C10.7452 0 0 10.7452 0 24V48H12V24C12 17.3726 17.3726 12 24 12H36V0H24Z" fill="#2196F3"/>
      
      {/* d */}
      <g>
        <rect x="41" y="0" width="24" height="48" fill="#2196F3" />
        <circle cx="57" cy="24" r="20" fill="#FFC107" />
      </g>
      
      {/* c */}
      <path d="M105 24C105 37.2548 94.2548 48 81 48V0C94.2548 0 105 10.7452 105 24Z" fill="#F44336" />
    </svg>
  );
}
