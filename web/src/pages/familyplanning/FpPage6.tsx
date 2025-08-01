import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form"
import SignatureCanvas from "react-signature-canvas"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { page6Schema,ServiceProvisionRecordSchema, type FormData, type ServiceProvisionRecord } from "@/form-schema/FamilyPlanningSchema"
import { api2 } from "@/api/api" // Import your API instance
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal"
import { Trash2 } from "lucide-react"
import z from "zod"

const methods = [
  "COC", "POP", "Injectable", "Implant", "Condom",
  "BOM/CMM", "BBT", "STM", "DMPA", "SDM", "Pills", "LAM", "IUD-Interval",
  "Lactating Amenorrhea", "IUD-Post Partum", "Bilateral Tubal Ligation", "Vasectomy",
];

const mapMethodFromPage1ToPage6 = (methodFromPage1: string, otherMethod?: string): string => {
  const methodMapping: Record<string, string> = {
    pills: "Pills",
    DMPA: "DMPA",
    "iud-interval": "IUD-Interval",
    "iud-postpartum": "IUD-Post Partum",
    implant: "Implant",
    condom: "Condom",
    lactating: "Lactating Amenorrhea",
    bilateral: "Bilateral Tubal Ligation",
    vasectomy: "Vasectomy",
    coc: "COC",
    pop: "POP",
    injectable: "Injectable",
    "bom/cmm": "BOM/CMM",
    bbt: "BBT",
    stm: "STM",
    sdm: "SDM",
    lam: "LAM",
    others: "Others",
  }
  if (methodFromPage1 === "Others" && otherMethod) {
    return otherMethod;
  }

  // Use the direct value if no specific mapping is found, assuming it's a commodity name
  return methodMapping[methodFromPage1.toLowerCase()] || methodFromPage1;
};

const pregnancyQuestions = [
  { id: "breastfeeding", q: "Did you have a baby less than six (6) months ago, are you fully or nearly fully breastfeeding, and have you had no menstrual period since then?" },
  { id: "abstained", q: "Have you abstained from sexual intercourse since your last menstrual period or delivery?" },
  { id: "recent_baby", q: "Have you had a baby in the last four (4) weeks?" },
  { id: "recent_period", q: "Did your last menstrual period start within the past seven (7) days?" },
  { id: "recent_abortion", q: "Have you had miscarriage or abortion in the last seven (7) days?" },
  { id: "using_contraceptive", q: "Have you been using a reliable contraceptive method consistently and correctly?" },
]

const parseBloodPressure = (bp: string | undefined) => {
  if (!bp) return { systolic: 0, diastolic: 0 };
  const [systolic, diastolic] = bp.split('/').map(Number);
  return {
    systolic: isNaN(systolic) ? 0 : systolic,
    diastolic: isNaN(diastolic) ? 0 : diastolic,
  };
};

type Props = {
  onPrevious5: () => void
  onSubmitFinal: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  isSubmitting?: boolean
  mode?: "create" | "edit" | "view"
}

