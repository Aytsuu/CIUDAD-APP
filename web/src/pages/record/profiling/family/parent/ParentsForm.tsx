import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { DependentRecord } from "../../ProfilingTypes";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";

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

    const selectedResident = form.watch(`${prefix}.id`);
    const searchedResident = residents.default.find((value: any) =>
      value.rp_id === selectedResident?.split(" ")[0]
    );
    const personalInfo = searchedResident?.personal_info

    if (personalInfo) {
      form.setValue(`${prefix}`, {
        id: selectedResident || '',
        lastName: personalInfo.per_lname || '',
        firstName: personalInfo.per_fname || '',
        middleName: personalInfo.per_mname || '',
        suffix: personalInfo.per_suffix || '',
        dateOfBirth: personalInfo.per_dob || '',
        status: personalInfo.per_status || '',
        religion: personalInfo.per_religion || '',
        edAttainment: personalInfo.per_edAttainment || '',
        contact: personalInfo.per_contact || ''
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

    onSelect(selectedResident?.split(' ')[0])

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
            placeholder="Select a resident"
            contentClassName="w-[28rem]"
            triggerClassName="w-1/3"
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