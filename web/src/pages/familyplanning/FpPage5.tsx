import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import SignatureCanvas from "react-signature-canvas"
import { page5Schema, type FormData } from "@/form-schema/FamilyPlanningSchema"
import { zodResolver } from "@hookform/resolvers/zod"

const getPhilippineDate = (): string => {
  const now = new Date();
  // Convert to Philippine time (UTC+8)
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return phTime.toISOString().split('T')[0];
};

type FamilyPlanningMethod =
  | "COC"
  | "IUD-Interval"
  | "IUD-Post Partum"
  | "BOM/CMM"
  | "LAM"
  | "POP"
  | "BBT"
  | "SDM"
  | "Injectable"
  | "STM"
  | "Implant"
  | "Condom"
  | "Pills"
  | "Others"
  | "DMPA"
  | "Lactating Amenorrhea"
  | "BTL"
  | "Vasectomy"


const methodLabels: Record<string, string> = {
  COC: "COC",
  "IUD-Interval": "IUD-Interval",
  "IUD-Post Partum": "IUD-Post Partum",
  "BOM/CMM": "BOM/CMM",
  LAM: "LAM",
  BBT: "BBT",
  POP: "POP",
  SDM: "SDM",
  Injectable: "Injectable",
  STM: "STM",
  Implant: "Implant",
  Condom: "Condom",
  Others: "Others",
  Pills: "Pills",
  DMPA: "DMPA",
  BTL: "BTL",
  Vasectomy: "Vasectomy",
}

// Helper function to map method values between pages
const mapMethodFromPage1 = (methodFromPage1: string,otherMethod?: string): string => {
  const methodMapping: Record<string, string> = {
    Pills: "Pills",
    DMPA: "DMPA",
    "IUD-Interval": "IUD-Interval",
    "IUD-Post Partum": "IUD-Post Partum",
    Implant: "Implant",
    Condom: "Condom",
    "BTL": "BTL",
    Vasectomy: "Vasectomy",
    COC: "COC",
    POP: "POP",
    Injectable: "Injectable",
    "BOM/CMM": "BOM/CMM",
    BBT: "BBT",
    STM: "STM",
    SDM: "SDM",
    LAM: "LAM",
    Others: "Others",
  }
 if (methodFromPage1 === "Others" && otherMethod) {
    return otherMethod;
  }

  return methodMapping[methodFromPage1.toLowerCase()] || methodFromPage1;
};

interface AcknowledgementFormProps {
  onPrevious4: () => void;
  onNext6: () => void;
  updateFormData: (data: Partial<FormData>) => void;
  formData: FormData;
  mode?: "create" | "edit" | "view";
  age?: number; // Pass age from parent component
}

