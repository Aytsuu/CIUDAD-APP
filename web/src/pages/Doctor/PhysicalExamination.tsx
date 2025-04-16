import React, { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PEType, PESchema } from "@/form-schema/doctor/doctorSchema";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { Button } from "@/components/ui/button/button";
import {
  ChevronDown,
  ChevronUp,
  CirclePlus,
  Trash2,
} from "lucide-react";

import { CombinedType } from "@/form-schema/doctor/doctorSchema";

interface Option {
  id: string;
  name: string;
}

interface PEFormProps {
  form: UseFormReturn<CombinedType>;
}

const initialCategories: Option[] = [
  { id: "tablet", name: "Tablet" },
  { id: "syrup", name: "Syrup" },
  { id: "injection", name: "Injection" },
];

export default function PEForm({ form }: PEFormProps) {
  const findings = [
    {
      id: 1,
      type_id: 1,
      typeLabel: "Skin",
      name: "skin_essentiallyNormal",
      label: "Essentially Normal",
    },
    {
      id: 2,
      type_id: 1,
      typeLabel: "Skin",
      name: "skin_coldCalmly",
      label: "Cold/Calmly",
    },
    {
      id: 3,
      type_id: 1,
      typeLabel: "Skin",
      name: "skin_edematousSwelling",
      label: "Edematous/Swelling",
    },
    {
      id: 4,
      type_id: 2,
      typeLabel: "Eyes",
      name: "eyes_abnormalPupillaryReaction",
      label: "Abnormal Pupillary Reaction",
    },
    {
      id: 5,
      type_id: 2,
      typeLabel: "Eyes",
      name: "eyes_coldCalmly",
      label: "Cold/Calmly",
    },
    {
      id: 6,
      type_id: 3,
      typeLabel: "Nose",
      name: "nose_abnormalPupillaryReaction",
      label: "Abnormal Pupillary Reaction",
    },
    {
      id: 7,
      type_id: 3,
      typeLabel: "Nose",
      name: "nose_coldCalmly",
      label: "Cold/Calmly",
    },
  ];

  const groupedFindings = findings.reduce((acc, finding) => {
    if (!acc[finding.type_id]) {
      acc[finding.type_id] = {
        typeLabel: finding.typeLabel,
        findings: [],
      };
    }
    acc[finding.type_id].findings.push(finding);
    return acc;
  }, {} as Record<number, { typeLabel: string; findings: typeof findings }>);

  const [categories, setCategories] = useState<Option[]>(initialCategories);
  const [otherFields, setOtherFields] = useState<
    { id: number; typeId: number }[]
  >([]);
  const [showAllTypes, setShowAllTypes] = useState(false);

  const handleSelectChange = (selectedValue: string, fieldIndex: number) => {
    const currentOthers = form.getValues("others") || [];
    const updatedOthers = [...currentOthers];
    updatedOthers[fieldIndex] = selectedValue;

    form.setValue("others", updatedOthers, { shouldValidate: true });

    setCategories((prev) =>
      prev.some((opt) => opt.id === selectedValue)
        ? prev
        : [...prev, { id: selectedValue, name: selectedValue }]
    );
  };

  const handleAddOtherField = (typeId: number) => {
    const newId = Date.now();
    setOtherFields((prev) => [...prev, { id: newId, typeId }]);

    const currentOthers = form.getValues("others") || [];
    const currentTypeIds = form.getValues("othersTypeIds") || [];

    form.setValue("others", [...currentOthers, ""], { shouldValidate: true });
    form.setValue("othersTypeIds", [...currentTypeIds, typeId], {
      shouldValidate: true,
    });
  };

  const handleRemoveOtherField = (index: number) => {
    setOtherFields((prev) => prev.filter((_, i) => i !== index));

    const currentOthers = form.getValues("others") || [];
    const currentTypeIds = form.getValues("othersTypeIds") || [];

    const updatedOthers = currentOthers.filter((_, i) => i !== index);
    const updatedTypeIds = currentTypeIds.filter((_, i) => i !== index);

    form.setValue("others", updatedOthers, { shouldValidate: true });
    form.setValue("othersTypeIds", updatedTypeIds, { shouldValidate: true });
  };

  const onSubmit = (data: PEType) => {
    console.log("Form submitted:", data);
  };

  // Get all type IDs as numbers
  const allTypeIds = Object.keys(groupedFindings).map((id) => parseInt(id));

  // Determine which types to show (first 2 if not showing all)
  const visibleTypeIds = showAllTypes ? allTypeIds : allTypeIds.slice(0, 2);

  // Check if show more button should be displayed
  const showMoreButton = allTypeIds.length > 2;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {visibleTypeIds.map((typeId) => {
          const typeIdStr = typeId.toString();
          const { typeLabel, findings: typeFindings } = groupedFindings[typeId];
          const typeSpecificFields = otherFields.filter(
            (field) => field.typeId === typeId
          );

          return (
            <div
              key={typeIdStr}
              className="mb-6 border p-4 rounded-lg border-gray"
            >
              <h3 className="text-md font-medium mb-3 text-black/65">
                {typeLabel} Assessment
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4">
                {typeFindings.map((finding) => {
                  const fieldName = finding.name as keyof PEType;
                  return (
                    <FormField
                      key={finding.id}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => {
                        const isChecked = field.value && field.value.length > 0;
                        return (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                  id={finding.name}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked ? ["true"] : []);
                                  }}
                                />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {finding.label}
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  );
                })}
              </div>

              <div className="mt-6">
                <div className="flex items-center  gap-2">
                  <h4 className="text-sm font-medium text-green-600">
                    Other {typeLabel} Findings
                  </h4>
                  <div
                    onClick={() => handleAddOtherField(typeId)}
                    className="flex items-center text-green-800 border-none bg-white cursor-pointer"
                  >
                    <CirclePlus size={20} className="font-medium" />
                    {/* <span className="ml-1">Add Field</span> */}
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  {typeSpecificFields.map((field) => {
                    const globalIndex = otherFields.findIndex(
                      (f) => f.id === field.id
                    );
                    const othersValue = form.watch("others");
                    const currentValue = othersValue?.[globalIndex] || "";

                    return (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <SelectLayoutWithAdd
                            className="w-full"
                            label={`${typeLabel} Finding`}
                            placeholder={`Select or add new ${typeLabel} finding`}
                            options={categories}
                            value={currentValue}
                            onChange={(selectedValue) =>
                              handleSelectChange(selectedValue, globalIndex)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOtherField(globalIndex)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {showMoreButton && (
          <div className="flex justify-center ">
            <Button
              type="button"
              variant="outline"
              className="w-full max-w-md flex items-center justify-center gap-2 bg-green-700 text-white hover:bg-green-100 hover:text-green-800"
              onClick={() => setShowAllTypes(!showAllTypes)}
            >
              {showAllTypes ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show More ({allTypeIds.length - 2} more)
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
