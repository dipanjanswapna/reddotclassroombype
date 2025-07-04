import { cn } from "@/lib/utils";

/**
 * A reusable component to display the site logo.
 * It directly references the logo file from the /public directory.
 * Using a standard <img> tag to ensure direct asset loading,
 * bypassing Next.js Image optimization which might have been causing issues.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="RED DOT CLASSROOM Logo"
      width="120"
      height="40"
      className={cn("h-8 w-auto", className)}
    />
  );
}
