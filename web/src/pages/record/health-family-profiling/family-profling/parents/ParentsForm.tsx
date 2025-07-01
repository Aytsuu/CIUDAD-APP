import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
<<<<<<< HEAD

import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/family-form-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { DependentRecord } from "../../profilingTypes";

=======
import { FormSelect } from "@/components/ui/form/form-select";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { DependentRecord } from "../../profilingTypes";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";

>>>>>>> mobile-register
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

<<<<<<< HEAD
    const searchedResidentId = form.watch(`${prefix}.id`);
    const searchResident = residents.default?.find((value: any) =>
      value.rp_id === searchedResidentId?.split(" ")[0]
    );

    if (searchResident) {
      form.setValue(`${prefix}`, {
        id: searchedResidentId || '',
        lastName: searchResident.per.per_lname || '',
        firstName: searchResident.per.per_fname || '',
        middleName: searchResident.per.per_mname || '',
        suffix: searchResident.per.per_suffix || '',
        // sex: searchResident.per.per_sex || '',
        dateOfBirth: searchResident.per.per_dob || '',
        status: searchResident.per.per_status || '',
        religion: searchResident.per.per_religion || '',
        edAttainment: searchResident.per.per_edAttainment || '',
        contact: searchResident.per.per_contact || ''
=======
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
        contact: personalInfo.per_contact || '',
        perAddDetails: {
          bloodType: personalInfo.bloodType || '',
          philHealthId: personalInfo.philHealthId || '',
          covidVaxStatus: personalInfo.covidVaxStatus || '',
        }
>>>>>>> mobile-register
      });
    } else {
      form.setValue(`${prefix}`, {
        id: '',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
<<<<<<< HEAD
        // sex: '',
=======
>>>>>>> mobile-register
        dateOfBirth: '',
        status: '',
        religion: '',
        edAttainment: '',
<<<<<<< HEAD
        contact: ''
      });
    }

    onSelect(searchedResidentId?.split(' ')[0])
=======
        contact: '',
        perAddDetails: {
          bloodType: '',
          philHealthId: '',
          covidVaxStatus: '',
        },
      });
    }

    onSelect(selectedResident?.split(' ')[0])
>>>>>>> mobile-register

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
<<<<<<< HEAD
            placeholder="Search for resident..."
            contentClassName="w-[28rem]"
            triggerClassName="w-1/3"
            emptyMessage="No resident found"
=======
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
>>>>>>> mobile-register
          />

          <div className="grid grid-cols-4 gap-4 mb-6">
            <FormInput control={form.control} name={`${prefix}.lastName`} label="Last Name" readOnly />
            <FormInput control={form.control} name={`${prefix}.firstName`} label="First Name" readOnly />
            <FormInput control={form.control} name={`${prefix}.middleName`} label="Middle Name" readOnly />
            <FormInput control={form.control} name={`${prefix}.suffix`} label="Suffix" readOnly />
<<<<<<< HEAD
            {/* <FormDateTimeInput control={form.control} name={`${prefix}.dateOfBirth`} label="Date of Birth" type="date"  /> */}
=======
            <FormDateTimeInput control={form.control} name={`${prefix}.dateOfBirth`} label="Date of Birth" type="date" readOnly />
>>>>>>> mobile-register
            <FormSelect control={form.control} name={`${prefix}.status`} label="Marital Status" options={[
              { id: 'single', name: 'Single' },
              { id: 'married', name: 'Married' },
              { id: 'divorced', name: 'Divorced' },
              { id: 'widowed', name: 'Widowed' },
            ]} readOnly />
            <FormInput control={form.control} name={`${prefix}.religion`} label="Religion" readOnly />
            <FormInput control={form.control} name={`${prefix}.edAttainment`} label="Educational Attainment" readOnly />
<<<<<<< HEAD
            <FormInput control={form.control} name={`${prefix}.contact`} label="Contact Number" readOnly />
            <FormInput control={form.control} name={`${prefix}.bloodType`} label="Blood Type"  />
            <FormSelect control={form.control} name={`${prefix}.covidVaxStatus`} label="COVID-19 Vax Status" options={[
              { id: 'firstDose', name: '1st Dose' },
              { id: 'secondDose', name: '2nd Dose' },
              { id: 'boosterDose', name: 'Booster Dose' },
            
            ]}/>
            <FormInput control={form.control} name={`${prefix}.philHealthId`} label="PhilHealth ID" />

=======
            <FormInput control={form.control} name={`${prefix}.contact`} label="Contact#" readOnly />
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
>>>>>>> mobile-register
          </div>
        </form>
      </Form>
    </div>
  );
}