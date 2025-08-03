"use client"

import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Button } from "@/components/ui/button/button"
import { type FormData } from "@/form-schema/FamilyPlanningSchema"
import { useEffect } from "react"

// Add props type to the component
type Page4Props = {
  onPrevious3: () => void
  onNext5: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
}

const FamilyPlanningForm4 = ({ onPrevious3, onNext5, updateFormData, formData }: Page4Props) => {
  // Initialize form with formData values
  const form = useForm<FormData>({
    // resolver: zodResolver(page4Schema),
    defaultValues: formData,
    values: formData,
    mode: "onChange",
  })

  // Check if user selected IUD in page 1
  // Check if user selected IUD-Interval or IUD-Post Partum in page 1
  const isIUDSelected =
    formData.methodCurrentlyUsed === "IUD-Interval" ||
    formData.methodCurrentlyUsed === "IUD-Post Partum" ||
    (formData.typeOfClient === "New Acceptor" &&
      (formData.acknowledgement?.selectedMethod === "iud-interval" ||
        formData.acknowledgement?.selectedMethod === "iud-postpartum"))

  // Add form submission handler to update parent form data
  const onSubmit = async (data: FormData) => {
    console.log("Form Submitted", data)
    updateFormData(data)
    onNext5()
  }

  // Helper function to render radio group
  const renderRadioGroup = (
    label: string,
    name: string,
    options: { value: string; label: string }[],
    className?: string,
  ) => (
    <div className={`mb-4 ${className}`}>
      <p className="font-semibold mb-2">{label}</p>
      <FormField
        control={form.control}
        name={name as any}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup value={field.value as string} onValueChange={field.onChange} className="space-y-1">
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                    <FormLabel htmlFor={`${name}-${option.value}`} className="text-sm font-normal">
                      {option.label}
                    </FormLabel>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  // Reset pelvic examination fields when IUD is not selected
  useEffect(() => {
    if (!isIUDSelected) {
      form.setValue("pelvicExamination", "not_applicable")
      form.setValue("cervicalConsistency", "not_applicable")
      form.setValue("cervicalTenderness", false)
      form.setValue("cervicalAdnexalMassTenderness", false)
      form.setValue("uterinePosition", "not_applicable")
      form.setValue("uterineDepth", "")
    }
  }, [isIUDSelected, form])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">V. PHYSICAL EXAMINATION</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Physical Measurements */}
              <FormField control={form.control} name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter weight" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (m)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter height" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="bloodPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Pressure (mmHg)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter BP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="pulseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pulse Rate (/min)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter pulse rate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {/* Skin Examination */}
              {renderRadioGroup("SKIN", "skinExamination", [
                { value: "normal", label: "Normal" },
                { value: "pale", label: "Pale" },
                { value: "yellowish", label: "Yellowish" },
                { value: "hematoma", label: "Hematoma" },
              ])}

              {/* Conjunctiva Examination */}
              {renderRadioGroup("CONJUNCTIVA", "conjunctivaExamination", [
                { value: "normal", label: "Normal" },
                { value: "pale", label: "Pale" },
                { value: "yellowish", label: "Yellowish" },
              ])}

              {/* Neck Examination */}
              {renderRadioGroup("NECK", "neckExamination", [
                { value: "normal", label: "Normal" },
                { value: "neck_mass", label: "Neck mass" },
                { value: "enlarged_lymph_nodes", label: "Enlarged lymph nodes" },
              ])}

              {/* Breast Examination */}
              {renderRadioGroup("BREAST", "breastExamination", [
                { value: "normal", label: "Normal" },
                { value: "mass", label: "Mass" },
                { value: "nipple_discharge", label: "Nipple discharge" },
              ])}

              {/* Abdomen Examination */}
              {renderRadioGroup("ABDOMEN", "abdomenExamination", [
                { value: "normal", label: "Normal" },
                { value: "abdominal_mass", label: "Abdominal mass" },
                { value: "varicosities", label: "Varicosities" },
              ])}

              {/* Extremities Examination */}
              {renderRadioGroup("EXTREMITIES", "extremitiesExamination", [
                { value: "normal", label: "Normal" },
                { value: "edema", label: "Edema" },
                { value: "varicosities", label: "Varicosities" },
              ])}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Pelvic Examination - Only enabled for IUD acceptors */}
              <div className={isIUDSelected ? "" : "opacity-50 pointer-events-none"}>
                <h4 className="font-semibold mb-4">
                  PELVIC EXAMINATION (For IUD Acceptors)
                  {!isIUDSelected && <span className="text-sm text-red-500 ml-2">(Disabled - IUD not selected)</span>}
                </h4>

                {renderRadioGroup("", "pelvicExamination", [
                  { value: "normal", label: "Normal" },
                  { value: "mass", label: "Mass" },
                  { value: "abnormal_discharge", label: "Abnormal discharge" },
                  { value: "cervical_abnormalities", label: "Cervical abnormalities" },
                  { value: "warts", label: "Warts" },
                  { value: "polyp_or_cyst", label: "Polyp or cyst" },
                  { value: "inflammation_or_erosion", label: "Inflammation or erosion" },
                  { value: "bloody_discharge", label: "Bloody discharge" },
                ])}
              </div>

              {/* Cervical and Uterine Examination - Only enabled for IUD acceptors */}
              <div className={isIUDSelected ? "" : "opacity-50 pointer-events-none"}>
                <div className="mb-4">
                  <p className="font-semibold mb-2">CERVICAL CONSISTENCY</p>
                  <FormField
                    control={form.control}
                    name="cervicalConsistency"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup value={field.value as string} onValueChange={field.onChange} className="flex space-x-4" >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="firm" id="cervicalConsistency" disabled={!isIUDSelected} />
                              <FormLabel htmlFor="cervicalConsistency" className="text-sm font-normal">
                                Firm
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="soft" id="cervicalConsistency" disabled={!isIUDSelected} />
                              <FormLabel htmlFor="cervicalConsistency" className="text-sm font-normal">
                                Soft
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <FormField
                    control={form.control}
                    name="cervicalTenderness"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input type="checkbox" checked={field.value as boolean}
                            onChange={(e) => field.onChange(e.target.checked)}
                            id="cervicalTenderness"
                            disabled={!isIUDSelected}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel htmlFor="cervicalTenderness" className="text-sm font-normal">
                          Cervical tenderness
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cervicalAdnexalMassTenderness"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input type="checkbox" checked={field.value as boolean}
                            onChange={(e) => field.onChange(e.target.checked)}
                            id="cervicalAdnexalMassTenderness"
                            disabled={!isIUDSelected}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel htmlFor="cervicalAdnexalMassTenderness" className="text-sm font-normal">
                          Adnexal mass/tenderness
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-4 mt-4">
                  <p className="font-semibold mb-2">UTERINE POSITION</p>
                  <FormField
                    control={form.control}
                    name="uterinePosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            value={field.value as string}
                            onValueChange={field.onChange}
                            className="flex flex-wrap gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mid" id="uterinePositionMid" disabled={!isIUDSelected} />
                              <FormLabel htmlFor="uterinePositionMid" className="text-sm font-normal">
                                Mid
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="anteflexed" id="uterinePositionAnteflexed" disabled={!isIUDSelected} />
                              <FormLabel htmlFor="uterinePositionAnteflexed" className="text-sm font-normal">
                                Anteflexed
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="retroflexed" id="uterinePositionRetroflexed" disabled={!isIUDSelected} />
                              <FormLabel htmlFor="uterinePositionRetroflexed" className="text-sm font-normal">
                                Retroflexed
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="uterineDepth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uterine Depth</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="cm" {...field} disabled={!isIUDSelected} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline" type="button" onClick={onPrevious3}>
                Previous
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  // Validate the form
                  const isValid = await form.trigger()
                  if (isValid) {
                    // If valid, save data and proceed
                    const currentValues = form.getValues()
                    updateFormData(currentValues)
                    onNext5()
                  } else {
                    console.error("Please fill in all required fields")
                  }
                }}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FamilyPlanningForm4
