import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  title: string
  icon?: React.ReactNode
  iconColor?: string
  children: React.ReactNode
  className?: string
}

export function InfoCard({ 
  title, 
  icon, 
  iconColor = "bg-blue-500", 
  children, 
  className 
}: InfoCardProps) {
  return (
    <Card className={cn("shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
              {icon}
            </div>
          ) : (
            <div className={cn("w-2 h-8 rounded-full", iconColor)} />
          )}
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )
}