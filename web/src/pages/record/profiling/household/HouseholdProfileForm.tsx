import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { FormSelect } from "@/components/ui/form/form-select";
import { Combobox } from "@/components/ui/combobox";
import { LoadButton } from "@/components/ui/button/load-button";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import React from "react";

export default function HouseholdProfileForm({
  addresses,
  residents,
  isSubmitting,
  invalidHouseHead,
  form,
  onSubmit,
  setSearchQuery
}: {
  addresses: any[];
  residents: any[];
  isSubmitting: boolean;
  invalidHouseHead: boolean;
  form: UseFormReturn<z.infer<typeof householdFormSchema>>;
  onSubmit: () => void;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
}) {

  React.useEffect(() => {
    if(form.watch('address')){
      const address = addresses.find((add: any) => add.id === form.watch('address'));
      form.setValue('add_id', String(address?.add_id));
    }
  }, [form.watch('address')])

  return (
    <>
      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label className="text-black/70">Household Head</Label>
        </div>
        <Combobox
          options={residents}
          value={form.watch("householdHead")}
          onChange={(value) => form.setValue("householdHead", value as string)}
          placeholder="Select a household head"
          onSearchChange={(value: string) => setSearchQuery(value)}
          emptyMessage={
            <div className="flex gap-2 justify-center items-center">
              <Label className="font-normal text-[13px]">No resident found.</Label>
              <Link to="/profiling/resident/form">
                <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                  Register
                </Label>
              </Link>
            </div>
          }
        />
        <div className="flex justify-between">
          <Label className="text-[13px] text-red-500">{invalidHouseHead ? `Household head is required` : ''} </Label>
        </div>
      </div>
      <FormSelect control={form.control} name="nhts" label="NHTS Household"options={[
          { id: "NO", name: "NO" },
          { id: "YES", name: "YES" },
        ]}
        readOnly={false}
      />
      {addresses.length > 0 && <FormSelect control={form.control} name="address" label="Address" options={addresses} readOnly={false}/>}
      <div className="flex justify-end mt-5">
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