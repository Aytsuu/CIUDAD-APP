"use client";

import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import { Form } from "@/components/ui/form/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DemographicSchema } from "@/form-schema/family-profiling-schema";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form/form";
import CardLayout from "@/components/ui/card/card-layout";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";

export function DemographicData({
  form,
  households,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof DemographicSchema>>;
  onSubmit: () => void;
  households: any[];
}) {
  const submit = async () => {
    const formIsValid = await form.trigger();

    if (formIsValid) {
      onSubmit();
    } else {
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    }
  };

  const handleHouseholdChange = React.useCallback(
    (value: any) => {
      form.setValue('demographicInfo.householdNo', value);
    },
    [form]
  );

  return (
    <div className="w-full">
      <CardLayout
        title="Demographic Data"
        description="Fill in all the required fields to complete the demographic data."
        content={
          <div className="w-full mx-auto border-none">
            <Separator className="w-full bg-gray"></Separator>
            <div className="pt-4">
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormInput
                        control={form.control}
                        name="demographicInfo.building"
                        label="Building"
                        placeholder="Enter building"
                      />
                      <FormInput
                        control={form.control}
                        name="demographicInfo.quarter"
                        label="Quarter"
                        placeholder="Enter quarter"
                      />
                      <Combobox
                        options={[]}
                        // value={form.watch(`demographicInfo.householdNo`)}
                        value={form.watch(`demographicInfo.householdNo`) || ""}
                        onChange={handleHouseholdChange}
                        placeholder="Search for household..."
                        contentClassName="w-full"
                        emptyMessage="No household found"
                      />
                      <FormInput
                        control={form.control}
                        name="demographicInfo.familyNo"
                        label="Family No."
                        placeholder="Enter family no."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        control={form.control}
                        name="address"
                        label="Street Address"
                        placeholder="Enter complete address"
                      />
                      <FormSelect
                        control={form.control}
                        name="sitio"
                        label="Sitio"
                        options={[
                          { id: "cuenco", name: "Cuenco" },
                          { id: "palma", name: "Palma" },
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormSelect
                        control={form.control}
                        name="nhtsHousehold"
                        label="NHTS Household"
                        options={[
                          { id: "Yes", name: "Yes" },
                          { id: "No", name: "No" },
                        ]}
                      />
                      <FormSelect
                        control={form.control}
                        name="demographicInfo.indigenousPeople"
                        label="Indigenous People"
                        options={[
                          { id: "Yes", name: "Yes" },
                          { id: "No", name: "No" },
                        ]}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                      Respondent Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput
                        control={form.control}
                        name="respondent.lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                      />
                      <FormInput
                        control={form.control}
                        name="respondent.firstName"
                        label="First Name"
                        placeholder="Enter first name"
                      />
                      <FormInput
                        control={form.control}
                        name="respondent.middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormSelect
                        control={form.control}
                        name="respondent.gender"
                        label="Sex"
                        options={[
                          { id: "female", name: "Female" },
                          { id: "male", name: "Male" },
                        ]}
                      />
                      <FormInput
                        control={form.control}
                        name="respondent.contactNumber"
                        label="Contact Number"
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Household Head</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormInput
                        control={form.control}
                        name="householdHead.lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                      />
                      <FormInput
                        control={form.control}
                        name="householdHead.firstName"
                        label="First Name"
                        placeholder="Enter first name"
                      />
                      <FormInput
                        control={form.control}
                        name="householdHead.middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                      />
                      <FormSelect
                        control={form.control}
                        name="householdHead.gender"
                        label="Sex"
                        options={[
                          { id: "female", name: "Female" },
                          { id: "male", name: "Male" },
                        ]}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                      Father's Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput
                        control={form.control}
                        name="father.lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                      />
                      <FormInput
                        control={form.control}
                        name="father.firstName"
                        label="First Name"
                        placeholder="Enter first name"
                      />
                      <FormInput
                        control={form.control}
                        name="father.middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormDateTimeInput
                        control={form.control}
                        name="father.birthYear"
                        label="Date of Birth"
                      />
                      <FormInput
                        control={form.control}
                        name="father.age"
                        label="Age"
                        placeholder="Enter age"
                      />

                      <FormSelect
                        control={form.control}
                        name="father.civilStatus"
                        label="Civil Status"
                        options={[
                          { id: "Single", name: "Single" },
                          { id: "Married", name: "Married" },
                          { id: "Widowed", name: "Widowed" },
                          { id: "Separated", name: "Separated" },
                          { id: "Divorced", name: "Divorced" },
                        ]}
                      />

                      <FormSelect
                        control={form.control}
                        name="father.educationalAttainment"
                        label="Educational Attainment"
                        options={[
                          { id: "Elementary", name: "Elementary" },
                          { id: "Highschool", name: "Highschool" },
                          { id: "College", name: "College" },
                          { id: "Post Graduate", name: "Post Graduate" },
                          { id: "Vocational", name: "Vocational" },
                          { id: "None", name: "None" },
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormInput
                        control={form.control}
                        name="father.religion"
                        label="Religion"
                        placeholder="Enter religion"
                      />

                      <FormSelect
                        control={form.control}
                        name="father.bloodType"
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
                        name="father.philHealthId"
                        label="PhilHealth ID"
                        placeholder="Enter PhilHealth ID"
                      />

                      <FormSelect
                        control={form.control}
                        name="father.covidVaxStatus"
                        label="COVID Vaccination Status"
                        options={[
                          { id: "notVaccinated", name: "Not Vaccinated" },
                          {
                            id: "partiallyVaccinated",
                            name: "Partially Vaccinated",
                          },
                          { id: "fullyVaccinated", name: "Fully Vaccinated" },
                          { id: "boosted", name: "Boosted" },
                        ]}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                      Mother's Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput
                        control={form.control}
                        name="mother.lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                      />
                      <FormInput
                        control={form.control}
                        name="mother.firstName"
                        label="First Name"
                        placeholder="Enter first name"
                      />
                      <FormInput
                        control={form.control}
                        name="mother.middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormDateInput
                        control={form.control}
                        name="mother.birthYear"
                        label="Date of Birth"
                      />
                      <FormInput
                        control={form.control}
                        name="mother.age"
                        label="Age"
                        placeholder="Enter age"
                      />

                      <FormSelect
                        control={form.control}
                        name="mother.civilStatus"
                        label="Civil Status"
                        options={[
                          { id: "Single", name: "Single" },
                          { id: "Married", name: "Married" },
                          { id: "Widowed", name: "Widowed" },
                          { id: "Separated", name: "Separated" },
                          { id: "Divorced", name: "Divorced" },
                        ]}
                      />

                      <FormSelect
                        control={form.control}
                        name="mother.educationalAttainment"
                        label="Educational Attainment"
                        options={[
                          { id: "Elementary", name: "Elementary" },
                          { id: "Highschool", name: "Highschool" },
                          { id: "College", name: "College" },
                          { id: "Post Graduate", name: "Post Graduate" },
                          { id: "Vocational", name: "Vocational" },
                          { id: "None", name: "None" },
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormInput
                        control={form.control}
                        name="mother.religion"
                        label="Religion"
                        placeholder="Enter religion"
                      />

                      <FormSelect
                        control={form.control}
                        name="mother.bloodType"
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
                        name="mother.philHealthId"
                        label="PhilHealth ID"
                        placeholder="Enter PhilHealth ID"
                      />

                      <FormSelect
                        control={form.control}
                        name="mother.covidVaxStatus"
                        label="COVID Vaccination Status"
                        options={[
                          { id: "notVaccinated", name: "Not Vaccinated" },
                          {
                            id: "partiallyVaccinated",
                            name: "Partially Vaccinated",
                          },
                          { id: "fullyVaccinated", name: "Fully Vaccinated" },
                          { id: "boosted", name: "Boosted" },
                        ]}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                      Health Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormSelect
                        control={form.control}
                        name="healthRiskClassification"
                        label="Health Risk Classification"
                        options={[
                          { id: "low", name: "Low Risk" },
                          { id: "medium", name: "Medium Risk" },
                          { id: "high", name: "High Risk" },
                        ]}
                      />
                      <FormSelect
                        control={form.control}
                        name="immunizationStatus"
                        label="Immunization Status"
                        options={[
                          { id: "complete", name: "Complete" },
                          { id: "incomplete", name: "Incomplete" },
                          { id: "none", name: "None" },
                        ]}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-md font-medium">Family Planning</h3>

                      <FormField
                        control={form.control}
                        name="healthInfo.noFamilyPlanning"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                No Family Planning Method Used
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!form.watch("healthInfo.noFamilyPlanning") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormSelect
                            control={form.control}
                            name="familyPlanning.method"
                            label="Family Planning Method"
                            options={[
                              { id: "pills", name: "Pills" },
                              { id: "iud", name: "IUD" },
                              { id: "condom", name: "Condom" },
                              { id: "implant", name: "Implant" },
                              { id: "rhythm", name: "Rhythm" },
                              { id: "other", name: "Other" },
                            ]}
                          />

                          <FormSelect
                            control={form.control}
                            name="familyPlanning.source"
                            label="Family Planning Source"
                            options={[
                              { id: "healthCenter", name: "Health Center" },
                              { id: "hospital", name: "Hospital" },
                              { id: "pharmacy", name: "Pharmacy" },
                              { id: "other", name: "Other" },
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        }
        cardClassName="border-0 shadow-none pb-2 rounded-lg"
        headerClassName="pb-2 bt-2 text-xl"
        contentClassName="pt-0"
      />
    </div>
  );
}
