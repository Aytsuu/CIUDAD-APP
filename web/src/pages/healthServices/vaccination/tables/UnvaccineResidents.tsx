"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { calculateAge, getAgeInUnit } from "@/helpers/ageCalculator"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { useUnvaccinatedResidents } from "../restful-api/fetch"
import type { Resident, UnvaccinatedResident, VaccineCounts, GroupedResidents } from "./columns/types"
import { Dialog, DialogTrigger } from "@/components/ui/dialog/dialog"
import ResidentListDialog from "./ResidentListDialog"

export default function UnvaccinatedResidents() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: unvaccinated, isLoading } = useUnvaccinatedResidents()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentDialogTitle, setCurrentDialogTitle] = useState("")
  const [currentDialogResidents, setCurrentDialogResidents] = useState<UnvaccinatedResident[]>([])

  // Get all vaccine names from the API response, including those with no residents
  const allVaccineNames = React.useMemo(() => {
    if (!unvaccinated || typeof unvaccinated !== "object") return []
    return Object.keys(unvaccinated)
  }, [unvaccinated])

  const vaccineCounts: VaccineCounts = React.useMemo(() => {
    if (!unvaccinated || typeof unvaccinated !== "object") return {}
    const counts: VaccineCounts = {}
    Object.entries(unvaccinated).forEach(([vaccine_name, residents]) => {
      if (Array.isArray(residents)) {
        counts[vaccine_name] = residents.length
      } else {
        counts[vaccine_name] = 0 // Handle cases where there are no residents
      }
    })
    return counts
  }, [unvaccinated])

  // Flatten and format all residents, adding age_group_name, min_age, max_age, time_unit for later grouping
  const allResidents: UnvaccinatedResident[] = React.useMemo(() => {
    if (!unvaccinated || typeof unvaccinated !== "object") return []
    return Object.entries(unvaccinated).flatMap(([vaccine_name, residents]) =>
      Array.isArray(residents) && residents.length > 0
        ? residents.map((resident: Resident) => ({
            vaccine_name: resident.vaccine_not_received?.vac_name || vaccine_name,
            pat_id: resident.pat_id?.toString() || "N/A",
            fname: resident.personal_info?.per_fname || "N/A",
            lname: resident.personal_info?.per_lname || "N/A",
            mname: resident.personal_info?.per_mname || null,
            sex: resident.personal_info?.per_sex || "N/A",
            dob: resident.personal_info?.per_dob || "N/A",
            age: resident.personal_info?.per_dob ? calculateAge(resident.personal_info.per_dob).toString() : "N/A",
            sitio: resident.personal_info?.per_addresses?.[0]?.sitio || "N/A",
            address: [
              resident.personal_info?.per_addresses?.[0]?.add_street,
              resident.personal_info?.per_addresses?.[0]?.sitio,
              resident.personal_info?.per_addresses?.[0]?.add_barangay,
              resident.personal_info?.per_addresses?.[0]?.add_city,
              resident.personal_info?.per_addresses?.[0]?.add_province,
            ]
              .filter(Boolean)
              .join(", "),
            pat_type: "Resident",
            age_group_name: resident.vaccine_not_received?.age_group?.agegroup_name || "Unknown Age Group",
            min_age: resident.vaccine_not_received?.age_group?.min_age || 0,
            max_age: resident.vaccine_not_received?.age_group?.max_age || 0,
            time_unit: resident.vaccine_not_received?.age_group?.time_unit || "NA",
          }))
        : [],
    )
  }, [unvaccinated])

  // Filter residents based on search query
  const filteredResidents = React.useMemo(() => {
    return allResidents.filter((record) => {
      const searchText =
        `${record.pat_id} ${record.lname} ${record.fname} ${record.sitio} ${record.vaccine_name} ${record.age_group_name}`.toLowerCase()
      return searchText.includes(searchQuery.toLowerCase())
    })
  }, [searchQuery, allResidents])

  // Group filtered residents by vaccine name and then by age group name,
  // applying age range filtering at this stage.
  const groupedData: GroupedResidents = React.useMemo(() => {
    const groups: GroupedResidents = {}
    
    // Initialize all vaccines, even those with no residents
    allVaccineNames.forEach(vaccineName => {
      groups[vaccineName] = {}
    })
    
    filteredResidents.forEach((resident) => {
      const vaccineName = resident.vaccine_name
      const ageGroupName = resident.age_group_name
      const groupMinAge = resident.min_age
      const groupMaxAge = resident.max_age
      const groupTimeUnit = resident.time_unit

      let shouldIncludeResidentInGroup = true

      // Only apply age filtering if time_unit is not "NA" and DOB is available
      if (resident.dob && groupTimeUnit !== "NA") {
        const residentAgeInUnit = getAgeInUnit(resident.dob, groupTimeUnit as "years" | "months" | "weeks" | "days")
        if (residentAgeInUnit < groupMinAge || residentAgeInUnit > groupMaxAge) {
          shouldIncludeResidentInGroup = false
        }
      } else if (!resident.dob && (groupMinAge !== 0 || groupMaxAge !== 0) && groupTimeUnit !== "NA") {
        shouldIncludeResidentInGroup = false
      }

      if (shouldIncludeResidentInGroup) {
        groups[vaccineName] = groups[vaccineName] || {}
        groups[vaccineName][ageGroupName] = groups[vaccineName][ageGroupName] || []
        groups[vaccineName][ageGroupName].push(resident)
      }
    })

    // Don't remove empty age groups or vaccines - keep them for display
    return groups
  }, [filteredResidents, allVaccineNames])

  const handleOpenDialog = (vaccineName: string, ageGroupName: string, residents: UnvaccinatedResident[]) => {
    setCurrentDialogTitle(`${vaccineName} - ${ageGroupName}`)
    setCurrentDialogResidents(residents)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex gap-2 mr-2 mb-4 mt-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Button className="w-full sm:w-auto">
            <Link to="/patNewVacRecForm" state={{ mode: "newvaccination_record" }}>
              New Record
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allVaccineNames.map((vaccineName) => {
          const ageGroups = groupedData[vaccineName] || {}
          const hasResidents = Object.values(ageGroups).some(residents => residents && residents.length > 0)
          
          return (
            <div key={vaccineName} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold text-darkBlue2 mb-4">{vaccineName}</h3>
              
              {!hasResidents ? (
                <div className="text-center text-gray-500 py-4">
                  No unvaccinated residents found
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(ageGroups).map(([ageGroupName, residents]) => {
                    if (!residents || residents.length === 0) return null
                    
                    const firstResident = residents[0]
                    const ageRange =
                      firstResident && firstResident.min_age !== undefined && firstResident.max_age !== undefined
                        ? `${firstResident.min_age}-${firstResident.max_age} ${
                            firstResident.time_unit === "NA" ? "" : firstResident.time_unit
                          }`
                        : ""

                    return (
                      <Dialog key={`${vaccineName}-${ageGroupName}`}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between p-4 h-auto text-left flex items-center bg-gray-50 hover:bg-gray-100"
                            onClick={() => handleOpenDialog(vaccineName, ageGroupName, residents)}
                          >
                            <span className="font-medium text-darkBlue1">
                              {ageGroupName} {ageRange ? `(${ageRange})` : ""}
                            </span>
                            <span className="text-sm text-gray-600">{residents.length} Residents</span>
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allVaccineNames.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-10">No vaccine data available.</div>
      )}

      <ResidentListDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        title={currentDialogTitle}
        residents={currentDialogResidents}
      />
    </div>
  )
}