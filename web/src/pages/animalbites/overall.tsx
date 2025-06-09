import type React from "react"
import { useState, useEffect } from "react"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button/button"
import ReferralFormModal from "./referralform"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Input } from "@/components/ui/input"
import { Eye, Search, Trash } from "lucide-react"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Link } from "react-router-dom"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import {getUniqueAnimalbitePatients,getAnimalbitePatients} from "./api/get-api"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal"
import { toast } from "sonner"
import { referral } from "./db-request/postrequest"

// Define Patient Type
type Patient = {
  id: string
  referralId?: string 
  fname: string
  lname: string
  gender: string
  age: string
  date: string
  transient: boolean
  exposure: string
  siteOfExposure: string
  bitingAnimal: string
  actions: string
  referredby?: string
  recordCount?: number
}

// Helper function to calculate age
const calculateAge = (birthDate: string): string => {
  if (!birthDate) return "N/A"

  const today = new Date()
  const birthDateObj = new Date(birthDate)

  // Check if date is valid
  if (isNaN(birthDateObj.getTime())) return "N/A"

  let age = today.getFullYear() - birthDateObj.getFullYear()
  const monthDiff = today.getMonth() - birthDateObj.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--
  }

  return age >= 0 ? age.toString() : "N/A"
}

function AnimalBites() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPatientForDeletion, setSelectedPatientForDeletion] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("🔄 Fetching animal bite patients...")

        // Use the new simplified function for unique patients
        const patientData = await getUniqueAnimalbitePatients()

        console.log("✅ Received patient data:", patientData)

        // Transform data for the table
        const formattedPatients: Patient[] = patientData.map((patient: any) => {
          return {
            id: patient.id?.toString() || Math.random().toString(),
            fname: patient.fname || "Unknown",
            lname: patient.lname || "Unknown",
            gender: patient.gender || "N/A",
            age: calculateAge(patient.dob),
            date: patient.date || "N/A",
            transient: patient.transient || false,
            exposure: patient.exposure || "N/A",
            siteOfExposure: patient.siteOfExposure || "N/A",
            bitingAnimal: patient.bitingAnimal || "N/A",
            actions: patient.actions || "N/A",
            referredby: patient.referredby || "N/A",
            recordCount: patient.recordCount || 1
          }
        })

        console.log("✅ Formatted patients for table:", formattedPatients)
        setPatients(formattedPatients)

      } catch (error) {
        console.error("❌ Failed to fetch patients:", error)
        setError("Failed to load patient records. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatientForDeletion(patient)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPatientForDeletion) return

    setIsDeleting(true)
    try {
      await deleteAnimalBitePatient(selectedPatientForDeletion.id)

      // Remove the deleted patient from local state
      setPatients(prev => prev.filter(p => p.id !== selectedPatientForDeletion.id))

      toast.success(`Successfully deleted all records for ${selectedPatientForDeletion.fname} ${selectedPatientForDeletion.lname}`)
      setDeleteDialogOpen(false)
      setSelectedPatientForDeletion(null)
    } catch (error: any) {
      console.error("Delete error:", error)
      toast.error(error.message || "Failed to delete patient records")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedPatientForDeletion(null)
  }
  const navigateToPatient = (patientId: string) => {
    if (!patientId || patientId === "N/A") {
      toast.error("Invalid patient ID")
      return
    }
    
    // Find the referral ID for this patient
    const patient = patients.find(p => p.id === patientId)
    if (patient && patient.referralId) {
      route(`/Animalbite_individual/${patient.referralId}`)
    } else {
      route(`/Animalbite_individual/${patientId}`)
    }
  }
  // Define Columns for DataTable
  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "fullName",
      header: "Patient",
      cell: ({ row }) => {
        const patient = row.original
        const fullName = `${patient.lname}, ${patient.fname}`
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <Link
                to={`/Animalbite_individual/${patient.id}`}
                className="hover:text-blue-600 hover:underline"
              >
                <div className="font-medium truncate">{fullName}</div>
                <div className="text-sm text-darkGray">
                  {patient.gender}, {patient.age} years old
                  {patient.recordCount && patient.recordCount > 1 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {patient.recordCount} records
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        )
      },
    },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "exposure", header: "Exposure Type" },
    { accessorKey: "siteOfExposure", header: "Site of Exposure" },
    {
      accessorKey: "transient",
      header: "Transient",
      cell: ({ row }) => (row.original.transient ? "Yes" : "No"),
    },
    { accessorKey: "bitingAnimal", header: "Biting Animal" },
    {
      accessorKey: "actions",
      header: "Actions Taken",
      cell: ({ row }) => {
        const actions = row.original.actions
        return actions && actions.length > 30 ? `${actions.substring(0, 30)}...` : actions
      },
    },
    { accessorKey: "referredby", header: "Referred by" },
    {
      accessorKey: "button",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <TooltipProvider>
            <TooltipLayout
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                  <Link to={`/Animalbite_individual/${row.original.id}`}>
                    <Eye size={15} />
                  </Link>
                </div>
              }
              content="View Details"
            />
          </TooltipProvider>
          <TooltipProvider>
            <TooltipLayout
              trigger={
                <div 
                  className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"
                  onClick={() => handleDeleteClick(row.original)}
                >
                  <Trash size={16} />
                </div>
              }
              content="Delete All Records"
            />
          </TooltipProvider>
        </div>
      ),
    },
  ]

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  // Filtering logic
  const filteredPatients = patients.filter((patient) => {
    const searchString = `${patient.fname} ${patient.lname} ${patient.age} ${patient.gender} ${patient.date} ${patient.exposure} ${patient.siteOfExposure} ${patient.bitingAnimal}`.toLowerCase()
    const matchesSearch = searchString.includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterValue === "All" ||
      (filterValue === "Bite" && patient.exposure === "Bite") ||
      (filterValue === "Non-bite" && patient.exposure === "Non-bite")

    return matchesSearch && matchesFilter
  })

  const handleModalClose = () => {
    window.location.reload()
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Animal Bite Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patient information
          </p>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Animal Bite Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view patient information
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Search, Filter & Button Section */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                size={17}
              />
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
              className="w-full md:w-[200px] bg-white"
              options={[
                { id: "All", name: "All" },
                { id: "Bite", name: "Bite" },
                { id: "Non-bite", name: "Non-bite" },
              ]}
              value={filterValue}
              onChange={(value) => setFilterValue(value)}
            />
          </div>
        </div>

        {/* New Record Button */}
        <div className="flex justify-end">
          <DialogLayout
            trigger={
              <Button className="font-medium py-2 px-4 rounded-md shadow-sm">
                New Record
              </Button>
            }
            className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
            mainContent={
              <ReferralFormModal
                onClose={handleModalClose}
                onAddPatient={(newPatient) => {
                  // Optionally update the local state or refetch data
                  console.log("New patient added:", newPatient)
                }}
              />
            }
            title=""
            description=""
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="mb-2">Loading patient records...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white overflow-x-auto">
            <DataTable columns={columns} data={filteredPatients} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {filteredPatients.length} of {patients.length} records
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Records"
        description={
          selectedPatientForDeletion
            ? `Are you sure you want to delete all records for ${selectedPatientForDeletion.fname} ${selectedPatientForDeletion.lname}? This action cannot be undone and will remove all referrals and bite details associated with this patient.`
            : "Are you sure you want to delete this patient's records?"
        }
      />

      {/* Loading overlay while deleting */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Deleting patient records...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnimalBites
