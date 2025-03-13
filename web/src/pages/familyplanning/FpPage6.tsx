"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import type { FormData, ServiceProvisionRecord } from "@/form-schema/FamilyPlanningSchema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { page6Schema } from "@/form-schema/FamilyPlanningSchema"
import { Form } from "@/components/ui/form"
import SignatureCanvas from "react-signature-canvas"

// Fix the props type
interface ServiceProvisionFormProps {
  onPrevious5: () => void
  onSubmitFinal: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
}

const FamilyPlanningForm6: React.FC<ServiceProvisionFormProps> = ({
  onPrevious5,
  onSubmitFinal,
  updateFormData,
  formData,
}) => {
  // Use the ServiceProvisionRecord type from the schema
  const [records, setRecords] = useState<ServiceProvisionRecord[]>(
    formData && formData.serviceProvisionRecords ? formData.serviceProvisionRecords : [],
  )

  const form = useForm<FormData>({
    resolver: zodResolver(page6Schema),
    defaultValues: {
      serviceProvisionRecords: formData?.serviceProvisionRecords || [],
    },
    mode: "onBlur",
  })

  const [record, setRecord] = useState<ServiceProvisionRecord>({
    dateOfVisit: new Date().toISOString().split("T")[0],
    methodAccepted: "",
    nameOfServiceProvider: "",
    dateOfFollowUp: "",
    methodQuantity: "",
    methodUnit: "box/pcs",
    serviceProviderSignature: "",
    medicalFindings: "",
    weight: 0,
    bp_systolic: 0,
    bp_diastolic: 0,
  })

  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [serviceProviderSignatureRef, setServiceProviderSignatureRef] = useState<SignatureCanvas | null>(null)

  // Update formData when records change
  useEffect(() => {
    updateFormData({
      serviceProvisionRecords: records,
    })
  }, [records, updateFormData])

  const handleInputChange = (name: keyof ServiceProvisionRecord, value: string) => {
    setRecord((prev) => ({ ...prev, [name]: value }))
    setValidationError(null)
  }

  const handleSelectChange = (name: keyof ServiceProvisionRecord) => (value: string) => {
    setRecord((prev) => ({ ...prev, [name]: value }))
    setValidationError(null)
  }

  const clearSignature = () => {
    if (serviceProviderSignatureRef) {
      serviceProviderSignatureRef.clear()
      setRecord((prev) => ({ ...prev, serviceProviderSignature: "" }))
    }
  }

  const saveSignature = () => {
    if (serviceProviderSignatureRef) {
      const signatureData = serviceProviderSignatureRef.toDataURL()
      setRecord((prev) => ({ ...prev, serviceProviderSignature: signatureData }))
    }
  }

  const validateRecord = (): boolean => {
    if (!record.dateOfVisit) {
      setValidationError("Date of visit is required")
      return false
    }
    if (!record.methodAccepted) {
      setValidationError("Method is required")
      return false
    }
    if (!record.nameOfServiceProvider) {
      setValidationError("Service provider name is required")
      return false
    }
    if (!record.dateOfFollowUp) {
      setValidationError("Follow-up date is required")
      return false
    }
    if (!record.methodQuantity) {
      setValidationError("Quantity is required")
      return false
    }
    return true
  }

  const handleAdd = () => {
    if (validateRecord()) {
      setRecords((prev) => [...prev, record])

      // Reset the form after adding
      setRecord({
        dateOfVisit: new Date().toISOString().split("T")[0],
        methodAccepted: "",
        nameOfServiceProvider: "",
        dateOfFollowUp: "",
        methodQuantity: "",
        methodUnit: "box/pcs",
        serviceProviderSignature: "",
        medicalFindings: "",
        weight: 0,
        bp_systolic: 0,
        bp_diastolic: 0,
      })
      setFollowUpDate(undefined)
      setValidationError(null)
    }
  }

  // Function to add the current record if it's valid
  const addCurrentRecordIfValid = (): boolean => {
    if (validateRecord()) {
      // Only add if there's actual data in the record
      if (record.methodAccepted && record.nameOfServiceProvider) {
        setRecords((prev) => [...prev, record])
        return true
      }
    }
    return false
  }

  const handleSubmit = (data: FormData) => {
    // Try to add the current record if it's valid and not empty
    const recordAdded = addCurrentRecordIfValid()

    // Use the updated records (including the one just added if applicable)
    const updatedRecords = recordAdded ? [...records, record] : records

    // Save current records before final submission
    updateFormData({
      serviceProvisionRecords: updatedRecords,
    })

    // Log the final data being submitted
    console.log("Final form data:", {
      ...data,
      serviceProvisionRecords: updatedRecords,
    })

    onSubmitFinal()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Service Provision Record</CardTitle>
        <CardDescription>Record details of family planning services provided</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {validationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{validationError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="methodAccepted">
                  Method Accepted<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select value={record.methodAccepted} onValueChange={handleSelectChange("methodAccepted")}>
                  <SelectTrigger id="methodAccepted">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "COC",
                      "POP",
                      "Injectable",
                      "Implant",
                      "IUD",
                      "Interval",
                      "Post Partum",
                      "Condom",
                      "BOM/CMM",
                      "BBT",
                      "STM",
                      "SDM",
                      "LAM",
                      "Others",
                    ].map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodQuantity">Quantity</Label>
                <div className="flex">
                  <Input
                    id="methodQuantity"
                    value={record.methodQuantity || ""}
                    onChange={(e) => handleInputChange("methodQuantity", e.target.value)}
                    placeholder="Enter qty"
                    className="rounded-r-none"
                  />
                  <Select value={record.methodUnit || ""} onValueChange={handleSelectChange("methodUnit")}>
                    <SelectTrigger className="w-[110px] rounded-l-none">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="box">box</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                     
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfFollowUp">
                  Date of Follow-up Visit<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="dateOfFollowUp"
                  type="date"
                  value={record.dateOfFollowUp}
                  onChange={(e) => handleInputChange("dateOfFollowUp", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="nameOfServiceProvider">
                  Name of Service Provider<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="nameOfServiceProvider"
                  value={record.nameOfServiceProvider}
                  onChange={(e) => handleInputChange("nameOfServiceProvider", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="serviceProviderSignature">Service Provider Signature</Label>
                <div className="border border-gray-300 rounded p-2 h-32 bg-white">
                  <SignatureCanvas
                    ref={(ref) => setServiceProviderSignatureRef(ref)}
                    canvasProps={{
                      className: "w-full h-full",
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                    Clear
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={saveSignature}>
                    Save Signature
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  defaultValue={20}
                  value={record.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bpsystolic">
                  Blood pressure (Systolic)
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="bpsystolic"
                  type="number"
                  placeholder="Systolic"
                  className="w-50"
                  value={record.bp_systolic}
                  onChange={(e) => handleInputChange("bp_systolic", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bpdiastolic">
                  Blood pressure (Diastolic)
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="bpdiastolic"
                  type="number"
                  placeholder="Systolic"
                  className="w-50"
                  value={record.bp_diastolic}
                  onChange={(e) => handleInputChange("bp_diastolic", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="medicalFindings">Medical Findings</Label>
                <Textarea
                  id="medicalFindings"
                  value={record.medicalFindings || ""}
                  onChange={(e) => handleInputChange("medicalFindings", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleAdd} className="bg-primary">
                Add Record
              </Button>
            </div>

            <div className="mt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date of Visit</TableHead>
                    <TableHead>Vital Signs</TableHead>
                    <TableHead>Method Accepted</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Medical Findings</TableHead>
                    <TableHead>Service Provider</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Follow-up Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No records found. Fill out the form above and click "Add Record" to add a record.
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.dateOfVisit}</TableCell>
                        <TableCell>
                          <i>BP:</i> {item.bp_systolic} / {item.bp_diastolic}
                          <br></br>
                          <i>Weight:</i> {item.weight}{" "}
                        </TableCell>
                        <TableCell>{item.methodAccepted}</TableCell>
                        <TableCell>
                          {item.methodQuantity} {item.methodUnit}{" "}
                        </TableCell>
                        <TableCell>{item.medicalFindings || "-"}</TableCell>
                        <TableCell>{item.nameOfServiceProvider}</TableCell>
                        <TableCell>{item.serviceProviderSignature ? "Signed" : "Not signed"}</TableCell>
                        <TableCell>{item.dateOfFollowUp}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline" type="button" onClick={onPrevious5}>
                Previous
              </Button>

              <Button
                type="submit"
                onClick={async () => {
                  // If the current record is valid, add it to the records array
                  const recordAdded = addCurrentRecordIfValid()

                  // Get the updated records (including the one just added if applicable)
                  const updatedRecords = recordAdded ? [...records, record] : records

                  // Update form data with the latest records
                  updateFormData({
                    serviceProvisionRecords: updatedRecords,
                  })

                  // Log the data being submitted
                  console.log("Submitting data:", {
                    serviceProvisionRecords: updatedRecords,
                  })

                  onSubmitFinal()
                }}
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FamilyPlanningForm6

