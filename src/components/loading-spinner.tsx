import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div role="status" className={cn("google-spinner", className)}>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
