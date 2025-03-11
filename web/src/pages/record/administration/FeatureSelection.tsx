import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Assuming you're using a Radix-like accordion
import api from "@/api/api";
import { Separator } from "@/components/ui/separator";
import { FixedSizeList as List} from 'react-window';

type Feature = {
  feat_id: string;
  feat_name: string;
  feat_category: string;
};

type Assigned = {
  assi_id: string
  assi_date: string
  feat: string
  pos: string
}

export default function FeatureSelection(
  {selectedPosition} : {selectedPosition: string}
) {

  // States and initializations
  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [assignedFeatures, setAssignedFeatures] = React.useState<Assigned[]>([]);
  const hasFetchData = React.useRef(false);

	// Group features by category
  const groupedFeatures = React.useMemo(() => {
    return features.reduce((acc, feature) => {
      if (!acc[feature.feat_category]) {
        acc[feature.feat_category] = [];
      }
      acc[feature.feat_category].push(feature);
      return acc;
    }, {} as Record<string, Feature[]>);
  }, [features]);

  // Performs side effects
  React.useEffect(() => {
    if (!hasFetchData.current) {
      getAllFeatures();
      getAssignedFeatures();
      hasFetchData.current = true;
    }
  }, []);

  // Function to fetch all features from db
  const getAllFeatures = React.useCallback(() => {
    api
      .get("administration/features/")
      .then((res) => res.data)
      .then((data) => {
        setFeatures(data);
      });
  }, []);

  // Function to assign features
	const assignFeature = (featureId: string) => (checked: boolean) => {
    const method = checked ? 'post' : 'delete';
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
    // Checks which API request method to perform
    const requestConfig = checked
      ? { // POST
          url: 'administration/assignment/',
          data: {
            assi_date: formattedDate,
            feat: featureId,
            pos: selectedPosition,
          },
        }
      : { // DELETE
          url: `administration/assignment/${featureId}/${selectedPosition}/`,
        };
  
    api[method](requestConfig.url, requestConfig.data)
      .then(() => {
        if (checked) {
          // Add the new assignment to the local state
          setAssignedFeatures((prev) => [
            ...prev,
            {
              assi_id: String(Date.now()), // Temporary ID (replace with actual ID from the API response if available)
              assi_date: formattedDate,
              feat: featureId,
              pos: selectedPosition,
            },
          ]);
        } else {
          // Remove the assignment from the local state
          setAssignedFeatures((prev) =>
            prev.filter((assignment) => assignment.feat !== featureId)
          );
        }
      })
      .catch((err) => console.log(err));
  };

  // Function to get the assigned features of the position
  const getAssignedFeatures = React.useCallback(() => {
    api
      .get(`administration/assignment/${selectedPosition}/`)
      .then((res) => res.data)
      .then((data) => {
        setAssignedFeatures(data)
      })
      .catch((err) => console.log(err))
  }, [])

  const checkAssignedFeatures = (featureId: string) => {

    if(assignedFeatures){
      return assignedFeatures.some((value) => 
        value.feat === featureId && value.pos === selectedPosition
    )}
    return false
  }

  const Row = ({ index, style, data }: { index: number; style: React.CSSProperties; data: Feature[] }) => {
    const feature = data[index];
    return (
      <div style={style}>
        <FeatureCheckbox
          feature={feature}
          isChecked={checkAssignedFeatures(feature.feat_id)}
          onCheckedChange={assignFeature(feature.feat_id)}
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

const FeatureCheckbox = React.memo(({ feature, isChecked, onCheckedChange }: {
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
});