"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, Search, FileInput, AlertCircle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/ui/table/data-table"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { SelectLayout } from "@/components/ui/select/select-layout"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { TooltipProvider } from "@/components/ui/tooltip"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { LinearLoader } from "@/components/ui/linear-loader"

import ScheduleTab from "./appointments-tab"

import { useAllFollowUpVisits } from "../../record/health/patientsRecord/queries/fetch"


export default function ScheduleRecords() {
  type ScheduleRecord = {
    id: number
    patient: {
      firstName: string
      lastName: string
      middleName: string
      gender: string
      age: number
      ageTime: string
      patientId: string
    }
    scheduledDate: string
    purpose: string
    status: "Pending" | "Completed" | "Missed" | "Cancelled"
    sitio: string
    type: "Transient" | "Resident"
    patrecType: string
  }

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [timeFrame, setTimeFrame] = useState("today");

  // fetch data 
  const { data: paginatedData, isLoading, error, refetch } = useAllFollowUpVisits({
    page,
    page_size: pageSize,
    status: selectedFilter !== "All" ? selectedFilter : undefined,
    search: searchTerm || undefined,
    time_frame: timeFrame,
  })

  // Transform the Django API data to match our ScheduleRecord type
  const transformedData = useMemo((): ScheduleRecord[] => {
    if (!paginatedData?.results) return [];

    return paginatedData.results.map((visit: any) => {
      try {
        const patientDetails = visit.patient_details
        if (!patientDetails) {
          console.warn("No patient details found for visit:", visit)
          return null
        }

        const patientInfo = patientDetails.patient_info || patientDetails.personal_info || {}
        const address = patientDetails.address || {}

        const calculateAge = (dob: string) => {
          if (!dob) return { age: 0, ageTime: "yrs" }
          try {
            const birthDate = new Date(dob)
            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--
            }
            return { age: Math.max(0, age), ageTime: "yrs" }
          } catch {
            return { age: 0, ageTime: "yrs" }
          }
        }

        const ageInfo = calculateAge(patientInfo.per_dob)

        const formatDate = (dateStr: string) => {
          if (!dateStr) return new Date().toISOString().split("T")[0]
          try {
            return new Date(dateStr).toISOString().split("T")[0]
          } catch {
            return dateStr
          }
        }

        const record: ScheduleRecord = {
          id: visit.followv_id || visit.id || 0,
          patient: {
            firstName: patientInfo.per_fname || "Unknown",
            lastName: patientInfo.per_lname || "Unknown",
            middleName: patientInfo.per_mname || "",
            gender: patientInfo.per_sex || "Unknown",
            age: ageInfo.age,
            ageTime: ageInfo.ageTime,
            patientId: patientDetails.pat_id || patientInfo.pat_id || "",
          },
          scheduledDate: formatDate(visit.followv_date || visit.date),
          purpose: visit.followv_description || visit.description || visit.purpose || "Follow-up Visit",
          status: visit.followv_status || visit.status || "Pending",
          sitio: address.sitio || address.location || "Unknown",
          type: patientDetails.pat_type || "Unknown",
          patrecType: patientDetails.patrec_type || "Unknown",
        }

        return record
      } catch (error) {
        console.error("Error transforming visit data:", error, visit)
        return null
      }
    }).filter(Boolean) // Remove null values
  }, [paginatedData])


  // const filteredDataByTimeFrame = (data: any) => {
  //   const today = new Date();
  //   const startOfWeek = new Date(today);
  //   const endOfWeek = new Date(today);
  //   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  //   const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  //   switch (timeFrame) {
  //     case 'today':
  //       return data.filter((visit: any) => new Date(visit.scheduledDate).toDateString() === today.toDateString());

  //     case 'thisWeek':
  //       startOfWeek.setDate(today.getDate() - today.getDay())
  //       endOfWeek.setDate(startOfWeek.getDate() + 6);
  //       return data.filter((visit: any) => {
  //         const visitDate = new Date(visit.scheduledDate);
  //         return visitDate >= startOfWeek && visitDate <= endOfWeek;
  //       });

  //     case 'thisMonth':
  //       return data.filter((visit:any) => {
  //         const visitDate = new Date(visit.scheduledDate);
  //         return visitDate >= startOfMonth && visitDate <= endOfMonth;
  //       })
      
  //     default:
  //       return data;
  //   }
  // };

  // const filteredTimeData = useMemo(() => filteredDataByTimeFrame(transformedData), [transformedData, timeFrame]);

  const totalPages = Math.ceil((paginatedData?.count || 0) / pageSize)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSearch = (search: string) => {
    setSearchTerm(search)
    setPage(1) // Reset to first page on search
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    setPage(1) // Reset to first page on filter change
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page
  }

  const handleTimeFrameChange = (timeFrame: string) => {
    setTimeFrame(timeFrame)
    setPage(1) // Reset to first page
  }

  // Function to determine if appointment is missed
  const getAppointmentStatus = (scheduledDate: string, currentStatus: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const appointmentDate = new Date(scheduledDate)
    appointmentDate.setHours(0, 0, 0, 0)

    if (appointmentDate < today && currentStatus === "Pending") {
      return "Missed"
    }
    return currentStatus
  }

  const columns: ColumnDef<ScheduleRecord>[] = [
    {
      accessorKey: "id",
      header: "Schedule ID",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="flex justify-center items-center gap-2 cursor-pointer bg-blue-100 text-blue-800 px-3 py-1 rounded-md w-8 text-center font-semibold">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Patient <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const patient = row.original.patient
        const fullName = `${patient.lastName}, ${patient.firstName} ${patient.middleName}`.trim()

        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-gray-600">
                {patient.gender}, {patient.age} {patient.ageTime} old
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "scheduledDate",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Scheduled Date <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center">
            <div className="font-medium">{row.original.scheduledDate}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[150px] px-2">
          <div className="w-full truncate">{row.original.purpose}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const actualStatus = getAppointmentStatus(row.original.scheduledDate, row.original.status)
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800",
          completed: "bg-green-100 text-green-800",
          missed: "bg-red-100 text-red-800",
          cancelled: "bg-gray-100 text-gray-800",
        }

        return (
          <div className="flex justify-center min-w-[100px] px-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[actualStatus as keyof typeof statusColors]}`}
            >
              {actualStatus}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.sitio}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.type}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <TooltipProvider>
            <TooltipLayout
              trigger={
                <div
                  className="bg-white hover:bg-gray-50 border text-black px-4 py-2 rounded cursor-pointer"
                  onClick={() => {
                    // Handle view action - you can navigate to patient details
                    console.log("View patient:", row.original.patient.patientId)
                    // You can add navigation logic here
                  }}
                >
                  <p className="font-semibold">View</p>
                </div>
              }
              content="View Schedule Details"
            />
          </TooltipProvider>
        </div>
      ),
    },
  ]

  const filter = [
    { id: "All", name: "All" },
    { id: "pending", name: "Pending" },
    { id: "completed", name: "Completed" },
    { id: "missed", name: "Missed" },
    { id: "cancelled", name: "Cancelled" },
  ]

  // Filter and search logic
  // const filteredData = useMemo(() => {
  //   let filtered = filteredTimeData

  //   // Apply status filter
  //   if (selectedFilter !== "All") {
  //     filtered = filtered.filter((item:any) => {
  //       const actualStatus = getAppointmentStatus(item.scheduledDate, item.status)
  //       return actualStatus === selectedFilter
  //     })
  //   }

  //   // Apply search filter
  //   if (searchTerm) {
  //     const searchLower = searchTerm.toLowerCase()
  //     filtered = filtered.filter((item:any) => {
  //       const fullName = `${item.patient.firstName} ${item.patient.middleName} ${item.patient.lastName}`.toLowerCase()
  //       const purpose = item.purpose.toLowerCase()
  //       const sitio = item.sitio.toLowerCase()
  //       const type = item.type.toLowerCase()

  //       return (
  //         fullName.includes(searchLower) ||
  //         purpose.includes(searchLower) ||
  //         sitio.includes(searchLower) ||
  //         type.includes(searchLower) ||
  //         item.id.toString().includes(searchLower) ||
  //         item.patient.patientId.toLowerCase().includes(searchLower)
  //       )
  //     })
  //   }

  //   return filtered
  // }, [filteredTimeData, selectedFilter, searchTerm])

  // Sort data by date (most recent first)
  // const sortedData = [...filteredData].sort((a, b) => {
  //   return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  // })

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["ID", "Patient Name", "Date", "Purpose", "Status", "Sitio", "Type"]
    const csvData = transformedData.map((record:any) => {
      const fullName = `${record.patient.lastName}, ${record.patient.firstName} ${record.patient.middleName}`
      const actualStatus = getAppointmentStatus(record.scheduledDate, record.status)
      return [
        record.id,
        fullName,
        record.scheduledDate,
        record.purpose,
        actualStatus,
        record.sitio,
        record.type,
      ]
    })

    const csvContent = [headers, ...csvData].map((row) => row.map((field:any) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "follow-up-visits.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Loading state
  if (isLoading) {
    return (
      <LayoutWithBack title="Schedule Records" description="Manage and view patient appointment schedules">
        <div className="flex items-center justify-center h-64">
          <LinearLoader/>
          <span>Loading follow-up visits...</span>
        </div>
      </LayoutWithBack>
    )
  }

  // Error state
  if (error) {
    return (
      <LayoutWithBack title="Scheduled Appointments" description="View patient appointment schedules">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-2 text-lg font-semibold">Error loading data</p>
          <p className="text-sm text-gray-600 mb-4">{error?.message || "Failed to fetch follow-up visits"}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </LayoutWithBack>
    )
  }

  return (
    <LayoutWithBack title="Scheduled Appointments" description="View patient appointment schedules">
      <div className="w-full h-full bg-white/40 p-2 flex flex-col">
        <div className="mb-4 w-full">
          <ScheduleTab onTimeFrameChange={handleTimeFrameChange} />
        </div> 
        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex w-full gap-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                <Input
                  placeholder="Search schedules..."
                  className="pl-10 w-full bg-white"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <SelectLayout
                placeholder="Select status"
                label=""
                className="w-full md:w-[200px] bg-white text-black"
                options={filter}
                value={selectedFilter}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {/* <Button variant="default">New Schedule</Button> */}
          </div>
        </div>

        <div className="h-full w-full rounded-md bg-white">
          <div className="w-full h-auto sm:h-16 bg- flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileInput />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToCSV}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="w-full h-[30rem] overflow-x-auto">
            {transformedData.length > 0 ? (
              <DataTable columns={columns} data={transformedData} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No follow-up visits found</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-gray-600 pl-0 sm:pl-4">
              Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, paginatedData?.count)} of {paginatedData?.count} rows
            </p>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex justify-center">
              {totalPages > 1 && (
                <PaginationLayout
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  )
}