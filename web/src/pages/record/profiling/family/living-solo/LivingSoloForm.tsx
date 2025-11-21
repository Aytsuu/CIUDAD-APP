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
import { ArrowDownUp, Plus } from "lucide-react";
import React from "react";

export default function LivingSoloForm({
  isRegistrationTab = false,
  prefix = "",
  residents,
  households,
  isSubmitting,
  invalidResident,
  invalidHousehold,
  buildingReadOnly,
  form,
  ownedHouses = [],
  selectOwnedHouses,
  setSelectOwnedHouses,
  onSubmit,
  setResidentSearch,
  setHouseSearch
}: {
  isRegistrationTab: boolean;
  prefix?: string;
  residents: any[];
  households: any[];
  isSubmitting: boolean;
  invalidResident: boolean;
  invalidHousehold: boolean;
  buildingReadOnly: boolean;
  form: UseFormReturn<z.infer<typeof demographicInfoSchema>>;
  ownedHouses: any[];
  selectOwnedHouses: boolean;
  setSelectOwnedHouses: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: () => void;
  setResidentSearch: React.Dispatch<React.SetStateAction<string>>
  setHouseSearch: React.Dispatch<React.SetStateAction<string>>
}) {
  return (
    <>
      <div className="grid gap-3">
        {!isRegistrationTab && (
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label className="text-black/70">Resident</Label>
            </div>
            <Combobox
              options={residents}
              value={form.watch("id") as string}
              onChange={(value) => form.setValue("id", value)}
              onSearchChange={(value) => setResidentSearch(value)}
              placeholder="Select a resident"
              triggerClassName="font-normal"
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
            <Label className="text-[13px] text-red-500">
              {invalidResident ? `Resident is required` : ""}
            </Label>
          </div>
        )}
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-black/70">
              Household <span className="text-gray-500">
                ({selectOwnedHouses ? "Owned" : "Existing"})
              </span>
              <span className="ml-1 text-red-500">*</span>
            </Label>
            {isRegistrationTab && <Button 
              type="button"
              onClick={() => {
                form.resetField(`${prefix}householdNo` as any)
                setSelectOwnedHouses((prev) => !prev)
              }}
              variant={"ghost"} 
              className="text-black/50 p-0 hover:text-blue-600 hover:bg-transparent"
            >
              <ArrowDownUp/>
             {!selectOwnedHouses ? "Select from owned houses" : "Select from existing houses"}
            </Button>}
          </div>
          {!selectOwnedHouses ? (
            <>
              <Combobox
                options={households}
                value={form.watch(`${prefix}householdNo` as any)}
                onChange={(value) => form.setValue(`${prefix}householdNo` as any, value as string)}
                onSearchChange={(value) => setHouseSearch(value)}
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
                {invalidHousehold ? `Household is required` : ""}
              </Label>
            </>
          ) : (
            <FormSelect 
              control={form.control}
              name={`${prefix}householdNo`}
              label=""
              placeholder="Select a household"
              options={ownedHouses}
              readOnly={false}
              required
            />
          )} 
        </div>
        <FormSelect
          control={form.control}
          name={`${prefix}building`}
          label="Household Occupancy"
          options={[
            { id: "owner", name: "OWNER" },
            { id: "renter", name: "RENTER" },
            { id: "sharer", name: "SHARER" },
          ]}
          readOnly={buildingReadOnly}
          required
        />
        <FormSelect
          control={form.control}
          name={`${prefix}indigenous`}
          label="Indigenous People"
          options={[
            { id: "no", name: "NO" },
            { id: "yes", name: "YES" },
          ]}
          readOnly={false}
          required
        />
      </div>
      {/* Submit Button */}
      {!isRegistrationTab && <div className="flex justify-end">
        {!isSubmitting ? (
          <ConfirmationModal 
            trigger={
              <Button className="min-w-32">
                <Plus className="w-4 h-4 mr-2" />
                Register
              </Button>
            }
            title="Confirm Register"
            description="Are you sure you want to register a family?"
            actionLabel="Confirm"
            onClick={onSubmit}
          />
        ) : (
          <LoadButton>Registering...</LoadButton>
        )}
      </div>}
    </>
  );
}
