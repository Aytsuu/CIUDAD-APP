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

export default function DemographicForm({
  form,
  households,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  households: any[];
  onSubmit: () => void;
}) {
  const [invalidHousehold, setInvalidHousehold] =
    React.useState<boolean>(false);

  const submit = async () => {
    const formIsValid = await form.trigger("demographicInfo");
    const householdId = form.watch("demographicInfo.householdNo");

    if (formIsValid && householdId) {
      onSubmit();
    } else {
      if (!householdId) setInvalidHousehold(true);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      });
    }
  };

  const handleHouseholdChange = React.useCallback(
    (value: any) => {
      form.setValue("demographicInfo.householdNo", value);
    },
    [form]
  );

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
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col justify-start">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-black/70">Household</Label>
                <div className="flex gap-2 justify-end items-center">
                  <Label className="font-normal text-[13px]">Not found?</Label>
                  <Link to="/household-form">
                    <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                      Register
                    </Label>
                  </Link>
                </div>
              </div>
              <Combobox
                options={households}
                value={form.watch(`demographicInfo.householdNo`)}
                onChange={handleHouseholdChange}
                placeholder="Search for household..."
                contentClassName="w-[22rem]"
                emptyMessage="No household found"
              />
              <Label className="text-[13px] text-red-500 mt-1">
                {invalidHousehold ? `Resident is required` : ""}
              </Label>
            </div>
            <FormSelect
              control={form.control}
              name="demographicInfo.building"
              label="Building"
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
              label="Inigenous People"
              options={[
                { id: "no", name: "No" },
                { id: "yes", name: "Yes" },
              ]}
              readOnly={false}
            />
          </div>
        </form>
      </Form>
    </div>
    
  );
}
