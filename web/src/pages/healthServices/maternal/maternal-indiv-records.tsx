"use client"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Search, Calendar, Heart, Baby, Clock, CheckCircle } from "lucide-react"
import { FileInput } from "lucide-react"

import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { SelectLayout } from "@/components/ui/select/select-layout"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { TooltipProvider } from "@/components/ui/tooltip"

import { PatientInfoCardv2 } from "@/pages/healthServices/maternal/maternal-components/patient-info-card-v2"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"

interface Patient {
  pat_id: string
  patients: {
    firstName: string
    lastName: string
    middleName: string
    sex: string
    dateOfBirth?: string
    age: number
    ageTime: string
  }
  address?: {
    add_street?: string
    add_barangay?: string
    add_city?: string
    add_province?: string
    add_external_sitio?: string
  }
  sitio?: string
  pat_type: string
  patrec_type?: string
}

interface MaternalRecord {
  id: number
  pregnancyId: string
  dateCreated: string
  address: string
  sitio: "Logarta" | "Bolinawan"
  type: "Transient" | "Resident"
  recordType: "Prenatal" | "Postpartum"
  status: "Active" | "Completed"
  gestationalWeek?: number
  expectedDueDate?: string
  deliveryDate?: string
  notes?: string
}

interface PregnancyGroup {
  pregnancyId: string
  status: "Active" | "Completed"
  startDate: string
  expectedDueDate?: string
  deliveryDate?: string
  records: MaternalRecord[]
  hasPrenatal: boolean
  hasPostpartum: boolean
}

