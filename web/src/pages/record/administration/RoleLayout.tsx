import React from "react";
import AdministrationPositions from "./AdministrationPositions";
import FeatureSelection from "./FeatureSelection";
import SettingPermissions from "./SettingPermissions";
import { Label } from "@/components/ui/label";
import { useLocation } from "react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Assigned, Position } from "./administrationTypes";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";

export default function RoleLayout() {
  const location = useLocation();

  const params = React.useMemo(() => {
    return location.state?.params || {};
  }, [location.state]);

  const [positions, setPositions] = React.useState<Position[]>(
    params.positions
  );
  const [selectedPosition, setSelectedPosition] = React.useState<string>("");
  const [assignedFeatures, setAssignedFeatures] = React.useState<Assigned[]>(
    []
  );

  // Handle position selection
  const handlePositionSelect = React.useCallback((position: string) => {
    setSelectedPosition(position);
  }, []);

  React.useEffect(() => {
    if (!selectedPosition) return;
    setAssignedFeatures(
      Object.values(params.allAssignedFeatures as Assigned[]).filter(
        (value) => value.pos === selectedPosition
      )
    );
  }, [selectedPosition]);

  return (
    <LayoutWithBack title="Roles" description="Assign features to positions">
      <Card className="w-full h-[85%] flex">
        {/* Positions Section */}
        <div className="w-full h-full flex flex-col p-5">
          <AdministrationPositions
            positions={positions}
            setPositions={setPositions}
            selectedPosition={selectedPosition}
            setSelectedPosition={handlePositionSelect}
          />
        </div>

        {/* Features Section */}
        <div className="w-full border-l p-5 flex flex-col gap-4 overflow-auto">
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
              <Label className="text-[15px] text-black/60">
                No position selected
              </Label>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="w-full border-l flex flex-col gap-4">
          <div className="w-full px-5 pt-5 text-darkBlue1">
            <Label>Set feature permissions</Label>
          </div>
          <ScrollArea className="w-full h-full px-5">
            {!selectedPosition ? (
              <Label className="text-[15px] text-black/60">
                No position selected
              </Label>
            ) : !(assignedFeatures.length > 0) ? (
              <Label className="text-[15px] text-black/60">
                No feature selected
              </Label>
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
      </Card>
    </LayoutWithBack>
  );
}
