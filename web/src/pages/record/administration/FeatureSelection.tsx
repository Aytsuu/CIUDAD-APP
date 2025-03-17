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