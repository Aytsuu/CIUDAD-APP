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
import { useUpdateFamilyHealth } from "../../health-family-profiling/family-profling/queries/profilingUpdateQueries";
import { formatHouseholds } from "../ProfilingFormats";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { capitalize } from "@/helpers/capitalize";

export default function EditGeneralDetails({
  familyData, 
  households, 
  setIsOpenDialog,
  setFamily
} : {
  familyData: Record<string, any>
  households: any[];
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setFamily: React.Dispatch<React.SetStateAction<any[]>>;
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
  const { mutateAsync: updateFamilyHealth } = useUpdateFamilyHealth();
  const formattedHouseholds = React.useMemo(() => 
    formatHouseholds(households), [households]
  );

  React.useEffect(() => {
    if(familyData) {
      form.setValue("householdNo", familyData.household_no)
      form.setValue("building", familyData.fam_building)
      form.setValue("indigenous", familyData.fam_indigenous)
    }
  }, [familyData])

  // Check if values are not changed when saving
  const checkDefaultValues = (values: any) => {
    const isDefault = 
      values.householdNo === familyData.household_no &&
      values.building === familyData.fam_building &&
      values.indigenous === familyData.fam_indigenous

    return isDefault;
  };

  const save = async () => {
    setIsSaving(true);
    const formIsValid = await form.trigger();
    const householdNo = form.watch("householdNo");
    if(!formIsValid && !householdNo) {
      setIsSaving(false);
      setInvalidHousehold(true);
      return;
    }

    const values = form.getValues();

    if(checkDefaultValues(values)) {
      setIsSaving(false);
      setIsOpenDialog(false);
      toast("No changes made", {
        icon: <CircleAlert size={24} className="fill-orange-500 stroke-white" />
      });
      return;
    }

    // Formatting data
    const data = {
      hh: values.householdNo,
      fam_building: capitalize(values.building),
      fam_indigenous: capitalize(values.indigenous)
    }

    try {
      await Promise.all([
        updateFamily({
          data: data,
          familyId: familyData.fam_id,
          oldHouseholdId: familyData.household_no
        }),
        updateFamilyHealth({
          data: data,
          familyId: familyData.fam_id,
          oldHouseholdId: familyData.household_no
        })
      ]);
      setIsSaving(false);
      setIsOpenDialog(false);
      setFamily((prev: any) => ({
        ...prev,
        fam_building: capitalize(values.building),
        fam_indigenous: capitalize(values.indigenous),
        household_no: values.householdNo
      }));
      toast("Record updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
      });
    } catch (error) {
      setIsSaving(false);
      toast("Failed to update record", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      });
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
