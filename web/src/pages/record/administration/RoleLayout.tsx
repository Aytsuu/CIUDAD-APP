import React from "react"
import AdministrationPositions from "./AdministrationPositions"
import FeatureSelection from "./FeatureSelection"
import { Label } from "@/components/ui/label"
import type { Assigned } from "./AdministrationTypes"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAllAssignedFeatures, useFeatures, usePositions } from "./queries/administrationFetchQueries"
import { Users, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/AuthContext"

export default function RoleLayout() {
  const { user } = useAuth();
  const { data: allAssignedFeatures, isLoading: isLoadingAllAssignedFeatures } = useAllAssignedFeatures()
  const { data: positions, isLoading: isLoadingPositions } = usePositions(
    user?.staff?.staff_type
  )
  const { data: features, isLoading: isLoadingFeatures } = useFeatures(
    user?.staff?.staff_type.toLowerCase() == "barangay staff" ? "BARANGAY FEATURE" : "HEALTH FEATURE"
  );
  const [selectedPosition, setSelectedPosition] = React.useState<string>("")
  const [positionFeaturesMap, setPositionFeaturesMap] = React.useState<Map<number, Assigned[]>>(new Map())

  // Initialize the position features map
  React.useEffect(() => {
    const newMap = new Map<number, Assigned[]>()
    allAssignedFeatures?.forEach((feature: Assigned) => {
      if (!newMap.has(+feature.pos.pos_id)) {
        newMap.set(+feature.pos.pos_id, [])
      }
      newMap.get(+feature.pos.pos_id)?.push(feature)
    })
    
    setPositionFeaturesMap(newMap)
  }, [allAssignedFeatures])

  // Memoized assigned features for the selected position
  const assignedFeatures = React.useMemo(() => {
    if (!selectedPosition) return []
    return positionFeaturesMap.get(+selectedPosition) || []
  }, [selectedPosition, positionFeaturesMap])

  // Handle position selection
  const handlePositionSelect = React.useCallback((position: string) => {
    setSelectedPosition(position)
  }, [])

  // Handle feature updates
  const handleFeatureUpdate = React.useCallback(
    (updateFn: React.SetStateAction<Assigned[]>) => {
      setPositionFeaturesMap((prev) => {
        const newMap = new Map(prev)
        const currentFeatures = newMap.get(+selectedPosition) || []
        const newFeatures = typeof updateFn === "function" ? updateFn(currentFeatures) : updateFn
        newMap.set(+selectedPosition, newFeatures)
        return newMap
      })
    },
    [selectedPosition],
  )

  const selectedPositionData = positions?.find((p: any) => p.pos_id == selectedPosition)

  return (
    <LayoutWithBack title="Role Management" description="Configure positions, features, and permissions">
      <div className="w-full">
        <div className="flex gap-4">
          {/* Positions Section */}
          <Card className="w-full max-w-md">
            <CardHeader className="pb-4 opacity-50">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Positions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingPositions || isLoadingFeatures ? (
                <div className="px-6 space-y-3 pb-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="px-6">
                  <AdministrationPositions
                    positions={positions}
                    selectedPosition={selectedPosition}
                    setSelectedPosition={handlePositionSelect}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Section */}
          <Card className="w-full">
            <CardHeader className="pb-4 opacity-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Features
                </CardTitle>
                {selectedPositionData && <Badge variant="outline">{selectedPositionData.pos_title}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6">
                {isLoadingAllAssignedFeatures || isLoadingFeatures ? (
                  <div className="space-y-3 pb-6">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : !selectedPosition ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <Label className="text-gray-500 block mb-2">No position selected</Label>
                    <p className="text-sm text-gray-400">Select a position from the left to assign features</p>
                  </div>
                ) : (
                  <FeatureSelection
                    selectedPosition={selectedPosition}
                    assignedFeatures={assignedFeatures}
                    features={features}
                    setAssignedFeatures={handleFeatureUpdate}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithBack>
  )
}