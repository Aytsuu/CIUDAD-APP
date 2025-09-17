// nutritional-status-section.tsx
import { NutritionalStatusCalculator } from "@/components/ui/nutritional-status-calculator";
import { AlertTriangle } from "lucide-react";
import { FormSelect } from "@/components/ui/form/form-select";
import { edemaSeverityOptions } from "../muti-step-form/options";

interface NutritionalStatusSectionProps {
  weight?: number;
  height?: number;
  age: string;
  muac?: number;
  nutritionalStatus: any;
  onStatusChange: (status: any) => void;
  hasSevereMalnutrition: boolean;
  showWarning: boolean;
}

export function NutritionalStatusSection({
  weight,
  height,
  age,
  muac,
  nutritionalStatus,
  onStatusChange,
  hasSevereMalnutrition,
  showWarning,
}: NutritionalStatusSectionProps) {
  return (
    <>
      <div className="mb-10 rounded-lg border bg-green-50 p-4">
        <h3 className="mb-4 text-lg font-bold">Nutritional Status</h3>
        <NutritionalStatusCalculator
          weight={weight}
          height={height}
          age={age}
          muac={muac}
          onStatusChange={onStatusChange}
          initialStatus={nutritionalStatus}
        />
      </div>

      {showWarning && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="mb-2 font-medium text-red-800">
                Nutritional Status Assessment
              </h4>
              {hasSevereMalnutrition ? (
                <>
                  <p className="text-sm text-red-700">
                    Severe malnutrition detected. Please assess for edema
                    and provide appropriate intervention.
                  </p>
                  <div className="mt-3 ml-3 p-3">
                    <FormSelect
                      control={undefined /* Replace with a valid control object */}
                      name="edemaSeverity"
                      label="Edema Severity Level"
                      options={edemaSeverityOptions}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-green-700">
                  No severe malnutrition detected.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}