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
import { formatResidents } from "../ProfilingFormats";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { useUpdateHousehold } from "../queries/profilingUpdateQueries";
import { showErrorToast, showPlainToast, showSuccessToast } from "@/components/ui/toast";

export default function EditGeneralDetails({
  residents,
  household, 
  setIsOpenDialog,
} : {
  residents: Record<string, any>[]
  household: Record<string, any>;
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const defaultValues = React.useRef(
    generateDefaultValues(householdFormSchema)
  ).current;
  const form = useForm<z.infer<typeof householdFormSchema>>({
    resolver: zodResolver(householdFormSchema),
    defaultValues,
  });

  const [invalidHead, setInvalidHead] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const { mutateAsync: updateHousehold } = useUpdateHousehold();
  const formattedResidents = React.useMemo(() => 
    formatResidents(residents), [residents]
  );

  React.useEffect(() => {
    if(household) {
      const head = formattedResidents.find(
        (res: any) => res.id.split(" ")[0] === household.head?.split("-")[0]
      ); 

      if(head) {
        form.setValue("householdHead", head.id);
      }
      form.setValue("nhts", household.hh_nhts.toLowerCase());
      // form.setValue("address", household.);

    }
  }, [household])

  // Check if values are not changed when saving
  const checkDefaultValues = (values: any) => {
    const isDefault = 
      values.householdHead?.split(" ")[0] == household.head?.split("-")[0] &&
      values.nhts.toLowerCase() == household.hh_nhts.toLowerCase()

    return isDefault;
  };

  const save = async () => {
    
    const formIsValid = await form.trigger();
    const head = form.watch("householdHead");
    if(!formIsValid && !head) {
      setInvalidHead(true);
      return;
    }

    const values = form.getValues();

    if(checkDefaultValues(values)) {
      setIsOpenDialog(false);
      showPlainToast("No changes made");
      return;
    }

    try {
      setIsSaving(true);
      await updateHousehold({ ...values, hh_id: household.hh_id });
      setIsSaving(false);
      setIsOpenDialog(false);
      showSuccessToast("Successfully updated household.");
    } catch (error) {
      setIsSaving(false);
      showErrorToast("Error updating household");
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
            <Label className="text-black/70">Household Head</Label>
          </div>
          <Combobox
            options={formattedResidents}
            value={form.watch("householdHead")}
            onChange={(value) => form.setValue("householdHead", value as string)}
            placeholder="Select a household"
            triggerClassName="font-normal"
            variant="modal"
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
          {invalidHead ? <Label className="text-[13px] text-red-500">
            Resident is required
          </Label> : ""}
        </div>
        <FormSelect control={form.control} name="nhts" label="NHTS Household" options={[
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