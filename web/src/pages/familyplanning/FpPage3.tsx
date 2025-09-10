import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { page3Schema, type FormData } from "@/form-schema/FamilyPlanningSchema"
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button/button"
import { useRiskStiData } from "./queries/fpFetchQuery"
import { zodResolver } from "@hookform/resolvers/zod"

type Page3Props = {
  onPrevious2: () => void
  onNext4: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  mode?: "create" | "edit" | "view"
  patientGender?: string
}

const referralOptions = {
  DSWD: "DSWD",
  WCPU: "WCPU",
  NGOs: "NGOs",
  Others: "Others",
}

const FamilyPlanningForm3 = ({ onPrevious2, onNext4, updateFormData, formData }: Page3Props) => {
  // const isReadOnly = mode === "view"
  const form = useForm<FormData>({
    resolver: zodResolver(page3Schema),
    defaultValues: formData,
    values: formData,
  })

  const patientId = formData?.pat_id
  const { data: riskStiData } = useRiskStiData(patientId)

  useEffect(() => {
    if (riskStiData) {
      form.reset({
        ...formData,
        sexuallyTransmittedInfections: {
          ...formData.sexuallyTransmittedInfections,
          abnormalDischarge: riskStiData.abnormalDischarge,
          dischargeFrom: riskStiData.dischargeFrom,
          sores: riskStiData.sores,
          pain: riskStiData.pain,
          history: riskStiData.history,
          hiv: riskStiData.hiv,
        },
      })
    }
  }, [riskStiData])

  const abnormalDischarge = form.watch("sexuallyTransmittedInfections.abnormalDischarge")
  const patientGender = formData.gender

  useEffect(() => {
    if (!abnormalDischarge) {
      form.setValue("sexuallyTransmittedInfections.dischargeFrom", undefined)
    } else if (abnormalDischarge && patientGender) {
      // Automatically set discharge location based on gender
      const dischargeLocation = patientGender.toLowerCase() === "female" ? "Vagina" : "Penis"
      form.setValue("sexuallyTransmittedInfections.dischargeFrom", dischargeLocation)
    }
  }, [abnormalDischarge, form, patientGender])

  const onSubmit = (data: FormData) => {
    if (!data.sexuallyTransmittedInfections.abnormalDischarge) {
      data.sexuallyTransmittedInfections.dischargeFrom = undefined
    }
    updateFormData(data)
    onNext4()
  }

  const saveFormData = () => {
    updateFormData(form.getValues())
  }


  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* <h5 className="text-lg text-right font-semibold mb-2 ">Page 3</h5> */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* RISKS FOR STI */}
              <div className="space-y-6 border-r-0 md:border-r pr-0 md:pr-8">
                <h3 className="font-bold text-lg mb-4">III. RISKS FOR SEXUALLY TRANSMITTED INFECTIONS</h3>
                <p className="mb-4">Does the client or the client's partner have any of the following?</p>

                <FormField control={form.control} name="sexuallyTransmittedInfections.abnormalDischarge"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <div className="flex items-center space-x-4">
                        <FormLabel>Abnormal discharge from the genital area</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            {["Yes", "No"].map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`abnormalDischarge-${option.toLowerCase()}`}
                                  value={(option === "Yes").toString()}
                                  checked={field.value === (option === "Yes")}
                                  onChange={() => field.onChange(option === "Yes")}
                                />
                                <label htmlFor={`abnormalDischarge-${option.toLowerCase()}`}>{option}</label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                {/* {abnormalDischarge && (
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
                                <input
                                  type="radio"
                                  id={`discharge-${location.toLowerCase()}`}
                                  value={location}
                                  checked={field.value === location}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                                <label htmlFor={`discharge-${location.toLowerCase()}`}>{location}</label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )} */}


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
                                <input
                                  type="radio"
                                  id={`discharge-${location.toLowerCase()}`}
                                  value={location}
                                  checked={field.value === location}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  disabled={!!(abnormalDischarge && patientGender)}
                                />
                                <label htmlFor={`discharge-${location.toLowerCase()}`}>{location}</label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        {abnormalDischarge && patientGender && (
                          <p className="text-sm text-gray-500 mt-1">
                            Automatically set based on patient's gender ({patientGender})
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                )}


                {[
                  { key: "sores", label: "Sores or ulcers in the genital area" },
                  { key: "pain", label: "Pain or burning sensation in the genital area" },
                  { key: "history", label: "History of treatment for sexually transmitted infection" },
                  { key: "hiv", label: "HIV / AIDS / Pelvic-inflammatory disease" },
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
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} id={`${key}-yes`} />
                              <label htmlFor={`${key}-yes`}>Yes</label>
                              <Checkbox checked={!field.value} onCheckedChange={() => field.onChange(false)} id={`${key}-no`} />
                              <label htmlFor={`${key}-no`}>No</label>
                            </div>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* VIOLENCE AGAINST WOMEN */}
              <div className="space-y-6 pl-0 md:pl-8">
                <h3 className="font-bold text-lg mb-4">IV. RISKS FOR VIOLENCE AGAINST WOMEN (VAW)</h3>
                {[
                  { key: "unpleasantRelationship", label: "Unpleasant relationship with partner" },
                  { key: "partnerDisapproval", label: "Partner does not approve of the visit to Family Planning clinic" },
                  { key: "domesticViolence", label: "History of domestic violence or VAW" },
                ].map(({ key, label }) => (
                  <FormField key={key} control={form.control} name={`violenceAgainstWomen.${key}` as any}
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <div className="flex items-center space-x-4">
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} id={`${key}-yes`} />
                              <label htmlFor={`${key}-yes`}>Yes</label>
                              <Checkbox checked={!field.value} onCheckedChange={() => field.onChange(false)} id={`${key}-no`} />
                              <label htmlFor={`${key}-no`}>No</label>
                            </div>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name="violenceAgainstWomen.referredTo"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel className="font-semibold">Referred to:</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          {Object.values(referralOptions).map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`referral-${option}`}
                                value={option}
                                checked={field.value === option || (option === "Others" && !["DSWD", "WCPU", "NGOs"].includes(field.value ?? ""))}
                                onChange={() => field.onChange(option)}
                              />
                              <label htmlFor={`referral-${option}`}>{option}</label>
                            </div>
                          ))}
                          {(field.value === "Others" || !["DSWD", "WCPU", "NGOs"].includes(field.value ?? "")) && (
                            <div className="ml-6 mt-2">
                              <FormLabel>Specify:</FormLabel>
                              <Input
                                className="w-[50%]"
                                placeholder="Specify referral"
                                value={field.value === "Others" ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value || "Others")}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <Button type="button" variant="outline" className="w-full md:w-auto"
                onClick={() => {
                  saveFormData()
                  onPrevious2()
                }}>
                Previous
              </Button>
              <Button type="submit" className="w-full md:w-auto">Next</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FamilyPlanningForm3