import React from "react";
import AdministrativePositions from "./AdministrativePositions";
import FeatureSelection from "./FeatureSelection";
import SettingPermissions from "./SettingPermissions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Assigned, Positions } from "./administrationTypes";
  
export default function RoleLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedPosition, setSelectedPosition] = React.useState<string>('');
    const [assignedFeatures, setAssignedFeatures] = React.useState<Assigned[]>([]);
    
    const params = React.useMemo(() => {
      return location.state?.params || {}
    }, [location.state])

    const [positions, setPositions] = React.useState<Positions[]>(params.positions)
  
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
              positions={positions}
              setPositions={setPositions}
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
                  features={params.features}
                  assignedFeatures={assignedFeatures}
                  setAssignedFeatures={setAssignedFeatures}
                />
              ) : (
                <Label className="text-[15px] text-black/60">No position selected</Label>
              )}
            </div>
          </div>
  
          {/* Permissions Section */}
          <div className="w-full h-full border-l border-gray flex flex-col gap-4">
            <div className="w-full px-5 pt-5 text-darkBlue1">
              <Label>Set feature permissions</Label>
            </div>
            <ScrollArea className="w-full h-full px-5">
              {!selectedPosition ? (
                <Label className="text-[15px] text-black/60">No position selected</Label>
              ) : !(assignedFeatures.length > 0) ? (
                <Label className="text-[15px] text-black/60">No feature selected</Label>
              ) : (
                <>
                  <SettingPermissions
                    selectedPosition={selectedPosition}
                    features={params.features}
                    assignedFeatures={assignedFeatures}
                  />
                </>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }
