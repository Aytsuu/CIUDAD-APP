import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Assigned, Feature } from "./administrationTypes"
import { formatDate } from "@/helpers/dateFormatter"
import { useAuth } from "@/context/AuthContext"
import { useAssignFeature, useSetPermission } from "./queries/administrationAddQueries"
import { useDeleteAssignedFeature } from "./queries/administrationDeleteQueries"
import {
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react"

interface FeatureSelectionProps {
  selectedPosition: string
  assignedFeatures: Assigned[]
  groupedFeatures: Record<string, Feature[]>
  setAssignedFeatures: React.Dispatch<React.SetStateAction<Assigned[]>>
}

export default function FeatureSelection({
  selectedPosition,
  assignedFeatures,
  groupedFeatures,
  setAssignedFeatures,
}: FeatureSelectionProps) {
  const { user } = useAuth()
  const { mutateAsync: assignFeature } = useAssignFeature()
  const { mutateAsync: setPermissions } = useSetPermission()
  const { mutate: deleteAssignedFeature } = useDeleteAssignedFeature()
  const [openCategories, setOpenCategories] = React.useState<Set<string>>(new Set())
  const [loadingFeatures, setLoadingFeatures] = React.useState<Set<string>>(new Set())

  // Initialize all categories as open
  React.useEffect(() => {
    const categories = Object.keys(groupedFeatures)
    setOpenCategories(new Set(categories))
  }, [groupedFeatures])

  // Create a set for quick lookup of assigned feature IDs
  const assignedFeatureIds = React.useMemo(() => {
    const ids = new Set<string>()
    for (const af of assignedFeatures) {
      ids.add(af.feat.feat_id)
    }
    return ids
  }, [assignedFeatures])

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  // Optimistic update for feature assignment
  const handleAssignment = React.useCallback(
    async (feature: any, checked: boolean) => {
      const featureId = feature.feat_id

      // Add to loading state
      setLoadingFeatures((prev) => new Set([...prev, featureId]))

      // Create a reference to the current state to avoid stale closures
      const currentAssignedFeatures = assignedFeatures

      try {
        if (checked) {
          // Generate a stable temporary ID
          const tempId = `temp-${feature.feat_id}-${Date.now()}`

          // Create the optimistic update
          const newAssignment: Assigned = {
            assi_id: tempId,
            assi_date: formatDate(new Date()),
            feat: feature,
            pos: selectedPosition,
            permissions: [
              {
                perm_id: `perm-${tempId}`,
                view: true,
                create: false,
                update: false,
                delete: false,
                assi_id: tempId,
              },
            ],
          }

          // Update state immediately
          setAssignedFeatures((prev) => [...prev, newAssignment])

          // Make API calls
          const assignment = await assignFeature({
            positionId: selectedPosition,
            featureId: feature.feat_id,
            staffId: user?.staff.staff_id,
          })

          const permission = await setPermissions({
            assi_id: assignment.assi_id,
          })

          // Update with real data
          setAssignedFeatures((prev) =>
            prev.map((item) =>
              item.feat.feat_id === feature.feat_id && item.assi_id === tempId
                ? {
                    ...item,
                    assi_id: assignment.assi_id,
                    permissions: [
                      {
                        perm_id: permission.perm_id,
                        view: true,
                        create: false,
                        update: false,
                        delete: false,
                        assi_id: assignment.assi_id,
                      },
                    ],
                  }
                : item,
            ),
          )
        } else {
          // Find the exact assignment to remove
          const assignmentToRemove = currentAssignedFeatures.find((af) => af.feat.feat_id === feature.feat_id)
          if (!assignmentToRemove) return

          // Optimistic update - remove from state
          setAssignedFeatures((prev) => prev.filter((item) => item.feat.feat_id !== feature.feat_id))

          // API call
          deleteAssignedFeature({
            positionId: selectedPosition,
            featureId: feature.feat_id,
          })
        }
      } catch (error) {
        // Rollback to previous state
        setAssignedFeatures(currentAssignedFeatures)
      } finally {
        // Remove from loading state
        setLoadingFeatures((prev) => {
          const newSet = new Set(prev)
          newSet.delete(featureId)
          return newSet
        })
      }
    },
    [selectedPosition, assignedFeatures],
  )

  // Check if a feature is assigned
  const isFeatureAssigned = React.useCallback(
    (featureId: string) => {
      return assignedFeatureIds.has(featureId)
    },
    [assignedFeatureIds],
  )

  // Get category stats
  const getCategoryStats = (categoryFeatures: Feature[]) => {
    const assigned = categoryFeatures.filter((f) => isFeatureAssigned(f.feat_id)).length
    const total = categoryFeatures.length
    return { assigned, total }
  }

  // Bulk actions
  const handleSelectAllInCategory = (categoryFeatures: Feature[], selectAll: boolean) => {
    categoryFeatures.forEach((feature) => {
      const isAssigned = isFeatureAssigned(feature.feat_id)
      if (selectAll && !isAssigned) {
        handleAssignment(feature, true)
      } else if (!selectAll && isAssigned) {
        handleAssignment(feature, false)
      }
    })
  }

  const totalAssigned = assignedFeatures.length
  const totalFeatures = Object.values(groupedFeatures).flat().length

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header with search and stats */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label className="text-[16px] font-semibold text-black/90">Feature Permissions</Label>
            <Label className="text-sm text-black/60">Assign features to this position</Label>
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalAssigned} of {totalFeatures} assigned
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Feature categories */}
      <div className="w-full flex flex-col gap-3">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
            const stats = getCategoryStats(categoryFeatures)
            const isAllSelected = stats.assigned === stats.total && stats.total > 0

            return (
              <Card key={category} className="w-full">
                <Collapsible open={openCategories.has(category)} onOpenChange={() => toggleCategory(category)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors pb-3">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{category}</span>
                          </div>
                          <Badge variant={stats.assigned === stats.total ? "default" : "secondary"} className="text-xs">
                            {stats.assigned}/{stats.total}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {stats.total > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectAllInCategory(categoryFeatures, !isAllSelected)
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              {isAllSelected ? "Deselect All" : "Select All"}
                            </Button>
                          )}
                          {openCategories.has(category) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <ScrollArea className="max-h-64">
                        <div className="flex flex-col gap-2">
                          {categoryFeatures.map((feature) => {
                            const isAssigned = isFeatureAssigned(feature.feat_id)
                            const isLoading = loadingFeatures.has(feature.feat_id)

                            return (
                              <div
                                key={feature.feat_id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                  isAssigned
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Checkbox
                                      id={feature.feat_id}
                                      checked={isAssigned}
                                      onCheckedChange={(checked) => handleAssignment(feature, checked as boolean)}
                                      disabled={isLoading}
                                    />
                                    {isLoading && (
                                      <Loader2 className="absolute inset-0 w-4 h-4 animate-spin text-blue-500" />
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <Label
                                      htmlFor={feature.feat_id}
                                      className={`text-[14px] cursor-pointer font-medium ${
                                        isAssigned ? "text-green-800" : "text-black/80"
                                      }`}
                                    >
                                      {feature.feat_name}
                                    </Label>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isAssigned && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                      <Check className="w-3 h-3 mr-1" />
                                      Assigned
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
      </div>
    </div>
  )
}