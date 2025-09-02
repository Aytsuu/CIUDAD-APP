import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import ParentsForm from "./ParentsForm";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { DependentRecord } from "../../ProfilingTypes";
import { showErrorToast } from "@/components/ui/toast";

export default function ParentsFormLayout({
  form,
  residents,
  selectedParents,
  dependentsList,
  setSelectedMotherId,
  setSelectedFatherId,
  setSelectedGuardianId,
  onSubmit,
  back,
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedParents: Record<string, string>;
  dependentsList: DependentRecord[];
  setSelectedMotherId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFatherId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedGuardianId: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  back: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState("mother");

  const submit = React.useCallback(() => {
    const isValid = Object.values(selectedParents).some(
      (value) => value !== ""
    );

    if (isValid) {
      onSubmit();
    } else {
      showErrorToast("Must have atleast one parent")
    }
  }, [selectedParents]);

  const tabs = [
    {
      id: "mother",
      label: "Mother",
      component: (
        <ParentsForm
          residents={residents}
          form={form}
          dependentsList={dependentsList}
          selectedParents={[selectedParents.guardian, selectedParents.father]}
          onSelect={setSelectedMotherId}
          prefix="motherInfo"
          title="Mother's Information"
        />
      )
    },
    {
      id: "father",
      label: "Father",
      component: (
        <ParentsForm
          residents={residents}
          form={form}
          dependentsList={dependentsList}
          selectedParents={[selectedParents.guardian, selectedParents.mother]}
          onSelect={setSelectedFatherId}
          prefix="fatherInfo"
          title="Father's Information"
        />
      )
    },
    {
      id: "guardian",
      label: "Guardian",
      component: (
        <ParentsForm
          residents={residents}
          form={form}
          dependentsList={dependentsList}
          selectedParents={[selectedParents.mother, selectedParents.father]}
          onSelect={setSelectedGuardianId}
          prefix="guardInfo"
          title="Guardian's Information"
        />
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      {/* Compact Tab Navigation - Top Left */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-md w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 space-y-6">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>

      {/* Navigation Buttons */}
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