import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Combobox } from "@/components/ui/combobox";
import { LoadButton } from "@/components/ui/button/load-button";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";

export default function HouseholdProfileForm({
  sitio,
  residents,
  isSubmitting,
  invalidHouseHead,
  form
}: {
  sitio: any[];
  residents: any[];
  isSubmitting: boolean;
  invalidHouseHead: boolean;
  form: UseFormReturn<z.infer<typeof householdFormSchema>>;
}) {
  return (
    <>
      <div className="grid gap-2">
        <Combobox
          options={residents}
          value={form.watch("householdHead")}
          onChange={(value) => form.setValue("householdHead", value)}
          placeholder="Search for household head (by resident #)"
          emptyMessage="No resident found"
        />
        <div className="flex justify-between">
          <Label className="text-[13px] text-red-500">{invalidHouseHead ? `Household head is required` : ''} </Label>
          <div className="flex gap-2 justify-end items-center">
            <Label className="font-normal">Resident not found?</Label>
            <Link to="/resident/form">
              <Label className="font-normal text-teal cursor-pointer hover:underline">
                Register
              </Label>
            </Link>
          </div>
        </div>
      </div>
      <FormSelect
        control={form.control}
        name="nhts"
        label="NHTS Household"
        options={[
          { id: "no", name: "No" },
          { id: "yes", name: "Yes" },
        ]}
        readOnly={false}
      />
      <FormSelect
        control={form.control}
        name="sitio"
        label="Sitio"
        options={sitio}
        readOnly={false}
      />
      <FormInput
        control={form.control}
        name="street"
        label="House Street Address"
        placeholder="Enter your house's street address"
        readOnly={false}
      />
      <div className="flex justify-end">
        {!isSubmitting ? (
          <Button type="submit" className="mt-5">
            Register
          </Button>
        ) : (
          <LoadButton>Registering...</LoadButton>
        )}
      </div>
    </>
  );
}
