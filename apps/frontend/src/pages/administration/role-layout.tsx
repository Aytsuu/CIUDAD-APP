import React from "react";
import AdministrativePositions from "./administrative-positions";
import FeatureSelection from "./feature-selection";
import SettingPermissions from "./setting-permissions";
import { Check, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

export default function RoleLayout() {
    const [addClicked, setAddClicked] = React.useState(false);

    return (
        <div className="w-screen h-screen bg-snow flex justify-center items-center">
            <div className="w-[80%] h-4/5 bg-white border border-gray rounded-[5px] flex">
                <div className="w-1/2 h-full flex flex-col gap-4 p-5">
                    <div className="w-full flex justify-between items-start">
                        <Label className="text-[22px] text-darkBlue1">Positions</Label>
                        {!addClicked && (
                            <Button onClick={() => setAddClicked(true)}>
                                <Plus /> Add
                            </Button>
                        )}
                    </div>
                    {/* Input container with Tailwind transition */}
                    <div
                        className={`transition-all duration-300 ease-in-out ${
                            addClicked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 h-0"}`}
                    >
                        {addClicked && (
                            <div className="flex items-center gap-2">
                                <Input placeholder="Enter position title" />

                                <TooltipLayout 
                                    trigger={
                                        <Check
                                            size={26}
                                            className="cursor-pointer text-black/60 stroke-[1.5] hover:text-black"
                                            onClick={() => setAddClicked(false)}
                                        />
                                    }
                                    content={"Save"}
                                />  
                            </div>
                        )}
                    </div>
                    <Separator />
                    <AdministrativePositions />
                </div>
                <div className="w-1/2 h-full border-l border-gray p-5 flex flex-col gap-4">
                    <div className="w-full">
                        <Label>Mark the features to be assigned</Label>
                    </div>
                    <FeatureSelection />
                </div>
                <div className="w-full h-full border-l border-gray p-5 flex flex-col gap-4">
                    <div className="w-full">
                        <Label>Set feature permissions</Label>
                    </div>
                    <SettingPermissions />
                </div>
            </div>
        </div>
    );
}