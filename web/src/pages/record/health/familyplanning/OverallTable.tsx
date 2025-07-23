
import React, { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, Home, Loader2, RefreshCw, Search, UserCog, Users } from "lucide-react"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { FPPatientsCount, getFPPatientsCounts, getFPRecordsList } from "@/pages/familyplanning/request-db/GetRequest"
import CardLayout from "@/components/ui/card/card-layout"

interface FPRecord {
  fprecord_id: number
  patient_id: string
  client_id: string
  patient_name: string
  patient_age: number
  client_type: string
  patient_type: string
  method_used: string
  created_at: string
  updated_at: string
  sex: string 
  record_count?: number
}

 export default function FamPlanningTable() {
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const queryClient = useQueryClient()

  const {
    data: fpRecords = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FPRecord[], Error>({
    queryKey: ["fpRecordsList"],
    queryFn: getFPRecordsList,
  })

  // NEW: Fetch FP Patient Counts
  const { 
    data: fpCounts, 
    isLoading: isLoadingCounts, 
    isError: isErrorCounts, 
    error: errorCounts 
  } = useQuery<FPPatientsCount, Error>({
    queryKey: ["fpPatientCounts"],
    queryFn: getFPPatientsCounts,
  });

  const filteredRecords = useMemo(() => {
    let filtered = fpRecords

    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.client_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.client_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.method_used.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((record) => record.client_type === selectedFilter)
    }

    return filtered
  }, [fpRecords, searchQuery, selectedFilter])

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredRecords.slice(startIndex, startIndex + pageSize)
  }, [filteredRecords, currentPage, pageSize])

  const totalPages = Math.ceil(filteredRecords.length / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value) || 10
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value)
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    refetch() // Refetch FP records
    queryClient.invalidateQueries({ queryKey: ["fpPatientCounts"] }); // Refetch counts
  }

   const columns = useMemo<ColumnDef<FPRecord>[]>(
    () => [
      {
        accessorKey: "fprecord_id",
        header: "Record ID",
        cell: ({ row }) => `${row.original.fprecord_id}`,
      },
      {
        accessorKey: "patient_info",
        header: "Patient",
        cell: ({ row }) => {
          const record = row.original
          return (
            <div className="flex flex-col min-w-[200px]">
              <div className="font-medium">
                <Link
                  to={`/familyplanning/patient/${record.patient_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {record.patient_name || "No name available"}
                </Link>
              </div>
              <div className="text-sm text-gray-600">
                {record.patient_age ? `${record.patient_age} years` : "Age not available"}•
                {record.sex || "Gender not available"}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "patient_type", // NEW: Column for Patient Type
        header: "Patient Type",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium 
                        ${row.original.patient_type === 'Resident' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}
          >
            {row.original.patient_type || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: "method_used",
        header: "Method",
        cell: ({ row }) => (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {row.original.method_used || "Not specified"}
          </span>
        ),
      },
      {
        accessorKey: "client_type",
        header: "Client Type",
      },
      {
        accessorKey: "created_at",
        header: "Date Created",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
      {
        accessorKey: "record_count",
        header: "Records",
        cell: ({ row }) => (
          <span className="font-semibold text-gray-700">
            {row.original.record_count || 0} records
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link to={`/familyplanning/patient/${row.original.patient_id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  )
  // Use a combined loading state for both data fetches
  if (isLoading || isLoadingCounts) {
    return <div className="p-8 text-center flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading records...</div>;
  }

  if (isError || isErrorCounts) {
    return <div className="p-8 text-center text-red-600">Error loading data: {error?.message || errorCounts?.message}</div>;
  }

  const clientTypeOptions = [
    { id: "all", name: "All Types" },
    { id: "New Acceptor", name: "New Acceptor" },
    { id: "Current User", name: "Current User" },
  ]

  const totalFPPatients = fpCounts?.total_fp_patients || 0;
  const residentFPPatients = fpCounts?.resident_fp_patients || 0;
  const transientFPPatients = fpCounts?.transient_fp_patients || 0;

  const residentFPPercentage = totalFPPatients > 0 ? Math.round((residentFPPatients / totalFPPatients) * 100) : 0;
  const transientFPPercentage = totalFPPatients > 0 ? Math.round((transientFPPatients / totalFPPatients) * 100) : 0;


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

      {/* NEW: Stats Cards for Family Planning Patients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CardLayout
          title='Total Patients'
          description="All patients who availed Family Planning"
          content={
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{totalFPPatients}</span>
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
          title="Resident Patients"
          description="Permanent residents who availed FP"
          content={
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{residentFPPatients}</span>
                <div className="flex items-center text-xs text-muted-foreground">
                  {residentFPPercentage > transientFPPercentage ? (
                    <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1 text-amber-500" />
                  )}
                  <span>{residentFPPercentage}% of total</span>
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
          title="Transient Patients"
          description="Temporary residents who availed FP"
          content={
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{transientFPPatients}</span>
                <div className="flex items-center text-xs text-muted-foreground">
                  {transientFPPercentage > residentFPPercentage ? (
                    <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1 text-amber-500" />
                  )}
                  <span>{transientFPPercentage}% of total</span>
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <SelectLayout
              className="w-full md:w-[200px] bg-white"
              label=""
              placeholder="Select Type"
              options={clientTypeOptions}
              value={selectedFilter}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* New Record Button */}
        <div className="flex justify-end">
          <Link to={`/familyplanning/new-record`}>
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
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}