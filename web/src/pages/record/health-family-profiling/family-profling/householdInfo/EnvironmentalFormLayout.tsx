import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import EnvironmentalForm from "./EnvironmentalForm";
import { familyFormSchema } from "@/form-schema/profiling-schema";

export default function EnvironmentalFormLayout({
  form,
  residents,
  selectedResidentId,
  setSelectedResidentId,
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedResidentId: string;
  setSelectedResidentId: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="w-full max-w-full mx-auto">
      <div className="flex flex-col bg-white rounded-lg overflow-hidden">
        <div className="flex flex-col p-4 sm:p-6 md:p-10 gap-4 sm:gap-6">
          {/* Responsive container with max-width constraints */}
          <div className="w-full mx-auto">
            <div className="space-y-4 sm:space-y-6">
              {/* Household Head Information */}
              <EnvironmentalForm
              residents={residents}
              form={form}
              selectedResidentId={selectedResidentId}
              onSelect={setSelectedResidentId}
              prefix="environmentalForm"
              title="Environmental Health and Sanitation"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
