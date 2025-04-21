import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Assigned } from "./administrationTypes";
import { useBatchPermissionUpdate, useUpdatePermission } from "./queries/administrationUpdateQueries";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingPermissions({
  selectedPosition,
  assignedFeatures,
}: {
  selectedPosition: string; 
  assignedFeatures: Assigned[];
}) {
  const permissions = ["view", "create", "update", "delete"];
  const queryClient = useQueryClient();
  const { mutateAsync: updatePermission } = useUpdatePermission();
  const { mutateAsync: batchPermissionUpdate } = useBatchPermissionUpdate();

  // Filter assignedFeatures based on the selected position
  const filteredAssignedFeatures = React.useMemo(() => {
    return assignedFeatures.filter(feature => feature.pos === selectedPosition);
  }, [assignedFeatures, selectedPosition]);

  const changePermission = async (
    assignmentId: string,
    option: string,
    permission: boolean
  ) => {
    // Optimistically update the cache
    queryClient.setQueryData<Assigned[]>(['allAssignedFeatures'], (old = []) =>
      old.map(feature =>
        feature.assi_id === assignmentId
          ? {
              ...feature,
              permissions: feature.permissions.map((perm: any) => ({
                ...perm,
                [option]: permission
              }))
            }
          : feature
      )
    );

    await updatePermission({
      assignmentId,
      option,
      permission
    });
  };

  const handleAddAllForFeature = async (
    assignmentId: string,
    checked: boolean
  ) => {
    // Find the feature to update
    const featureToUpdate = assignedFeatures.find(
      feature => feature.assi_id === assignmentId
    );

    if (!featureToUpdate) return;

    // Optimistically update all permissions
    queryClient.setQueryData<Assigned[]>(['allAssignedFeatures'], (old = []) =>
      old.map(feature =>
        feature.assi_id === assignmentId
          ? {
              ...feature,
              permissions: feature.permissions.map((perm: any) => {
                const updated = { ...perm };
                permissions.forEach(key => {
                  if (key !== 'view') updated[key] = checked;
                });
                return updated;
              })
            }
          : feature
      )
    );

    // Update all permissions via API
    await batchPermissionUpdate({
      assignmentId: assignmentId,
      checked: checked
    })
  };

  // Helper function to flatten permissions
  const flattenPermissions = (permissions: Record<string, boolean>[]) => {
    return permissions.reduce((acc, perm) => {
      Object.entries(perm).forEach(([key, value]) => {
        acc[key] = value;
      });
      return acc;
    }, {} as Record<string, boolean>);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {filteredAssignedFeatures.map((feature) => {
        const flattenedPermissions = flattenPermissions(feature.permissions);
        const filteredPermissions = Object.entries(flattenedPermissions).filter(
          ([key]) => permissions.includes(key)
        );
        const allPermissionsEnabled = filteredPermissions.every(
          ([, value]) => value
        );

        return (
          <AccordionItem key={feature.assi_id} value={feature.assi_id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex gap-4">
                {feature.feat.feat_name}
                <div className="flex gap-1 items-center text-black/50">
                  {filteredPermissions
                    .filter(([, value]) => value)
                    .reduce((acc, [key], index, array) => {
                      acc.push(
                        <Label key={key} className="text-black/50 italic">
                          {key}
                        </Label>
                      );
                      if (index < array.length - 1 && array[index + 1][1]) {
                        acc.push(
                          <Label
                            key={`separator-${index}`}
                            className="text-black/50 italic"
                          >
                            {index === array.length - 2 ? " and " : ", "}
                          </Label>
                        );
                      }
                      return acc;
                    }, [] as JSX.Element[])}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`add-all-${feature.assi_id}`}
                  checked={allPermissionsEnabled}
                  onCheckedChange={(checked) =>
                    handleAddAllForFeature(feature.assi_id, checked as boolean)
                  }
                />
                <Label htmlFor={`add-all-${feature.assi_id}`} className="cursor-pointer">
                  All
                </Label>
              </div>

              {filteredPermissions.map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      changePermission(feature.assi_id, key, checked as boolean)
                    }
                    disabled={key === "view"}
                  />
                  <Label htmlFor={key} className="cursor-pointer">
                    {key}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}