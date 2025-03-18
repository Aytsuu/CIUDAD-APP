<<<<<<< HEAD
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function FeatureSelection({features, selectedFeatures, setSelectedFeatures} :
  {
    features: Record<string, string>,
    selectedFeatures: Record<string, boolean>, 
    setSelectedFeatures: (value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void}
) {

  // Handle checkbox change
  const handleCheckboxChange = (id: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the checkbox state
    }));
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {Object.entries(features).map(([featureId, value]) => (
        <div key={featureId} className="w-full flex items-center gap-3">
          <Checkbox
            id={featureId}
            checked={selectedFeatures[featureId]}
            onCheckedChange={() => handleCheckboxChange(featureId)}
          />
          <Label htmlFor={featureId} className="text-black/80 text-[15px] cursor-pointer">
            {value}
          </Label>
        </div>
      ))}
    </div>
  );
}
=======
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
import { FixedSizeList as List } from "react-window";
import { Assigned, Feature } from "./administrationTypes";

export default function FeatureSelection({
  selectedPosition,
  features,
  assignedFeatures,
  setFeatures,
  setAssignedFeatures,
}: {
  selectedPosition: string;
  features: Feature[];
  assignedFeatures: Assigned[];
  setFeatures: React.Dispatch<React.SetStateAction<Feature[]>>;
  setAssignedFeatures: React.Dispatch<React.SetStateAction<Assigned[]>>;
}) {
  // States and initializations
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
  const assignFeature = async (featureId: string, checked: boolean) => {
    const method = checked ? "post" : "delete";
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];

    // Checks which API request method to perform
    const requestConfig = checked
      ? {
          // POST
          url: "administration/assignments/",
          data: {
            assi_date: formattedDate,
            feat: featureId,
            pos: selectedPosition,
          },
        }
      : {
          // DELETE
          url: `administration/assignments/${featureId}/${selectedPosition}/`,
        };

    try {
      const res = await api[method](requestConfig.url, requestConfig.data);

      if (checked) {
        // Set permissions (default)
        const perm_id = await setPermissions(res.data.assi_id);

        // Add the new assignment to the local state
        setAssignedFeatures((prev: any) => [
          ...prev,
          {
            assi_id: res.data.assi_id,
            assi_date: formattedDate,
            feat: featureId,
            pos: selectedPosition,
            permissions: [{
              perm_id: perm_id,
              view: true,
              create: false,
              update: false,
              delete: false,
              assi_id: res.data.assi_id
            }],
          },
        ]);

      } else {
        // Remove the assignment from the local state
        setAssignedFeatures((prev) =>
          prev.filter((assignment) => assignment.feat !== featureId)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Function to add permissions of the assigned feature to the db (all false by default)
  const setPermissions = async (assignmentId: string) => {
    try {
      const res = await api.post("administration/permissions/", { assi: assignmentId });
      return res.data.perm_id
    } catch (err) {
      console.log(err);
    }
  };

  // Function to get the assigned features of the position
  const getAssignedFeatures = React.useCallback(async () => {
    try {
      const res = await api.get(
        `administration/assignments/${selectedPosition}/`
      );
      setAssignedFeatures(res.data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  // Function to check assigned features
  const checkAssignedFeatures = (featureId: string) => {
    if (assignedFeatures) {
      return assignedFeatures.some(
        (value) => value.feat === featureId && value.pos === selectedPosition
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
          onCheckedChange={(checked) => assignFeature(feature.feat_id, checked)}
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
>>>>>>> master
