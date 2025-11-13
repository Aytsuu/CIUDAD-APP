import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";

import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { DependentRecord } from "../../../profiling/ProfilingTypes"
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { Spinner } from "@/components/ui/spinner";

export default function ParentsForm({ residents, form, dependentsList, onSelect, prefix, title, hideHealthFields = false }: {
  residents: any;
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  dependentsList: DependentRecord[];
  onSelect: React.Dispatch<React.SetStateAction<string>>
  prefix: 'motherInfo' | 'fatherInfo' | 'guardInfo' | 'respondentInfo';
  title: string;
  hideHealthFields?: boolean;
}) {

  // Early return if residents data is not available
  if (!residents?.formatted || !residents?.default) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="mb-4">
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-xs text-black/50">Review all fields before proceeding</p>
        </div>
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner size="md" />
          <p className="text-sm text-gray-500">Loading resident data...</p>
        </div>
      </div>
    );
  }

  // Create a Set of dependent IDs for O(1) lookup instead of O(n) array search
  const dependentIdsSet = React.useMemo(() => {
    return new Set(dependentsList.map(dep => dep.id));
  }, [dependentsList]);

  // Optimize filtering with Set lookup
  const filteredResidents = React.useMemo(() => {
    if (!residents?.formatted) return [];
    return residents.formatted.filter((resident: any) => {
      const residentId = resident.id.split(" ")[0];
      // Only exclude dependents, allow same person to be selected for multiple parent roles
      return !dependentIdsSet.has(residentId);
    });
  }, [residents?.formatted, dependentIdsSet]);

  // Create a Map for O(1) resident lookup instead of O(n) find operation
  const residentsMap = React.useMemo(() => {
    if (!residents?.default) return new Map();
    return new Map(residents.default.map((r: any) => [r.rp_id, r]));
  }, [residents?.default]);

  // Watch the form field value
  const selectedResidentValue = form.watch(`${prefix}.id`);

  // Optimize useEffect - only trigger when the actual value changes
  React.useEffect(() => {
    if (!residents?.default || !selectedResidentValue) {
      // Clear form if no selection
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
        contact: '',
        perAddDetails: {
          bloodType: '',
          philHealthId: '',
          covidVaxStatus: '',
        },
      });
      onSelect('');
      return;
    }

    const residentId = selectedResidentValue.split(" ")[0];
    const searchedResident = residentsMap.get(residentId);
    const personalInfo = searchedResident?.personal_info;

    if (personalInfo) {
      // Batch setValue calls by setting the entire object at once
      form.setValue(`${prefix}`, {
        id: selectedResidentValue,
        lastName: personalInfo.per_lname || '',
        firstName: personalInfo.per_fname || '',
        middleName: personalInfo.per_mname || '',
        suffix: personalInfo.per_suffix || '',
        dateOfBirth: personalInfo.per_dob || '',
        status: personalInfo.per_status || '',
        religion: personalInfo.per_religion || '',
        edAttainment: personalInfo.per_edAttainment || '',
        contact: personalInfo.per_contact || '',
        perAddDetails: {
          bloodType: personalInfo.bloodType || '',
          philHealthId: personalInfo.philHealthId || '',
          covidVaxStatus: personalInfo.covidVaxStatus || '',
        }
      }, { shouldValidate: false }); // Skip validation during auto-fill for performance
      
      onSelect(residentId);
    }
  }, [selectedResidentValue, residentsMap, prefix, form, onSelect]);

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
            onChange={(value) => form.setValue(`${prefix}.id`, value as string)}
            placeholder="Select a resident"
            contentClassName="w-[28rem]"
            triggerClassName="w-1/3"
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

          <div className="grid grid-cols-4 gap-4">
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
            {!hideHealthFields && (
              <>
                <FormSelect
                  control={form.control}
                  name={`${prefix}.perAddDetails.bloodType`}
                  label="Blood Type"
                  options={[
                    { id: "A+", name: "A+" },
                    { id: "A-", name: "A-" },
                    { id: "B+", name: "B+" },
                    { id: "B-", name: "B-" },
                    { id: "AB+", name: "AB+" },
                    { id: "AB-", name: "AB-" },
                    { id: "O+", name: "O+" },
                    { id: "O-", name: "O-" },
                    { id: "unknown", name: "Unknown" },
                  ]}
                />
                <FormInput
                  control={form.control}
                  name={`${prefix}.perAddDetails.philHealthId`}
                  label="PhilHealth ID"
                  placeholder="Enter PhilHealth ID"
                  type="number"
                />

                <FormSelect
                  control={form.control}
                  name={`${prefix}.perAddDetails.covidVaxStatus`}
                  label="COVID Vaccination Status"
                  options={[
                    { id: "notVaccinated", name: "Not Vaccinated" },
                    {
                      id: "firstdose",
                      name: "1st Dose",
                    },
                    { id: "seconddose", name: "2nd Dose" },
                    { id: "booster", name: "Booster Shot" },
                  ]}
                />
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}