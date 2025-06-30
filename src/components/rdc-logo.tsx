import React from 'react';

export function RdcLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 250 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Red Dot Classroom Logo"
      {...props}
    >
      <path
        d="M10 70C10 30 50 10 90 10V70C50 70 10 70 10 70Z"
        fill="#2979FF"
      />
      <circle
        cx="140"
        cy="40"
        r="30"
        fill="#FFD600"
      />
      <path
        d="M200 10C240 10 240 70 200 70C160 70 160 10 200 10Z"
        fill="#FF3D00"
      />
    </svg>
  );
}
