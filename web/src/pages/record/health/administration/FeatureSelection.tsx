import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FixedSizeList as List } from "react-window";
import { Assigned, Feature } from "./administrationTypes";
import { formatDate } from "@/helpers/dateFormatter";
import { useAuth } from "@/context/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAssignFeature, useSetPermission } from "./queries/administrationAddQueries";
import { useDeleteAssignedFeature } from "./queries/administrationDeleteQueries";

interface FeatureSelectionProps {
  selectedPosition: string;
  assignedFeatures: Assigned[];
  groupedFeatures: Record<string, Feature[]>;
  setAssignedFeatures: React.Dispatch<React.SetStateAction<Assigned[]>>;
}

export default function FeatureSelection({
  selectedPosition,
  assignedFeatures,
  groupedFeatures,
  setAssignedFeatures,
}: FeatureSelectionProps) {
  const { user } = useAuth();
  const { mutateAsync: assignFeature } = useAssignFeature();
  const { mutateAsync: setPermissions} = useSetPermission();
  const { mutate: deleteAssignedFeature} = useDeleteAssignedFeature();

  // Create a set for quick lookup of assigned feature IDs
  const assignedFeatureIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const af of assignedFeatures) {
      ids.add(af.feat.feat_id);
    }
    return ids;
  }, [assignedFeatures]);

  // Optimistic update for feature assignment
  const handleAssignment = React.useCallback(
    async (feature: any, checked: boolean) => {
      // Create a reference to the current state to avoid stale closures
      const currentAssignedFeatures = assignedFeatures;

      try {
        if (checked) {
          // Generate a stable temporary ID
          const tempId = `temp-${feature.feat_id}-${Date.now()}`;

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
          };

          // Update state immediately
          setAssignedFeatures((prev) => [...prev, newAssignment]);

          // Make API calls
          const assignment = await assignFeature({
            positionId: selectedPosition,
            featureId: feature.feat_id,
            staffId: user?.staff.staff_id,
          });
      
          const permission = await setPermissions({
            assi_id: assignment.assi_id
          });

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
            featureId: feature.feat_id
          });
        }
      } catch (error) {
        // Rollback to previous state
        setAssignedFeatures(currentAssignedFeatures);
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

  // Memoized row component
  const Row = React.memo(({ index, style, data } : {
    index: number;
    style: React.CSSProperties;
    data: Feature[];
  }) => {
    const feature = data[index];
    const handleChange = (checked: boolean) => handleAssignment(feature, checked);
    return (
      <div style={style}>
        <div className="flex items-center gap-3">
          <Checkbox
            id={feature.feat_id}
            checked={isFeatureAssigned(feature.feat_id)}
            onCheckedChange={handleChange}
          />
          <Label
            htmlFor={feature.feat_id}
            className="text-black/80 text-[14px] cursor-pointer"
          >
            {feature.feat_name}
          </Label>
        </div>
      </div>
    );
  });

  return (
    <Accordion type="multiple" className="w-full">
      <Separator />
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <AccordionItem key={category} value={category}>
          <AccordionTrigger className="text-black/80 text-[15px] font-medium">
            {category}
          </AccordionTrigger>
          <AccordionContent>
            <List
              height={categoryFeatures.length * 35}
              itemCount={categoryFeatures.length}
              itemSize={35}
              width="100%"
              itemData={categoryFeatures}
              overscanCount={10}
            >
              {Row}
            </List>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
