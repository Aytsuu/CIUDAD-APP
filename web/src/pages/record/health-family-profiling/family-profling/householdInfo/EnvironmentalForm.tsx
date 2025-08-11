import React from "react";
import { Form } from "@/components/ui/form/form";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { FormSelect } from "@/components/ui/form/form-select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { Separator } from "@/components/ui/separator";
import { useWaterSupplyOptions } from "../queries/profilingFetchQueries";

export default function EnvironmentalForm({
  form,
  prefix,
  title,
  householdId,
}: {
  residents: any;
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  selectedResidentId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  prefix: "environmentalForm";
  title: string;
  householdId?: string;
}) {

  const [facilityType, setFacilityType] = React.useState<string>("");

  // Fetch water supply types from backend
  const { data: waterSupplyOptionsData, isLoading: isLoadingWaterSupply, error: waterSupplyError } = useWaterSupplyOptions();

  // Watch the facility type value
  const selectedFacilityType = form.watch("environmentalForm.facilityType");
  const selectedWaterSupply = form.watch("environmentalForm.waterSupply");
  const selectedHouseholdId = form.watch("demographicInfo.householdNo");

  React.useEffect(() => {
    // Clear the specific facility type when switching between sanitary/unsanitary
    if (selectedFacilityType === "sanitary") {
      form.setValue("environmentalForm.unsanitaryFacilityType", "");
    } else if (selectedFacilityType === "unsanitary") {
      form.setValue("environmentalForm.sanitaryFacilityType", "");
    }
    setFacilityType(selectedFacilityType);
  }, [selectedFacilityType, form]);

  // Debug logging
  React.useEffect(() => {
    console.log('EnvironmentalForm - Water supply value:', selectedWaterSupply);
    console.log('EnvironmentalForm - Household ID from form:', selectedHouseholdId);
    console.log('EnvironmentalForm - Household ID from props:', householdId);
    console.log('EnvironmentalForm - Water supply options data:', waterSupplyOptionsData);
  }, [selectedWaterSupply, selectedHouseholdId, householdId, waterSupplyOptionsData]);

  // Prepare water supply options for RadioCardGroup
  const waterSupplyOptions = React.useMemo(() => {
    if (!waterSupplyOptionsData?.data) {
      // Fallback to hardcoded options if backend data is not available
      return [
        {
          value: "level1",
          title: "LEVEL I",
          subtitle: "POINT SOURCE",
          description: "Developed/protected/improved spring or dug well without distribution/piping system...",
        },
        {
          value: "level2",
          title: "LEVEL II",
          subtitle: "COMMUNAL (COMMON) FAUCET OR STAND POST",
          description: "HH using point source with distribution system to a communal (common) faucet...",
        },
        {
          value: "level3",
          title: "LEVEL III",
          subtitle: "INDIVIDUAL CONNECTION",
          description: "HH with faucet/tap (e.g. water supplied by MCWD, BWSA, Homeowner's Assoc...)",
        },
      ];
    }

    // Use backend data
    return waterSupplyOptionsData.data;
  }, [waterSupplyOptionsData]);

  if (waterSupplyError) {
    console.error('Error loading water supply types:', waterSupplyError);
  }

  

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
          {isLoadingWaterSupply ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-gray-500">Loading water supply options...</div>
            </div>
          ) : (
            <RadioCardGroup
              name={`${prefix}.waterSupply`}
              control={form.control}
              options={waterSupplyOptions}
              columns={3}
            />
          )}

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
                  { id: "santype1", name: "Pour/flush type with septic tank" },
                  {
                    id: "santype2",
                    name: "Pour/flush toilet connected to septic tank AND to sewerage",
                  },
                  { id: "santype3", name: "Ventilated Pit (VIP) Latrine" },
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
                  { id: "unsantype2", name: "Overhung latrine" },
                  { id: "unsantype3", name: "Open Pit Latrine" },
                  { id: "unsantype4", name: "Without toilet" },
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
                { id: "notshared", name: "NOT SHARED with Other Household" },
              ]}
            />
          </div>
          <h2>C. Solid Waste Management</h2>
          <div className="grid grid-cols-3 gap-4">
            <FormSelect
              control={form.control}
              name={`${prefix}.wasteManagement`}
              label="Waste Management Type"
              options={[
                { id: "wastesegregation", name: "Waste Segregation" },
                { id: "backyardcomposting", name: "Backyard Composting" },
                { id: "recycling", name: "Recyling/Reuse" },
                { id: "collectedbycity", name: "Collected by City Collection and Disposal System" },
                { id: "burning", name: "Burning/Burying" },
                { id: "others", name: "Others.."}
              ]}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
