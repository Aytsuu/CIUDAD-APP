"use client"

import { useEffect, useMemo, useState } from "react"
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

import { usePregnancyDetails } from "./queries/maternalFetchQueries"
import { Skeleton } from "@/components/ui/skeleton"

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
    add_sitio?: string
  }
  pat_type: string
  patrec_type?: string
}

interface MaternalRecord {
  id: string
  pregnancyId: string
  dateCreated: string
  address: string
  sitio: string
  type: "Transient" | "Resident"
  recordType: "Prenatal" | "Postpartum Care"
  status: "Active" | "Completed" | "Pregnancy Loss"
  gestationalWeek?: number
  expectedDueDate?: string
  deliveryDate?: string
  notes?: string
}

interface PregnancyGroup {
  pregnancyId: string
  status: "Active" | "Completed" | "Pregnancy Loss"
  startDate: string
  expectedDueDate?: string
  deliveryDate?: string
  records: MaternalRecord[]
  hasPrenatal: boolean
  hasPostpartum: boolean
}

interface PregnancyDataDetails{
  pregnancy_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  prenatal_end_date?: string;
  postpartum_end_date?: string;
  pat_id: string;
  prenatal_form?: {
    pf_id: string;
    pf_lmp: string;
    pf_edc: string;
    created_at: string;
  }[]
  postpartum_record?: {
    ppr_id:string;
    delivery_date: string | "N/A";
    created_at: string;
    updated_at: string;
  }[]
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

  const { data: pregnancyData, isLoading: pregnancyDataLoading } = usePregnancyDetails(selectedPatient?.pat_id || "")

  function calculateGestationalWeek(lmp: string, visitDate: string): number {
    const lmpDate = new Date(lmp);
    const visit = new Date(visitDate);

    if (isNaN(lmpDate.getTime()) || isNaN(visit.getTime())) {
      return 0; 
    }

    const diffTime = Math.abs(visit.getTime() - lmpDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  const groupPregnancies = (
    pregnancies: PregnancyDataDetails[],
    patientType: string,
    patientAddress: Patient["address"] | undefined,
  ): PregnancyGroup[] => {
    const grouped: Record<string, PregnancyGroup> = {}

    if(!pregnancies) return []

    pregnancies.forEach((pregnancy) => {
      if(!grouped[pregnancy.pregnancy_id]) {
        grouped[pregnancy.pregnancy_id] = {
          pregnancyId: pregnancy.pregnancy_id,
          status: pregnancy.status as "Active" | "Completed" | "Pregnancy Loss",
          startDate: pregnancy.created_at.split("T")[0],
          expectedDueDate: pregnancy.prenatal_form?.[0]?.pf_edc || undefined,
          deliveryDate: pregnancy.postpartum_record?.[0]?.delivery_date || undefined,
          records: [],
          hasPrenatal: false,
          hasPostpartum: false,
        }
      }

      const currPregnancyGroup =  grouped[pregnancy.pregnancy_id]

      pregnancy.prenatal_form?.forEach((pf) => {
        const addressParts = [
          patientAddress?.add_street,
          patientAddress?.add_barangay,
          patientAddress?.add_city,
          patientAddress?.add_province
        ].filter(Boolean);

        currPregnancyGroup.records.push({
          id: pf.pf_id,
          pregnancyId: pregnancy.pregnancy_id,
          dateCreated: pf.created_at.split("T")[0],
          address: addressParts.length > 0 ? addressParts.join(", ") : "N/A",
          sitio: patientAddress?.add_external_sitio || patientAddress?.add_sitio || "N/A",
          type: patientType as "Transient" | "Resident",
          recordType: "Prenatal",
          status: pregnancy.status as "Active" | "Completed" | "Pregnancy Loss",
          gestationalWeek: calculateGestationalWeek(pf.pf_lmp, pf.created_at.split("T")[0]),
          expectedDueDate: pf.pf_edc,
          notes: `Prenatal visit on ${pf.created_at.split("T")[0]}`,
        })
        currPregnancyGroup.hasPrenatal = true
        if(pf.pf_edc && !currPregnancyGroup.expectedDueDate) {
          currPregnancyGroup.expectedDueDate = pf.pf_edc
        }
      })

      pregnancy.postpartum_record?.forEach((ppr) => {
        const addressParts = [
          patientAddress?.add_street,
          patientAddress?.add_barangay,
          patientAddress?.add_city,
          patientAddress?.add_province
        ].filter(Boolean);

        currPregnancyGroup.records.push({
          id: ppr.ppr_id,
          pregnancyId: pregnancy.pregnancy_id,
          dateCreated: ppr.created_at.split("T")[0],
          address: addressParts.length > 0 ? addressParts.join(", ") : "N/A",
          sitio: patientAddress?.add_sitio || "N/A",
          type: patientType as "Transient" | "Resident",
          recordType: "Postpartum Care",
          status: pregnancy.status as "Active" | "Completed" | "Pregnancy Loss",
          deliveryDate: ppr.delivery_date,
          notes: `Postpartum care on ${ppr.created_at.split("T")[0]}`,
        })
        currPregnancyGroup.hasPostpartum = true
        // Update deliveryDate for the pregnancy group from postpartum record if available
        if (ppr.delivery_date && !currPregnancyGroup.deliveryDate) {
          currPregnancyGroup.deliveryDate = ppr.delivery_date
        }
      })

      currPregnancyGroup.records.sort(
        (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
      )
      
      if(currPregnancyGroup.records.length > 0) {
        currPregnancyGroup.startDate = currPregnancyGroup.records[0].dateCreated
      }
    })
    return Object.values(grouped).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  // using memo for grouped pregnancies
  const pregnancyGroups: PregnancyGroup[] = useMemo(() => {
    if (pregnancyData && selectedPatient) {
      return groupPregnancies(
        pregnancyData,
        selectedPatient.pat_type,
        selectedPatient.address,
      )
    }
    return []
  }, [pregnancyData, selectedPatient])

  const filter = [
    { id: "All", name: "All" },
    { id: "Active", name: "Active" },
    { id: "Completed", name: "Completed" },
  ]
  const [selectedFilter, setSelectedFilter] = useState(filter[0].name)


  const filteredGroups = pregnancyGroups.filter((group) => {
    switch (selectedFilter) {
      case "All":
        return true
      case "Active":
        return group.status === "Active"
      case "Completed":
        return group.status === "Completed"
      default:
        return true
    }
  })


  const getStatusBadge = (status: "Active" | "Completed" | "Pregnancy Loss") => {
    if (status === "Active") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    } else if (status === "Completed") {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )
    } else if (status === "Pregnancy Loss") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {/* You can use a suitable icon here */}
          <Heart className="w-3 h-3 mr-1" />
          Pregnancy Loss
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        Unknown
      </Badge>
    )
  }


  const getRecordTypeBadge = (recordType: "Prenatal" | "Postpartum Care") => {
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

  
  const handleCompletePregnancy = (pregnancyId: string) => {
    console.log(`Pregnancy ${pregnancyId} marked as completed`)
  }

  if(pregnancyDataLoading) {
    return (
      <LayoutWithBack title="Maternal Records" description="Manage mother's individual record">
        <div className="mb-5">
          <PatientInfoCardv2 patient={selectedPatient} />
        </div>
        <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
        </div>
      </LayoutWithBack>
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
                  <Link to="/prenatalform" state={{ params : {pregnancyData: selectedPatient, pregnancyId: null}}}>Prenatal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/postpartumform" state={{ params : {pregnancyData: selectedPatient, pregnancyId: null}}}>Postpartum</Link>
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
