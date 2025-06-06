import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
// import ParentsForm from "./ParentsForm";
import { familyFormSchema } from "@/form-schema/family-form-schema";
import { DependentRecord } from "../../profilingTypes";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";

export default function ParentsFormLayout({
  form,
  residents,
  selectedParents,
  dependentsList,
  setSelectedMotherId,
  setSelectedFatherId,

}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedParents: Record<string, string>;
  dependentsList: DependentRecord[];
  setSelectedMotherId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFatherId: React.Dispatch<React.SetStateAction<string>>;



}) {

 

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="space-y-6">
        {/* Mother's Information */}
        <ParentsForm
          residents={residents}
          form={form}
          dependentsList={dependentsList}
          selectedParents={[selectedParents.guardian, selectedParents.father]}
          onSelect={setSelectedMotherId}
          prefix="motherInfo"
          title="Mother's Information"
        />

        <Separator />

        {/* Father's Information */}
        <ParentsForm
          residents={residents}
          form={form}
          dependentsList={dependentsList}
          selectedParents={[selectedParents.guardian, selectedParents.mother]}
          onSelect={setSelectedFatherId}
          prefix="fatherInfo"
          title="Father's Information"
        />

       
      </div>

      
    </div>
  );
}
