import React from "react";
import AdministrativePositions from "./AdministrativePositions";
import FeatureSelection from "./FeatureSelection";
import SettingPermissions from "./SettingPermissions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Permissions } from "./_types";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
  
export default function RoleLayout() {
    const navigate = useNavigate();
    const [selectedPosition, setSelectedPosition] = React.useState<string>('');
  
    // State to track selected features for each position
    const [positionFeatures, setPositionFeatures] = React.useState<
      Record<string, Record<string, Record<string, boolean>>>
    >({});
  
  
    // Check if any feature is selected for the current position
    const hasSelectedFeature = selectedPosition
      ? Object.values(positionFeatures[selectedPosition] || {}).some((category) =>
          Object.values(category).some((value) => value === true))
      : false;
  
    // Handle position selection
    const handlePositionSelect = (position: string) => {
      setSelectedPosition(position);
    };
  
    return (
      <div className="w-full h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-center mb-4 gap-3">
          <Button
            className="text-black p-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Roles</h1>
            <p className="text-xs sm:text-sm text-darkGray">Assign features to positions</p>
          </div>
        </div>
  
        <hr className="border-gray mb-5 sm:mb-8" />
  
        <div className="w-full h-4/5 bg-white border border-gray rounded-[5px] flex">
          {/* Positions Section */}
          <div className="w-1/2 h-full flex flex-col p-5">
            <AdministrativePositions
              selectedPosition={selectedPosition}
              setSelectedPosition={handlePositionSelect}
            />
          </div>
  
          {/* Features Section */}
          <div className="w-1/2 h-full border-l border-gray p-5 flex flex-col gap-4 overflow-auto">
            <div className="w-full text-darkBlue1">
              <Label>Mark the features to be assigned</Label>
            </div>
            <div className="flex flex-col">
              {selectedPosition ? (
                <FeatureSelection
                  selectedPosition={selectedPosition} 
                />
              ) : (
                <Label className="text-[15px] text-black/60">No position selected</Label>
              )}
            </div>
          </div>
  
          {/* Permissions Section */}
          <div className="w-full h-full border-l border-gray flex flex-col gap-4">
            {/* <div className="w-full px-5 pt-5 text-darkBlue1">
              <Label>Set feature permissions</Label>
            </div>
            <ScrollArea className="w-full h-full px-5">
              {!selectedPosition ? (
                <Label className="text-[15px] text-black/60">No position selected</Label>
              ) : !hasSelectedFeature ? (
                <Label className="text-[15px] text-black/60">No feature selected</Label>
              ) : (
                <>
                  <Separator />
                  {Object.entries(positionFeatures[selectedPosition]).map(([category, categoryFeatures]) =>
                    Object.entries(categoryFeatures).map(([featureId, isSelected]) =>
                      isSelected && (
                        <SettingPermissions
                          key={`${category}-${featureId}`}
                          id={featureId}
                          feature={features[category][featureId]}
                          permissions={positionPermissions[selectedPosition][category]}
                          setPermissions={(updatedPermissions) =>
                            setPositionPermissions((prev) => ({
                              ...prev,
                              [selectedPosition]: {
                                ...prev[selectedPosition],
                                [category]: updatedPermissions,
                              },
                            }))
                          }
                        />
                      )
                    )
                  )}
                </>
              )}
            </ScrollArea> */}
            <div className="w-full flex justify-end px-5 pb-5">
              {hasSelectedFeature && <Button>Save</Button>}
            </div>
          </div>
        </div>
      </div>
    );
  }