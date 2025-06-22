import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Edit, Eye, Plus, RefreshCw, Search, Trash } from "lucide-react"
import { toast } from "sonner"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { deleteFPCompleteRecord, getFamilyPlanningPatients, getFPRecordsList } from "@/pages/familyplanning/request-db/GetRequest"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { SelectLayout } from "@/components/ui/select/select-layout"

// Type definition for a Family Planning Record, including patient details
interface FPRecord {
  fprecord_id: number
  client_id: string
  patient_name: string
  patient_age: number
  client_type: string
  method_used: string
  created_at: string
  updated_at: string
  sex: string // Added 'sex' field to the interface
}

export default function FamPlanningTable() {
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [fpRecords, setFpRecords] = useState<FPRecord[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Fetch FP records on component mount
  useEffect(() => {
    fetchFPRecords()
  }, [])

  // Function to fetch family planning records from the API
  const fetchFPRecords = async () => {
    setLoading(true) // Set loading state to true
    try {
      const records = await getFPRecordsList() // Call the API function to get records
      setFpRecords(records) // Update the state with fetched records
      console.log("✅ FP Records loaded:", records)
      toast.success(`Loaded ${records.length} FP records`) // Show success toast
    } catch (error) {
      console.error("❌ Error fetching FP records:", error)
      toast.error("Failed to load FP records") // Show error toast
    } finally {
      setLoading(false) // Set loading state to false
    }
  }

  // Handle delete record confirmation and deletion
  const handleDelete = async (fprecord_id: number) => {
    try {
      await deleteFPCompleteRecord(fprecord_id) // Call the API to delete the record
      toast.success("FP record deleted successfully") // Show success toast
      fetchFPRecords() // Refresh the list after deletion
    } catch (error) {
      console.error("❌ Error deleting FP record:", error)
      toast.error("Failed to delete FP record") // Show error toast
    }
  }

  // Define the columns for the data table
  const columns: ColumnDef<FPRecord>[] = [
  { 
    accessorKey: "fprecord_id", 
    header: "Record ID",
    cell: ({ row }) => `FP-${row.original.fprecord_id.toString().padStart(4, '0')}`
  },
  {
    accessorKey: "patient_info",
    header: "Patient",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex flex-col min-w-[200px]">
          <div className="font-medium">
            {record.patient_name || 'No name available'}
          </div>
          <div className="text-sm text-gray-600">
            {record.patient_age ? `${record.patient_age} years` : 'Age not available'}• 
            {record.sex || 'Gender not available'}  
            {/* {record.client_type || 'Type not available' */}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "method_used",
    header: "Method",
    cell: ({ row }) => (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        {row.original.method_used || 'Not specified'}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date Created",
    cell: ({ row }) => (
      new Date(row.original.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    )},
    
  ]

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Filter records based on search query and selected filter
  const filteredRecords = fpRecords.filter((record) => {
    // Combine relevant fields into a single search string
    const searchString = `${record.patient_name} ${record.method_used} ${record.client_type} ${record.sex}`.toLowerCase()
    const matchesSearch = searchString.includes(searchQuery.toLowerCase())

    // Apply filter based on client type
    if (selectedFilter === "all" || selectedFilter === "All") {
      return matchesSearch
    }

    return matchesSearch && record.client_type === selectedFilter
  })

  // Paginate records based on current page and page size
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value) || 10 // Parse input value, default to 10
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page when page size changes
  }

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Show loading indicator while data is being fetched
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin mb-2" size={24} />
        <p>Loading Family Planning records...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Family Planning Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view family planning records
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      {/* Search & New Record Button */}
      <div className="relative w-full flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search"
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filter Dropdown */}
            <SelectLayout
              className="w-full md:w-[200px] bg-white"
              label=""
              placeholder="Select Type"
              options={[
                { id: "All", name: "All Types" },
                { id: "Resident", name: "Resident" },
                { id: "Non-Resident", name: "Non-Resident" },
              ]}
              value={selectedFilter}
              onChange={handleFilterChange}
            />

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={fetchFPRecords}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
              Refresh
            </Button>
          </div>
        </div>

        {/* New Record Button */}
        <div className="flex justify-end">
          <Link to={`/FamPlanning_main/`}>
            <Button variant="default" className="flex items-center gap-2">
              New Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
        <div className="flex gap-x-2 items-center">
          <p className="text-xs sm:text-sm">Show</p>
          <Input
            type="number"
            className="w-14 h-8"
            value={pageSize}
            onChange={handlePageSizeChange}
            min="1"
            max="100"
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white w-full overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || selectedFilter !== "all" ?
              "No records found matching your search criteria." :
              "No Family Planning records available."
            }
          </div>
        ) : (
          <DataTable columns={columns} data={paginatedRecords} />
        )}
      </div>

      {/* Pagination & Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        {/* Showing Rows Info */}
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
          {Math.min(currentPage * pageSize, filteredRecords.length)} of{" "}
          {filteredRecords.length} records
          {filteredRecords.length !== fpRecords.length && ` (filtered from ${fpRecords.length} total)`}
        </p>

        {filteredRecords.length > 0 && Math.ceil(filteredRecords.length / pageSize) > 1 && (
          <PaginationLayout
            currentPage={currentPage}
            totalPages={Math.ceil(filteredRecords.length / pageSize)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}