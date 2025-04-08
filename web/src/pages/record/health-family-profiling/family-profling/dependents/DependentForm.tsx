import React from 'react';
import { z } from 'zod';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button/button';
import { Form } from '@/components/ui/form/form';
import { FormInput } from '@/components/ui/form/form-input';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { Plus } from 'lucide-react';
import { familyFormSchema } from '@/form-schema/profiling-schema';
import { Combobox } from '@/components/ui/combobox';
import { DependentRecord } from '../../profilingTypes';

export default function DependentForm({ form, residents, selectedParents, dependents, title}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any; 
  selectedParents: string[];
  dependents: DependentRecord[];
  title: string;
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
    const searchedResidentId = form.watch('dependentsInfo.new.id')
    const searchedResident = residents.default?.find((value: any) => 
      value.rp_id === form.watch('dependentsInfo.new.id')?.split(" ")[0]  
    );

    // Condition to populate the fields if true, otherwise empty
    if (searchedResident && !selectedParents.includes(searchedResidentId.split(" ")[0])) {
      form.setValue('dependentsInfo.new', {
        id: searchedResidentId || '',
        lastName: searchedResident.per.per_lname || '',
        firstName: searchedResident.per.per_fname || '',
        middleName: searchedResident.per.per_mname || '',
        suffix: searchedResident.per.per_suffix || '',
        dateOfBirth: searchedResident.per.per_dob || '',
        sex: searchedResident.per.per_sex || '',
      });
    } else {
      resetForm();
    }
  }, [form.watch('dependentsInfo.new.id'), selectedParents]);

  // Handle adding dependent to the list
  const handleAddDependent = () => {
    const newDependent = form.getValues('dependentsInfo.new');
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
      <Form {...form}>
        <form className='grid gap-4'>
          <Combobox 
            options={filteredResidents}
            value={form.watch('dependentsInfo.new.id')}
            onChange={(value) => form.setValue('dependentsInfo.new.id', value)}
            placeholder='Search for resident...'
            triggerClassName='w-1/3'
            contentClassName='w-[28rem]'
            emptyMessage='No resident found'
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
            <FormDateInput control={form.control} name="dependentsInfo.new.dateOfBirth" label="Date of Birth" readOnly />
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