import React from "react";
import { Combobox } from "@/components/ui/combobox";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { newMemberFormSchema } from "@/form-schema/profiling-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { CircleCheck, Loader2, Plus } from "lucide-react";
import { LoadButton } from "@/components/ui/button/load-button";
import { formatResidents } from "../profilingFormats";
import { useAddFamilyComposition } from "../queries/profilingAddQueries";
import { useAddFamilyCompositionHealth } from "../../health-family-profiling/family-profling/queries/profilingAddQueries"; // Add this import
import { toast } from "sonner";
import { useResidentsWithFamExclusion } from "../queries/profilingFetchQueries";

export default function AddMemberForm({ 
  familyId, 
  setIsOpenDialog,
  setCompositions
} : {
  familyId: string;
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
  setCompositions: React.Dispatch<React.SetStateAction<any>>
}) {
  // Initializing states
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [invalidResident, setInvalidResident] = React.useState<boolean>(false);
  const { mutateAsync: addFamilyComposition} = useAddFamilyComposition(); 
  const { mutateAsync: addFamilyCompositionHealth} = useAddFamilyCompositionHealth(); // Add this line
  const { data: residentsWithFamExclusion, isLoading: isLoadingResidents } = useResidentsWithFamExclusion(familyId);

  const formattedResidents = React.useMemo(() => 
    formatResidents(residentsWithFamExclusion)
  , [residentsWithFamExclusion]);
  const defaultValues = React.useRef(generateDefaultValues(newMemberFormSchema)).current;
  const form = useForm<z.infer<typeof newMemberFormSchema>>({
    resolver: zodResolver(newMemberFormSchema),
    defaultValues,
    mode: "onChange"
  });

  // Submit function
  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();
    const residentId = form.watch("id").split(" ")[0];

    if(!formIsValid || !residentId) {
      setIsSubmitting(false);
      if(!residentId) setInvalidResident(true);
      return;
    }

    const role = form.getValues().role;
    const compositionData = [{
      "fam": familyId,
      "fc_role": role,
      "rp": residentId
    }];

    try {
      // Execute both mutations concurrently
      const [newComposition, newCompositionHealth] = await Promise.all([
        addFamilyComposition(compositionData, {
          onSuccess: () => {
            // Individual success handler for main database
            console.log("Main database insertion successful");
          }
        }),
        addFamilyCompositionHealth(compositionData, {
          onSuccess: () => {
            // Individual success handler for health database
            console.log("Health database insertion successful");
          }
        })
      ]);

      // Both insertions successful
      setIsOpenDialog(false);
      setIsSubmitting(false);
      setCompositions((prev: any) => [
        ...prev,
        newComposition
      ]);

      toast("Record added successfully to both databases", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });

    } catch (error) {
      console.error("Error inserting to databases:", error);
      setIsSubmitting(false);
      
      toast("Error adding record", {
        icon: <CircleCheck size={24} className="fill-red-500 stroke-white" />,
      });
    }
  };

  if(isLoadingResidents) {
    return <Loader2 className="animate-spin" />
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="grid gap-3"
      >
        <div className="grid gap-2">
          <div className="flex justify-between items-center mb-1">
            <Label className="text-black/70">Resident</Label>
          </div>
          <Combobox
            options={formattedResidents}
            value={form.watch("id")}
            onChange={(value) => form.setValue("id", value)}
            placeholder="Select a resident" 
            emptyMessage={
              <div className="flex gap-2 justify-center items-center">
                <Label className="font-normal text-[13px]">No resident found.</Label>
                <Link to="/resident/form">
                  <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                    Register
                  </Label>
                </Link>
              </div>
            }
          />
          {invalidResident ? <Label className="text-[13px] text-red-500">
            Resident is required
          </Label> : ""}
        </div>
        <FormSelect control={form.control} name="role" label="Role" options={[
          {id: "Mother", name: "Mother"},
          {id: "Father", name: "Father"},
          {id: "Guardian", name: "Guardian"},
          {id: "Dependent", name: "Dependent"},
        ]}/>
        <div className="flex justify-end items-start mt-8">
          {!isSubmitting ? (<Button>
            <Plus/> Add
          </Button>) : (
            <LoadButton>Adding...</LoadButton>
          )}
        </div>
      </form>
    </Form>
  )
}