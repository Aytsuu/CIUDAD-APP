import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";

import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { DependentRecord } from "../../profilingTypes";

export default function HouseholdHeadForm({ residents, form, selectedResidentId, onSelect, prefix, title }: {
  residents: any;
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  selectedResidentId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  prefix: 'householdHeadInfo';
  title: string;
}) {
  const filteredResidents = React.useMemo(() => {
    return residents.formatted.filter((resident: any) => {
      const residentId = resident.id.split(" ")[0];
      return residentId !== selectedResidentId; 
     
    });
  }, [residents.formatted, selectedResidentId]);

  React.useEffect(() => {
    const searchedResidentId = form.watch(`${prefix}.id`);
    const residentIdPart = searchedResidentId?.split(" ")[0];
    
    const searchResident = residents.default?.find((value: any) => 
      value.rp_id === residentIdPart
    ) || residents.formatted?.find((resident: any) =>
      resident.id.split(" ")[0] === residentIdPart
    );

    if (searchResident) {
      const residentData = searchResident.per || searchResident;
      form.setValue(`${prefix}`, {
        id: searchedResidentId || '',
        lastName: residentData.per_lname || residentData.lastName || '',
        firstName: residentData.per_fname || residentData.firstName || '',
        middleName: residentData.per_mname || residentData.middleName || '',
        sex: residentData.per_sex || residentData.sex || '',
       
      });
    }
  }, [form.watch(`${prefix}.id`), residents, prefix]);

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-xs text-black/50">Review all fields before proceeding</p>
      </div>

      <Form {...form}>
        <form className="grid gap-4">
          <Combobox
            options={filteredResidents}
            value={form.watch(`${prefix}.id`)}
            onChange={(value) => form.setValue(`${prefix}.id`, value)}
            placeholder="Search for resident..."
            contentClassName="w-[28rem]"
            triggerClassName="w-1/3"
            emptyMessage="No resident found"
          />

          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormInput control={form.control} name={`${prefix}.lastName`} label="Last Name" readOnly />
            <FormInput control={form.control} name={`${prefix}.firstName`} label="First Name" readOnly />
            <FormInput control={form.control} name={`${prefix}.middleName`} label="Middle Name" readOnly />
            <FormSelect 
              control={form.control} 
              name={`${prefix}.sex`} 
              label="Sex" 
              options={[
                { id: 'male', name: 'Male' },
                { id: 'female', name: 'Female' },
              ]}
            />
          </div>
        </form>
      </Form>
    </div>
  )
}
