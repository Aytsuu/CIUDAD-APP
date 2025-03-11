import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Assigned, Feature } from "./_types";
import api from "@/api/api";

export default function SettingPermissions(
    { selectedPosition, features, assignedFeatures }: {
        selectedPosition: string; // Pass the selected position as a prop
        features: Feature[];
        assignedFeatures: Assigned[];
    }
) {
    const permissions = React.useMemo(() => {
        return ['view', 'create', 'update', 'delete'];
    }, []);

    // State to manage permissions
    const [localAssignedFeatures, setLocalAssignedFeatures] = React.useState<Assigned[]>(assignedFeatures);

    // Filter assignedFeatures based on the selected position
    const filteredAssignedFeatures = React.useMemo(() => {
        return localAssignedFeatures.filter((feature) => feature.pos === selectedPosition);
    }, [localAssignedFeatures, selectedPosition]);

    const getFeatureName = (featureId: string) => {
        const feature = features.find((value) => value.feat_id === featureId);
        return feature ? feature.feat_name : undefined;
    };

    const changePermission = (assignmentId: string, option: string, permission: boolean) => {
        // Update the local state first
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

        // Send the API request
        api
            .put(`administration/permissions/${assignmentId}/`, { [option]: permission })
            .catch((err) => {
                console.log(err);
                // Revert the local state if the API call fails
                setLocalAssignedFeatures(assignedFeatures);
            });
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
                // Flatten the permissions for this feature
                const flattenedPermissions = flattenPermissions(feature.permissions);

                // Filter out permissions not in the permissions list
                const filteredPermissions = Object.entries(flattenedPermissions)
                    .filter(([key]) => permissions.includes(key));

                return (
                    <AccordionItem key={feature.assi_id} value={feature.assi_id}>
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex gap-4">
                                {getFeatureName(feature.feat)}
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
                                                    <Label key={`separator-${index}`} className="text-black/50 italic">
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