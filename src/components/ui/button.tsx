import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-black uppercase tracking-widest",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 font-black uppercase tracking-widest border-b-4 border-black/20",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm font-bold",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline font-bold",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 font-black uppercase tracking-widest border-b-4 border-black/20",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 font-black uppercase tracking-widest",
        social: "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-lg shadow-blue-600/20 font-bold",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
