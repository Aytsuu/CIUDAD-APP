"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { FormData, ServiceProvisionRecord } from "@/form-schema/FamilyPlanningSchema"

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

  // Update formData when records change
  useEffect(() => {
    updateFormData({
      serviceProvisionRecords: records,
    })
  }, [records, updateFormData])

  const handleInputChange = (name: keyof ServiceProvisionRecord, value: string) => {
    setRecord((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof ServiceProvisionRecord) => (value: string) => {
    setRecord((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setFollowUpDate(date)
    if (date) {
      setRecord((prev) => ({ ...prev, dateOfFollowUp: format(date, "yyyy-MM-dd") }))
    }
  }

  const handleAdd = () => {
    if (!record.dateOfVisit || !record.methodAccepted || !record.nameOfServiceProvider || !record.dateOfFollowUp) {
      alert("Please fill in all required fields")
      return
    }

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
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Service Provision Record</CardTitle>
        <CardDescription>Record details of family planning services provided</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="methodAccepted">Method Accepted</Label>
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
            <Label htmlFor="dateOfFollowUp">Date of Follow-up Visit</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !followUpDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {followUpDate ? format(followUpDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={followUpDate} onSelect={handleDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nameOfServiceProvider">Name of Service Provider</Label>
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
          <Button onClick={handleAdd} className="bg-primary">
            Add Record
          </Button>
        </div>

        <div className="mt-8">
          <Table>
            {/* <TableCaption>List of service provision records</TableCaption> */}
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                records.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.dateOfVisit}</TableCell>
                    <TableCell>{item.methodAccepted}</TableCell>
                    <TableCell>{item.methodQuantity} {item.methodUnit} </TableCell>
                    <TableCell>{item.medicalFindings || "-"}</TableCell>
                    <TableCell>{item.nameOfServiceProvider}</TableCell>
                    <TableCell>{item.dateOfFollowUp}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end mt-6 space-x-4">
        <Button variant="outline" onClick={onPrevious5}>
          Previous
        </Button>
        <Button
          onClick={() => {
            // Save current records before final submission
            updateFormData({
              serviceProvisionRecords: records,
            })
            onSubmitFinal()
          }}
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}

export default FamilyPlanningForm6;

