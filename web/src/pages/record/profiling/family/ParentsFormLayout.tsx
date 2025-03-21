import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import ParentsForm from "./ParentsForm";
import { familyFormSchema } from "@/form-schema/profiling-schema";

export default function ParentsFormLayout(
  { form, residents, onSubmit, back}: {
    form: UseFormReturn<z.infer<typeof familyFormSchema>>;
    residents: any;
    onSubmit: () => void;
    back: () => void;
  }) {

  

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="space-y-8">
        {/* Mother's Information */}
        <ParentsForm 
          residents={residents}
          form={form}
          prefix="motherInfo" 
          title="Mother's Information" 
        />


        {/* Father's Information */}
        <ParentsForm 
          residents={residents}
          form={form}
          prefix="fatherInfo" 
          title="Father's Information" 
        />
      </div>

      <div className="mt-8 flex justify-end gap-2 sm:gap-3">
        <Button variant="outline" className="w-full sm:w-32" onClick={back}>
          Prev
        </Button>
        <Button onClick={onSubmit} className="w-full sm:w-32">Next</Button>
      </div>
    </div>
  );
};