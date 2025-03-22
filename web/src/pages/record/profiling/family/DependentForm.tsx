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
import { DependentRecord } from '../profilingTypes';

export default function DependentForm({ form, residents, selectedParents, dependents}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any; 
  selectedParents: Record<string, string>
  dependents: DependentRecord[]
}) {

  const { append } = useFieldArray({
    control: form.control,
    name: 'dependentsInfo.list',
  });

  const filteredResidents = React.useMemo(() => {
    return residents.formatted.filter((resident: any) => {
      const residentId = resident.id?.split(" ")[0]

      return residentId !== selectedParents.mother && residentId !== selectedParents.father &&
        !dependents.some((dependent) => dependent.id === residentId)
    })
  }, [residents.formatted, selectedParents, dependents])

  React.useEffect(() => {
    const searchedResident = residents.default.find((value: any) => 
      value.per_id === form.watch('dependentsInfo.new.id')?.split(" ")[0]
  );

    if (searchedResident) {
      form.setValue('dependentsInfo.new', {
        id: searchedResident.per_id || '',
        lastName: searchedResident.per_lname || '',
        firstName: searchedResident.per_fname || '',
        middleName: searchedResident.per_mname || '',
        suffix: searchedResident.per_suffix || '',
        dateOfBirth: searchedResident.per_dob || '',
        sex: searchedResident.per_sex || '',
      });
    } else {
      resetForm();
    }
  }, [form.watch('dependentsInfo.new.id')]);

  const handleAddDependent = () => {
    const newDependent = form.getValues('dependentsInfo.new');
    append(newDependent);

    resetForm();
  };

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