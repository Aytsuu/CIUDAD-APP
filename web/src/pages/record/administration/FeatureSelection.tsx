import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatDate } from "@/helpers/dateHelper"
import { useAuth } from "@/context/AuthContext"
import { useAssignFeature } from "./queries/administrationAddQueries"
import { useDeleteAssignedFeature } from "./queries/administrationDeleteQueries"
import {
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { capitalize } from "@/helpers/capitalize"
import { useUpdateAssignment } from "./queries/administrationUpdateQueries"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Assigned, Feature } from "./AdministrationTypes"

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
  const { mutateAsync: updateAssignment } = useUpdateAssignment();
  const { mutate: deleteAssignedFeature } = useDeleteAssignedFeature()
  const [loadingFeatures, setLoadingFeatures] = React.useState<Set<string>>(new Set())
  const [loadingPermissions, setLoadingPermissions] = React.useState<Set<string>>(new Set())

  // Create a set for quick lookup of assigned feature IDs
  const assignedFeatureIds = React.useMemo(() => {
    const ids = new Set<string>()
    for (const af of assignedFeatures) {
      ids.add(af.feat.feat_id)
    }
    return ids
  }, [assignedFeatures])

  const handleChangePermission = async (feat_id: string, assi_id: string, permission: string) => {
    setLoadingPermissions((prev) => new Set([...prev, feat_id]))
    try {
      const formatPerm = permission === 'view only' ? 'VIEW ONLY' : 'FULL CONTROL'
      await updateAssignment({
        assi_id: assi_id,
        data: {
          assi_permission: formatPerm
        }
      })
    } finally {
      setLoadingPermissions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(feat_id);
        return newSet;
      })
    }
  }

  // Optimistic update for feature assignment
  const handleCheckbox = React.useCallback(
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
            assi_date: formatDate(new Date()) ?? "",
            feat: feature,
            pos: {
              pos_id: selectedPosition
            },
            assi_permission: 'VIEW ONLY'
          }

          // Update state immediately
          setAssignedFeatures((prev) => [...prev, newAssignment])

          // // Make API calls
          const assignment = await assignFeature({
            positionId: selectedPosition,
            featureId: feature.feat_id,
            staffId: user?.staff?.staff_id || "",
          })

          // Update with real data
          setAssignedFeatures((prev) =>
            prev.map((item) =>
              item.feat.feat_id === feature.feat_id && item.assi_id === tempId
                ? {
                    ...item,
                    assi_id: assignment.assi_id
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

  const getPermission = React.useCallback((feat_id: string) => {
    if(!feat_id) return;
    const feature = assignedFeatures.find((assi: any) =>
      assi.feat.feat_id == feat_id
    );
    return feature?.assi_permission
  }, [assignedFeatures])

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
        handleCheckbox(feature, true)
      } else if (!selectAll && isAssigned) {
        handleCheckbox(feature, false)
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

      {/* Feature categories - Accordion */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="w-full pr-4 pt-1 pb-16">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
              const stats = getCategoryStats(categoryFeatures)
              const isAllSelected = stats.assigned === stats.total && stats.total > 0

              return (
                <AccordionItem key={category} value={category} className="border-none">
                  <Card className="w-full">
                    <AccordionTrigger className="hover:no-underline p-0 pr-5">
                      <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors pb-4 w-full">
                        <CardTitle className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{category}</span>
                            </div>
                            <Badge variant={"secondary"} className={`text-xs 
                            ${stats.assigned === stats.total ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
                              {stats.assigned}/{stats.total}
                            </Badge>
                          </div>  
                          <div className="flex items-center gap-2">
                            {stats.total > 1 && (
                              <ConfirmationModal 
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                  > 
                                    {isAllSelected ? "Deselect All" : "Select All"} 
                                  </Button>
                                }
                                title={`${isAllSelected ? "Deselection" : "Selection"} Confirmation`}
                                description={`Are you sure you want to ${isAllSelected ? "deselect" : "select"} all ${category} features?`}
                                onClick={() => {
                                  handleSelectAllInCategory(categoryFeatures, !isAllSelected)
                                }}
                                variant={isAllSelected ? "destructive" : ""}
                              />
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </AccordionTrigger>

                    <AccordionContent className="pb-0">
                      <CardContent className="pt-0">
                        <ScrollArea className="max-h-64">
                          <div className="grid gap-2">
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
                                        onCheckedChange={(checked) => handleCheckbox(feature, checked as boolean)}
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
                                  {!isLoading && isAssigned && (
                                    <div className="flex items-center gap-2">
                                      {loadingPermissions.has(feature.feat_id) ? (
                                        <Button variant="outline" className="text-xs font-semibold h-6 p-2 shadow-none bg-green-100 
                                          border-green-100 text-green-800 cursor-pointer hover:border-green-500 hover:bg-green-50
                                          hover:text-green-800 gap-1
                                          "
                                          disabled
                                        > 
                                          <Loader2 className="w-4 h-4 animate-spin text-green-800" />
                                        </Button>
                                      ) : (<DropdownLayout 
                                        trigger={
                                          <Button variant="outline" className="text-xs font-semibold h-6 p-2 shadow-none bg-green-100 
                                          border-green-100 text-green-800 cursor-pointer hover:border-green-500 hover:bg-green-50
                                          hover:text-green-800 gap-1
                                          "> 
                                            {capitalize(getPermission(feature.feat_id) as string)} 
                                            <ChevronDown className="w-3 h-3 "/>
                                          </Button>
                                        }
                                        options={[
                                          {id: 'view only', name: "View Only"},
                                          {id: 'full control', name: "Full Control"}
                                        ]}
                                        onSelect={(value) => {
                                          if(value !== getPermission(feature.feat_id)?.toLowerCase()) {
                                            const assigment = assignedFeatures.find((assi: any) => assi.feat.feat_id == feature.feat_id)
                                            handleChangePermission(feature.feat_id, assigment?.assi_id as string, value)
                                          }
                                        }}
                                      />)}
                                      
                                      <Badge variant="secondary" className="text-xs bg-green-100 
                                      text-green-800 hover:bg-green-100 hover:text-green-800">
                                        <Check className="w-3 h-3 mr-1" />
                                        Assigned
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  )
}