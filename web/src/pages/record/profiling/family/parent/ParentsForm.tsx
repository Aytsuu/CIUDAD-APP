import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { DependentRecord } from "../../profilingTypes";

export default function ParentsForm({ residents, form, dependentsList, selectedParents, onSelect, prefix, title }: {
  residents: any;
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  selectedParents: string[];
  dependentsList: DependentRecord[];
  onSelect: React.Dispatch<React.SetStateAction<string>>
  prefix: 'motherInfo' | 'fatherInfo' | 'guardInfo';
  title: string;
}) {


  const filteredResidents = React.useMemo(() => {
    return residents.formatted.filter((resident: any) => {
      const residentId = resident.id.split(" ")[0]
      return !selectedParents.includes(residentId) && 
          !dependentsList.some((dependent) => dependent.id == residentId)
    }
  )}, [residents.formatted, selectedParents, dependentsList])

  React.useEffect(() => {

    const searchedResidentId = form.watch(`${prefix}.id`);
    const searchResident = residents.default.find((value: any) =>
      value.rp_id === searchedResidentId?.split(" ")[0]
    );

    if (searchResident) {
      form.setValue(`${prefix}`, {
        id: searchedResidentId || '',
        lastName: searchResident.per.per_lname || '',
        firstName: searchResident.per.per_fname || '',
        middleName: searchResident.per.per_mname || '',
        suffix: searchResident.per.per_suffix || '',
        dateOfBirth: searchResident.per.per_dob || '',
        status: searchResident.per.per_status || '',
        religion: searchResident.per.per_religion || '',
        edAttainment: searchResident.per.per_edAttainment || '',
        contact: searchResident.per.per_contact || ''
      });
    } else {
      form.setValue(`${prefix}`, {
        id: '',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        dateOfBirth: '',
        status: '',
        religion: '',
        edAttainment: '',
        contact: ''
      });
    }

    onSelect(searchedResidentId?.split(' ')[0])

  }, [form.watch(`${prefix}.id`)]);

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
            value={form.watch(`${prefix}.id`)} // Use the isolated watched value
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
            <FormInput control={form.control} name={`${prefix}.suffix`} label="Suffix" readOnly />
            <FormDateTimeInput control={form.control} name={`${prefix}.dateOfBirth`} label="Date of Birth" type="date" readOnly />
            <FormSelect control={form.control} name={`${prefix}.status`} label="Marital Status" options={[
              { id: 'single', name: 'Single' },
              { id: 'married', name: 'Married' },
              { id: 'divorced', name: 'Divorced' },
              { id: 'widowed', name: 'Widowed' },
            ]} readOnly />
            <FormInput control={form.control} name={`${prefix}.religion`} label="Religion" readOnly />
            <FormInput control={form.control} name={`${prefix}.edAttainment`} label="Educational Attainment" readOnly />
            <FormInput control={form.control} name={`${prefix}.contact`} label="Contact#" readOnly />
          </div>
        </form>
      </Form>
    </div>
  );
}