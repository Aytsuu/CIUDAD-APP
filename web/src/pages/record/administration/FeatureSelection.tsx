import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Assuming you're using a Radix-like accordion
import { Separator } from "@/components/ui/separator";
import { FixedSizeList as List } from "react-window";
import { Assigned, Feature } from "./administrationTypes";
import { getAssignedFeatures } from "./restful-api/administrationGetAPI";
import { assignFeature, setPermissions } from "./restful-api/administrationPostAPI";
import { formatDate } from "@/helpers/dateFormatter";
import { deleteAssignedFeature } from "./restful-api/administrationDeleteAPI";

export default function FeatureSelection({
  selectedPosition,
  features,
  assignedFeatures,
  setAssignedFeatures,
}: {
  selectedPosition: string;
  features: Feature[];
  assignedFeatures: Assigned[];
  setAssignedFeatures: React.Dispatch<React.SetStateAction<Assigned[]>>;
}) {

  // Group features by category
  const groupedFeatures = React.useMemo(() => {
    return features.reduce((acc, feature) => {
      if (!acc[feature.feat_category]) {
        acc[feature.feat_category] = [];
      }
      acc[feature.feat_category].push(feature);
      return acc;
    }, {} as Record<string, Feature[]>);
  }, [features])

  React.useEffect(() => {

    if(!selectedPosition) return;
    handleGetAssignedFeatures()

  }, [selectedPosition])

  const handleGetAssignedFeatures = React.useCallback( async () => {

    const res = await getAssignedFeatures(selectedPosition);
    setAssignedFeatures(res)

  }, [selectedPosition])

  // Function to assign features
  const handleAssignment = async (featureId: string, checked: boolean) => {

      if (checked) {

        // Assign feature to position (default)
        const assignment = await assignFeature(selectedPosition, featureId)

        console.log(assignment.assi_id)

        // Set permissions (default)
        const perm_id = await setPermissions(assignment.assi_id)

        // Add the new assignment to the local state
        setAssignedFeatures((prev: any) => [
          ...prev,
          {
            assi_id: assignment.assi_id,
            assi_date: formatDate(new Date()),
            feat: featureId,
            pos: selectedPosition,
            permissions: [{
              perm_id: perm_id,
              view: true,
              create: false,
              update: false,
              delete: false,
              assi_id: assignment.assi_id
            }],
          },
        ]);

      } else {

        // Remove the assignment from the local state
        setAssignedFeatures((prev) =>
          prev.filter((assignment) => assignment.feat !== featureId)
        );

        const res = await deleteAssignedFeature(selectedPosition, featureId)

        if (res?.status === 204) {
          // Remove the assignment from the local state
          
        }
      }
  };

  // Function to check assigned features
  const checkAssignedFeatures = (featureId: string) => {
    if (assignedFeatures) {
      return assignedFeatures.some(
        (value) => value.feat === featureId && value.pos == selectedPosition
      );
    }
    return false;
  };

  // Render only the visible items on the list
  const Row = ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: Feature[];
  }) => {
    const feature = data[index];
    return (
      <div style={style}>
        <FeatureCheckbox
          feature={feature}
          isChecked={checkAssignedFeatures(feature.feat_id)}
          onCheckedChange={(checked) => handleAssignment(feature.feat_id, checked)}
        />
      </div>
    );
  };

  return (
    <Accordion type="multiple" className="w-full">
      <Separator />
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <AccordionItem key={category} value={category}>
          <AccordionTrigger className="text-black/80 text-[15px] font-medium">
            {category}
          </AccordionTrigger>
          <AccordionContent>
            <List
              height={140} // Adjust based on your needs
              itemCount={categoryFeatures.length}
              itemSize={35} // Adjust based on your needs
              width="100%"
              itemData={categoryFeatures}
            >
              {Row}
            </List>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// Checkbox component tailored for feature selection
const FeatureCheckbox = React.memo(
  ({
    feature,
    isChecked,
    onCheckedChange,
  }: {
    feature: Feature;
    isChecked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => {
    return (
      <div className="flex items-center gap-3">
        <Checkbox
          id={feature.feat_id}
          onCheckedChange={onCheckedChange}
          checked={isChecked}
        />
        <Label
          htmlFor={feature.feat_id}
          className="text-black/80 text-[14px] cursor-pointer"
        >
          {feature.feat_name}
        </Label>
      </div>
    );
  }
);
