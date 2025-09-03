import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { LoadButton } from "@/components/ui/button/load-button";
import { demographicInfoSchema } from "@/form-schema/profiling-schema";
import { useUpdateFamily } from "../queries/profilingUpdateQueries";
import { formatHouseholds } from "../ProfilingFormats";
import { capitalize } from "@/helpers/capitalize";
import { showErrorToast, showPlainToast, showSuccessToast } from "@/components/ui/toast";

export default function EditGeneralDetails({
  familyData, 
  households, 
  setIsOpenDialog,
} : {
  familyData: Record<string, any>
  households: any[];
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const defaultValues = React.useRef(
    generateDefaultValues(demographicInfoSchema)
  ).current;
  const form = useForm<z.infer<typeof demographicInfoSchema>>({
    resolver: zodResolver(demographicInfoSchema),
    defaultValues,
  });
  const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const { mutateAsync: updateFamily } = useUpdateFamily(); 
  const formattedHouseholds = React.useMemo(() => 
    formatHouseholds(households), [households]
  );

  React.useEffect(() => {
    if(familyData) {
      console.log("has family data")
      form.setValue("householdNo", familyData.household_no)
      form.setValue("building", familyData.fam_building.toLowerCase())
      form.setValue("indigenous", familyData.fam_indigenous.toLowerCase())
    }
  }, [familyData])

  // Check if values are not changed when saving
  const checkDefaultValues = (values: any) => {
    const isDefault = 
      values.householdNo === familyData.household_no &&
      values.building.toLowerCase() === familyData.fam_building.toLowerCase() &&
      values.indigenous.toLowerCase() === familyData.fam_indigenous.toLowerCase()

    return isDefault;
  };

  const save = async () => {
    const formIsValid = await form.trigger();
    const householdNo = form.watch("householdNo");
    if(!formIsValid && !householdNo) {
      setInvalidHousehold(true);
      return;
    }

    const values = form.getValues();
    console.log('familyData:', familyData)
    console.log('values:', values)
    
    if(checkDefaultValues(values)) {
      setIsOpenDialog(false);
      showPlainToast("No changes made");
      return;
    }

    // Formatting data
    const data = {
      hh: values.householdNo,
      fam_building: capitalize(values.building),
      fam_indigenous: capitalize(values.indigenous)
    }

    try {
      setIsSaving(true);
      await updateFamily({
        data: data,
        familyId: familyData.fam_id,
      })

      setIsSaving(false);
      setIsOpenDialog(false);
      showSuccessToast("Record updated successfully");
    } catch (error) {
      setIsSaving(false);
      showErrorToast("Failed to update record");
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="grid gap-3"
      >
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-black/70">Household</Label>
          </div>
          <Combobox
            options={formattedHouseholds}
            value={form.watch("householdNo")}
            onChange={(value) => form.setValue("householdNo", value as string)}
            placeholder="Select a household"
            triggerClassName="font-normal"
            variant="modal" // Use modal variant for better dialog compatibility
            modalTitle="Select Household"
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
          {invalidHousehold ? <Label className="text-[13px] text-red-500">
            Resident is required
          </Label> : ""}
        </div>
        <FormSelect control={form.control} name="building" label="Building" options={[
          { id: "owner", name: "Owner" },
          { id: "renter", name: "Renter" },
          { id: "other", name: "Other" },
        ]}/>
        <FormSelect control={form.control} name="indigenous" label="Indigenous" options={[
          { id: "yes", name: "Yes" },
          { id: "no", name: "No" },
        ]}/>
        <div className="flex justify-end mt-8">
          {!isSaving ? (<Button>Save</Button>) : (
            <LoadButton>
              Saving...
            </LoadButton>
          )}
        </div>
      </form>
    </Form>
  );
}