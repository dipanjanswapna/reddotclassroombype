import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A reusable component to display the site logo.
 * It directly references the logo file from the /public directory.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png" // The root path for files in /public
      alt="RED DOT CLASSROOM Logo"
      width={120}
      height={40}
      className={cn("h-8 w-auto", className)} // Default styling
      priority // Helps with LCP by prioritizing the logo image
    />
  );
}
