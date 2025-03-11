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
  })

  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined)
  const [validationError, setValidationError] = useState<string | null>(null)

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

  // Remove or comment out this function since we're not using it anymore
  // const handleDateChange = (date: Date | undefined) => {
  //   setFollowUpDate(date)
  //   if (date) {
  //     setRecord((prev) => ({ ...prev, dateOfFollowUp: format(date, "yyyy-MM-dd") }))
  //     setValidationError(null)
  //   }
  // }

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
      })
      setFollowUpDate(undefined)
      setValidationError(null)
    }
  }

  const handleSubmit = (data: FormData) => {
    // Save current records before final submission
    updateFormData({
      serviceProvisionRecords: records,
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
                  <Select value={record.methodUnit || "box/pcs"} onValueChange={handleSelectChange("methodUnit")}>
                    <SelectTrigger className="w-[110px] rounded-l-none">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="box/pcs">box/pcs</SelectItem>
                      <SelectItem value="cycles">cycles</SelectItem>
                      <SelectItem value="vials">vials</SelectItem>
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

              <div className="space-y-2 md:col-span-2">
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
                    <TableHead>Method Accepted</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Medical Findings</TableHead>
                    <TableHead>Service Provider</TableHead>
                    <TableHead>Follow-up Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.dateOfVisit}</TableCell>
                        <TableCell>{item.methodAccepted}</TableCell>
                        <TableCell>
                          {item.methodQuantity} {item.methodUnit}{" "}
                        </TableCell>
                        <TableCell>{item.medicalFindings || "-"}</TableCell>
                        <TableCell>{item.nameOfServiceProvider}</TableCell>
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
                                  // If valid, save data and proceed
                                  const currentValues = form.getValues()
                                  updateFormData(currentValues)
                                  onSubmitFinal()
                                 
                              }}
                            >
                              Submit
                            </Button>
              
              
              
              {/* <Button type="submit">Submit</Button> */}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FamilyPlanningForm6