export default function FamilyPlanningForm6({
  onPrevious5,
  onSubmitFinal,
  updateFormData,
  formData,
  isSubmitting,
  mode = "create",
}: Props) {
  const isReadOnly = mode === "view"
  const [records, setRecords] = useState(formData.serviceProvisionRecords || [])
  const [availableStock, setAvailableStock] = useState<number | null>(null); // New state for available stock
  const [fetchingStock, setFetchingStock] = useState(false); // New state for loading indicator

  // Get method from Page 1 and auto-populate
  const getMethodFromPage1 = (): string => {
    if (formData?.methodCurrentlyUsed) {
      return mapMethodFromPage1ToPage6(formData.methodCurrentlyUsed, formData.otherMethod);
    }
    return ""
  }

  const [record, setRecord] = useState<ServiceProvisionRecord>({
    dateOfVisit: new Date().toISOString().split("T")[0],
    methodAccepted: getMethodFromPage1(),
    nameOfServiceProvider: "",
    dateOfFollowUp: "",
    methodQuantity: "",
    serviceProviderSignature: "",
    medicalFindings: "",
    weight: formData?.weight || 0,
    bp_systolic: parseBloodPressure(formData?.bloodPressure).systolic, // Parse systolic
    bp_diastolic: parseBloodPressure(formData?.bloodPressure).diastolic, // Parse diastolic
  })

  const [validationError, setValidationError] = useState<string | null>(null)
  const [sigRef, setSigRef] = useState<SignatureCanvas | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const navigate = useNavigate()

  const form = useForm<FormData>({
    resolver: zodResolver(page6Schema),
    defaultValues: {
      serviceProvisionRecords: formData?.serviceProvisionRecords || [],
      pregnancyCheck: formData?.pregnancyCheck || Object.fromEntries(pregnancyQuestions.map((q) => [q.id, false])),
    },
    mode: "onBlur",
  })
  const pregnancyCheckValues = form.watch("pregnancyCheck");

  useEffect(() => {
    updateFormData({ pregnancyCheck: pregnancyCheckValues });
  }, [pregnancyCheckValues, updateFormData]);

  useEffect(() => {
    const methodFromPage1 = getMethodFromPage1()
    if (methodFromPage1 && methodFromPage1 !== record.methodAccepted) {
      setRecord((prev) => ({
        ...prev,
        methodAccepted: methodFromPage1,
      }))
    }
  }, [formData?.methodCurrentlyUsed, formData?.otherMethod]) // Added otherMethod to dependencies

  // New useEffect to fetch commodity stock
  useEffect(() => {
    const fetchCommodityStock = async () => {
      const selectedMethod = record.methodAccepted;

      // Only fetch if a method is selected and it's not "Others" (or if "Others" is specified in otherMethod)
      if (selectedMethod && selectedMethod !== "Others") {
        setFetchingStock(true);
        try {
          // Encode the commodity name to handle spaces or special characters in the URL
          const encodedCommodityName = encodeURIComponent(selectedMethod);
          const response = await api2.get(`familyplanning/commodity-stock/${encodedCommodityName}/`);
          setAvailableStock(response.data.available_stock);
        } catch (error) {
          console.error("Error fetching commodity stock:", error);
          setAvailableStock(null); // Reset stock if fetching fails
          toast.error("Failed to fetch commodity stock."); // You might want to show a toast
        } finally {
          setFetchingStock(false);
        }
      } else {
        setAvailableStock(null); // Clear stock if no method or "Others" is selected
      }
    };

    fetchCommodityStock();
  }, [record.methodAccepted]); // Re-fetch when the selected method changes

  useEffect(() => {
    updateFormData({ serviceProvisionRecords: records })
  }, [records, updateFormData])

  const handleChange = (name: keyof ServiceProvisionRecord, value: string) => {
    const numFields = ["weight", "bp_systolic", "bp_diastolic"]
    setRecord((prev) => ({ ...prev, [name]: numFields.includes(name) ? Number(value) : value }))
    setValidationError(null)
  }

 const addRecord = () => {
  try {
    const validatedData = ServiceProvisionRecordSchema.parse(record);
    
    if (availableStock !== null && Number(record.methodQuantity) > availableStock) {
      setValidationError(`Quantity cannot exceed available stock: ${availableStock}`);
      return;
    }

    setRecords((prev) => [...prev, validatedData]);
    
    setRecord({
      dateOfVisit: new Date().toISOString().split("T")[0],
      methodAccepted: getMethodFromPage1(),
      nameOfServiceProvider: "",
      dateOfFollowUp: "",
      methodQuantity: "",
      serviceProviderSignature: "",
      medicalFindings: "",
      weight: 0,
      bp_systolic: 0,
      bp_diastolic: 0,
    });
    setValidationError(null);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      setValidationError(`${firstError.path.join('.')}: ${firstError.message}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setValidationError("An unexpected error occurred");
      console.error(error);
    }
  }
};


  const removeRecord = (index: number) => {
    setRecords((prev) => prev.filter((_, i) => i !== index))
    updateFormData({ serviceProvisionRecords: records.filter((_, i) => i !== index) })
  }

  const saveSig = () => {
    if (sigRef) setRecord((prev) => ({ ...prev, serviceProviderSignature: sigRef.toDataURL() }))
  }

  const onConfirmSubmit = form.handleSubmit((data) => {
    const complete = record.methodAccepted && record.nameOfServiceProvider
    const finalRecords = complete ? [...records, record] : records

    const latestFollowUpDate = finalRecords.length > 0
      ? finalRecords[finalRecords.length - 1].dateOfFollowUp
      : "";

    // Optional: Add validation here for the final submission
    if (availableStock !== null && Number(record.methodQuantity) > availableStock) {
      setValidationError(`Quantity cannot exceed available stock: ${availableStock}`);
      return;
    }

    updateFormData({
      serviceProvisionRecords: finalRecords,
      pregnancyCheck: data.pregnancyCheck,
      latestFollowUpDate: latestFollowUpDate
    });
    onSubmitFinal()
    // navigate("/FamPlanning_table")
  })

  return (
    <Card>
      <CardHeader>
        {/* <h5 className="text-lg text-right font-semibold mb-7">Page 6</h5> */}
        <CardTitle>Service Provision Record</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form>
            {validationError && <p className="text-red-600 mb-4">{validationError}</p>}

            {/* Display info about auto-populated method */}
            {formData?.methodCurrentlyUsed && (
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Note:</strong> Method automatically selected based on your choice from Page 1:{" "}
                {formData.methodCurrentlyUsed === "Others" && formData.otherMethod
                  ? formData.otherMethod
                  : formData.methodCurrentlyUsed}
              </div>
            )}

            {/* Service Record Inputs */}
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              <div className="flex flex-col space-y-1 mb-2">
                <Label htmlFor="methodAccepted" className="mt-1">
                  METHOD SELECTED
                </Label>
                <Select
                  value={record.methodAccepted}
                  onValueChange={(v) => handleChange("methodAccepted", v)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="methodAccepted">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>QUANTITY (pcs)</Label>
                <div className="flex">
                  <Input
                    type="number"
                    value={record.methodQuantity}
                    onChange={(e) => handleChange("methodQuantity", e.target.value)}
                    className="rounded-r-none"
                    placeholder={fetchingStock ? "Loading stock..." : (availableStock !== null ? `Available: ${availableStock}` : "Enter quantity")}
                    disabled={isReadOnly || fetchingStock || availableStock === 0} // Added availableStock === 0 condition
                  />
                </div>
              </div>

              {["dateOfFollowUp", "nameOfServiceProvider"].map((field) => (
                <div key={field}>
                  <Label>
                    {field === "dateOfFollowUp" ? "Follow-up Date".toUpperCase() : "Service Provider".toUpperCase()}
                  </Label>
                  <Input
                    type={field.includes("date") ? "date" : "text"}
                    value={record[field as keyof ServiceProvisionRecord] as string}
                    onChange={(e) => handleChange(field as keyof ServiceProvisionRecord, e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              ))}

              {["weight", "bp_systolic", "bp_diastolic"].map((field) => (
                <div key={field}>
                  <Label>{field.replace("_", " ").toUpperCase()}</Label>
                  <Input
                    type="number"
                    value={record[field as keyof ServiceProvisionRecord]}
                    onChange={(e) => handleChange(field as keyof ServiceProvisionRecord, e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <Label>Medical Findings</Label>
                <Textarea
                  value={record.medicalFindings}
                  onChange={(e) => handleChange("medicalFindings", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Signature</Label>
                <div className="border h-32 bg-white">
                  <SignatureCanvas ref={(ref) => setSigRef(ref)} canvasProps={{ className: "w-full h-full" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => sigRef?.clear()}
                    disabled={isReadOnly}
                  >
                    Clear
                  </Button>
                  <Button size="sm" variant="secondary" type="button" onClick={saveSig} disabled={isReadOnly}>
                    Save
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button type="button" onClick={addRecord} disabled={isReadOnly}>
                Add Record
              </Button>
            </div>

            {/* Table */}
            <Table className="mt-6">
              <TableHeader>
                <TableRow>
                  {["Visit", "Vitals", "Method", "Qty", "Findings", "Provider", "Signed", "Follow-up", "Action"].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>No records yet.</TableCell>
                  </TableRow>
                ) : (
                  records.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.dateOfVisit}</TableCell>
                      <TableCell>
                        BP: {r.bp_systolic}/{r.bp_diastolic}
                        <br />
                        Wt: {r.weight}
                      </TableCell>
                      <TableCell>{r.methodAccepted}</TableCell>
                      <TableCell>{r.methodQuantity}</TableCell>
                      <TableCell>{r.medicalFindings || "-"}</TableCell>
                      <TableCell>{r.nameOfServiceProvider}</TableCell>
                      <TableCell>{r.serviceProviderSignature ? "✔" : "—"}</TableCell>
                      <TableCell>{r.dateOfFollowUp}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRecord(i)}
                          disabled={isReadOnly}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pregnancy Check */}
            <Separator className="my-8" />
            <h3 className="text-lg font-semibold mb-4">How to be Reasonably Sure a Client is Not Pregnant</h3>
            <div className="grid gap-4">
              {pregnancyQuestions.map(({ id, q }, i) => (
                <FormField
                  key={id}
                  control={form.control}
                  name={`pregnancyCheck.${id}` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`${i + 1}. ${q}`}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value ? "yes" : "no"}
                          onValueChange={(val) => field.onChange(val === "yes")}
                          className="flex gap-6"
                          disabled={isReadOnly}
                        >
                          {["yes", "no"].map((opt) => (
                            <div key={opt} className="flex items-center gap-2">
                              <RadioGroupItem value={opt} id={`${id}-${opt}`} disabled={isReadOnly} />
                              <Label htmlFor={`${id}-${opt}`}>{opt.toUpperCase()}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="mt-6 p-4 rounded-md bg-gray-50">
              <div className="font-medium mb-2">
                ■ If the client answered YES to at least one of the questions and she is free of signs or symptoms of
                pregnancy, provide client with desired method.
              </div>
              <div className="font-medium mb-2">
                ■ If the client answered NO to all of the questions, pregnancy cannot be ruled out. The client should
                await menses or use a pregnancy test.
              </div>
            </div>

            {/* Confirmation & Navigation */}
            <div className="flex justify-end mt-6 space-x-4">
              <Button type="button" variant="outline" onClick={onPrevious5} disabled={isReadOnly}>
                Previous
              </Button>
              <Button type="button" onClick={() => setIsConfirmOpen(true)} disabled={isReadOnly}>
                Submit
              </Button>
            </div>

            <Button
              type="button"
              onClick={() => {
                console.log("=== FINAL FORM DATA REVIEW ===");
                console.log(JSON.stringify(formData, null, 2));
                console.log("=== END OF REVIEW ===");
              }}
              variant="outline"
              className="mr-4"
            >
              Review Data
            </Button>

            <ConfirmationDialog
              isOpen={isConfirmOpen}
              onOpenChange={setIsConfirmOpen}
              onConfirm={onConfirmSubmit}
              title="Confirm Submission"
              description="Are you sure you want to submit all data? This action cannot be undone."
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
