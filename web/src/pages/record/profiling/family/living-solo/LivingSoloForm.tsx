import { FormSelect } from "@/components/ui/form/form-select";
import { Button } from "@/components/ui/button/button";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { LoadButton } from "@/components/ui/button/load-button";
import { demographicInfoSchema } from "@/form-schema/profiling-schema";
import { Link } from "react-router";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export default function LivingSoloForm({
  residents,
  households,
  isSubmitting,
  invalidResident,
  invalidHousehold,
  form,
  onSubmit
}: {
  residents: any[];
  households: any[];
  isSubmitting: boolean;
  invalidResident: boolean;
  invalidHousehold: boolean;
  form: UseFormReturn<z.infer<typeof demographicInfoSchema>>;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="grid gap-3">
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-black/70">Resident</Label>
          </div>
          <Combobox
            options={residents}
            value={form.watch("id")}
            onChange={(value) => form.setValue("id", value)}
            placeholder="Select a resident"
            triggerClassName="font-normal"
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
          <Label className="text-[13px] text-red-500">
            {invalidResident ? `Resident is required` : ""}
          </Label>
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-black/70">Household</Label>
          </div>
          <Combobox
            options={households}
            value={form.watch("householdNo")}
            onChange={(value) => form.setValue("householdNo", value)}
            placeholder="Select a household"
            triggerClassName="font-normal"
            emptyMessage={
              <div className="flex gap-2 justify-center items-center">
                <Label className="font-normal text-[13px]">No household found.</Label>
                <Link to="/household/form">
                  <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                    Register
                  </Label>
                </Link>
              </div>
            }
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
          <ConfirmationModal 
            trigger={<Button>Register</Button>}
            title="Confirm Register"
            description="Are you sure you want to register a family?"
            actionLabel="Confirm"
            onClick={onSubmit}
          />
        ) : (
          <LoadButton>Registering...</LoadButton>
        )}
      </div>
    </>
  );
}
