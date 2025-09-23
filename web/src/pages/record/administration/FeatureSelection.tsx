import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/helpers/dateHelper";
import { useAuth } from "@/context/AuthContext";
import { useAssignFeature } from "./queries/administrationAddQueries";
import { useDeleteAssignedFeature } from "./queries/administrationDeleteQueries";
import { Check, Loader2 } from "lucide-react";
import { Assigned, Feature } from "./AdministrationTypes";

interface FeatureSelectionProps {
  selectedPosition: string;
  assignedFeatures: Assigned[];
  features: Feature[];
  setAssignedFeatures: React.Dispatch<React.SetStateAction<Assigned[]>>;
}

export default function FeatureSelection({
  selectedPosition,
  assignedFeatures,
  features,
  setAssignedFeatures,
}: FeatureSelectionProps) {
  // =================== STATE INITIALIZATION ===================
  const { user } = useAuth();
  const { mutateAsync: assignFeature } = useAssignFeature();
  const { mutate: deleteAssignedFeature } = useDeleteAssignedFeature();
  const [loadingFeatures, setLoadingFeatures] = React.useState<Set<string>>(
    new Set()
  );

  // Create a set for quick lookup of assigned feature IDs
  const assignedFeatureIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const af of assignedFeatures) {
      ids.add(af.feat.feat_id);
    }
    return ids;
  }, [assignedFeatures]);

  const totalAssigned = assignedFeatures.length;
  const totalFeatures = features.length;

  // =================== HANDLERS ===================
  // Optimistic update for feature assignment
  const handleCheckbox = React.useCallback(
    async (feature: any, checked: boolean) => {
      const featureId = feature.feat_id;

      // Add to loading state
      setLoadingFeatures((prev) => new Set([...prev, featureId]));

      // Create a reference to the current state to avoid stale closures
      const currentAssignedFeatures = assignedFeatures;

      try {
        if (checked) {
          // Generate a stable temporary ID
          const tempId = `temp-${feature.feat_id}-${Date.now()}`;

          // Create the optimistic update
          const newAssignment: Assigned = {
            assi_id: tempId,
            assi_date: formatDate(new Date()) ?? "",
            feat: feature,
            pos: {
              pos_id: selectedPosition,
            }
          };

          // Update state immediately
          setAssignedFeatures((prev) => [...prev, newAssignment]);

          // // Make API calls
          const assignment = await assignFeature({
            positionId: selectedPosition,
            featureId: feature.feat_id,
            staffId: user?.staff?.staff_id || "",
          });

          // Update with real data
          setAssignedFeatures((prev) =>
            prev.map((item) =>
              item.feat.feat_id === feature.feat_id && item.assi_id === tempId
                ? {
                    ...item,
                    assi_id: assignment.assi_id,
                  }
                : item
            )
          );
        } else {
          // Find the exact assignment to remove
          const assignmentToRemove = currentAssignedFeatures.find(
            (af) => af.feat.feat_id === feature.feat_id
          );
          if (!assignmentToRemove) return;

          // Optimistic update - remove from state
          setAssignedFeatures((prev) =>
            prev.filter((item) => item.feat.feat_id !== feature.feat_id)
          );

          // API call
          deleteAssignedFeature({
            positionId: selectedPosition,
            featureId: feature.feat_id,
          });
        }
      } catch (error) {
        // Rollback to previous state
        setAssignedFeatures(currentAssignedFeatures);
      } finally {
        // Remove from loading state
        setLoadingFeatures((prev) => {
          const newSet = new Set(prev);
          newSet.delete(featureId);
          return newSet;
        });
      }
    },
    [selectedPosition, assignedFeatures]
  );

  // Check if a feature is assigned
  const isFeatureAssigned = React.useCallback(
    (featureId: string) => {
      return assignedFeatureIds.has(featureId);
    },
    [assignedFeatureIds]
  );

  // Handle row click
  const handleRowClick = React.useCallback(
    (feature: Feature, event: React.MouseEvent) => {
      // Prevent triggering if already loading
      if (loadingFeatures.has(feature.feat_id)) {
        return;
      }

      // Don't trigger if clicking directly on the checkbox (it handles itself)
      if (event.target instanceof HTMLElement) {
        const target = event.target;
        const isCheckboxClick = 
          target.closest('[role="checkbox"]') || 
          (target instanceof HTMLInputElement && target.type === 'checkbox') ||
          target.getAttribute('data-state') !== null;
        
        if (isCheckboxClick) {
          return;
        }
      }

      const currentlyAssigned = isFeatureAssigned(feature.feat_id);
      handleCheckbox(feature, !currentlyAssigned);
    },
    [loadingFeatures, isFeatureAssigned, handleCheckbox]
  );

  // =================== RENDER ===================
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header with search and stats */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label className="text-[16px] font-semibold text-black/90">
              Feature Permissions
            </Label>
            <Label className="text-sm text-black/60">
              Assign features to this position
            </Label>
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalAssigned} of {totalFeatures} assigned
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Feature categories - Accordion */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="w-full pr-4 pt-1 pb-16 space-y-4">
          {features.map((feature) => {
            const isAssigned = isFeatureAssigned(feature.feat_id);
            const isLoading = loadingFeatures.has(feature.feat_id);

            return (
              <div
                key={feature.feat_id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isAssigned
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200 hover:border-blue-500"
                } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
                onClick={(e) => handleRowClick(feature, e)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Checkbox
                      id={feature.feat_id}
                      checked={isAssigned}
                      onCheckedChange={(checked) =>
                        handleCheckbox(feature, checked as boolean)
                      }
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
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 
                                      text-green-800 hover:bg-green-100 hover:text-green-800"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Assigned
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}