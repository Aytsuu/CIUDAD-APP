import React from "react";
import { Form } from "@/components/ui/form/form";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormInput } from "@/components/ui/form/form-input";
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
  const selectedWasteManagement = form.watch("environmentalForm.wasteManagement");

  React.useEffect(() => {
    // Normalize the watched value (backend/options use uppercase IDs)
    const normalized = (selectedFacilityType || "").toUpperCase();
    // Clear the specific facility type when switching between SANITARY/UNSANITARY
    if (normalized === "SANITARY") {
      form.setValue("environmentalForm.unsanitaryFacilityType", "");
    } else if (normalized === "UNSANITARY") {
      form.setValue("environmentalForm.sanitaryFacilityType", "");
    }
    setFacilityType(normalized);
  }, [selectedFacilityType, form]);

  // Clear others field when waste management is not "others"
  React.useEffect(() => {
    const wm = (selectedWasteManagement || "").toUpperCase();
    if (wm !== "OTHERS") {
      form.setValue("environmentalForm.wasteManagementOthers", "");
    }
  }, [selectedWasteManagement, form]);

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
                { id: "SANITARY", name: "Sanitary" },
                { id: "UNSANITARY", name: "Unsanitary" },
              ]}
            />

            {/* Conditionally render Sanitary Facility Type */}
            {facilityType === "SANITARY" && ( 
              <FormSelect
                control={form.control}
                name={`${prefix}.sanitaryFacilityType`}
                label="Sanitary Facility Type"
                options={[
                  { id: "santype1", name: "Pour/flush type with septic tank" },
                  {
                    id: "santype2",
                    name: "Pour/flush toilet connected to septic tank AND to sewerage system",
                  },
                  { id: "santype3", name: "Ventilated Pit (VIP) Latrine" },
                ]}
              />
            )}

            {/* Conditionally render Unsanitary Facility Type */}
            {facilityType === "UNSANITARY" && (
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
                { id: "SHARED", name: "SHARED with Other Household" },
                { id: "NOT SHARED", name: "NOT SHARED with Other Household" },
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
                { id: "WASTE SEGREGATION", name: "Waste Segregation" },
                { id: "BACKYARD COMPOSTING", name: "Backyard Composting" },
                { id: "RECYCLING", name: "Recyling/Reuse" },
                { id: "COLLECTED BY CITY", name: "Collected by City Collection and Disposal System" },
                { id: "BURNING/BURYING", name: "Burning/Burying" },
                { id: "OTHERS", name: "Others"}
              ]}
            />
            
            {/* Show "Others" input field when "others" is selected */}
            {selectedWasteManagement === "OTHERS" && (
              <FormInput
                control={form.control}
                name={`${prefix}.wasteManagementOthers`}
                label="Please specify"
                placeholder="Enter waste management type"
              />
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
