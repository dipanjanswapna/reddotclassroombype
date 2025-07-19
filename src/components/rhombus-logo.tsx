
import { cn } from "@/lib/utils";

export function RhombusLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L65 15L50 30L35 15L50 0Z" fill="#D62828"/>
            <path d="M35 15L50 30L35 45L20 30L35 15Z" fill="#D62828"/>
            <path d="M65 15L80 30L65 45L50 30L65 15Z" fill="#D62828"/>
            <path d="M50 30L65 45L50 60L35 45L50 30Z" fill="#D62828"/>
       </svg>
       <div>
            <svg width="100" height="40" viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
                <text x="0" y="30" fontFamily="Poppins, sans-serif" fontSize="30" fontWeight="bold" fill="black" className="dark:fill-white">
                    RDC
                </text>
                <text x="0" y="60" fontFamily="Poppins, sans-serif" fontSize="20" letterSpacing="8" fill="gray" className="dark:fill-gray-400">
                    STORE
                </text>
            </svg>
       </div>
    </div>
  );
}
