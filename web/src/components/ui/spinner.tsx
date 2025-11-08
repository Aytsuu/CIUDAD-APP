import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary"
}

export function Spinner({ className, size = "md", variant = "default" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-[3px]",
  }

  const variantClasses = {
    default: "border-gray-300 border-t-blue-600",
    primary: "border-blue-200 border-t-blue-600",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    />
  )
}
