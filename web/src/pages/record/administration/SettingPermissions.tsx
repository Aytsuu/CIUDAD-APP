import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Assigned } from "./administrationTypes"
import { useBatchPermissionUpdate, useUpdatePermission } from "./queries/administrationUpdateQueries"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Loader2,
  Check,
} from "lucide-react"

export default function SettingPermissions({
  selectedPosition,
  assignedFeatures,
}: {
  selectedPosition: string
  assignedFeatures: Assigned[]
}) {
  const permissions = ["view", "create", "update", "delete"]
  const queryClient = useQueryClient()
  const { mutateAsync: updatePermission } = useUpdatePermission()
  const { mutateAsync: batchPermissionUpdate } = useBatchPermissionUpdate()

  const [openFeatures, setOpenFeatures] = React.useState<Set<string>>(new Set())
  const [loadingPermissions, setLoadingPermissions] = React.useState<Set<string>>(new Set())

  // Filter assignedFeatures based on the selected position
  const filteredAssignedFeatures = React.useMemo(() => {
    return assignedFeatures.filter((feature) => feature.pos === selectedPosition)
  }, [assignedFeatures, selectedPosition])

  // Group features by category
  const groupedFeatures = React.useMemo(() => {
    const grouped: Record<string, Assigned[]> = {}
    filteredAssignedFeatures.forEach((feature) => {
      const category = feature.feat.feat_category || "Uncategorized"
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(feature)
    })
    return grouped
  }, [filteredAssignedFeatures])

  const changePermission = async (assignmentId: string, option: string, permission: boolean) => {
    const loadingKey = `${assignmentId}-${option}`
    setLoadingPermissions((prev) => new Set([...prev, loadingKey]))

    try {
      // Optimistically update the cache
      queryClient.setQueryData<Assigned[]>(["allAssignedFeatures"], (old = []) =>
        old.map((feature) =>
          feature.assi_id === assignmentId
            ? {
                ...feature,
                permissions: feature.permissions.map((perm: any) => ({
                  ...perm,
                  [option]: permission,
                })),
              }
            : feature,
        ),
      )

      await updatePermission({
        assignmentId,
        option,
        permission,
      })
    } finally {
      setLoadingPermissions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(loadingKey)
        return newSet
      })
    }
  }

  const handleAddAllForFeature = async (assignmentId: string, checked: boolean) => {
    const loadingKey = `${assignmentId}-all`
    setLoadingPermissions((prev) => new Set([...prev, loadingKey]))

    try {
      // Find the feature to update
      const featureToUpdate = assignedFeatures.find((feature) => feature.assi_id === assignmentId)

      if (!featureToUpdate) return

      // Optimistically update all permissions
      queryClient.setQueryData<Assigned[]>(["allAssignedFeatures"], (old = []) =>
        old.map((feature) =>
          feature.assi_id === assignmentId
            ? {
                ...feature,
                permissions: feature.permissions.map((perm: any) => {
                  const updated = { ...perm }
                  permissions.forEach((key) => {
                    if (key !== "view") updated[key] = checked
                  })
                  return updated
                }),
              }
            : feature,
        ),
      )

      // Update all permissions via API
      await batchPermissionUpdate({
        assignmentId: assignmentId,
        checked: checked,
      })
    } finally {
      setLoadingPermissions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(loadingKey)
        return newSet
      })
    }
  }

  // Helper function to flatten permissions
  const flattenPermissions = (permissions: Record<string, boolean>[]) => {
    return permissions.reduce(
      (acc, perm) => {
        Object.entries(perm).forEach(([key, value]) => {
          acc[key] = value
        })
        return acc
      },
      {} as Record<string, boolean>,
    )
  }

  const toggleFeature = (featureId: string) => {
    setOpenFeatures((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(featureId)) {
        newSet.delete(featureId)
      } else {
        newSet.add(featureId)
      }
      return newSet
    })
  }

  // List view component
  const ListView = () => (
    <div className="w-full flex flex-col gap-3">
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <Card key={category} className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryFeatures.length} feature{categoryFeatures.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              {categoryFeatures.map((feature) => {
                const flattenedPermissions = flattenPermissions(feature.permissions)
                const filteredPermissions = Object.entries(flattenedPermissions).filter(([key]) =>
                  permissions.includes(key),
                )
                const allPermissionsEnabled = filteredPermissions.every(([, value]) => value)
                const isOpen = openFeatures.has(feature.assi_id)

                return (
                  <Card key={feature.assi_id} className="border border-gray-200">
                    <Collapsible open={isOpen} onOpenChange={() => toggleFeature(feature.assi_id)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors pb-3">
                          <CardTitle className="flex items-center justify-between text-sm">
                            <div className="flex flex-col gap-1 text-left">
                              <span className="font-medium">{feature.feat.feat_name}</span>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {filteredPermissions
                                  .filter(([, value]) => value)
                                  .map(([key]) => (
                                    <Badge
                                      key={key}
                                      variant="secondary"
                                      className={`text-xs "text-gray-600"`}
                                    >
                                      <span className="ml-1 capitalize">{key}</span>
                                    </Badge>
                                  ))}
                                {filteredPermissions.filter(([, value]) => value).length === 0 && (
                                  <Badge variant="secondary" className="text-xs text-gray-500">
                                    No permissions
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isOpen ? (
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
                          <div className="flex flex-col gap-4">
                            {/* Grant All Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-gray-600" />
                                <Label className="font-medium">Grant All Permissions</Label>
                              </div>
                              <Switch
                                checked={allPermissionsEnabled}
                                onCheckedChange={(checked) => handleAddAllForFeature(feature.assi_id, checked)}
                                disabled={loadingPermissions.has(`${feature.assi_id}-all`)}
                              />
                            </div>

                            {/* Individual Permissions */}
                            <div className="grid grid-cols-2 gap-3">
                              {filteredPermissions.map(([key, value]) => {
                                const isLoading = loadingPermissions.has(`${feature.assi_id}-${key}`)

                                return (
                                  <div
                                    key={key}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                      value ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Label className="capitalize font-medium">{key}</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {value && <Check className="w-4 h-4 text-green-600" />}
                                      {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Checkbox
                                          checked={value}
                                          onCheckedChange={(checked) =>
                                            changePermission(feature.assi_id, key, checked as boolean)
                                          }
                                          disabled={key === "view"}
                                        />
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Label className="text-[16px] font-semibold text-black/90">Permission Settings</Label>
        <Label className="text-sm text-black/60">Configure detailed permissions for assigned features</Label>
      </div>

      <Separator />

      {/* Content */}
      <ScrollArea className="h-[600px]">
        <ListView />
      </ScrollArea>
    </div>
  )
}