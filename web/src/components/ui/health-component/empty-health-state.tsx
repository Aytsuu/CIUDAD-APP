import { Card, CardContent } from "@/components/ui/card"
import { Heart, FileText, Users } from "lucide-react"

export function EmptyHealthState() {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100/50">
      <CardContent className="p-12">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full opacity-20" />
            <div className="relative flex items-center justify-center w-full h-full">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-700">No Health Profiling Data</h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              This family does not have health profiling data yet. Complete the health assessment to view comprehensive family health information.
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Users className="h-6 w-6" />
              <span className="text-xs">Family Members</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Heart className="h-6 w-6" />
              <span className="text-xs">Health Records</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <FileText className="h-6 w-6" />
              <span className="text-xs">Survey Data</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}