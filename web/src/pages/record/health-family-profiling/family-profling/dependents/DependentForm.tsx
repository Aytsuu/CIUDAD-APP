import React from 'react';
import { z } from 'zod';
import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button/button';
import { Form } from '@/components/ui/form/form';
import { FormInput } from '@/components/ui/form/form-input';
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { CircleAlert, Plus } from 'lucide-react';
import { familyFormSchema } from '@/form-schema/profiling-schema';
import { Combobox } from '@/components/ui/combobox';
import { DependentRecord } from '../../../profiling/ProfilingTypes';
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

  // React to resident selection instantly
  const selectedResidentId = useWatch({ control: form.control, name: 'dependentsInfo.new.id' });
  const prevSelectedRpRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const rpId = selectedResidentId?.split(' ')[0] || '';
    const prevRp = prevSelectedRpRef.current;
    const searchedResident = residents.default.find((value: any) => value.rp_id === rpId);
    const personalInfo = searchedResident?.personal_info;

    if (!selectedResidentId) {
      prevSelectedRpRef.current = null;
      resetForm();
      return;
    }

    // Only initialize/overwrite when the selected resident actually changes
    if (personalInfo && !selectedParents.includes(rpId) && rpId !== prevRp) {
      // Update each field to ensure RHF watchers trigger immediately
      form.setValue('dependentsInfo.new.lastName', personalInfo.per_lname || '', { shouldDirty: true, shouldTouch: true, shouldValidate: false });
      form.setValue('dependentsInfo.new.firstName', personalInfo.per_fname || '', { shouldDirty: true, shouldTouch: true, shouldValidate: false });
      form.setValue('dependentsInfo.new.middleName', personalInfo.per_mname || '', { shouldDirty: true, shouldTouch: true, shouldValidate: false });
      form.setValue('dependentsInfo.new.suffix', personalInfo.per_suffix || '', { shouldDirty: true, shouldTouch: true, shouldValidate: false });
      form.setValue('dependentsInfo.new.dateOfBirth', personalInfo.per_dob || '', { shouldDirty: true, shouldTouch: true, shouldValidate: false });
      form.setValue('dependentsInfo.new.sex', personalInfo.per_sex || '', { shouldDirty: true, shouldTouch: true, shouldValidate: false });

      // Initialize dynamic groups to defaults only on resident change
      form.setValue('dependentsInfo.new.relationshipToHead', form.getValues('dependentsInfo.new.relationshipToHead') || '', { shouldDirty: false });
      // Initialize under-five fields individually (avoid replacing whole object)
      const ufBase = 'dependentsInfo.new.dependentUnderFiveSchema';
      if (form.getValues(`${ufBase}.fic`) === undefined) {
        form.setValue(`${ufBase}.fic`, '', { shouldDirty: false });
      }
      if (form.getValues(`${ufBase}.nutritionalStatus`) === undefined) {
        form.setValue(`${ufBase}.nutritionalStatus`, '', { shouldDirty: false });
      }
      if (form.getValues(`${ufBase}.exclusiveBf`) === undefined) {
        form.setValue(`${ufBase}.exclusiveBf`, '', { shouldDirty: false });
      }
      // Initialize 6+ fields individually
      const padBase = 'dependentsInfo.new.perAddDetails';
      if (form.getValues(`${padBase}.bloodType`) === undefined) {
        form.setValue(`${padBase}.bloodType`, '', { shouldDirty: false });
      }
      if (form.getValues(`${padBase}.philHealthId`) === undefined) {
        form.setValue(`${padBase}.philHealthId`, '', { shouldDirty: false });
      }
      if (form.getValues(`${padBase}.covidVaxStatus`) === undefined) {
        form.setValue(`${padBase}.covidVaxStatus`, '', { shouldDirty: false });
      }

      prevSelectedRpRef.current = rpId;
    }
  }, [selectedResidentId, residents.default, selectedParents]);

  // Handle adding dependent to the list
  const handleAddDependent = () => {
    const newDependent = form.getValues('dependentsInfo.new');
    const hasSelection = !!newDependent.id;
    if (!hasSelection) {
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
      relationshipToHead: '',
      dependentUnderFiveSchema: {
        fic: '',
        nutritionalStatus: '',
        exclusiveBf: '',
      },
      perAddDetails: {
        bloodType: '',
        philHealthId: '',
        covidVaxStatus: '',
      }
    });
  }

  // Compute age to determine conditional fields
  const watchedDOB = useWatch({ control: form.control, name: 'dependentsInfo.new.dateOfBirth' });
  const age = React.useMemo(() => {
    const dob = watchedDOB;
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    return years;
  }, [watchedDOB]);

  // When age changes, clear fields that don't apply
  React.useEffect(() => {
    if (typeof age !== 'number') return;
    if (age >= 0 && age <= 5) {
      // Clear 6+ fields
      form.setValue('dependentsInfo.new.perAddDetails.bloodType', '', { shouldDirty: false });
      form.setValue('dependentsInfo.new.perAddDetails.philHealthId', '', { shouldDirty: false });
      form.setValue('dependentsInfo.new.perAddDetails.covidVaxStatus', '', { shouldDirty: false });
    } else if (age >= 6) {
      // Clear under-five fields
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.fic', '', { shouldDirty: false });
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.nutritionalStatus', '', { shouldDirty: false });
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.exclusiveBf', '', { shouldDirty: false });
    }
  }, [age]);

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
            {/* Common field for all ages */}
            <FormInput control={form.control} name="dependentsInfo.new.relationshipToHead" label="Relationship to family head" placeholder="e.g., Son, Daughter, None" />

            {/* Conditional fields for ages 0-5 */}
            {typeof age === 'number' && age >= 0 && age <= 5 && (
              <>
                <FormSelect
                  control={form.control}
                  name="dependentsInfo.new.dependentUnderFiveSchema.fic"
                  label="FIC"
                  options={[{ id: 'yes', name: 'Yes' }, { id: 'no', name: 'No' }]}
                />
                <FormInput
                  control={form.control}
                  name="dependentsInfo.new.dependentUnderFiveSchema.nutritionalStatus"
                  label="Nutritional status"
                  placeholder="e.g., Normal, Underweight"
                />
                <FormSelect
                  control={form.control}
                  name="dependentsInfo.new.dependentUnderFiveSchema.exclusiveBf"
                  label="Exclusive breastfeeding"
                  options={[{ id: 'yes', name: 'Yes' }, { id: 'no', name: 'No' }]}
                />
              </>
            )}

            {/* Conditional fields for ages 6+ */}
            {typeof age === 'number' && age >= 6 && (
              <>
                <FormSelect
                  control={form.control}
                  name="dependentsInfo.new.perAddDetails.bloodType"
                  label="Blood Type"
                  options={[
                    { id: 'A+', name: 'A+' },
                    { id: 'A-', name: 'A-' },
                    { id: 'B+', name: 'B+' },
                    { id: 'B-', name: 'B-' },
                    { id: 'AB+', name: 'AB+' },
                    { id: 'AB-', name: 'AB-' },
                    { id: 'O+', name: 'O+' },
                    { id: 'O-', name: 'O-' },
                    { id: 'unknown', name: 'Unknown' },
                  ]}
                />
                <FormInput
                  control={form.control}
                  name="dependentsInfo.new.perAddDetails.philHealthId"
                  label="PhilHealth ID"
                  placeholder="Enter PhilHealth ID"
                />
                <FormSelect
                  control={form.control}
                  name="dependentsInfo.new.perAddDetails.covidVaxStatus"
                  label="COVID Vaccination Status"
                  options={[
                    { id: 'notVaccinated', name: 'Not Vaccinated' },
                    { id: 'firstdose', name: '1st Dose' },
                    { id: 'seconddose', name: '2nd Dose' },
                    { id: 'booster', name: 'Booster Shot' },
                  ]}
                />
              </>
            )}
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