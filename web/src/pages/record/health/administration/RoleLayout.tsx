import React from "react";
import AdministrationPositions from "./AdministrationPositions";
import FeatureSelection from "./FeatureSelection";
import SettingPermissions from "./SettingPermissions";
import { Label } from "@/components/ui/label";
import { useLocation } from "react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Assigned, Feature } from "./administrationTypes";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { useAllAssignedFeatures, usePositionsHealth } from "./queries/administrationFetchQueries";

export default function RoleLayout() {
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const { data: allAssignedFeatures, isLoading: isLoadingAllAssignedFeatures } =
    useAllAssignedFeatures();
  const { data: positionsHealth, isLoading: isLoadingPositions } = usePositionsHealth();
  const [selectedPosition, setSelectedPosition] = React.useState<string>("");
  const [positionFeaturesMap, setPositionFeaturesMap] = React.useState<
    Map<number, Assigned[]>
  >(new Map());

  // Initialize the position features map
  React.useEffect(() => {
    const newMap = new Map<number, Assigned[]>();
    allAssignedFeatures?.forEach((feature: Assigned) => {
      if (!newMap.has(+feature.pos)) {
        newMap.set(+feature.pos, []);
      }
      newMap.get(+feature.pos)?.push(feature);
    });
    setPositionFeaturesMap(newMap);
  }, [allAssignedFeatures]);

  // Memoized assigned features for the selected position
  const assignedFeatures = React.useMemo(() => {
    if (!selectedPosition) return [];
    return positionFeaturesMap.get(+selectedPosition) || [];
  }, [selectedPosition, positionFeaturesMap]);

  // Handle position selection
  const handlePositionSelect = React.useCallback((position: string) => {
    setSelectedPosition(position);
  }, []);

  // Handle feature updates
  const handleFeatureUpdate = React.useCallback(
    (updateFn: React.SetStateAction<Assigned[]>) => {
      setPositionFeaturesMap((prev) => {
        const newMap = new Map(prev);
        const currentFeatures = newMap.get(+selectedPosition) || [];
        const newFeatures = typeof updateFn === "function" ? updateFn(currentFeatures) : updateFn;
        newMap.set(+selectedPosition, newFeatures);
        return newMap;
      });
    },
    [selectedPosition]
  );

  // Group features by category
  const groupedFeatures = React.useMemo(() => {
    const groups: Record<string, Feature[]> = {};
    for (const feature of params.features || []) {
      if (!groups[feature.feat_category]) {
        groups[feature.feat_category] = [];
      }
      groups[feature.feat_category].push(feature);
    }
    return groups;
  }, [params.features]);

  if (isLoadingAllAssignedFeatures || isLoadingPositions) {
    return <div>Loading...</div>;
  }

  return (
    <LayoutWithBack title="Roles" description="Assign features to positions">
      <Card className="w-full h-[85%] flex">
        {/* Positions Section */}
        <div className="w-full h-full flex flex-col p-5">
          <AdministrationPositions
            positions={positionsHealth}
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
                assignedFeatures={assignedFeatures}
                groupedFeatures={groupedFeatures}
                setAssignedFeatures={handleFeatureUpdate}
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
            ) : assignedFeatures.length === 0 ? (
              <Label className="text-[15px] text-black/60">
                No feature selected
              </Label>
            ) : (
              <SettingPermissions
                selectedPosition={selectedPosition}
                assignedFeatures={assignedFeatures}
              />
            )}
          </ScrollArea>
        </div>
      </Card>
    </LayoutWithBack>
  );
}
