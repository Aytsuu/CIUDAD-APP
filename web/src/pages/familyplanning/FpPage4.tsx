import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button/button"
import { page4Schema, type FormData } from "@/form-schema/FamilyPlanningSchema"
import { zodResolver } from "@hookform/resolvers/zod"

// Utility function to format dates
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Add props type to the component
type Page4Props = {
  onPrevious3: () => void
  onNext5: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  mode?: "create" | "edit" | "view"
}

const FamilyPlanningForm4 = ({ onPrevious3, onNext5, updateFormData, formData, mode = "create" }: Page4Props) => {
  const isReadOnly = mode === "view"

  const form = useForm<FormData>({
    resolver: zodResolver(page4Schema),
    defaultValues: formData,
    values: formData,
    mode: "onChange",
  })
  const handleBloodPressureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9/]/g, ''); // Allow only numbers and '/'
    value = value.replace(/(\/){2,}/g, '/');
    if (value.length === 3 && !value.includes('/')) {
      value += '/';
    }
    if (value.length === 4 && value.charAt(3) !== '/') {
      value = value.substring(0, 3) + '/' + value.substring(3);
    }
    if (value.length > 7) {
      value = value.substring(0, 7);
    }
    form.setValue("bloodPressure", value);
  };

  const isIUDSelected =
    formData.methodCurrentlyUsed === "IUD-Interval" || formData.methodCurrentlyUsed === "IUD-Post Partum" ||
    (formData.typeOfClient === "New Acceptor" &&
      (formData.acknowledgement?.selectedMethod === "IUD-Interval" ||
        formData.acknowledgement?.selectedMethod === "IUD-Post Partum"))


  // Add form submission handler to update parent form data
  const onSubmit = async (data: FormData) => {
    console.log("Form Submitted", data)
    updateFormData(data)
    onNext5()
  }

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
                    <RadioGroupItem value={option.value} id={`${name}-${option.value}`} disabled={isReadOnly} />
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">V. PHYSICAL EXAMINATION</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4 mt-5">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter weight" {...field} readOnly={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter height" {...field} readOnly={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="bloodPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Pressure (mmHg)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter BP e.g. 120/80"
                        {...field}
                        onChange={handleBloodPressureChange} // Use the custom handler
                        readOnly={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pulseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pulse Rate (/min)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter pulse rate" {...field} readOnly={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <span className="text-xs italic mt-5 m">
              {(formData.weight > 0 || formData.height > 0) && (
                `Weight & height last recorded (y/m/d): ${formData.bodyMeasurementRecordedAt
                  ? formatDate(formData.bodyMeasurementRecordedAt)
                  : formatDate(new Date().toISOString().split('T')[0])
                }`
              )}
            </span>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {/* Skin Examination */}
              {renderRadioGroup("SKIN", "skinExamination", [
                { value: "Normal", label: "Normal" },
                { value: "Pale", label: "Pale" },
                { value: "Yellowish", label: "Yellowish" },
                { value: "Hematoma", label: "Hematoma" },
              ])}

              {/* Conjunctiva Examination */}
              {renderRadioGroup("CONJUNCTIVA", "conjunctivaExamination", [
                { value: "Normal", label: "Normal" },
                { value: "Pale", label: "Pale" },
                { value: "Yellowish", label: "Yellowish" },
              ])}

              {/* Neck Examination */}
              {renderRadioGroup("NECK", "neckExamination", [
                { value: "Normal", label: "Normal" },
                { value: "Neck Mass", label: "Neck Mass" },
                { value: "Enlarged Lymph Nodes", label: "Enlarged Lymph Nodes" },
              ])}

              {/* Breast Examination */}
              {renderRadioGroup("BREAST", "breastExamination", [
                { value: "Normal", label: "Normal" },
                { value: "Mass", label: "Mass" },
                { value: "Nipple Discharge", label: "Nipple Discharge" },
              ])}

              {/* Abdomen Examination */}
              {renderRadioGroup("ABDOMEN", "abdomenExamination", [
                { value: "Normal", label: "Normal" },
                { value: "Abdominal Mass", label: "Abdominal Mass" },
                { value: "Varicosities", label: "Varicosities" },
              ])}

              {/* Extremities Examination */}
              {renderRadioGroup("EXTREMITIES", "extremitiesExamination", [
                { value: "Normal", label: "Normal" },
                { value: "Edema", label: "Edema" },
                { value: "Varicosities", label: "Varicosities" },
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
                  <p className="font-semibold mt-7">CERVICAL CONSISTENCY</p>
                  <FormField
                    control={form.control}
                    name="fp_pelvic_exam.cervicalConsistency"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            value={field.value as string}
                            onValueChange={field.onChange}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="firm"
                                id="cervicalConsistency"
                                disabled={!isIUDSelected || isReadOnly}
                              />
                              <FormLabel htmlFor="cervicalConsistency" className="text-sm font-normal">
                                Firm
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="soft"
                                id="cervicalConsistency"
                                disabled={!isIUDSelected || isReadOnly}
                              />
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
                    name="fp_pelvic_exam.cervicalTenderness"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value as boolean}
                            onChange={(e) => field.onChange(e.target.checked)}
                            id="cervicalTenderness"
                            disabled={!isIUDSelected || isReadOnly}
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
                    name="fp_pelvic_exam.cervicalAdnexal"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value as boolean}
                            onChange={(e) => field.onChange(e.target.checked)}
                            id="cervicalAdnexal"
                            disabled={!isIUDSelected || isReadOnly}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel htmlFor="cervicalAdnexal" className="text-sm font-normal">
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
                    name="fp_pelvic_exam.uterinePosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            value={field.value as string}
                            onValueChange={field.onChange}
                            className="flex flex-wrap gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="middle"
                                id="uterinePositionMid"
                                disabled={!isIUDSelected || isReadOnly}
                              />
                              <FormLabel htmlFor="uterinePositionMid" className="text-sm font-normal">
                                Mid
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="anteflexed"
                                id="uterinePositionAnteflexed"
                                disabled={!isIUDSelected || isReadOnly}
                              />
                              <FormLabel htmlFor="uterinePositionAnteflexed" className="text-sm font-normal">
                                Anteflexed
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="retroflexed"
                                id="uterinePositionRetroflexed"
                                disabled={!isIUDSelected || isReadOnly}
                              />
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
                  name="fp_pelvic_exam.uterineDepth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uterine Depth</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="cm"
                          {...field}
                          disabled={!isIUDSelected || isReadOnly}
                          readOnly={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline" type="button" onClick={onPrevious3} disabled={isReadOnly}>
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
              // disabled={isReadOnly}
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