import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
    };

    return (
        <Accordion type="single" collapsible className="w-full">
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
