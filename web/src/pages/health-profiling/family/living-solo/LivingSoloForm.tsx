import { FormSelect } from "@/components/ui/form/form-select";
import { Button } from "@/components/ui/button/button";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { LoadButton } from "@/components/ui/button/load-button";
import { demographicInfoSchema } from "@/form-schema/profiling-schema";
import { Link } from "react-router";

export default function LivingSoloForm({
  residents,
  households,
  isSubmitting,
  invalidResident,
  invalidHousehold,
  form,
}: {
  residents: any[];
  households: any[];
  isSubmitting: boolean;
  invalidResident: boolean;
  invalidHousehold: boolean;
  form: UseFormReturn<z.infer<typeof demographicInfoSchema>>;
}) {
  return (
    <>
      <div className="grid gap-3">
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-black/70">Resident</Label>
            <div className="flex gap-2 justify-end items-center">
              <Label className="font-normal text-[13px]">Not found?</Label>
              <Link to="/resident-form">
                <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                  Register
                </Label>
              </Link>
            </div>
          </div>
          <Combobox
            options={residents}
            value={form.watch("id")}
            onChange={(value) => form.setValue("id", value)}
            placeholder="Search for resident..."
            triggerClassName="font-normal"
            emptyMessage="No resident found"
          />
          <Label className="text-[13px] text-red-500">
            {invalidResident ? `Resident is required` : ""}
          </Label>
        </div>
        <div className="grid gap-2">
        <div className="flex justify-between items-center">
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
            value={form.watch("householdNo")}
            onChange={(value) => form.setValue("householdNo", value)}
            placeholder="Search for household..."
            triggerClassName="font-normal"
            emptyMessage="No resident found"
          />
          <Label className="text-[13px] text-red-500">
            {invalidHousehold ? `Resident is required` : ""}
          </Label>
        </div>
        <FormSelect
          control={form.control}
          name="building"
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
          name="indigenous"
          label="Indigenous People"
          options={[
            { id: "no", name: "No" },
            { id: "yes", name: "Yes" },
          ]}
          readOnly={false}
        />
      </div>
      {/* Submit Button */}
      <div className="flex justify-end">
        {!isSubmitting ? (
          <Button type="submit">Register</Button>
        ) : (
          <LoadButton>Registering...</LoadButton>
        )}
      </div>
    </>
  );
}
