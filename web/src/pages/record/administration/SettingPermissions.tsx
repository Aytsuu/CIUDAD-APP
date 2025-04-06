import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Assigned } from "./administrationTypes";
import { updatePermission } from "./restful-api/administrationPutAPI";

export default function SettingPermissions({
  selectedPosition,
  assignedFeatures,
}: {
  selectedPosition: string; // Pass the selected position as a prop
  assignedFeatures: Assigned[];
}) {
  const permissions = ["view", "create", "update", "delete"];

  // State to manage permissions
  const [localAssignedFeatures, setLocalAssignedFeatures] =
    React.useState<Assigned[]>(assignedFeatures);

  React.useEffect(() => {
    setLocalAssignedFeatures(assignedFeatures);
  }, [assignedFeatures, selectedPosition]);

  // Filter assignedFeatures based on the selected position
  const filteredAssignedFeatures = React.useMemo(() => {
    return localAssignedFeatures.filter(
      (feature) => feature.pos == selectedPosition
    );
  }, [localAssignedFeatures, selectedPosition]);

  const changePermission = async (
    assignmentId: string,
    option: string,
    permission: boolean
  ) => {
    const previousState = [...localAssignedFeatures];

    // Update the local state first using a functional update
    setLocalAssignedFeatures((prev) =>
      prev.map((feature) =>
        feature.assi_id === assignmentId
          ? {
              ...feature,
              permissions: feature.permissions.map((perm: any) => ({
                ...perm,
                [option]: permission,
              })),
            }
          : feature
      )
    );

    const res = await updatePermission(assignmentId, option, permission);

    if (!res) {
      // Revert the local state if the API call fails
      setLocalAssignedFeatures(previousState);
    }
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

  const handleAddAllForFeature = async (
    assignmentId: string,
    checked: boolean
  ) => {
    // Update the local state first
    setLocalAssignedFeatures((prev) =>
      prev.map((feature) =>
        feature.assi_id === assignmentId
          ? {
              ...feature,
              permissions: feature.permissions.map((perm: any) => {
                const updatedPerm: Record<string, boolean> = {};
                Object.keys(perm).forEach((key) => {
                  // Update all permissions except 'view'
                  if (permissions.includes(key) && key !== "view") {
                    updatedPerm[key] = checked;
                  } else {
                    updatedPerm[key] = perm[key]; // Preserve other keys
                  }
                });
                return updatedPerm;
              }),
            }
          : feature
      )
    );

    // Find the feature to update
    const featureToUpdate = localAssignedFeatures.find(
      (feature) => feature.assi_id === assignmentId
    );

    if (featureToUpdate) {
      // Flatten permissions for the feature
      const flattenedPTU = flattenPermissions(featureToUpdate.permissions);

      // Filter permissions to include only those in the `permissions` array
      const permissionsToUpdate = Object.entries(flattenedPTU).filter(
        ([key]) => permissions.includes(key) && key !== "view"
      );

      // Make API calls to update permissions
      for (const [key, _] of permissionsToUpdate) {
        const res = await updatePermission(assignmentId, key, checked);

        if (res?.status !== 200) {
          // Revert checked boxes
          setLocalAssignedFeatures(assignedFeatures);
        }
      }
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {filteredAssignedFeatures.map((feature) => {
        // Flatten the permissions for this feature
        const flattenedPermissions = flattenPermissions(feature.permissions);

        // Filter out permissions not in the permissions list
        const filteredPermissions = Object.entries(flattenedPermissions).filter(
          ([key]) => permissions.includes(key)
        );

        // Check if all permissions are already enabled for this feature
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
                    .filter(([, value]) => value) // Filter only truthy values
                    .reduce((acc, [key], index, array) => {
                      acc.push(
                        <Label key={key} className="text-black/50 italic">
                          {key}
                        </Label>
                      );

                      // Add separator if the next item exists and has a truthy value
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
              {/* Add All Checkbox for each feature */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`add-all-${feature.assi_id}`}
                  checked={allPermissionsEnabled}
                  onCheckedChange={(checked) =>
                    handleAddAllForFeature(feature.assi_id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`add-all-${feature.assi_id}`}
                  className="cursor-pointer"
                >
                  All
                </Label>
              </div>

              {/* Map through each permission option for the feature */}
              {filteredPermissions.map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  {/* Checkbox for the permission */}
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
