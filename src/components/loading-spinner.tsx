

import { cn } from "@/lib/utils"
import Image from "next/image"
import logoSrc from '@/public/logo.png'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div role="status" className="relative flex items-center justify-center">
        {/* The spinning border */}
        <div className={cn("absolute w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin", className)}></div>
        {/* The logo in the center */}
        <Image 
            src={logoSrc} 
            alt="Loading Logo" 
            width={50} 
            height={50} 
            className="h-auto"
            style={{ width: `calc(${className ? '100%' : '32px'} - 16px)` }} // Adjust size based on container, leaving space for the border
        />
        <span className="sr-only">Loading...</span>
    </div>
  )
}
