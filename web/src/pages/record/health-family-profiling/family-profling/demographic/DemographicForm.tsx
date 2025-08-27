import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { Button } from "@/components/ui/button/button";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";
import { FormInput } from "@/components/ui/form/form-input";
import { useHouseholdData, usePersonalInfo } from "../../family-profling/queries/profilingFetchQueries";

export default function DemographicForm({
  form,
  households,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  households: any[];
  onSubmit: () => void;
}) {
  const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false);
  
  // Watch the selected household ID
  const selectedHouseholdId = form.watch("demographicInfo.householdNo");
  
  // Fetch household data when household is selected
  const { data: householdData, isLoading: isLoadingHousehold, error: householdError } = useHouseholdData(selectedHouseholdId);
  
  // Extract household head ID from household data - try multiple possible property names
  const householdHeadId = React.useMemo(() => {
    if (!householdData) return null;
    
    // Try different possible property names for household head ID
    const possibleIds = [
      householdData.rp_id,
      householdData.head_id,
      householdData.household_head_id,
      householdData.resident_id,
      householdData.hh_head_id,
      // If householdData is an array, get the first item's ID
      Array.isArray(householdData) && householdData.length > 0 ? householdData[0].rp_id : null,
      Array.isArray(householdData) && householdData.length > 0 ? householdData[0].head_id : null,
    ];
    
    // Return the first non-null/undefined value
    return possibleIds.find(id => id != null) || null;
  }, [householdData]);
  
  // Fetch personal info of household head
  const { data: personalInfo, isLoading: isLoadingPersonal, error: personalError } = usePersonalInfo(householdHeadId);

  // Populate form fields when personal info is fetched
  React.useEffect(() => {
    if (personalInfo && selectedHouseholdId) {
      // Use the correct field paths from the updated schema
      form.setValue("householdHead.per_lname", personalInfo.per_lname || "");
      form.setValue("householdHead.per_fname", personalInfo.per_fname || "");
      form.setValue("householdHead.per_mname", personalInfo.per_mname || "");
      form.setValue("householdHead.per_sex", personalInfo.per_sex || "");
    }
  }, [personalInfo, selectedHouseholdId, form]);

  // Clear personal info fields when household changes or is cleared
  React.useEffect(() => {
    if (!selectedHouseholdId) {
      form.setValue("householdHead.per_lname", "");
      form.setValue("householdHead.per_fname", "");
      form.setValue("householdHead.per_mname", "");
      form.setValue("householdHead.per_sex", "");
    }
  }, [selectedHouseholdId, form]);

  const submit = async () => {
    const formIsValid = await form.trigger("demographicInfo");
    const householdId = form.watch("demographicInfo.householdNo");

    if (formIsValid && householdId) {
      onSubmit();
    } else {
      if (!householdId) setInvalidHousehold(true);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: "1px solid rgb(225, 193, 193)",
          padding: "16px",
          color: "#b91c1c",
          background: "#fef2f2",
        },
      });
    }
  };

  const handleHouseholdChange = React.useCallback(
    (value: any) => {
      form.setValue("demographicInfo.householdNo", value);
      setInvalidHousehold(false); // Reset validation error
      
      // Clear previous data when changing household
      form.setValue("householdHead.per_lname", "");
      form.setValue("householdHead.per_fname", "");
      form.setValue("householdHead.per_mname", "");
      form.setValue("householdHead.per_sex", "");
    },
    [form]
  );

  const isLoadingData = isLoadingHousehold || isLoadingPersonal;

  const getStatusMessage = () => {
    if (isLoadingHousehold) return "Loading household information...";
    if (isLoadingPersonal) return "Loading household head information...";
    if (householdError) return "Error loading household data";
    if (personalError) return "Error loading personal information";
    if (!selectedHouseholdId) return "Select a household to view head information";
    if (!householdHeadId) return "No household head ID found";
    if (!personalInfo) return "No personal info found for household head";
    return "Household head information loaded";
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Demographic Information</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid gap-4"
        >
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col justify-start item pt-1">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-black/70">Household</Label>
              </div>
              <Combobox
                options={households}
                value={form.watch(`demographicInfo.householdNo`)}
                onChange={handleHouseholdChange}
                placeholder="Select a household"
                contentClassName="w-[22rem]"
                emptyMessage={
                  <div className="flex gap-2 justify-center items-center">
                    <Label className="font-normal text-[13px]">
                      No household found.
                    </Label>
                    <Link to="/household/form">
                      <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                        Register
                      </Label>
                    </Link>
                  </div>
                }
              />
              <Label className="text-[13px] text-red-500 mt-1">
                {invalidHousehold ? `Household is required` : ""}
              </Label>
            </div>
            <FormSelect
              control={form.control}
              name="demographicInfo.building"
              label="Building Occupancy"
              options={[
                { id: "owner", name: "Owner" },
                { id: "renter", name: "Renter" },
                { id: "other", name: "Other" },
              ]}
              readOnly={false}
            />

            <FormSelect
              control={form.control}
              name="demographicInfo.indigenous"
              label="Indigenous People"
              options={[
                { id: "no", name: "No" },
                { id: "yes", name: "Yes" },
              ]}
              readOnly={false}
            />
          </div>
          
          <div className="">
            <h2 className="text-lg font-semibold">Household Head Information</h2>
            <p className="text-xs text-black/50">
              {getStatusMessage()}
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormInput 
              control={form.control} 
              name="householdHead.per_lname" 
              label="Last Name" 
              readOnly 
              placeholder={isLoadingData ? "Loading..." : "Last Name"}
              className={isLoadingData ? "opacity-50" : ""}
            />
            <FormInput 
              control={form.control} 
              name="householdHead.per_fname" 
              label="First Name" 
              readOnly 
              placeholder={isLoadingData ? "Loading..." : "First Name"}
              className={isLoadingData ? "opacity-50" : ""}
            />
            <FormInput 
              control={form.control} 
              name="householdHead.per_mname" 
              label="Middle Name" 
              readOnly 
              placeholder={isLoadingData ? "Loading..." : "Middle Name"}
              className={isLoadingData ? "opacity-50" : ""}
            />
            <FormSelect 
              control={form.control} 
              name="householdHead.per_sex"
              label="Sex" 
              options={[
                { id: 'male', name: 'Male' },
                { id: 'female', name: 'Female' },
              ]}
              readOnly
            />
          </div>

          {/* Submit Button */}
          <div className="mt-8 sm:mt-auto flex justify-end">
            <Button 
              type="submit" 
              className="w-full sm:w-32"
              disabled={isLoadingData}
            >
              {isLoadingData ? "Loading..." : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}