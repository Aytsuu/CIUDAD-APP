"use client"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Search, Heart, Baby, Clock, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { SelectLayout } from "@/components/ui/select/select-layout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { PatientInfoCardv2 } from "@/pages/healthServices/maternal/maternal-components/patient-info-card-v2"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { PregnancyAccordion } from "../maternal/maternal-components/maternal-records-accordion"

interface Patient {
  pat_id: string
  age: number
  personal_info: {
    per_fname: string;
    per_lname: string;
    per_mname: string;
    per_sex: string;
    per_dob?: string
    ageTime?: "yrs"
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
  sitio: string
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
      const ageTimeCheck = patientData.personal_info.ageTime
      console.log("Age Time: ", ageTimeCheck)

      console.log("Selected patient data:", patientData)
    }
  }, [location.state])

  // Sample data with pregnancy grouping
  const [sampleData, setSampleData] = useState<MaternalRecord[]>([
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
  ])

  // group records by pregnancy ID
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

  // Handle completing a pregnancy
  const handleCompletePregnancy = (pregnancyId: string) => {
    setSampleData((prevData) =>
      prevData.map((record) =>
        record.pregnancyId === pregnancyId ? { ...record, status: "Completed" as const } : record,
      ),
    )

    // Here you would typically make an API call to update the pregnancy status
    console.log(`Pregnancy ${pregnancyId} marked as completed`)

    // You could also show a success message or notification here
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
          </div>

          <div className="bg-white w-full rounded-b-md">
            {filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No pregnancy records found</p>
              </div>
            ) : (
              <PregnancyAccordion
                pregnancyGroups={filteredGroups}
                selectedPatient={selectedPatient}
                getStatusBadge={getStatusBadge}
                getRecordTypeBadge={getRecordTypeBadge}
                onCompletePregnancy={handleCompletePregnancy}
              />
            )}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  )
}
