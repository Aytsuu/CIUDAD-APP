import React from "react"
import AdministrationPositions from "./AdministrationPositions"
import FeatureSelection from "./FeatureSelection"
import SettingPermissions from "./SettingPermissions"
import { Label } from "@/components/ui/label"
import { useLocation } from "react-router"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Assigned, Feature } from "./AdministrationTypes"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { useAllAssignedFeatures, usePositions } from "./queries/administrationFetchQueries"
import { Users, Settings, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function RoleLayout() {
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params || {}, [location.state])
  const { data: allAssignedFeatures, isLoading: isLoadingAllAssignedFeatures } = useAllAssignedFeatures()
  const { data: positions, isLoading: isLoadingPositions } = usePositions()
  const [selectedPosition, setSelectedPosition] = React.useState<string>("")
  const [positionFeaturesMap, setPositionFeaturesMap] = React.useState<Map<number, Assigned[]>>(new Map())

  // Initialize the position features map
  React.useEffect(() => {
    const newMap = new Map<number, Assigned[]>()
    allAssignedFeatures?.forEach((feature: Assigned) => {
      if (!newMap.has(+feature.pos)) {
        newMap.set(+feature.pos, [])
      }
      newMap.get(+feature.pos)?.push(feature)
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

  // Group features by category
  const groupedFeatures = React.useMemo(() => {
    const groups: Record<string, Feature[]> = {}
    for (const feature of params.features || []) {
      if (!groups[feature.feat_category]) {
        groups[feature.feat_category] = []
      }
      groups[feature.feat_category].push(feature)
    }
    return groups
  }, [params.features])

  const selectedPositionData = positions?.find((p: any) => p.pos_id == selectedPosition)

  return (
    <LayoutWithBack title="Role Management" description="Configure positions, features, and permissions">
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Positions Section */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Positions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingPositions ? (
                <div className="p-6 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="px-6 pb-6">
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
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Features
                </CardTitle>
                {selectedPositionData && <Badge variant="outline">{selectedPositionData.pos_title}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="px-6 pb-6">
                  {isLoadingAllAssignedFeatures ? (
                    <div className="space-y-3">
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
                      groupedFeatures={groupedFeatures}
                      setAssignedFeatures={handleFeatureUpdate}
                    />
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Permissions
                </CardTitle>
                {assignedFeatures.length > 0 && (
                  <Badge variant="secondary">
                    {assignedFeatures.length} feature{assignedFeatures.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="px-6 pb-6">
                  {!selectedPosition ? (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <Label className="text-gray-500 block mb-2">No position selected</Label>
                      <p className="text-sm text-gray-400">Select a position and assign features to set permissions</p>
                    </div>
                  ) : assignedFeatures.length === 0 ? (
                    <div className="text-center py-12">
                      <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <Label className="text-gray-500 block mb-2">No features assigned</Label>
                      <p className="text-sm text-gray-400">Assign features to this position to configure permissions</p>
                    </div>
                  ) : (
                    <SettingPermissions selectedPosition={selectedPosition} assignedFeatures={assignedFeatures} />
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithBack>
  )
}