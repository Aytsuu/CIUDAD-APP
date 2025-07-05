import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VitalSignSchema, VitalSignType } from "@/form-schema/chr-schema";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface VitalSignsDialogFormProps {
  onSubmit: (values: VitalSignType) => void;
  onCancel: () => void;
  childAge?: string;
}

export function VitalSignsDialogForm({
  onSubmit,
  onCancel,
  childAge,
}: VitalSignsDialogFormProps) {
  const currentDate = new Date().toISOString().split("T")[0];
  const [hasFollowUp, setHasFollowUp] = useState(false);

  const form = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: new Date(currentDate).toISOString().split("T")[0],
      age: childAge || "",
      wt: undefined,
      ht: undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: "",
    },
  });

  // Fixed: Remove the custom handleSubmit and use the form's handleSubmit directly
 

  
      const onsubmitForm = (data: VitalSignType) => {
        console.log("PAGE 3:", data);
        form.reset();

      };
    

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onsubmitForm)}>
        <div>
          <div className="flex gap-2 w-full justify-between">
            <FormInput
              control={form.control}
              name="age"
              label="Age"
              type="text"
              placeholder="Enter age"
              readOnly
            />
            <FormInput
              control={form.control}
              name="wt"
              label="Weight (kg)"
              type="number"
              placeholder="Enter weight"
            />
            <FormInput
              control={form.control}
              name="ht"
              label="Height (cm)"
              type="number"
              placeholder="Enter height"
            />
            <FormInput
              control={form.control}
              name="temp"
              label="Temperature (°C)"
              type="number"
              placeholder="Enter temperature"
            />
          </div>

          <div className="w-full mb-4">
            <FormTextArea
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Enter notes"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex items-center space-x-2 mb-4">
            <Checkbox
              id="hasFollowUp"
              checked={hasFollowUp}
              onCheckedChange={(checked) => {
                setHasFollowUp(!!checked);
                if (!checked) {
                  form.setValue("follov_description", "");
                  form.setValue("followUpVisit", "");
                }
              }}
            />
            <label
              htmlFor="hasFollowUp"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Requires follow-up visit?
            </label>
          </div>
        </div>

        {hasFollowUp && (
          <>
            <div className="flex w-full gap-4 mb-4">
              <FormInput
                control={form.control}
                name="follov_description"
                label="Follow Up Reason"
                type="text"
                placeholder="Enter reason for follow-up"
                className="w-full"
              />
              <FormDateTimeInput
                control={form.control}
                name="followUpVisit"
                label="Follow Up Visit Date"
                type="date"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 px-4 py-2"
          >
            Add
          </Button>
        </div>
      </form>
    </Form>
  );
}