"use client"

import { useState, useMemo } from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import type { ColumnDef } from "@tanstack/react-table"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { ArrowUpDown, Search, FileInput, Loader2, AlertCircle } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAllFollowUpVisits } from "../../record/health/patientsRecord/queries/patientsFetchQueries"

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
    scheduledTime: string
    purpose: string
    status: "Pending" | "Completed" | "Missed" | "Cancelled"
    sitio: string
    type: "Transient" | "Resident"
  }

  // Fetch data using React Query
  const { data: followUpVisits, isLoading, error, refetch } = useAllFollowUpVisits()

  // Transform the Django API data to match our ScheduleRecord type
  const transformedData = useMemo((): ScheduleRecord[] => {
    if (!followUpVisits || !Array.isArray(followUpVisits)) return []

    const validRecords: ScheduleRecord[] = []

    followUpVisits.forEach((visit: any) => {
      try {
        const patientDetails = visit.patient_details
        if (!patientDetails) return

        const personalInfo = patientDetails.personal_info || {}
        const address = patientDetails.address || {}

        // Calculate age from date of birth
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

        const ageInfo = calculateAge(personalInfo.per_dob)

        // Format date
        const formatDate = (dateStr: string) => {
          try {
            return new Date(dateStr).toISOString().split("T")[0]
          } catch {
            return dateStr
          }
        }

        const record: ScheduleRecord = {
          id: visit.followv_id,
          patient: {
            firstName: personalInfo.per_fname || "Unknown",
            lastName: personalInfo.per_lname || "Unknown",
            middleName: personalInfo.per_mname || "",
            gender: personalInfo.per_sex || "Unknown",
            age: ageInfo.age,
            ageTime: ageInfo.ageTime,
            patientId: patientDetails.pat_id || "",
          },
          scheduledDate: formatDate(visit.followv_date),
          scheduledTime: visit.followv_time || "09:00 AM",
          purpose: visit.followv_description || "Follow-up Visit",
          status: visit.followv_status || "Pending",
          sitio: address.sitio || "Unknown",
          type: patientDetails.pat_type || "Unknown",
        }

        validRecords.push(record)
      } catch (error) {
        console.error("Error transforming visit data:", error, visit)
      }
    })

    return validRecords
  }, [followUpVisits])

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
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md w-8 text-center font-semibold">
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
          Date <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center">
            <div className="font-medium">{row.original.scheduledDate}</div>
            <div className="text-sm text-gray-500">{row.original.scheduledTime}</div>
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
          Pending: "bg-yellow-100 text-yellow-800",
          Completed: "bg-green-100 text-green-800",
          Missed: "bg-red-100 text-red-800",
          Cancelled: "bg-gray-100 text-gray-800",
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

  const [searchTerm, setSearchTerm] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const filter = [
    { id: "All", name: "All" },
    { id: "Pending", name: "Pending" },
    { id: "Completed", name: "Completed" },
    { id: "Missed", name: "Missed" },
    { id: "Cancelled", name: "Cancelled" },
  ]
  const [selectedFilter, setSelectedFilter] = useState(filter[0].id)

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = transformedData

    // Apply status filter
    if (selectedFilter !== "All") {
      filtered = filtered.filter((item) => {
        const actualStatus = getAppointmentStatus(item.scheduledDate, item.status)
        return actualStatus === selectedFilter
      })
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((item) => {
        const fullName = `${item.patient.firstName} ${item.patient.middleName} ${item.patient.lastName}`.toLowerCase()
        const purpose = item.purpose.toLowerCase()
        const sitio = item.sitio.toLowerCase()
        const type = item.type.toLowerCase()

        return (
          fullName.includes(searchLower) ||
          purpose.includes(searchLower) ||
          sitio.includes(searchLower) ||
          type.includes(searchLower) ||
          item.id.toString().includes(searchLower)
        )
      })
    }

    return filtered
  }, [transformedData, selectedFilter, searchTerm])


  // Sort data by date (most recent first)
  const sortedData = [...filteredData].sort((a, b) => {
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  })


  // Export to CSV
  const exportToCSV = () => {
    const headers = ["ID", "Patient Name", "Date", "Time", "Purpose", "Status", "Sitio", "Type"]
    const csvData = sortedData.map((record) => {
      const fullName = `${record.patient.lastName}, ${record.patient.firstName} ${record.patient.middleName}`
      const actualStatus = getAppointmentStatus(record.scheduledDate, record.status)
      return [
        record.id,
        fullName,
        record.scheduledDate,
        record.scheduledTime,
        record.purpose,
        actualStatus,
        record.sitio,
        record.type,
      ]
    })

    const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

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
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading follow-up visits...</span>
        </div>
      </LayoutWithBack>
    )
  }

  // Error state
  if (error) {
    return (
      <LayoutWithBack title="Health Schedule Records" description="Manage and view patient appointment schedules">
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
    <LayoutWithBack title="Health Schedule Records" description="Manage and view patient appointment schedules">
      <div className="w-full h-full flex flex-col">
        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex w-full gap-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                <Input
                  placeholder="Search schedules..."
                  className="pl-10 w-full bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <SelectLayout
                placeholder="Select status"
                label=""
                className="w-full md:w-[200px] bg-white text-black"
                options={filter}
                value={selectedFilter}
                onChange={setSelectedFilter}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <Button variant="default">New Schedule</Button>
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
          <div className="bg-white w-full overflow-x-auto">
            {transformedData.length === 0 && (
              <DataTable columns={columns} data={sortedData.slice(0, itemsPerPage)} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-gray-600 pl-0 sm:pl-4">
              Showing 1-{Math.min(itemsPerPage, sortedData.length)} of {sortedData.length} rows
            </p>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  )
}
