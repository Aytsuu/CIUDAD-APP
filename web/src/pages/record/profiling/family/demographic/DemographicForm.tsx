import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { FormSelect } from "@/components/ui/form/form-select";
import { showErrorToast } from "@/components/ui/toast";

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
      showErrorToast("Please fill out all required fields");
    }
  };

  const handleHouseholdChange = React.useCallback(
    (value: any) => {
      form.setValue("demographicInfo.householdNo", value);
  }, [form]);

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
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col justify-start item pt-1 col-span-2">
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
                    <Label className="font-normal text-[13px]">No household found.</Label>
                    <Link to="/profiling/household/form">
                      <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                        Register
                      </Label>
                    </Link>
                  </div>
                }
              />
              <Label className="text-[13px] text-red-500 mt-1">
                {invalidHousehold ? `Resident is required` : ""}
              </Label>
            </div>
            <FormSelect
              control={form.control}
              name="demographicInfo.building"
              label="Household Occupancy"
              options={[
                { id: "owner", name: "Owner" },
                { id: "renter", name: "Renter" },
                { id: "sharer", name: "Sharer" },
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

          {/* Submit Button */}
          <div className="mt-8 sm:mt-auto flex justify-end">
            <Button type="submit" className="w-full sm:w-32">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}