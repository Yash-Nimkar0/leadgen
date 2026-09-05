import * as React from "react"
import { cn } from "../../lib/utils"

// Retro "pressed button" mechanics: rest on a short hard shadow, lift up
// and grow the shadow on hover (the button pulls away from it), then
// collapse flush against it on press. No blur, no easing tricks — a
// pixel-perfect push, in three discrete states rather than a fade.
const buttonVariants = ({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
} = {}) => {
  const base = "inline-flex items-center justify-center whitespace-nowrap font-terminal text-base tracking-wide transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 active:translate-x-[3px] active:translate-y-[3px] active:!shadow-none"

  const variants = {
    default: "bg-primary text-primary-foreground shadow-pixel-signal hover:shadow-pixel-signal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brightness-110",
    destructive: "bg-destructive text-destructive-foreground shadow-pixel hover:shadow-pixel-lg hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brightness-110",
    outline: "border-2 border-border bg-background shadow-pixel hover:shadow-pixel-lg hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-signal/60 hover:text-signal",
    secondary: "bg-secondary text-secondary-foreground shadow-pixel hover:shadow-pixel-lg hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-secondary/80",
    ghost: "hover:bg-muted hover:text-foreground text-muted-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-12 px-8 text-lg",
    icon: "h-9 w-9",
  }

  return cn(base, variants[variant], sizes[size], className)
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
