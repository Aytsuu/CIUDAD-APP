"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import FamilyPlanningSchema, { type FormData } from "@/form-schema/FamilyPlanningSchema"
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card/card"
import { Button } from "@/components/ui/button"

// Referral options constant
const referralOptions = ["DSWD", "WCPU", "NGOs", "Others"]

// Extract only the fields needed for this page
const page3Schema = FamilyPlanningSchema.pick({
  // STI section
  sexuallyTransmittedInfections: true,
  // VAW section
  violenceAgainstWomen: true,
})

// Add props type to the component
type Page3Props = {
  onPrevious2: () => void
  onNext4: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
}

const FamilyPlanningForm3 = ({ onPrevious2, onNext4, updateFormData, formData }: Page3Props) => {
  // Update the form initialization to use formData
  const form = useForm<FormData>({
    resolver: zodResolver(page3Schema),
    defaultValues: formData,
    values: formData,
  })

  // This effect will update the form values whenever formData changes
  useEffect(() => {
    // Reset the form with the new values from formData
    form.reset(formData)
  }, [form, formData])

  // Watch form fields for conditional rendering
  const abnormalDischarge = form.watch("sexuallyTransmittedInfections.abnormalDischarge")

  // Add form submission handler to update parent form data
  const onSubmit = (data: FormData) => {
    console.log("Form Submitted", data)
    updateFormData(data)
    onNext4()
  }

  // Add a function to save data without navigating
  const saveFormData = () => {
    const currentValues = form.getValues()
    console.log("Saving current form data:", currentValues)
    updateFormData(currentValues)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Section III: Risks for Sexually Transmitted Infections */}
              <div className="space-y-6 border-r-0 md:border-r pr-0 md:pr-8">
                <div>
                  <h3 className="font-bold text-lg mb-4">III. RISKS FOR SEXUALLY TRANSMITTED INFECTIONS</h3>
                  <p className="mb-4">Does the client or the client's partner have any of the following?</p>

                  {/* Abnormal Discharge */}
                  <FormField
                    control={form.control}
                    name="sexuallyTransmittedInfections.abnormalDischarge"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <div className="flex items-center space-x-4">
                          <FormLabel>Abnormal discharge from the genital area</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="abnormalDischarge-yes"
                              />
                              <label htmlFor="abnormalDischarge-yes">Yes</label>
                              <Checkbox
                                checked={!field.value}
                                onCheckedChange={() => field.onChange(false)}
                                id="abnormalDischarge-no"
                              />
                              <label htmlFor="abnormalDischarge-no">No</label>
                            </div>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Discharge Location Conditional Rendering */}
                  {abnormalDischarge && (
                    <FormField
                      control={form.control}
                      name="sexuallyTransmittedInfections.dischargeFrom"
                      render={({ field }) => (
                        <FormItem className="ml-4 mb-4">
                          <p className="italic text-sm mb-2">If "YES" please indicate if from:</p>
                          <FormControl>
                            <div className="flex space-x-4">
                              {["Vagina", "Penis"].map((location) => (
                                <div key={location} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={field.value?.includes(location)}
                                    onCheckedChange={() => {
                                      const newValue = field.value?.includes(location)
                                        ? field.value.filter((v) => v !== location)
                                        : [...(field.value || []), location]
                                      field.onChange(newValue)
                                    }}
                                    id={`discharge-${location.toLowerCase()}`}
                                  />
                                  <label htmlFor={`discharge-${location.toLowerCase()}`}>{location}</label>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Other STI Risks */}
                  {[
                    { key: "sores", label: "Sores" },
                    { key: "pain", label: "Pain" },
                    { key: "history", label: "History" },
                    { key: "hiv", label: "HIV" },
                  ].map(({ key, label }) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`sexuallyTransmittedInfections.${key}` as any}
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <div className="flex items-center space-x-4">
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value as boolean}
                                  onCheckedChange={field.onChange}
                                  id={`${key}-yes`}
                                />
                                <label htmlFor={`${key}-yes`}>Yes</label>
                                <Checkbox
                                  checked={!(field.value as boolean)}
                                  onCheckedChange={() => field.onChange(false)}
                                  id={`${key}-no`}
                                />
                                <label htmlFor={`${key}-no`}>No</label>
                              </div>
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Section IV: Risks for Violence Against Women */}
              <div className="space-y-6 pl-0 md:pl-8">
                <div>
                  <h3 className="font-bold text-lg mb-4">IV. RISKS FOR VIOLENCE AGAINST WOMEN (VAW)</h3>

                  {[
                    {
                      key: "unpleasantRelationship",
                      label: "Unpleasant relationship with partner",
                    },
                    {
                      key: "partnerDisapproval",
                      label: "Partner does not approve of the visit to Family Planning clinic",
                    },
                    {
                      key: "domesticViolence",
                      label: "History of domestic violence or VAW",
                    },
                  ].map(({ key, label }) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`violenceAgainstWomen.${key}` as any}
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <div className="flex items-center space-x-4">
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value as boolean}
                                  onCheckedChange={field.onChange}
                                  id={`${key}-yes`}
                                />
                                <label htmlFor={`${key}-yes`}>Yes</label>
                                <Checkbox
                                  checked={!(field.value as boolean)}
                                  onCheckedChange={() => field.onChange(false)}
                                  id={`${key}-no`}
                                />
                                <label htmlFor={`${key}-no`}>No</label>
                              </div>
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}

                  {/* Referral Section */}
                  <FormField
                    control={form.control}
                    name="violenceAgainstWomen.referredTo"
                    render={({ field }) => (
                      <FormItem className="mt-6">
                        <FormLabel className="font-semibold">Referred to:</FormLabel>
                        <FormControl>
                          <div className="flex flex-col space-y-2">
                            {referralOptions.map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`referral-${option.toLowerCase().replace(/\s+/g, "-")}`}
                                  checked={field.value?.includes(option)}
                                  onCheckedChange={() => {
                                    const newValue = field.value?.includes(option)
                                      ? field.value.filter((v) => v !== option)
                                      : [...(field.value || []), option]
                                    field.onChange(newValue)
                                  }}
                                />
                                <label htmlFor={`referral-${option.toLowerCase().replace(/\s+/g, "-")}`}>
                                  {option}
                                </label>
                              </div>
                            ))}

                            {/* Conditional Input for Other Referral */}
                            {field.value?.includes("Others") && (
                              <FormField
                                control={form.control}
                                name="violenceAgainstWomen.otherReferral"
                                render={({ field: otherField }) => (
                                  <FormItem className="ml-6 mt-2">
                                    <FormLabel>Specify:</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder=""
                                        {...otherField}
                                        className="w-[50%]"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6 space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full md:w-auto"
                onClick={() => {
                  saveFormData();
                  onPrevious2();
                }}
              >
                Previous
              </Button>
              <Button type="submit" className="w-full md:w-auto">
                Next
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FamilyPlanningForm3
