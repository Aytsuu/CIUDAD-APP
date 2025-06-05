
import type React from "react"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Input } from "@/components/ui/input"
import { Search,UserRound,MapPin,Calendar,ArrowLeft,FileText,AlertTriangle,Clipboard,Activity } from "lucide-react"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getPatientRecordsByPatId } from "./api/animal-bite-service"
import ReferralFormModal from "./referralform"

// Define Record Type for this patient's records
type PatientRecord = {
  id: number
  date: string
  transient: boolean
  receiver: string
  sender: string
  exposure: string
  siteOfExposure: string
  bitingAnimal: string
  actions: string
  referredBy?: string
  lab_exam?: string
  bite_id: number
}

export default function IndividualAnimalBites() {
  const { patientId } = useParams<{ patientId: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch patient data by pat_id
  const { data: patientData, isLoading } = useQuery({
    queryKey: ["patientRecordsByPatId", patientId],
    queryFn: () => getPatientRecordsByPatId(patientId!),
    enabled: !!patientId,
  })

  // Function to view record details
  const viewRecordDetails = (record: PatientRecord) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
  }

  // Define columns for the records table
  const columns: ColumnDef<PatientRecord>[] = [
    {
      accessorKey: "id",
      header: "Record ID",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        // Format date if needed
        return new Date(row.original.date).toLocaleDateString()
      },
    },
    {
      accessorKey: "exposure",
      header: "Exposure",
    },
    {
      accessorKey: "siteOfExposure",
      header: "Site of Exposure",
    },
    {
      accessorKey: "bitingAnimal",
      header: "Biting Animal",
    },
    {
      accessorKey: "actions",
      header: "Actions Taken",
      cell: ({ row }) => {
        const actions = row.original.actions
        return actions && actions.length > 20 ? `${actions.substring(0, 20)}...` : actions || "N/A"
      },
    },
    {
      accessorKey: "referredBy",
      header: "Referred By",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewRecordDetails(row.original)}
            className="h-8 px-2 text-xs"
          >
            View Details
          </Button>
        </div>
      ),
    },
  ]

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  // Function to handle adding a new record
  const handleAddRecord = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["patientRecordsByPatId", patientId] })
    queryClient.invalidateQueries({ queryKey: ["unique-animalbite-patients"] })
    setIsModalOpen(false)
  }

  // Filtering logic
  const filteredRecords =
    patientData?.records?.filter((record: any) => {
      const searchString =
        `${record.exposure} ${record.siteOfExposure} ${record.bitingAnimal} ${record.actions}`.toLowerCase()
      const matchesSearch = searchString.includes(searchQuery.toLowerCase())

      const matchesFilter =
        filterValue === "All" ||
        (filterValue === "Bite" && record.exposure === "Bite") ||
        (filterValue === "Non-bite" && record.exposure === "Non-bite")

      return matchesSearch && matchesFilter
    }) || []

  // Extract patient info for display
  const patient = patientData?.patientInfo || {}

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading patient data...</p>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p>Patient not found</p>
        <Link to="/animalbites">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Records
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Patient Animal Bite Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">View and manage records for this patient</p>
        </div>
        <Link to="/animalbites">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Records
          </Button>
        </Link>
      </div>

      {/* Patient Information Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-darkBlue2 mb-4 flex items-center gap-2">
          <UserRound className="h-5 w-5" />
          Patient Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <UserRound className="h-4 w-4" />
              Full Name
            </p>
            <p className="font-medium">{`${patient.per_lname || ""}, ${
              patient.per_fname || ""
            } ${patient.per_mname || ""}`}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Age & Gender
            </p>
            <p className="font-medium">
              {patient.per_age || "N/A"} years old, {patient.per_sex || "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Address
            </p>
            <p className="font-medium">{patient.per_address || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Total Records
            </p>
            <p className="font-medium">{filteredRecords.length} record(s)</p>
          </div>
        </div>
      </div>

      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Search, Filter & Button Section */}
      <div className="relative w-full flex justify-between items-center mb-4">
        {/* Search Input and Filter Dropdown */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input
                placeholder="Search records..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filter Dropdown */}
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
            trigger={<Button className="font-medium py-2 px-4 rounded-md shadow-sm">Add New Record</Button>}
            className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
            mainContent={<ReferralFormModal onAddPatient={handleAddRecord} onClose={() => setIsModalOpen(false)} />}
            title=""
            description=""
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        <div className="w-full bg-white overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <DataTable columns={columns} data={filteredRecords} />
          ) : (
            <div className="flex justify-center items-center p-8">
              <p className="text-gray-500">No records found for this patient</p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {filteredRecords.length} of {patientData?.records?.length || 0} records
          </p>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <DialogLayout
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          trigger={<></>}
          title="Animal Bite Record Details"
          description={`Record ID: ${selectedRecord.id}`}
          className="max-w-3xl"
          mainContent={
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referral Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-700">
                    <Clipboard className="h-5 w-5" />
                    Referral Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Receiver</p>
                      <p className="font-medium">{selectedRecord.receiver || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sender</p>
                      <p className="font-medium">{selectedRecord.sender || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Transient</p>
                      <p className="font-medium">{selectedRecord.transient ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Referred By</p>
                      <p className="font-medium">{selectedRecord.referredBy || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Bite Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Bite Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Bite ID</p>
                      <p className="font-medium">{selectedRecord.bite_id || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type of Exposure</p>
                      <p className="font-medium">{selectedRecord.exposure || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Site of Exposure</p>
                      <p className="font-medium">{selectedRecord.siteOfExposure || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Biting Animal</p>
                      <p className="font-medium">{selectedRecord.bitingAnimal || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lab Examination</p>
                      <p className="font-medium">{selectedRecord.lab_exam || "None"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Taken */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-700">
                  <Activity className="h-5 w-5" />
                  Actions Taken
                </h3>
                <p className="whitespace-pre-wrap">{selectedRecord.actions || "No actions recorded"}</p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          }
        />
      )}
    </div>
  )
}
