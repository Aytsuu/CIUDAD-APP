"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import SignatureCanvas from "react-signature-canvas"
import { type FormData } from "@/form-schema/FamilyPlanningSchema"

type FamilyPlanningMethod =
  | "coc"
  | "iud-interval"
  | "iud-postpartum"
  | "bom/cmm"
  | "lam"
  | "pop"
  | "bbt"
  | "sdm"
  | "injectable"
  | "stm"
  | "implant"
  | "condom"
  | "others"

  const methodLabels: Record<FamilyPlanningMethod, string> = {
    coc: "Combined Oral Contraceptives (COC)",
    "iud-interval": "Intrauterine Device - Interval (IUD)",
    "iud-postpartum": "Intrauterine Device - Post Partum (IUD)",
    "bom/cmm": "Billings Ovulation Method/Cervical Mucus Method",
    lam: "Lactational Amenorrhea Method",
    pop: "Progestin-only Pills",
    bbt: "Basal Body Temperature",
    sdm: "Standard Days Method",
    injectable: "Injectable Contraceptives",
    stm: "Symptothermal Method",
    implant: "Contraceptive Implant",
    condom: "Condom",
    others: "Others",
  }
  
// Fix the props type
interface AcknowledgementFormProps {
  onPrevious4: () => void
  onNext6: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
}

