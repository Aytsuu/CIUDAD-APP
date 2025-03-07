"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Button } from "@/components/ui/button"
import FamilyPlanningSchema, { type FormData } from "@/form-schema/FamilyPlanningSchema"

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
    resolver: zodResolver(FamilyPlanningSchema),
    defaultValues: formData || {
      weight: "",
      height: "",
      bloodPressure: "",
      pulseRate: "",

      skinNormal: false,
      skinPale: false,
      skinYellowish: false,
      skinHematoma: false,
      conjunctivaNormal: false,
      conjunctivaPale: false,
      neckNormal: false,
      neckMass: false,
      neckEnlargedLymphNodes: false,
      breastNormal: false,
      breastMass: false,
      abdomenNormal: false,
      abdomenVaricosities: false,

      extremitiesNormal: false,
      extremitiesEdema: false,
      extremitiesVaricosities: false,
      pelvicNormal: false,
      pelvicMass: false,
      pelvicAbnormalDischarge: false,
      pelvicCervicalAbnormalities: false,
      pelvicWarts: false,
      pelvicPolypOrCyst: false,
      pelvicInflammationOrErosion: false,
      pelvicBloodyDischarge: false,
      cervicalConsistencyFirm: false,
      cervicalConsistencySoft: false,
      cervicalTenderness: false,
      cervicalAdnexalMassTenderness: false,

      uterinePositionMid: false,
      uterinePositionAnteflexed: false,
      uterinePositionRetroflexed: false,
      uterineDepth: "",
    },
  })

  // Add form submission handler to update parent form data
  const onSubmit = (data: FormData) => {
    console.log("Form Submitted", data)
    updateFormData(data)
    onNext5()
  }

  // Helper function to render checkbox group
  const renderCheckboxGroup = (label: string, options: { name: string; label: string }[], className?: string) => (
    <div className={`mb-4 ${className}`}>
      <p className="font-semibold mb-2">{label}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <FormField
            key={option.name}
            control={form.control}
            name={option.name as keyof FormData}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} id={option.name} />
                </FormControl>
                <FormLabel htmlFor={option.name} className="text-sm">
                  {option.label}
                </FormLabel>
              </FormItem>
            )}
          />
        ))}
      </div>
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
            <div className="grid md:grid-cols-4 gap-4">
              {/* Physical Measurements */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter weight" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (m)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter height" {...field} />
                    </FormControl>
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
                      <Input type="text" placeholder="Enter BP" {...field} />
                    </FormControl>
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
                      <Input type="text" placeholder="Enter pulse rate" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {/* Skin Examination */}
              {renderCheckboxGroup("SKIN", [
                { name: "skinNormal", label: "normal" },
                { name: "skinPale", label: "pale" },
                { name: "skinYellowish", label: "yellowish" },
                { name: "skinHematoma", label: "hematoma" },
              ])}

              {/* Conjunctiva Examination */}
              {renderCheckboxGroup("CONJUNCTIVA", [
                { name: "conjunctivaNormal", label: "normal" },
                { name: "conjunctivaPale", label: "pale" },
                { name: "conjunctivaYellowish", label: "yellowish" },
              ])}

              {/* Neck Examination */}
              {renderCheckboxGroup("NECK", [
                { name: "neckNormal", label: "normal" },
                { name: "neckMass", label: "neck mass" },
                { name: "neckEnlargedLymphNodes", label: "enlarged lymph nodes" },
              ])}

              {/* Breast Examination */}
              {renderCheckboxGroup("BREAST", [
                { name: "breastNormal", label: "normal" },
                { name: "breastMass", label: "mass" },
                { name: "breastNippleDischarge", label: "nipple discharge" },
              ])}

              {/* Abdomen Examination */}
              {renderCheckboxGroup("ABDOMEN", [
                { name: "abdomenNormal", label: "normal" },
                { name: "abdomenMass", label: "abdominal mass" },
                { name: "abdomenVaricosities", label: "varicosities" },
              ])}

              {/* Extremities Examination */}
              {renderCheckboxGroup("EXTREMITIES", [
                { name: "extremitiesNormal", label: "normal" },
                { name: "extremitiesEdema", label: "edema" },
                { name: "extremitiesVaricosities", label: "varicosities" },
              ])}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Pelvic Examination */}
              <div>
                <h4 className="font-semibold mb-4">PELVIC EXAMINATION (For IUD Acceptors)</h4>
                {renderCheckboxGroup("", [
                  { name: "pelvicNormal", label: "normal" },
                  { name: "pelvicMass", label: "mass" },
                  { name: "pelvicAbnormalDischarge", label: "abnormal discharge" },
                  { name: "pelvicCervicalAbnormalities", label: "cervical abnormalities" },
                  { name: "pelvicWarts", label: "warts" },
                  { name: "pelvicPolypOrCyst", label: "polyp or cyst" },
                  { name: "pelvicInflammationOrErosion", label: "inflammation or erosion" },
                  { name: "pelvicBloodyDischarge", label: "bloody discharge" },
                ])}
              </div>

              {/* Cervical and Uterine Examination */}
              <div>
                <div className="mb-4">
                  <p className="font-semibold mb-2">CERVICAL CONSISTENCY</p>
                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="cervicalConsistencyFirm"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                              id="cervicalConsistencyFirm"
                            />
                          </FormControl>
                          <FormLabel htmlFor="cervicalConsistencyFirm" className="text-sm">
                            Firm
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cervicalConsistencySoft"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                              id="cervicalConsistencySoft"
                            />
                          </FormControl>
                          <FormLabel htmlFor="cervicalConsistencySoft" className="text-sm">
                            Soft
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {renderCheckboxGroup("", [
                  { name: "cervicalTenderness", label: "cervical tenderness" },
                  { name: "cervicalAdnexalMassTenderness", label: "adnexal mass/tenderness" },
                ])}

                <div className="mb-4">
                  <p className="font-semibold mb-2">UTERINE POSITION</p>
                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="uterinePositionMid"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                              id="uterinePositionMid"
                            />
                          </FormControl>
                          <FormLabel htmlFor="uterinePositionMid" className="text-sm">
                            Mid
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="uterinePositionAnteflexed"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                              id="uterinePositionAnteflexed"
                            />
                          </FormControl>
                          <FormLabel htmlFor="uterinePositionAnteflexed" className="text-sm">
                            Anteflexed
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="uterinePositionRetroflexed"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                              id="uterinePositionRetroflexed"
                            />
                          </FormControl>
                          <FormLabel htmlFor="uterinePositionRetroflexed" className="text-sm">
                            Retroflexed
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="uterineDepth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uterine Depth</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="cm" {...field} />
                      </FormControl>
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
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FamilyPlanningForm4

