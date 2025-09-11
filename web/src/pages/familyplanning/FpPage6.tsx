import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form/form"
import SignatureCanvas from "react-signature-canvas"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { page6Schema, ServiceProvisionRecordSchema, type FormData, type ServiceProvisionRecord } from "@/form-schema/FamilyPlanningSchema"
import { api2 } from "@/api/api"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal"
import { Trash2 } from "lucide-react"
import { z } from "zod"
import { formatDate } from "@/helpers/dateFormatter"

const methods = [
  "COC", "POP", "Injectable", "Implant", "Condom",
  "BOM/CMM", "BBT", "STM", "DMPA", "SDM", "Pills", "LAM", "IUD-Interval",
  "Lactating Amenorrhea", "IUD-Post Partum", "Bilateral Tubal Ligation (BTL)", "Vasectomy",
]

const initialCommonFindings: string[] = [
  "In for FP method","No complaint","In fair looking","Pale looking","Vital signs taken","Remind for next visit","No vitamin taken"
]

const pregnancyQuestions = [
  { id: "breastfeeding", q: "Did you have a baby less than six (6) months ago, are you fully or nearly fully breastfeeding, and have you had no menstrual period since then?" },
  { id: "abstained", q: "Have you abstained from sexual intercourse since your last menstrual period or delivery?" },
  { id: "recent_baby", q: "Have you had a baby in the last four (4) weeks?" },
  { id: "recent_period", q: "Did your last menstrual period start within the past seven (7) days?" },
  { id: "recent_abortion", q: "Have you had miscarriage or abortion in the last seven (7) days?" },
  { id: "using_contraceptive", q: "Have you been using a reliable contraceptive method consistently and correctly?" },
]

const parseBloodPressure = (bp: string | undefined) => {
  if (!bp) return { systolic: 0, diastolic: 0 }
  const [systolic, diastolic] = bp.split('/').map(Number)
  return { systolic: isNaN(systolic) ? 0 : systolic, diastolic: isNaN(diastolic) ? 0 : diastolic }
}

type Props = {
  onPrevious5: () => void
  onSubmitFinal: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  isSubmitting?: boolean
  mode?: "create" | "edit" | "view"
}

