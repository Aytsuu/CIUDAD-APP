<<<<<<< HEAD
=======
import React from "react";
>>>>>>> master
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { PermissionKey, Permissions } from "./_types";

export default function SettingPermissions({id, feature, permissions, setPermissions} : 
    { 
        id: string
        feature: string
        permissions: Record<string, boolean>, 
        setPermissions: (value: Permissions | ((prev: Permissions) => Permissions)) => void}
) {

  // Handle checkbox change for a specific feature and permission
    const handleCheckboxChange = (featureId: string, optionId: PermissionKey) => {
        setPermissions((prevPermissions) => ({
        ...prevPermissions, // Spread the previous permissions
        [featureId]: {
            ...prevPermissions[featureId], // Spread the previous permissions for the specific feature
            [optionId]: !prevPermissions[featureId][optionId], // Toggle the permission
        },
        }));
=======
import { Assigned, Feature } from "./administrationTypes";
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
    const [localAssignedFeatures, setLocalAssignedFeatures] = React.useState<Assigned[]>([]);

    React.useEffect(() => {
        setLocalAssignedFeatures(assignedFeatures);
    }, [assignedFeatures]);

    // Filter assignedFeatures based on the selected position
    const filteredAssignedFeatures = React.useMemo(() => {
        return localAssignedFeatures.filter((feature) => feature.pos === selectedPosition);
    }, [localAssignedFeatures, selectedPosition]);

    const getFeatureName = (featureId: string) => {
        const feature = features.find((value) => value.feat_id === featureId);
        return feature ? feature.feat_name : undefined;
    };

    const changePermission = async (assignmentId: string, option: string, permission: boolean) => {
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
    
        // Send the API request
        try {
            await api.put(`administration/permissions/${assignmentId}/`, { [option]: permission });
        } catch (err) {
            console.error(err);
            // Revert the local state if the API call fails
            setLocalAssignedFeatures((prev) =>
                prev.map((feature) =>
                    feature.assi_id === assignmentId
                        ? {
                            ...feature,
                            permissions: feature.permissions.map((perm: any) => ({
                                ...perm,
                                [option]: !permission, // Revert to the previous value
                            })),
                        }
                        : feature
                )
            );
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

    const handleAddAllForFeature = async (assignmentId: string, checked: boolean) => {
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
                                if (permissions.includes(key)) {
                                    updatedPerm[key] = key !== 'view' ? checked : perm[key];
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
        const featureToUpdate = localAssignedFeatures.find((feature) => feature.assi_id === assignmentId);
    
        if (featureToUpdate) {
            // Flatten permissions for the feature
            const flattenedPTU = flattenPermissions(featureToUpdate.permissions);
    
            // Filter permissions to include only those in the `permissions` array
            const permissionsToUpdate = Object.entries(flattenedPTU).filter(([key]) =>
                permissions.includes(key)
            );
    
            // Make API calls to update permissions
            for (const [key, value] of permissionsToUpdate) {
                try {
                    await api.put(`administration/permissions/${assignmentId}/`, {
                        [key]: key !== 'view' ? checked : value,
                    });
                } catch (err) {
                    console.error(err);
                    // Revert the local state if the API call fails
                    setLocalAssignedFeatures(assignedFeatures);
                }
            }
        }
>>>>>>> master
    };

    return (
        <Accordion type="single" collapsible className="w-full">
<<<<<<< HEAD
            <AccordionItem value={id}>
                <AccordionTrigger className="hover:no-underline">
                    <div className="flex gap-4">
                        {feature} 
                        <div className="flex gap-1 items-center text-black/50">
                            
                                { 
                                    Object.entries(permissions)
                                    .filter(([_, value]) => value) // Filter only truthy values
                                    .reduce((acc, [key], index, array) => {
                                    acc.push(<Label className="text-black/50 italic">{key}</Label>);

                                    // Add separator if the next item exists and has a truthy value
                                    if (index < array.length - 1 && array[index + 1][1]) {
                                        acc.push(
                                        <Label className="text-black/50 italic">
                                            {index === array.length - 2 ? " and " : ", "}
                                        </Label>
                                        );
                                    }
                                    return acc;
                                    }, [] as JSX.Element[])
                                }
                            
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3">
                    {/* Map through each permission option for the feature */}
                    {
                        Object.entries(permissions).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex items-center gap-3"
                            >
                                {/* Checkbox for the permission */}
                                <Checkbox
                                    id={key} // Unique ID for the checkbox
                                    checked={value} // Checked state from permissions state
                                    onCheckedChange={() =>
                                        handleCheckboxChange(id, key as PermissionKey) // Handle change
                                    } 

                                    disabled={key === "view" && true}
                                />

                                <Label
                                    htmlFor={key}
                                    className="cursor-pointer"
                                >
                                    {key}
                                </Label>
                            </div>
                        ))
                    }
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
=======
            {filteredAssignedFeatures.map((feature) => {
                // Flatten the permissions for this feature
                const flattenedPermissions = flattenPermissions(feature.permissions);

                // Filter out permissions not in the permissions list
                const filteredPermissions = Object.entries(flattenedPermissions)
                    .filter(([key]) => permissions.includes(key));

                // Check if all permissions are already enabled for this feature
                const allPermissionsEnabled = filteredPermissions.every(([, value]) => value);

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
                            {/* Add All Checkbox for each feature */}
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
                                        disabled={key === 'view'}
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
>>>>>>> master
