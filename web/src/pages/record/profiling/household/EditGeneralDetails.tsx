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
import { formatResidents, formatSitio } from "../profilingFormats";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { useResidentsList, useSitioList } from "../queries/profilingFetchQueries";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { FormInput } from "@/components/ui/form/form-input";

export default function EditGeneralDetails({
  householdData, 
  setIsOpenDialog,
} : {
  householdData: Record<string, any>
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
  const { data: residentsList } = useResidentsList();
  const { data: sitioList } = useSitioList();
  const formattedResidents = React.useMemo(() => 
    formatResidents(residentsList), [residentsList]
  );
  const formattedSitio = React.useMemo(() => 
    formatSitio(sitioList), [sitioList]
  );

  console.log(formattedSitio)

  React.useEffect(() => {
    if(householdData) {
      // form.setValue("householdHead", householdData.head);
      form.setValue("nhts", householdData.nhts);
      form.setValue("sitio", householdData.sitio);
      form.setValue("street", householdData.street);
    }
  }, [householdData])

  // Check if values are not changed when saving
  const checkDefaultValues = (values: any) => {
    const isDefault = 
      values.householdHead === householdData.head &&
      values.nhts === householdData.nhts &&
      values.sitio === householdData.sitio &&
      values.street === householdData.street

    return isDefault;
  };

  const save = async () => {
    setIsSaving(true);
    const formIsValid = await form.trigger();
    const head = form.watch("householdHead");
    if(!formIsValid && !head) {
      setIsSaving(false);
      setInvalidHead(true);
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
        {/* <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-black/70">Household Head</Label>
          </div>
          <Combobox
            options={formattedResidents}
            value={form.watch("householdHead")}
            onChange={(value) => form.setValue("householdHead", value)}
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
          {invalidHead ? <Label className="text-[13px] text-red-500">
            Resident is required
          </Label> : ""}
        </div> */}
        <FormSelect control={form.control} name="nhts" label="NHTS Household" options={[
          { id: "yes", name: "Yes" },
          { id: "no", name: "No" },
        ]}/>
        <FormSelect control={form.control} name="sitio" label="Sitio" options={formattedSitio}/>
        <FormInput control={form.control} name="street" label="Street"/>
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
