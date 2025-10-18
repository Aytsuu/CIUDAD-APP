import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import RespondentsForm from "./RespondentsForm";
import { familyFormSchema2 } from "@/form-schema/family-form-schema";

export default function RespodentsFormLayout({
  form,
  residents,
  selectedResidentId,
  setSelectedResidentId
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema2>>;
  residents: any;
  selectedResidentId: string;
  setSelectedResidentId: React.Dispatch<React.SetStateAction<string>>;
}) {


  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="space-y-6">
        {/* Respondents Information */}
        <RespondentsForm
          residents={residents}
          form={form}
         
          selectedResidentId={selectedResidentId}
          onSelect={setSelectedResidentId}
          prefix="respondentInfo"
          title="Respondents Information"
        />


       
      </div>

      
    </div>
  );
}
