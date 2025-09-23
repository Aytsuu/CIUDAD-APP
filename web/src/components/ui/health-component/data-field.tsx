import * as React from "react"
import { cn } from "@/lib/utils"

interface DataFieldProps {
  label: string
  value: string | React.ReactNode
  className?: string
  orientation?: "vertical" | "horizontal"
}

export function DataField({ 
  label, 
  value, 
  className,
  orientation = "vertical" 
}: DataFieldProps) {
  if (orientation === "horizontal") {
    return (
      <div className={cn("flex items-center justify-between py-2", className)}>
        <span className="font-medium text-gray-600 text-sm">{label}:</span>
        <div className="text-gray-900 text-sm font-medium">{value}</div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", className)}>
      <span className="font-medium text-gray-600 text-sm block">{label}:</span>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  )
}