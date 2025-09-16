import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import ParentsForm from "./ParentsForm";
import HealthInfoForm from "../healthInfo/HealthInfoForm";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { DependentRecord } from "../../ProfilingTypes";
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
  setSelectedRespondentId,
  onSubmit,
  back,
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedParents: Record<string, string>;
  dependentsList: DependentRecord[];
  setSelectedMotherId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFatherId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedRespondentId?: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  back: () => void;
}) {
  // Add state for respondent selection - use internal state or external prop
  const [, setInternalSelectedRespondentId] = React.useState("")
  const respondentSetter = setSelectedRespondentId || setInternalSelectedRespondentId;

  const submit = React.useCallback(() => {
    const isValid = Object.values(selectedParents).some(
      (value) => value !== ""
    );

    if (isValid) {
      onSubmit();
    } else {
      toast("Family Registration", {
        description: "Must have atleast one parent.",
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: "1px solid rgb(225, 193, 193)",
          padding: "16px",
          color: "#b91c1c",
          background: "#fef2f2",
        },
      });
    }
  }, [selectedParents]);

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="space-y-6">
        {/* Respondent's Information */}
        <ParentsForm
          residents={residents}
          form={form}
          dependentsList={dependentsList}
          onSelect={respondentSetter}
          prefix="respondentInfo"
          title="Respondent's Information"
        />

        <Separator />

        {/* Father's Information */}
        <ParentsForm
          residents={residents}
          form={form}
          dependentsList={dependentsList}
          onSelect={setSelectedFatherId}
          prefix="fatherInfo"
          title="Father's Information"
        />

        <Separator />

        {/* Mother's Information */}
        <ParentsForm
          residents={residents}
          form={form}
          dependentsList={dependentsList}
          onSelect={setSelectedMotherId}
          prefix="motherInfo"
          title="Mother's Information"
        />
        <HealthInfoForm
          form={form}
          prefix="motherInfo.motherHealthInfo"
          title="Mother's Health Information"
        />
        

      </div>

      <div className="mt-8 flex justify-end gap-2 sm:gap-3">
        <Button variant="outline" className="w-full sm:w-32" onClick={back}>
          Prev
        </Button>
        <Button onClick={submit} className="w-full sm:w-32">
          Next
        </Button>
      </div>
    </div>
  );
}
