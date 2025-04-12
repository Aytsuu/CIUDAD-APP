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
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export default function HouseholdProfileForm({
  sitio,
  residents,
  isSubmitting,
  invalidHouseHead,
  form,
  onSubmit
}: {
  sitio: any[];
  residents: any[];
  isSubmitting: boolean;
  invalidHouseHead: boolean;
  form: UseFormReturn<z.infer<typeof householdFormSchema>>;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label className="text-black/70">Household Head</Label>
        </div>
        <Combobox
          options={residents}
          value={form.watch("householdHead")}
          onChange={(value) => form.setValue("householdHead", value)}
          placeholder="Select a household head"
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
        <Label className="text-[13px] text-red-500">{invalidHouseHead ? `Household head is required` : ''} </Label>
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
          <ConfirmationModal 
            trigger={<Button>Register</Button>}
            title="Confirm Register"
            description="Are you sure you want to register a household?"
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