import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Define the type for permission keys
type PermissionKey = "view" | "create" | "update" | "delete";

// Define the type for the permissions state
type Permissions = {
    [featureId: string]: {
        // Each feature has its own set of permissions
        view: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
    };
};

// Mock data for features
const features: { id: string; name: string }[] = [
    { id: "profiling", name: "Profiling" },
    { id: "blotter", name: "Blotter Complaint" },
    { id: "drr-report", name: "Incident Report" },
    { id: "clearance", name: "Clearance" },
    { id: "summon", name: "Summon" },
];

// Mock data for category options (permissions)
const categoryOptions: { id: PermissionKey; label: string }[] = [
    // Permission key (e.g., "view", "create")
    { id: "view", label: "View" },
    { id: "create", label: "Create" },
    { id: "update", label: "Update" },
    { id: "delete", label: "Delete" },
];

export default function SettingPermissions() {
    // State to manage permissions for each feature
    const [permissions, setPermissions] = React.useState<Permissions>(() => {
        // Initialize permissions state with default values (all permissions unchecked)
        const initialPermissions: Permissions = {};
        features.forEach((feature) => {
        initialPermissions[feature.id] = {
            view: false,
            create: false,
            update: false,
            delete: false,
        };
        });
        return initialPermissions;
    });

  // Handle checkbox change for a specific feature and permission
    const handleCheckboxChange = (featureId: string, optionId: PermissionKey) => {
        setPermissions((prevPermissions) => ({
        ...prevPermissions, // Spread the previous permissions
        [featureId]: {
            ...prevPermissions[featureId], // Spread the previous permissions for the specific feature
            [optionId]: !prevPermissions[featureId][optionId], // Toggle the permission
        },
        }));
    };

    return (
        <Accordion type="single" collapsible className="w-full">
            <Separator />
            {features.map((feature) => (
                <AccordionItem key={feature.id} value={feature.id}>
                    <AccordionTrigger>{feature.name}</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-3">
                        {/* Map through each permission option for the feature */}
                        {categoryOptions.map((option) => (
                        <div
                            key={`${feature.id}-${option.id}`}
                            className="flex items-center gap-3"
                        >
                            {/* Checkbox for the permission */}
                            <Checkbox
                                id={`${feature.id}-${option.id}`} // Unique ID for the checkbox
                                checked={permissions[feature.id][option.id]} // Checked state from permissions state
                                onCheckedChange={() =>
                                handleCheckboxChange(feature.id, option.id) // Handle change
                            } 
                            />

                            <Label
                            htmlFor={`${feature.id}-${option.id}`}
                            className="cursor-pointer"
                            >
                            {option.label}
                            </Label>
                        </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