export default function FamilyPlanningForm6({ onPrevious5, onSubmitFinal, updateFormData, formData, mode = "create" }: Props) {
  const isReadOnly = mode === "view"
  const [records, setRecords] = useState(formData.serviceProvisionRecords || [])
  const [availableStock, setAvailableStock] = useState<number | null>(null)
  const [fetchingStock, setFetchingStock] = useState(false)
  const [commonFindings, setCommonFindings] = useState<string[]>(initialCommonFindings)
  const [selectedFindings, setSelectedFindings] = useState<string[]>([])
  const [sigRef, setSigRef] = useState<SignatureCanvas | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const getMethodFromPage1 = () => formData?.methodCurrentlyUsed || ""

  // ✅ New RHF instance just for one record
  const recordForm = useForm<ServiceProvisionRecord>({
    resolver: zodResolver(ServiceProvisionRecordSchema),
    defaultValues: {
      dateOfVisit: new Date().toISOString().split("T")[0],
      methodAccepted: getMethodFromPage1(),
      nameOfServiceProvider: "Joylyn M. Magullado",
      dateOfFollowUp: null,
      methodQuantity: "",
      serviceProviderSignature: "",
      medicalFindings: "",
      weight: formData?.weight || 0,
      bp_systolic: parseBloodPressure(formData?.bloodPressure).systolic,
      bp_diastolic: parseBloodPressure(formData?.bloodPressure).diastolic,
    },
    mode: "onChange",
  })

  const form = useForm<FormData>({
    resolver: zodResolver(page6Schema),
    defaultValues: {
      serviceProvisionRecords: formData?.serviceProvisionRecords || [],
      pregnancyCheck: formData?.pregnancyCheck || Object.fromEntries(pregnancyQuestions.map((q) => [q.id, false])),
    },
    mode: "onBlur",
  })

  const pregnancyCheckValues = form.watch("pregnancyCheck")

  useEffect(() => {
    const storedFindings = localStorage.getItem('commonMedicalFindings')
    if (storedFindings) setCommonFindings(JSON.parse(storedFindings))
  }, [])

  useEffect(() => {
    localStorage.setItem('commonMedicalFindings', JSON.stringify(commonFindings))
  }, [commonFindings])

  useEffect(() => {
    updateFormData({ pregnancyCheck: pregnancyCheckValues })
  }, [pregnancyCheckValues, updateFormData])

  useEffect(() => {
    const fetchCommodityStock = async () => {
      const selectedMethod = recordForm.getValues("methodAccepted")
      if (selectedMethod && selectedMethod !== "Others") {
        setFetchingStock(true)
        try {
          const encodedCommodityName = encodeURIComponent(selectedMethod)
          const response = await api2.get(`familyplanning/commodity-stock/${encodedCommodityName}/`)
          setAvailableStock(response.data.available_stock)
        } catch (error) {
          console.error("Error fetching commodity stock:", error)
          toast.error("Failed to fetch commodity stock.")
        } finally {
          setFetchingStock(false)
        }
      }
    }
    fetchCommodityStock()
  }, [recordForm.watch("methodAccepted")])

  useEffect(() => {
    updateFormData({ serviceProvisionRecords: records })
  }, [records, updateFormData])

  const toggleFinding = (finding: string) => {
    setSelectedFindings((prev) => prev.includes(finding) ? prev.filter(f => f !== finding) : [...prev, finding])
  }

  useEffect(() => {
    const concatenated = selectedFindings.map(f => `${f}.`).join(' ')
    recordForm.setValue("medicalFindings", concatenated, { shouldValidate: true })
  }, [selectedFindings])

  const saveSig = () => {
    if (sigRef) recordForm.setValue("serviceProviderSignature", sigRef.toDataURL(), { shouldValidate: true })
  }

  const addRecord = recordForm.handleSubmit((validatedData) => {
    if (availableStock !== null && Number(validatedData.methodQuantity) > availableStock) {
      toast.error(`Quantity cannot exceed available stock: ${availableStock}`)
      return
    }
    setRecords((prev) => [...prev, validatedData])
    recordForm.reset()
    setSelectedFindings([])
  })

  const removeRecord = (index: number) => {
    setRecords((prev) => prev.filter((_, i) => i !== index))
    updateFormData({ serviceProvisionRecords: records.filter((_, i) => i !== index) })
  }

  const onConfirmSubmit = form.handleSubmit(() => {
    updateFormData({ serviceProvisionRecords: records, pregnancyCheck: formData.pregnancyCheck })
    onSubmitFinal()
  })

  return (
    <Card>
      <CardHeader><CardTitle>Service Provision Record</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form>
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              <div className="flex flex-col space-y-1 mb-2">
                <Label>METHOD SELECTED</Label>
                <Select value={recordForm.watch("methodAccepted")} disabled>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>{methods.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                </Select>
              </div>

              <div>
                <Label>QUANTITY (pcs)</Label>
                <Input type="number" placeholder={fetchingStock ? "Loading..." : (availableStock !== null ? `Available: ${availableStock}` : "Enter quantity")}
                  {...recordForm.register("methodQuantity")}
                  disabled={isReadOnly || fetchingStock || availableStock === 0}
                />
                {recordForm.formState.errors.methodQuantity && <p className="text-red-600 text-sm">{recordForm.formState.errors.methodQuantity.message}</p>}
              </div>

              <div>
                <Label>FOLLOW-UP DATE</Label>
                <Input type="date" {...recordForm.register("dateOfFollowUp")} disabled={isReadOnly} />
                {recordForm.formState.errors.dateOfFollowUp && <p className="text-red-600 text-sm">{recordForm.formState.errors.dateOfFollowUp.message}</p>}
              </div>

              <div>
                <Label>SERVICE PROVIDER</Label>
                <Input type="text" {...recordForm.register("nameOfServiceProvider")} disabled={isReadOnly} />
                {recordForm.formState.errors.nameOfServiceProvider && <p className="text-red-600 text-sm">{recordForm.formState.errors.nameOfServiceProvider.message}</p>}
              </div>

              {['weight','bp_systolic','bp_diastolic'].map((field) => (
                <div key={field}>
                  <Label>{field.replace('_',' ').toUpperCase()}</Label>
                  <Input type="number" {...recordForm.register(field as keyof ServiceProvisionRecord)} disabled={isReadOnly} />
                  {recordForm.formState.errors[field as keyof ServiceProvisionRecord] && <p className="text-red-600 text-sm">{(recordForm.formState.errors[field as keyof ServiceProvisionRecord] as any)?.message}</p>}
                </div>
              ))}

              <div className="md:col-span-2">
                <Label>Medical Findings</Label>
                <Textarea {...recordForm.register("medicalFindings")} disabled={isReadOnly} />
                {recordForm.formState.errors.medicalFindings && <p className="text-red-600 text-sm">{recordForm.formState.errors.medicalFindings.message}</p>}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {commonFindings.map((finding) => (
                    <div key={finding} className="flex items-center space-x-2">
                      <Checkbox id={finding} checked={selectedFindings.includes(finding)} onCheckedChange={() => toggleFinding(finding)} />
                      <label htmlFor={finding}>{finding}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Signature</Label>
                <div className="border h-32 bg-white">
                  <SignatureCanvas ref={(ref) => setSigRef(ref)} canvasProps={{ className: "w-full h-full" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <Button size="sm" variant="outline" type="button" onClick={() => sigRef?.clear()} disabled={isReadOnly}>Clear</Button>
                  <Button size="sm" variant="secondary" type="button" onClick={saveSig} disabled={isReadOnly}>Save</Button>
                </div>
                {recordForm.formState.errors.serviceProviderSignature && <p className="text-red-600 text-sm">{recordForm.formState.errors.serviceProviderSignature.message}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button type="button" onClick={addRecord} disabled={!recordForm.formState.isValid || isReadOnly}>Add Record</Button>
            </div>

            <Table className="mt-6">
              <TableHeader>
                <TableRow>{["Visit","Vitals","Method","Qty","Findings","Provider","Signed","Follow-up","Action"].map((h) => (<TableHead key={h}>{h}</TableHead>))}</TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow><TableCell colSpan={9}>No records yet.</TableCell></TableRow>
                ) : records.map((r,i)=>(
                  <TableRow key={i}>
                    <TableCell>{r.dateOfVisit}</TableCell>
                    <TableCell>BP: {r.bp_systolic}/{r.bp_diastolic}<br/>Wt: {r.weight}</TableCell>
                    <TableCell>{r.methodAccepted}</TableCell>
                    <TableCell>{r.methodQuantity}</TableCell>
                    <TableCell>{r.medicalFindings || "-"}</TableCell>
                    <TableCell>{r.nameOfServiceProvider}</TableCell>
                    <TableCell>{r.serviceProviderSignature ? "Done" : "—"}</TableCell>
                    <TableCell>{r.dateOfFollowUp}</TableCell>
                    <TableCell><Button variant="destructive" size="sm" onClick={() => removeRecord(i)} disabled={isReadOnly}><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-8" />
            <h3 className="text-lg font-semibold mb-4">How to be Reasonably Sure a Client is Not Pregnant</h3>
            <div className="grid gap-4">
              {pregnancyQuestions.map(({id,q},i)=>(
                <FormField key={id} control={form.control} name={`pregnancyCheck.${id}` as any} render={({field})=>(
                  <FormItem>
                    <FormLabel>{`${i+1}. ${q}`}</FormLabel>
                    <FormControl>
                      <RadioGroup value={field.value ? "yes" : "no"} onValueChange={(val)=>field.onChange(val==="yes")} className="flex gap-6" disabled={isReadOnly}>
                        {['yes','no'].map(opt=>(
                          <div key={opt} className="flex items-center gap-2">
                            <RadioGroupItem value={opt} id={`${id}-${opt}`} disabled={isReadOnly}/>
                            <Label htmlFor={`${id}-${opt}`}>{opt.toUpperCase()}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )} />
              ))}
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <Button type="button" variant="outline" onClick={onPrevious5} disabled={isReadOnly}>Previous</Button>
              <Button type="button" onClick={() => setIsConfirmOpen(true)} disabled={isReadOnly}>Submit</Button>
            </div>

            <ConfirmationDialog isOpen={isConfirmOpen} onOpenChange={setIsConfirmOpen} onConfirm={onConfirmSubmit} title="Confirm Submission" description="Are you sure you want to submit all data? This action cannot be undone." />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
