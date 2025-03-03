import React from "react";
import AdministrativePositions from "./AdministrativePositions";
import FeatureSelection from "./FeatureSelection";
import SettingPermissions from "./SettingPermissions";
import { Check, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Permissions } from "./_types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

const features: Record<string, string> = {
    profiling: "Profiling",
    blotter: "Blotter Complaint",
    drrReport: "Incident Report",
    clearance: "Clearance",
    summon: "Summon",
    sessionSched: "Session Scheduling",
    budgetPlan: "Budget Plan",
    eduGrant: "Educational Grants",
    wasteSched: "Waste Scheduling",
    wasteReport: "Waste Report",
    ordRes: "Ordinance & Resolution",
    incomeExpense: "Income and Expense",
    developmentPlan: "Annual Development Plan",
    projectProposal: "Project Proposal",
    disbursement: "Disbursement and Monitoring",
    donation: "Donation",
    announcement: "Announcement",
};
  

export default function RoleLayout() {
    const [addClicked, setAddClicked] = React.useState<boolean>(false);
    const [selectedPosition, setSelectedPosition] = React.useState<string>('');

    // State to track selected features
    const [selectedFeatures, setSelectedFeatures] = React.useState<Record<string, boolean>>(
    Object.keys(features).reduce((acc, feature) => {
        acc[feature] = false; // Initialize all checkboxes as unchecked
        return acc;
    }, {} as Record<string, boolean>)
    );

    const [permissions, setPermissions] = React.useState<Permissions>(()=> {
    const initialPermissions: Permissions = {}
    Object.keys(selectedFeatures).map((key) => (
        initialPermissions[key] = {
            view: true,
            create: false,
            update: false,
            delete: false
        }
    ))
    return initialPermissions
    })

    const navigate = useNavigate();
    const hasSelectedFeature = Object.values(selectedFeatures).some((value) => value === true);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header Section */}
            <div className="flex items-center mb-4 gap-3">
                {/* Header - Stacks vertically on mobile */}
                <Button 
                    className="text-black p-2 self-start"
                    variant={"outline"}
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft />
                </Button>
                <div className="flex flex-col">
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                        Roles
                    </h1>
                    <p className="text-xs sm:text-sm text-darkGray">
                        Assign features to positions
                    </p>
                </div>  
            </div>

            <hr className="border-gray mb-5 sm:mb-8" />

            <div className="w-full h-4/5 bg-white border border-gray rounded-[5px] flex">
                <div className="w-1/2 h-full flex flex-col gap-4 p-5">
                    <div className="w-full flex justify-between items-start">
                        <Label className="text-[22px] text-darkBlue1">Positions</Label>
                        {!addClicked && (
                            <Button onClick={() => setAddClicked(true)}>
                                <Plus /> Add
                            </Button>
                        )}
                    </div>

                    <Separator />

                    <div
                        className={`transition-all duration-300 ease-in-out  ${
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
                    
                    <AdministrativePositions 
                        selectedPosition={selectedPosition} 
                        setSelectedPosition={setSelectedPosition}
                    />
                </div>
                <div className="w-1/2 h-full border-l border-gray p-5 flex flex-col gap-4">
                    <div className="w-full">
                        <Label>Mark the features to be assigned</Label>
                    </div>
                    {
                        selectedPosition ? 
                        (<FeatureSelection 
                            features={features}
                            selectedFeatures={selectedFeatures} 
                            setSelectedFeatures={setSelectedFeatures}
                        />) :
                        (<Label className="text-[15px] text-black/60">No position selected</Label>)
                    }
                </div>
                <div className="w-full h-full border-l border-gray flex flex-col gap-4">
                    <div className="w-full px-5 pt-5">
                        <Label>Set feature permissions</Label>
                    </div>
                    <ScrollArea className="w-full h-full px-5">
                        {
                            !selectedPosition ? 
                            (<Label className="text-[15px] text-black/60">No position selected</Label>) :
                            !hasSelectedFeature ? 
                            (<Label className="text-[15px] text-black/60">No feature selected</Label>) :
                            (
                                <>
                                <Separator />
                                {Object.entries(selectedFeatures).map(([key,value]) => (
                                    (value && 
                                    <SettingPermissions 
                                        key={key} 
                                        id={key}
                                        feature={features[key]}
                                        permissions={permissions[key]} 
                                        setPermissions={setPermissions}
                                    />)
                                ))}
                                </>
                            )
                        }   
                    </ScrollArea><div className="w-full flex justify-end px-5 pb-5">
                        {hasSelectedFeature && <Button>Save</Button>}
                    </div>
                </div>  
            </div>
        </div>
    );
}