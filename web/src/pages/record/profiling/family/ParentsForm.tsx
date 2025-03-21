import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";

export default function ParentsForm({ residents, form, prefix, title}: {
    residents: any
    form: UseFormReturn<z.infer<typeof familyFormSchema>>;
    prefix: 'motherInfo' | 'fatherInfo';
    title: string;
  })  {


  React.useEffect(()=>{

    const searchResident = residents.default.find((value: any) => 
      value.per_id == form.watch(`${prefix}.id`).split(" ")[0]
    );

    if(searchResident){

      form.setValue(`${prefix}`, {
        id: searchResident.per_id || '',
        lastName: searchResident.per_lname || '',
        firstName: searchResident.per_fname || '',
        middleName: searchResident.per_mname || '',
        suffix: searchResident.per_suffix || '',
        dateOfBirth: searchResident.per_dob || '',
        status: searchResident.per_status || '',
        religion: searchResident.per_religion || '',
        edAttainment: searchResident.per_edAttainment || '',
        contact: searchResident.per_contact || ''
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
            options={residents.formatted}
            value={form.watch(`${prefix}.id`)}
            onChange={(value) => form.setValue(`${prefix}.id`, value)}
            placeholder="Search for resident..."
            contentClassName="w-[28rem]"
            triggerClassName="w-1/3"
          />

          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormInput control={form.control} name={`${prefix}.lastName`} label="Last Name" readOnly/>
            <FormInput control={form.control} name={`${prefix}.firstName`} label="First Name" readOnly/>
            <FormInput control={form.control} name={`${prefix}.middleName`} label="Middle Name" readOnly/>
            <FormInput control={form.control} name={`${prefix}.suffix`} label="Suffix" readOnly/>
            <FormDateInput control={form.control} name={`${prefix}.dateOfBirth`} label="Date of Birth" readOnly/>
            <FormSelect control={form.control} name={`${prefix}.status`} label="Marital Status" options={[
                { id: 'single', name: 'Single' },
                { id: 'married', name: 'Married' },
                { id: 'divorced', name: 'Divorced' },
                { id: 'widowed', name: 'Widowed' },
              ]} readOnly/>
            <FormInput control={form.control} name={`${prefix}.religion`} label="Religion" readOnly/>
            <FormInput control={form.control}  name={`${prefix}.edAttainment`} label="Educational Attainment" readOnly/>
            <FormInput control={form.control} name={`${prefix}.contact`} label="Contact#" readOnly/>
          </div>
        </form>
      </Form>
    </div>
  );
};