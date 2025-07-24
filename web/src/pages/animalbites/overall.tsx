import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button/button"
import ReferralFormModal from "./referralform"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Input } from "@/components/ui/input"
import { ArrowDown, ArrowUp, Home, Search, UserCog, Users } from "lucide-react"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Link } from "react-router-dom"
import { getAnimalBitePatientDetails } from "./api/get-api" 
import { toast } from "sonner"
import CardLayout from "@/components/ui/card/card-layout"


// Type definition for table display
type UniquePatientDisplay = {
  id: string
  fname: string
  lname: string
  gender: string
  age: string
  date: string
  transient: boolean // This now reflects referral_transient from backend
  patientType: string // New: 'Resident' or 'Transient'
  exposure: string
  siteOfExposure: string
  bitingAnimal: string
  actions_taken: string
  referredby: string
  recordCount: number
}

type PatientCountStats = {
  total: number
  residents: number
  transients: number
  residentPercentage: number
  transientPercentage: number
}

const Overall: React.FC = () => {
  const [patients, setPatients] = useState<UniquePatientDisplay[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isReferralFormOpen, setIsReferralFormOpen] = useState(false)

  const fetchAnimalBiteRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const allRecords = await getAnimalBitePatientDetails()
      console.log("Fetched records (from getAnimalBitePatientDetails):", allRecords)

      const patientGroups = new Map<string, any[]>()

      allRecords.forEach((record: any) => {
        const patientId = record.patient_id // This is the pat_id from the backend
        if (!patientGroups.has(patientId)) {
          patientGroups.set(patientId, [])
        }
        // Ensure records are pushed to the group for count
        patientGroups.get(patientId)?.push(record)
      })

      const uniquePatients: UniquePatientDisplay[] = []

      // Iterate through the grouped data to create unique patient entries
      patientGroups.forEach((recordsForPatient, patientId) => {
        // The backend should sort by latest, so the first record in the group is the most recent.
        const latestRecord = recordsForPatient[0] // Assuming the backend returns records sorted by latest date first

        if (latestRecord) {
          uniquePatients.push({
            id: patientId, // Use patient_id for routing
            fname: latestRecord.patient_fname || "N/A", // Use data directly from serializer
            lname: latestRecord.patient_lname || "N/A", // Use data directly from serializer
            gender: latestRecord.patient_sex || "N/A", // Use data directly from serializer
            age: latestRecord.patient_age?.toString() || "N/A", // Use patient_age from serializer (it's already calculated)
            date: latestRecord.referral_date,
            transient: latestRecord.referral_transient, // From SerializerMethodField
            patientType: latestRecord.patient_type || "N/A", // New field from serializer
            exposure: latestRecord.exposure_type,
            siteOfExposure: latestRecord.exposure_site,
            bitingAnimal: latestRecord.biting_animal,
            actions_taken: latestRecord.actions_taken || "",
            referredby: latestRecord.referredby || "",
            recordCount: recordsForPatient.length, // Total count of records for this patient
          })
        }
      })
      setPatients(uniquePatients)
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to load animal bite records. Please try again.")
      toast.error("Failed to load animal bite records.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimalBiteRecords()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const calculatePatientStats = (): PatientCountStats => {
  const total = patients.length
  const residents = patients.filter(p => p.patientType === "Resident").length
  const transients = patients.filter(p => p.patientType === "Transient").length
  const residentPercentage = total > 0 ? Math.round((residents / total) * 100) : 0
  const transientPercentage = total > 0 ? Math.round((transients / total) * 100) : 0

  return {
    total,
    residents,
    transients,
    residentPercentage,
    transientPercentage
  }
}

const stats = calculatePatientStats()
  const handleReferralFormClose = () => {
    setIsReferralFormOpen(false)
    // Refresh data after form closes
    fetchAnimalBiteRecords()
  }

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const searchTerms = `${p.fname} ${p.lname} ${p.age} ${p.gender} ${p.date} ${p.exposure} ${p.siteOfExposure} ${p.bitingAnimal} ${p.patientType}`.toLowerCase()
      const matchesSearch = searchTerms.includes(searchQuery.toLowerCase())
      const matchesFilter =
        filterValue === "All" ||
        (filterValue === "Bite" && p.exposure === "Bite") ||
        (filterValue === "Non-bite" && p.exposure === "Non-bite") ||
        (filterValue === "Transient" && p.patientType=== "Transient") ||
         (filterValue === "Resident" && p.patientType=== "Resident")
      return matchesSearch && matchesFilter
    })
  }, [patients, searchQuery, filterValue])

  const columns: ColumnDef<UniquePatientDisplay>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "fullName",
      header: "Patient",
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              {/* Link to individual history using patient's pat_id */}
              <Link to={`/Animalbite_individual/${p.id}`} className="hover:text-blue-600 hover:underline">
                <div className="font-medium truncate">{`${p.lname}, ${p.fname} ${p.mname || ''}`.trim()}</div>
                <div className="text-sm text-darkGray">
                  {p.gender}, {p.age} years old
                  {p.recordCount > 1 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-sm font-bold p-1 rounded">
                        {p.recordCount} records
                    </span>

                  )}
                </div>
              </Link>
            </div>
          </div>
        )
      },
    },
    { 
      accessorKey: "patientType",
      header: "Patient Type",
      cell: ({ row }) => row.original.patientType, // Display the patient type
    },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "exposure", header: "Exposure Type" },
    { accessorKey: "siteOfExposure", header: "Site of Exposure" },
    { accessorKey: "bitingAnimal", header: "Biting Animal" },
    {
      accessorKey: "actions_taken",
      header: "Actions Taken",
      cell: ({ row }) => {
        const actions = row.original.actions_taken
        return actions && actions.length > 30 ? `${actions.substring(0, 30)}...` : actions
      },
    },
    { accessorKey: "referredby", header: "Referred by" },
  ]

  return (
    <div className="container mx-auto p-3 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Animal Bites Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view animal bite records</p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <CardLayout
    title='Total Animal Bite Cases'
    description="All recorded animal bite cases"
    content={
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{stats.total}</span>
          <span className="text-xs text-muted-foreground">Total records</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    }
    cardClassName="border shadow-sm rounded-lg"
    headerClassName="pb-2"
    contentClassName="pt-0"
  />

  <CardLayout
    title="Resident Cases"
    description="Permanent residents with animal bites"
    content={
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{stats.residents}</span>
          <div className="flex items-center text-xs text-muted-foreground">
            {stats.residentPercentage > stats.transientPercentage ? (
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1 text-amber-500" />
            )}
            <span>{stats.residentPercentage}% of total</span>
          </div>
        </div>
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <Home className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    }
    cardClassName="border shadow-sm rounded-lg"
    headerClassName="pb-2"
    contentClassName="pt-0"
  />

  <CardLayout
    title="Transient Cases"
    description="Temporary patients with animal bites"
    content={
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{stats.transients}</span>
          <div className="flex items-center text-xs text-muted-foreground">
            {stats.transientPercentage > stats.residentPercentage ? (
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1 text-amber-500" />
            )}
            <span>{stats.transientPercentage}% of total</span>
          </div>
        </div>
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <UserCog className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    }
    cardClassName="border shadow-sm rounded-lg"
    headerClassName="pb-2"
    contentClassName="pt-0"
  />
</div>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex gap-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 w-72 bg-white"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <SelectLayout
            placeholder="Filter by"
            label=""
            className="w-[200px] bg-white"
            options={[
              { id: "All", name: "All" },
              { id: "Bite", name: "Bite" },
              { id: "Non-bite", name: "Non-bite" },
              { id: "Transient", name: "Transient" },   
              { id: "Resident", name: "Resident" },            
            ]}
            value={filterValue}
            onChange={(value) => setFilterValue(value)}
          />
        </div>

        <Button onClick={() => setIsReferralFormOpen(true)} className="font-medium py-2 px-4 rounded-md shadow-sm">
          New Record
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading patient records...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-6">{error}</div>
      ) : (
        <div className="w-full bg-white overflow-x-auto">
          <DataTable columns={columns} data={filteredPatients} />
          <p className="text-xs sm:text-sm text-darkGray mt-2">
            Showing {filteredPatients.length} of {patients.length} records
          </p>
        </div>
      )}

      <DialogLayout
        isOpen={isReferralFormOpen}
        onClose={handleReferralFormClose}
        className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
        title=""
        description=""
        mainContent={
          <ReferralFormModal
            onClose={handleReferralFormClose}
            onAddPatient={(newPatient) => {
              console.log("New patient added:", newPatient)
              fetchAnimalBiteRecords() // Refresh data after adding
            }}
          />
        }
      />

    </div>
  )
}

export default Overall
