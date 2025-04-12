import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import HealthInfoForm from "./HealthInfoForm";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { DependentRecord } from "../../profilingTypes";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";

export default function HealthInfoLayout({
  form,
  residents,
  selectedResidentId,
  setSelectedResidentId
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedResidentId: string;
  setSelectedResidentId: React.Dispatch<React.SetStateAction<string>>;
}) {


  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="space-y-6">
        {/* Respondents Information */}
        <HealthInfoForm
          residents={residents}
          form={form}
         
          selectedResidentId={selectedResidentId}
          onSelect={setSelectedResidentId}
          prefix="motherInfo.motherHealthInfo"
          title="Health Information"
        />


       
      </div>

      
    </div>
  );
}
