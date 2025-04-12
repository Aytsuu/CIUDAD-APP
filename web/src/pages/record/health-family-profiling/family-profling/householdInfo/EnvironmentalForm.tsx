import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";

import { FormSelect } from "@/components/ui/form/form-select";
import {
  environmentalFormSchema,
  familyFormSchema,
} from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { DependentRecord } from "../../profilingTypes";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { Separator } from "@/components/ui/separator";

export default function EnvironmentalForm({
  residents,
  form,
  selectedResidentId,
  onSelect,
  prefix,
  title,
}: {
  residents: any;
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  selectedResidentId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  prefix: "environmentalForm";
  title: string;
}) {
  const filteredResidents = React.useMemo(() => {
    return residents.formatted.filter((resident: any) => {
      const residentId = resident.id.split(" ")[0];
      return residentId !== selectedResidentId;
    });
  }, [residents.formatted, selectedResidentId]);

  const [facilityType, setFacilityType] = React.useState<string>("");

  // Watch the facility type value
  const selectedFacilityType = form.watch("environmentalForm.facilityType");

  React.useEffect(() => {
    // Clear the specific facility type when switching between sanitary/unsanitary
    if (selectedFacilityType === "sanitary") {
      form.setValue("environmentalForm.unsanitaryFacilityType", "");
    } else if (selectedFacilityType === "unsanitary") {
      form.setValue("environmentalForm.sanitaryFacilityType", "");
    }
    setFacilityType(selectedFacilityType);
  }, [selectedFacilityType, form]);

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-xs text-black/50">
          Review all fields before proceeding
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-4">
          <h2>A. Type of Water Supply</h2>
          <RadioCardGroup
            name="waterSupply"
            control={form.control}
            options={[
              {
                value: "level1",
                title: "LEVEL I",
                subtitle: "POINT SOURCE",
                description:
                  "Developed/protected/improved spring or dug well without distribution/piping system...",
              },
              {
                value: "level2",
                title: "LEVEL II",
                subtitle: "COMMUNAL (COMMON) FAUCET OR STAND POST",
                description:
                  "HH using point source with distribution system to a communal (common) faucet...",
              },
              {
                value: "level3",
                title: "LEVEL III",
                subtitle: "INDIVIDUAL CONNECTION",
                description:
                  "HH with faucet/tap (e.g. water supplied by MCWD, BWSA, Homeowner's Assoc...)",
              },
            ]}
            columns={3}
          />

          <div className="mb-2 mt-2">
            <Separator></Separator>
          </div>

          <h2>B. Type of Sanitary Facility</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Facility Type Select - Use the correct name */}
            <FormSelect
              control={form.control}
              name={`${prefix}.facilityType`}
              label="Facility Type"
              options={[
                { id: "sanitary", name: "Sanitary" },
                { id: "unsanitary", name: "Unsanitary" },
              ]}
            />

            {/* Conditionally render Sanitary Facility Type */}
            {facilityType === "sanitary" && (
              <FormSelect
                control={form.control}
                name={`${prefix}.sanitaryFacilityType`}
                label="Sanitary Facility Type"
                options={[
                  { id: "sanType1", name: "Pour/flush type with septic tank" },
                  {
                    id: "sanType2",
                    name: "Pour/flush toilet connected to septic tank AND to sewerage",
                  },
                  { id: "sanType3", name: "Ventilated Pit (VIP) Latrine" },
                ]}
              />
            )}

            {/* Conditionally render Unsanitary Facility Type */}
            {facilityType === "unsanitary" && (
              <FormSelect
                control={form.control}
                name={`${prefix}.unsanitaryFacilityType`}
                label="Unsanitary Facility Type"
                options={[
                  {
                    id: "unsanType1",
                    name: "Water-sealed toilet without septic tank",
                  },
                  { id: "unsanType2", name: "Overhung latrine" },
                  { id: "unsanType3", name: "Open Pit Latrine" },
                  { id: "unsanType4", name: "Without toilet" },
                ]}
              />
            )}

            {/* Always show Toilet Facility Type */}
            <FormSelect
              control={form.control}
              name={`${prefix}.toiletFacilityType`}
              label="Toilet Facility Type"
              options={[
                { id: "shared", name: "SHARED with Other Household" },
                { id: "notShared", name: "NOT SHARED with Other Household" },
              ]}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
