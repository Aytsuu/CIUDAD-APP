import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingStateProps {
  message?: string
  type?: "spinner" | "skeleton"
}

export function LoadingState({ 
  message = "Loading health profiling data...", 
  type = "spinner" 
}: LoadingStateProps) {
  if (type === "skeleton") {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
        
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50/50">
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <Spinner size="lg" className="border-blue-200 border-t-blue-600" />
            <div className="absolute inset-0 rounded-full bg-blue-100/20 animate-ping" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-700">{message}</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the data...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}