"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Form } from "@/components/ui/form/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { demographicFormSchema } from "@/form-schema/family-profiling-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form/form"
import CardLayout from "@/components/ui/card/card-layout"
import { toast } from "sonner"
import { CircleCheck, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { FormDateInput } from "@/components/ui/form/form-date-input";

interface DemographicDataProps {
  onSubmit: (data: z.infer<typeof demographicFormSchema>) => void
  initialData?: Partial<z.infer<typeof demographicFormSchema>>
}

export function DemographicData({ onSubmit, initialData }: DemographicDataProps) {
  // Use generateDefaultValues helper for consistent default values
  const defaultValues = React.useRef(generateDefaultValues(demographicFormSchema))

  const form = useForm<z.infer<typeof demographicFormSchema>>({
    resolver: zodResolver(demographicFormSchema),
    defaultValues: defaultValues.current,
  })

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)



  // Handle form submission with validation
  const submit = async () => {
    setIsSubmitting(true)

    const formIsValid = await form.trigger()

    if (!formIsValid) {
      const errors = form.formState.errors
      console.log("Validation Errors:", errors)
      setIsSubmitting(false)
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      })
      return
    }

    try {
      const values = form.getValues()
      onSubmit(values)

      toast("Demographic data saved successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      })

      // Optionally reset form or navigate
      // form.reset(defaultValues.current);
    } catch (err) {
      console.error("Submission failed:", err)
      toast("Failed to save demographic data", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <CardLayout
        cardTitle="Demographic Data"
        cardDescription="Fill in all the required fields to complete the demographic data."
        cardContent={
          <div className="w-full mx-auto border-none">
            <Separator className="w-full bg-gray"></Separator>
            <div className="pt-4">
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submit()
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormInput
                        control={form.control}
                        name="building"
                        label="Building"
                        placeholder="Enter building"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="quarter"
                        label="Quarter"
                        placeholder="Enter quarter"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="householdNo"
                        label="Household No.*"
                        placeholder="Enter household no."
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="familyNo"
                        label="Family No.*"
                        placeholder="Enter family no."
                        readOnly={isReadOnly}
                      />
                    </div>
                    <FormInput
                      control={form.control}
                      name="address"
                      label="Complete Address"
                      placeholder="Enter complete address"
                      readOnly={isReadOnly}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormSelect
                        control={form.control}
                        name="nhtsHousehold"
                        label="NHTS Household"
                        options={[{ id: "Yes", name: "Yes" }, { id: "No", name: "No" },]}
                        readOnly={isReadOnly}
                      />
                      <FormSelect
                        control={form.control}
                        name="indigenousPeople"
                        label="Indigenous People"
                        options={[{ id: "Yes", name: "Yes" }, { id: "No", name: "No" },]}
                        readOnly={isReadOnly}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Respondent Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput
                        control={form.control}
                        name="respondent.lastName"
                        label="Last Name*"
                        placeholder="Enter last name"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="respondent.firstName"
                        label="First Name*"
                        placeholder="Enter first name"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="respondent.middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                        readOnly={isReadOnly}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormSelect control={form.control} name="respondent.gender" label="Sex" options={[{ id: "female", name: "Female" }, { id: "male", name: "Male" },]}/>
                      <FormInput
                        control={form.control}
                        name="respondent.contactNumber"
                        label="Contact Number"
                        placeholder="Enter contact number"
                        readOnly={isReadOnly}
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
                        label="Last Name*"
                        placeholder="Enter last name"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="householdHead.firstName"
                        label="First Name*"
                        placeholder="Enter first name"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="householdHead.middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                        readOnly={isReadOnly}
                      />
                      <FormSelect control={form.control} name="householdHead.gender" label="Sex" options={[{ id: "female", name: "Female" }, { id: "male", name: "Male" },]}/>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Father's Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput
                        control={form.control}
                        name="father.lastName"
                        label="Last Name*"
                        placeholder="Enter last name"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="father.firstName"
                        label="First Name*"
                        placeholder="Enter first name"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="father.middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                        readOnly={isReadOnly}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      <FormDateInput control={form.control} name="father.birthYear" label="Date of Birth"/>
                      <FormInput
                        control={form.control}
                        name="father.age"
                        label="Age"
                        placeholder="Enter age"
                        readOnly={isReadOnly}
                      />
                    
                      <FormSelect control={form.control} name="father.civilStatus" label="Civil Status" 
                      options={[
                        { id: "Single", name: "Single" }, 
                        { id: "Married", name: "Married" }, 
                        { id: "Widowed", name: "Widowed" }, 
                        { id: "Separated", name: "Separated" }, 
                        { id: "Divorced", name: "Divorced" },]}/>
                    
                      
                      <FormSelect control={form.control} name="father.educationalAttainment" label="Educational Attainment" options={[{ id: "Elementary", name: "Elementary" }, { id: "Highschool", name: "Highschool" }, { id: "College", name: "College" }, { id: "Post Graduate", name: "Post Graduate" }, { id: "Vocational", name: "Vocational" }, { id: "None", name: "None" },]}/>
                                                                                                          
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormInput
                        control={form.control}
                        name="father.religion"
                        label="Religion"
                        placeholder="Enter religion"
                        readOnly={isReadOnly}
                      />
                     
                      <FormSelect control={form.control} name="father.bloodType" label="Blood Type" options={[{ id: "A+", name: "A+" },
                          { id: "A-", name: "A-" },
                          { id: "B+", name: "B+" },
                          { id: "B-", name: "B-" },
                          { id: "AB+", name: "AB+" },
                          { id: "AB-", name: "AB-" },
                          { id: "O+", name: "O+" },
                          { id: "O-", name: "O-" },
                          { id: "unknown", name: "Unknown" },]}
                      />
                      <FormInput
                        control={form.control}
                        name="father.philHealthId"
                        label="PhilHealth ID"
                        placeholder="Enter PhilHealth ID"
                        readOnly={isReadOnly}
                      />
                      
                      <FormSelect control={form.control} name="father.covidVaxStatus" label="COVID Vaccination Status" 
                      options={[
                        { id: "notVaccinated", name: "Not Vaccinated" },
                        { id: "partiallyVaccinated", name: "Partially Vaccinated" },
                        { id: "fullyVaccinated", name: "Fully Vaccinated" },
                        { id: "boosted", name: "Boosted" },]}
                      />
              
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Mother's Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput
                        control={form.control}
                        name="mother.lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="mother.firstName"
                        label="First Name"
                        placeholder="Enter first name"
                        readOnly={isReadOnly}
                      />
                      <FormInput
                        control={form.control}
                        name="mother.middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                        readOnly={isReadOnly}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                      <FormDateInput control={form.control} name="mother.birthYear" label="Date of Birth"/>
                      <FormInput
                        control={form.control}
                        name="mother.age"
                        label="Age"
                        placeholder="Enter age"
                        readOnly={isReadOnly}
                      />
                      
                      <FormSelect control={form.control} name="mother.civilStatus" label="Civil Status" 
                      options={[
                        { id: "Single", name: "Single" }, 
                        { id: "Married", name: "Married" }, 
                        { id: "Widowed", name: "Widowed" }, 
                        { id: "Separated", name: "Separated" }, 
                        { id: "Divorced", name: "Divorced" },
                        ]}
                      />

                      <FormSelect control={form.control} name="mother.educationalAttainment" label="Educational Attainment" 
                      options={[
                        { id: "Elementary", name: "Elementary" }, 
                        { id: "Highschool", name: "Highschool" }, 
                        { id: "College", name: "College" }, 
                        { id: "Post Graduate", name: "Post Graduate" }, 
                        { id: "Vocational", name: "Vocational" }, 
                        { id: "None", name: "None" },]}
                      />
                                  
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormInput
                        control={form.control}
                        name="mother.religion"
                        label="Religion"
                        placeholder="Enter religion"
                        readOnly={isReadOnly}
                      />
                      
                      <FormSelect control={form.control} name="mother.bloodType" label="Blood Type" 
                      options={[
                          { id: "A+", name: "A+" },
                          { id: "A-", name: "A-" },
                          { id: "B+", name: "B+" },
                          { id: "B-", name: "B-" },
                          { id: "AB+", name: "AB+" },
                          { id: "AB-", name: "AB-" },
                          { id: "O+", name: "O+" },
                          { id: "O-", name: "O-" },
                          { id: "unknown", name: "Unknown" },]}
                      />
                      <FormInput
                        control={form.control}
                        name="mother.philHealthId"
                        label="PhilHealth ID"
                        placeholder="Enter PhilHealth ID"
                        readOnly={isReadOnly}
                      />
                      
                      <FormSelect control={form.control} name="mother.covidVaxStatus" label="COVID Vaccination Status" 
                      options={[
                        { id: "notVaccinated", name: "Not Vaccinated" },
                        { id: "partiallyVaccinated", name: "Partially Vaccinated" },
                        { id: "fullyVaccinated", name: "Fully Vaccinated" },
                        { id: "boosted", name: "Boosted" },]}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Health Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <FormSelect control={form.control} name="healthRiskClassification" label="Health Risk Classification" 
                      options={[
                        { id: "low", name: "Low Risk" },
                        { id: "medium", name: "Medium Risk" },
                        { id: "high", name: "High Risk" },]}
                      />
                      <FormSelect control={form.control} name="immunizationStatus" label="Immunization Status" 
                      options={[
                        { id: "complete", name: "Complete" },
                        { id: "incomplete", name: "Incomplete" },
                        { id: "none", name: "None" },]}
                      />

                    </div>

                    <div className="space-y-4">
                      <h3 className="text-md font-medium">Family Planning</h3>

                      <FormField
                        control={form.control}
                        name="noFamilyPlanning"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>No Family Planning Method Used</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!form.watch("noFamilyPlanning") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <FormSelect control={form.control} name="familyPlanning.method" label="Family Planning Method"
                            options={[
                              { id: "pills", name: "Pills" },
                              { id: "iud", name: "IUD" },
                              { id: "condom", name: "Condom" },
                              { id: "implant", name: "Implant" },
                              { id: "rhythm", name: "Rhythm" },
                              { id: "other", name: "Other" },]}
                          />
                          
                          <FormSelect control={form.control} name="familyPlanning.source" label="Family Planning Source"
                            options={[
                              { id: "healthCenter", name: "Health Center" },
                              { id: "hospital", name: "Hospital" },
                              { id: "pharmacy", name: "Pharmacy" },
                              { id: "other", name: "Other" },]}
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
        cardHeaderClassName="pb-2 bt-2 text-xl"
        cardContentClassName="pt-0"
      />
    </div>
  )
}