export default function MaternalIndivRecords() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const location = useLocation()

  useEffect(() => {
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData
      setSelectedPatient(patientData)
    }
  }, [location.state])

  // Sample data with pregnancy grouping
  const sampleData: MaternalRecord[] = [
    {
      id: 1,
      pregnancyId: "PREG-2024-001",
      dateCreated: "2024-01-15",
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Resident",
      recordType: "Prenatal",
      status: "Active",
      gestationalWeek: 28,
      expectedDueDate: "2024-08-15",
      notes: "Regular checkup, normal progress",
    },
    {
      id: 2,
      pregnancyId: "PREG-2024-001",
      dateCreated: "2024-02-20",
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Resident",
      recordType: "Prenatal",
      status: "Active",
      gestationalWeek: 32,
      expectedDueDate: "2024-08-15",
      notes: "Follow-up visit, baby developing well",
    },
    {
      id: 3,
      pregnancyId: "PREG-2023-002",
      dateCreated: "2023-06-10",
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Resident",
      recordType: "Prenatal",
      status: "Completed",
      gestationalWeek: 40,
      expectedDueDate: "2023-09-10",
      notes: "Full term pregnancy",
    },
    {
      id: 4,
      pregnancyId: "PREG-2023-002",
      dateCreated: "2023-09-12",
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Resident",
      recordType: "Postpartum",
      status: "Completed",
      deliveryDate: "2023-09-10",
      notes: "Normal delivery, healthy baby",
    },
    {
      id: 5,
      pregnancyId: "PREG-2022-003",
      dateCreated: "2022-03-15",
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Logarta",
      type: "Resident",
      recordType: "Postpartum",
      status: "Completed",
      deliveryDate: "2022-03-10",
      notes: "Postpartum care completed",
    },
  ]

  // Group records by pregnancy ID
  const groupRecordsByPregnancy = (records: MaternalRecord[]): PregnancyGroup[] => {
    const grouped = records.reduce(
      (acc, record) => {
        if (!acc[record.pregnancyId]) {
          acc[record.pregnancyId] = {
            pregnancyId: record.pregnancyId,
            status: record.status,
            startDate: record.dateCreated,
            expectedDueDate: record.expectedDueDate,
            deliveryDate: record.deliveryDate,
            records: [],
            hasPrenatal: false,
            hasPostpartum: false,
          }
        }

        acc[record.pregnancyId].records.push(record)

        // Update pregnancy info
        if (record.recordType === "Prenatal") {
          acc[record.pregnancyId].hasPrenatal = true
          if (record.expectedDueDate) {
            acc[record.pregnancyId].expectedDueDate = record.expectedDueDate
          }
        }

        if (record.recordType === "Postpartum") {
          acc[record.pregnancyId].hasPostpartum = true
          if (record.deliveryDate) {
            acc[record.pregnancyId].deliveryDate = record.deliveryDate
          }
        }

        // Update start date to earliest record
        if (new Date(record.dateCreated) < new Date(acc[record.pregnancyId].startDate)) {
          acc[record.pregnancyId].startDate = record.dateCreated
        }

        return acc
      },
      {} as Record<string, PregnancyGroup>,
    )

    return Object.values(grouped).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  const filter = [
    { id: "All", name: "All" },
    { id: "Active", name: "Active" },
    { id: "Completed", name: "Completed" },
    { id: "Prenatal", name: "Prenatal Only" },
    { id: "Postpartum", name: "Postpartum Only" },
  ]
  const [selectedFilter, setSelectedFilter] = useState(filter[0].name)

  const pregnancyGroups = groupRecordsByPregnancy(sampleData)

  const filteredGroups = pregnancyGroups.filter((group) => {
    switch (selectedFilter) {
      case "All":
        return true
      case "Active":
        return group.status === "Active"
      case "Completed":
        return group.status === "Completed"
      case "Prenatal":
        return group.hasPrenatal && !group.hasPostpartum
      case "Postpartum":
        return group.hasPostpartum && !group.hasPrenatal
      default:
        return true
    }
  })

  const getStatusBadge = (status: "Active" | "Completed") => {
    return status === "Active" ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Clock className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    )
  }

  const getRecordTypeBadge = (recordType: "Prenatal" | "Postpartum") => {
    return recordType === "Prenatal" ? (
      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
        <Heart className="w-3 h-3 mr-1" />
        Prenatal
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Baby className="w-3 h-3 mr-1" />
        Postpartum
      </Badge>
    )
  }

  return (
    <LayoutWithBack title="Maternal Records" description="Manage mother's individual record">
      <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
        {selectedPatient ? (
          <div className="mb-5">
            <PatientInfoCardv2 patient={selectedPatient} />
          </div>
        ) : (
          <div className="mb-5 rounded">
            <p className="text-center text-gray-500">No patient selected</p>
          </div>
        )}

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          {/* Search Input and Filter Dropdown */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex w-full gap-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                <Input placeholder="Search..." className="pl-10 w-full bg-white" />
              </div>
              <SelectLayout
                className="w-full md:w-[200px] bg-white"
                label=""
                placeholder="Select"
                options={filter}
                value={selectedFilter}
                onChange={setSelectedFilter}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">Add Record</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link to="/prenatalform">Prenatal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/postpartumform">Postpartum</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Accordion Container */}
        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0 rounded-t-md">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Showing {filteredGroups.length} pregnancies</p>
            </div>
            {/* <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileInput />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
          </div>

          <div className="bg-white w-full rounded-b-md">
            {filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No pregnancy records found</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full p-4">
                {filteredGroups.map((pregnancy) => (
                  <AccordionItem
                    key={pregnancy.pregnancyId}
                    value={pregnancy.pregnancyId}
                    className="border rounded-lg mb-4"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{pregnancy.pregnancyId}</h3>
                              {getStatusBadge(pregnancy.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Started: {new Date(pregnancy.startDate).toLocaleDateString()}
                              </span>
                              {pregnancy.expectedDueDate && (
                                <span>Due: {new Date(pregnancy.expectedDueDate).toLocaleDateString()}</span>
                              )}
                              {pregnancy.deliveryDate && (
                                <span>Delivered: {new Date(pregnancy.deliveryDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pregnancy.hasPrenatal && getRecordTypeBadge("Prenatal")}
                          {pregnancy.hasPostpartum && getRecordTypeBadge("Postpartum")}
                          <span className="text-sm text-gray-500">({pregnancy.records.length} records)</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <TooltipProvider>
                        <div className="space-y-3">
                          {pregnancy.records.map((record, index) => (
                            <Card key={record.id} className="border-l-4 border-l-blue-200">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm font-medium">Record #{record.id}</CardTitle>
                                    {getRecordTypeBadge(record.recordType)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                      {new Date(record.dateCreated).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-1">
                                      <TooltipLayout
                                        trigger={
                                          <Button variant="outline" size="sm" className="h-8 px-2">
                                            <Link
                                              to={
                                                record.recordType === "Prenatal"
                                                  ? "/prenatalindividualhistory"
                                                  : "/postpartumindividualhistory"
                                              }
                                              state={{ params: { patientData: selectedPatient, recordId: record.id } }}
                                            >
                                              View
                                            </Link>
                                          </Button>
                                        }
                                        content="View detailed history"
                                      />
                                      <TooltipLayout
                                        trigger={
                                          <Button variant="default" size="sm" className="h-8 px-2">
                                            <Link
                                              to=""
                                              state={{ params: { patientData: selectedPatient, recordId: record.id } }}
                                            >
                                              Update
                                            </Link>
                                          </Button>
                                        }
                                        content="Update record"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">
                                      <strong>Address:</strong> {record.address}
                                    </p>
                                    <p className="text-gray-600">
                                      <strong>Sitio:</strong> {record.sitio}
                                    </p>
                                    <p className="text-gray-600">
                                      <strong>Type:</strong> {record.type}
                                    </p>
                                  </div>
                                  <div>
                                    {record.gestationalWeek && (
                                      <p className="text-gray-600">
                                        <strong>Gestational Week:</strong> {record.gestationalWeek}
                                      </p>
                                    )}
                                    {record.notes && (
                                      <p className="text-gray-600">
                                        <strong>Notes:</strong> {record.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TooltipProvider>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  )
}
