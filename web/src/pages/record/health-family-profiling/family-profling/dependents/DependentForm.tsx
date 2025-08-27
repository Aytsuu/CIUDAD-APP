import React from 'react';
import { z } from 'zod';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button/button';
import { Form } from '@/components/ui/form/form';
import { FormInput } from '@/components/ui/form/form-input';
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { CircleAlert, Plus } from 'lucide-react';
import { familyFormSchema } from '@/form-schema/profiling-schema';
import { Combobox } from '@/components/ui/combobox';
import { DependentRecord } from '../../profilingTypes';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router';

export default function DependentForm({ form, residents, selectedParents, dependents}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any; 
  selectedParents: string[];
  dependents: DependentRecord[];
}) {

  // Initialize field array
  const { append } = useFieldArray({
    control: form.control,
    name: 'dependentsInfo.list',
  });

  // Filter unselected residents before populating the search functionality
  const filteredResidents = React.useMemo(() => {
    return residents.formatted.filter((resident: any) => {
      const residentId = resident.id?.split(" ")[0]

      return !selectedParents.includes(residentId) &&
        !dependents.some((dependent) => dependent.id === residentId)
    })
  }, [residents.formatted, selectedParents, dependents])

  React.useEffect(() => {

    // Get values
    const selectedResident = form.watch('dependentsInfo.new.id')
    const searchedResident = residents.default.find((value: any) => 
      value.rp_id === selectedResident?.split(" ")[0]  
    );
    const personalInfo = searchedResident?.personal_info;

    // Condition to populate the fields if true, otherwise empty
    if (personalInfo && !selectedParents.includes(selectedResident?.split(" ")[0] as string)) {
      form.setValue('dependentsInfo.new', {
        id: selectedResident || '',
        lastName: personalInfo.per_lname || '',
        firstName: personalInfo.per_fname || '',
        middleName: personalInfo.per_mname || '',
        suffix: personalInfo.per_suffix || '',
        dateOfBirth: personalInfo.per_dob || '',
        sex: personalInfo.per_sex || '',
      });
    } else {
      resetForm();
    }
  }, [form.watch('dependentsInfo.new.id'), selectedParents]);

  // Handle adding dependent to the list
  const handleAddDependent = () => {
    const newDependent = form.getValues('dependentsInfo.new');
    const isDefault = Object.values(newDependent).every((value) => value === '')
    if (isDefault) {
      toast('Please select a resident to add as a dependent.', {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: '1px solid rgb(225, 193, 193)',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
        },
      })
      return;
    }
    append(newDependent);
    resetForm();
  };

  // Handle form reset
  const resetForm = () => {
    form.setValue('dependentsInfo.new', {
      id: '',
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      dateOfBirth: '',
      sex: '',
    });
  }

  return (
    <div className="grid gap-3">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">Dependents Information</h2>
        <p className="text-xs text-black/50">Review all fields before proceeding</p>
      </div>

      <Form {...form}>
        <form className='grid gap-4'>
          <Combobox 
            options={filteredResidents}
            value={form.watch('dependentsInfo.new.id') as string}
            onChange={(value) => form.setValue('dependentsInfo.new.id', value)}
            placeholder='Select a resident'
            triggerClassName='w-1/3'
            contentClassName='w-[28rem]'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <FormInput control={form.control} name="dependentsInfo.new.lastName" label="Last Name" readOnly />
            <FormInput control={form.control} name="dependentsInfo.new.firstName" label="First Name" readOnly />
            <FormInput control={form.control} name="dependentsInfo.new.middleName" label="Middle Name" readOnly />
            <FormInput control={form.control} name="dependentsInfo.new.suffix" label="Suffix" readOnly />
            <FormSelect control={form.control} name="dependentsInfo.new.sex" label="Sex" options={[
                { id: 'male', name: 'Male' },
                { id: 'female', name: 'Female' },
            ]} readOnly/>
            <FormDateTimeInput control={form.control} name="dependentsInfo.new.dateOfBirth" label="Date of Birth" type="date" readOnly />
            <div className="flex items-end">
              <Button type="button" onClick={handleAddDependent} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus /> Dependent
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}