export default function FamilyPlanningForm5({
  onPrevious4,
  onNext6,
  updateFormData,
  formData,
}: AcknowledgementFormProps) {
  // Initialize with empty strings for signatures to avoid validation errors
  const defaultValues = {
    acknowledgement: {
      selectedMethod: formData?.acknowledgement?.selectedMethod || "",
      clientSignature: formData?.acknowledgement?.clientSignature || "",
      clientSignatureDate: formData?.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
      clientName: formData?.acknowledgement?.clientName || "",
      guardianSignature: formData?.acknowledgement?.guardianSignature || "",
      guardianSignatureDate: formData?.acknowledgement?.guardianSignatureDate || new Date().toISOString().split("T")[0],
    },
  }

  const form = useForm({
    // resolver: zodResolver(page5Schema),
    defaultValues,
    mode: "onChange",
  })

  const [clientSignature, setClientSignature] = useState<string>(formData?.acknowledgement?.clientSignature || "")
  const [guardianSignature, setGuardianSignature] = useState<string>(formData?.acknowledgement?.guardianSignature || "")

  let clientSignatureRef: SignatureCanvas | null = null
  let guardianSignatureRef: SignatureCanvas | null = null

  // Set form values for signatures when they change
  useEffect(() => {
    form.setValue("acknowledgement.clientSignature", clientSignature || "")
    form.setValue("acknowledgement.guardianSignature", guardianSignature || "")
  }, [clientSignature, guardianSignature, form])

  const clearClientSignature = () => {
    if (clientSignatureRef) {
      clientSignatureRef.clear()
      setClientSignature("")

      // Update form data to remove signature
      const updatedData = {
        ...formData,
        acknowledgement: {
          ...formData?.acknowledgement,
          clientSignature: "",
        },
      }
      updateFormData(updatedData)
      form.setValue("acknowledgement.clientSignature", "")
    }
  }

  const clearGuardianSignature = () => {
    if (guardianSignatureRef) {
      guardianSignatureRef.clear()
      setGuardianSignature("")

      // Update form data to remove signature
      const updatedData = {
        ...formData,
        acknowledgement: {
          ...formData?.acknowledgement,
          guardianSignature: "",
        },
      }
      updateFormData(updatedData)
      form.setValue("acknowledgement.guardianSignature", "")
    }
  }

  const saveClientSignature = () => {
    if (clientSignatureRef) {
      const signatureData = clientSignatureRef.toDataURL()
      setClientSignature(signatureData)

      // Update form data with signature
      const updatedData = {
        ...formData,
        acknowledgement: {
          ...formData?.acknowledgement,
          clientSignature: signatureData,
        },
      }
      updateFormData(updatedData)
      form.setValue("acknowledgement.clientSignature", signatureData)
    }
  }

  const saveGuardianSignature = () => {
    if (guardianSignatureRef) {
      const signatureData = guardianSignatureRef.toDataURL()
      setGuardianSignature(signatureData)

      // Update form data with signature
      const updatedData = {
        ...formData,
        acknowledgement: {
          ...formData?.acknowledgement,
          guardianSignature: signatureData,
        },
      }
      updateFormData(updatedData)
      form.setValue("acknowledgement.guardianSignature", signatureData)
    }
  }

  const handleFormSubmit = (data: any) => {
    // Skip validation for signatures - they're optional
    if (!data.acknowledgement?.selectedMethod) {
      form.setError("acknowledgement.selectedMethod", {
        type: "manual",
        message: "Please select a method",
      })
      return
    }

    // Create updated form data with all acknowledgement fields
    const updatedData = {
      ...formData,
      acknowledgement: {
        selectedMethod: data.acknowledgement.selectedMethod,
        clientSignature: clientSignature || "",
        clientSignatureDate: data.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
        clientName: data.acknowledgement?.clientName || "",
        guardianSignature: guardianSignature || "",
        guardianSignatureDate: data.acknowledgement?.guardianSignatureDate || "",
      },
    }
    // Update parent form data
    updateFormData(updatedData)

    // Call onSubmit if provided
    if (onNext6) {
      onNext6()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">ACKNOWLEDGEMENT</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="text-sm">
              This is to certify that the Physician/Nurse/Midwife of the clinic has fully explained to me the different
              methods available in family planning and I freely choose the
              <FormField
                control={form.control}
                name="acknowledgement.selectedMethod"
                render={({ field }) => (
                  <FormItem className="inline-block mx-2 mb-0 min-w-40">
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Update form data
                        const updatedData = {
                          ...formData,
                          acknowledgement: {
                            ...formData?.acknowledgement,
                            selectedMethod: value as FamilyPlanningMethod,
                          },
                        }
                        updateFormData(updatedData)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(methodLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              method.
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <div className="border border-gray-300 rounded p-2 h-32 bg-white">
                  <SignatureCanvas
                    ref={(ref) => (clientSignatureRef = ref)}
                    canvasProps={{
                      className: "w-full h-full",
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={clearClientSignature}>
                    Clear
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={saveClientSignature}>
                    Save Signature
                  </Button>
                </div>
                <div className="text-center border-t border-gray-300 pt-1 font-medium text-sm">Client Signature</div>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="acknowledgement.clientSignatureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date:<span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            // Update form data
                            const updatedData = {
                              ...formData,
                              acknowledgement: {
                                ...formData?.acknowledgement,
                                clientSignatureDate: e.target.value,
                              },
                            }
                            updateFormData(updatedData)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm mb-4">
                For WEA below 18 yrs. Old: I hereby consent
                <FormField
                  control={form.control}
                  name="acknowledgement.clientName"
                  render={({ field }) => (
                    <FormItem className="inline-block mx-2 mb-0 min-w-40">
                      <FormControl>
                        <Input
                          placeholder="Client's name"
                          className="border-b border-t-0 border-l-0 border-r-0 rounded-none px-2"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            // Update form data
                            const updatedData = {
                              ...formData,
                              acknowledgement: {
                                ...formData?.acknowledgement,
                                clientName: e.target.value,
                              },
                            }
                            updateFormData(updatedData)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                to accept the Family Planning method.
              </p>

              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <div className="border border-gray-300 rounded p-2 h-32 bg-white">
                    <SignatureCanvas
                      ref={(ref) => (guardianSignatureRef = ref)}
                      canvasProps={{
                        className: "w-full h-full",
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-between">
                    <Button type="button" variant="outline" size="sm" onClick={clearGuardianSignature}>
                      Clear
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={saveGuardianSignature}>
                      Save Signature
                    </Button>
                  </div>
                  <div className="text-center border-t border-gray-300 pt-1 font-medium text-sm">
                    Parent/Guardian Signature
                  </div>
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="acknowledgement.guardianSignatureDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date:</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              // Update form data
                              const updatedData = {
                                ...formData,
                                acknowledgement: {
                                  ...formData?.acknowledgement,
                                  guardianSignatureDate: e.target.value,
                                },
                              }
                              updateFormData(updatedData)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline" type="button" onClick={onPrevious4}>
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