export default function FamilyPlanningForm5({
  onPrevious4,
  onNext6,
  updateFormData,
  formData,
  mode = "create",
  age
}: AcknowledgementFormProps) {
  const isReadOnly = mode === "view"

  // Get the method from FpPage1 and map it appropriately
  const getSelectedMethodFromPage1 = (): string => {
    if (formData?.methodCurrentlyUsed) {
      return mapMethodFromPage1(formData.methodCurrentlyUsed, formData.otherMethod);
    }
    return formData?.acknowledgement?.selectedMethod || ""
  }
 

  // Initialize with method from Page 1 if available
  const defaultValues = {
    acknowledgement: {
      selectedMethod: getSelectedMethodFromPage1(),
      clientSignature: formData?.acknowledgement?.clientSignature || "",
      clientSignatureDate: getPhilippineDate(),
      clientName: formData?.acknowledgement?.clientName || "", // This will now be auto-populated
      guardianName: formData?.acknowledgement?.guardianName || "", 
      guardianSignature: formData?.acknowledgement?.guardianSignature || "",
      guardianSignatureDate: getPhilippineDate(),
    },
  }
  const form = useForm({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(page5Schema),
  })
  useEffect(() => {
    if (formData?.acknowledgement?.clientName) {
      form.setValue("acknowledgement.clientName", formData.acknowledgement.clientName)
    }
  }, [formData?.acknowledgement?.clientName, form])

  const [clientSignature, setClientSignature] = useState<string>(formData?.acknowledgement?.clientSignature || "")
  const [guardianSignature, setGuardianSignature] = useState<string>(formData?.acknowledgement?.guardianSignature || "")

  let clientSignatureRef: SignatureCanvas | null = null
  let guardianSignatureRef: SignatureCanvas | null = null

  const [signaturesSaved, setSignaturesSaved] = useState({
    client: !!formData?.acknowledgement?.clientSignature,
    guardian: !!formData?.acknowledgement?.guardianSignature,
  });

  // Auto-populate the selected method when component mounts or formData changes
  useEffect(() => {
    const methodFromPage1 = getSelectedMethodFromPage1()
    if (methodFromPage1 && methodFromPage1 !== form.getValues("acknowledgement.selectedMethod")) {
      form.setValue("acknowledgement.selectedMethod", methodFromPage1)

      // Update form data immediately
      const updatedData = {
        ...formData,
        acknowledgement: {
          ...formData?.acknowledgement,
          selectedMethod: methodFromPage1,
        },
      }
      updateFormData(updatedData)
    }
  }, [formData, form]) // Updated dependency array

  // Set form values for signatures when they change
  useEffect(() => {
    form.setValue("acknowledgement.clientSignature", clientSignature || "")
    form.setValue("acknowledgement.guardianSignature", guardianSignature || "")
  }, [clientSignature, guardianSignature, form])

  const clearClientSignature = () => {
    if (clientSignatureRef) {
      clientSignatureRef.clear()
      setClientSignature("")
      setSignaturesSaved((prev) => ({ ...prev, client: false })); 

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
      setSignaturesSaved((prev) => ({ ...prev, guardian: false })); 
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
      const signatureData = clientSignatureRef.toDataURL();
      setClientSignature(signatureData);
      setSignaturesSaved(prev => ({...prev, client: true}));
      
      const updatedData = {
        ...formData,
        acknowledgement: {
          ...formData?.acknowledgement,
          clientSignature: signatureData,
        },
      };
      updateFormData(updatedData);
      form.setValue("acknowledgement.clientSignature", signatureData);
    }
  };

  const saveGuardianSignature = () => {
    if (guardianSignatureRef) {
      const signatureData = guardianSignatureRef.toDataURL();
      setGuardianSignature(signatureData);
      setSignaturesSaved(prev => ({...prev, guardian: true}));
      
      const updatedData = {
        ...formData,
        acknowledgement: {
          ...formData?.acknowledgement,
          guardianSignature: signatureData,
        },
      };
      updateFormData(updatedData);
      form.setValue("acknowledgement.guardianSignature", signatureData);
    }
  };

  const handleFormSubmit = (data: any) => {
       // Check if signatures are saved
    if (!signaturesSaved.client) {
      form.setError("acknowledgement.clientSignature", {
        type: "manual",
        message: "Please save client signature"
      });
      return;
    }

    // Add check for guardian if under 18
    if (age !== undefined && age < 18 && !signaturesSaved.guardian) {
      form.setError("acknowledgement.guardianSignature", {
        type: "manual",
        message: "Please save guardian signature (required for clients under 18)"
      });
      return;
    }
    const updatedData = {
      ...formData,
      acknowledgement: {
        selectedMethod: data.acknowledgement.selectedMethod,
        clientSignature: clientSignature || "",
        clientSignatureDate: data.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
        clientName: data.acknowledgement?.clientName || "",
        guardianSignature: guardianSignature || "",
        guardianName: data.acknowledgement?.guardianName || "",
        guardianSignatureDate: data.acknowledgement?.guardianSignatureDate || "",
      },
    }

    updateFormData(updatedData)

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
                        field.onChange(value);
                        const updatedData = {
                          ...formData,
                          acknowledgement: {
                            ...formData?.acknowledgement,
                            selectedMethod: value as FamilyPlanningMethod,
                          },
                        };
                        updateFormData(updatedData);
                      }}
                      value={field.value}
                      disabled={isReadOnly}
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

            {formData?.methodCurrentlyUsed && (
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Note:</strong> Method automatically selected based on your choice from Page 1:{" "}
                {formData.methodCurrentlyUsed === "Others" && formData.otherMethod
                  ? formData.otherMethod
                  : formData.methodCurrentlyUsed}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <div className="border border-gray-300 rounded p-2 h-32 bg-white">
                  <SignatureCanvas
                    ref={(ref) => (clientSignatureRef = ref)}
                    canvasProps={{
                      className: "w-full h-full",
                    }}
                    penColor="black"
                    backgroundColor="white"
                    // disabled={isReadOnly}
                  />
                </div>
                <div className="flex gap-2 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearClientSignature}
                    disabled={isReadOnly}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={saveClientSignature}
                    disabled={isReadOnly}
                  >
                    Save Signature
                  </Button>
                </div>
                <div className="text-center border-t border-gray-300 pt-1 font-medium text-sm">Client Signature</div>
                <FormMessage>{form.formState.errors.acknowledgement?.clientSignature?.message}</FormMessage>
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
                            field.onChange(e);
                            const updatedData = {
                              ...formData,
                              acknowledgement: {
                                ...formData?.acknowledgement,
                                clientSignatureDate: e.target.value,
                              },
                            };
                            updateFormData(updatedData);
                          }}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Conditionally render guardian fields */}
            {(age === undefined || age < 18) && ( // Show if age is not provided or less than 18
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
                            readOnly
                            onChange={(e) => {
                              field.onChange(e);
                              const updatedData = {
                                ...formData,
                                acknowledgement: {
                                  ...formData?.acknowledgement,
                                  clientName: e.target.value,
                                },
                              };
                              updateFormData(updatedData);
                            }}
                            disabled={isReadOnly}
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
                        penColor="black"
                        backgroundColor="white"
                        // disabled={isReadOnly}
                      />
                    </div>
                    <div className="flex gap-2 justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearGuardianSignature}
                        disabled={isReadOnly}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={saveGuardianSignature}
                        disabled={isReadOnly}
                      >
                        Save Signature
                      </Button>
                    </div>
                    <div className="text-center border-t border-gray-300 pt-1 font-medium text-sm">
                      Parent/Guardian Signature
                    </div>
                    <FormMessage>{form.formState.errors.acknowledgement?.guardianSignature?.message}</FormMessage>
                  </div>

                  <div>
                    {/* <FormField
                      control={form.control}
                      name="acknowledgement.guardianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Guardian's Name:
                            {(age === undefined || age < 18) && <span className="text-red-500 ml-1">*</span>}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Guardian's Name"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const updatedData = {
                                  ...formData,
                                  acknowledgement: {
                                    ...formData?.acknowledgement,
                                    guardianName: e.target.value,
                                  },
                                };
                                updateFormData(updatedData);
                              }}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                    <FormField
                      control={form.control}
                      name="acknowledgement.guardianSignatureDate"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>
                            Date:
                            {(age === undefined || age < 18) && <span className="text-red-500 ml-1">*</span>}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const updatedData = {
                                  ...formData,
                                  acknowledgement: {
                                    ...formData?.acknowledgement,
                                    guardianSignatureDate: e.target.value,
                                  },
                                };
                                updateFormData(updatedData);
                              }}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline" type="button" onClick={onPrevious4} disabled={isReadOnly}>
                Previous
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}