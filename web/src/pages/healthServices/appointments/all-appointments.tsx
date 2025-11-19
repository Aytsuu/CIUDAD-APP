"use client";

import { Link } from "react-router";
import { useState, useMemo, useEffect, useCallback } from "react"
import { ArrowUpDown, Search, AlertCircle, FileText } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { DataTable } from "@/components/ui/table/data-table"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { SelectLayout } from "@/components/ui/select/select-layout"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { useLoading } from "@/context/LoadingContext"
import { ExportButton } from "@/components/ui/export";

import { getAgeInUnit } from "@/helpers/ageCalculator"

import ScheduleTab from "./appointments-tab";

import { useAllFollowUpVisits } from "../../record/health/patientsRecord/queries/fetch"
import { useDebounce } from "@/hooks/use-debounce";
import { capitalize } from "@/helpers/capitalize";

import TableLoading from "../../../components/ui/table-loading";

// main component           
export default function ScheduleRecords() {
  type ScheduleRecord = {
    id: number;
    patient: {
      firstName: string;
      lastName: string;
      middleName: string;
      gender: string;
      age: number;
      ageTime: string;
      patientId: string;
    };
    scheduledDate: string;
    purpose: string;
    status: "Pending" | "Completed" | "Missed" | "Cancelled";
    sitio: string;
    type: "Transient" | "Resident";
    patrecType: string;
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [timeFrame, setTimeFrame] = useState("all");
  const [isTimeFrameLoading, setIsTimeFrameLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300); // debounce the search term to avoid requests on every keystroke
  const { showLoading, hideLoading } = useLoading(); // for loading state

  // fetch data
  const {
    data: paginatedData,
    isLoading,
    error,  
    refetch
  } = useAllFollowUpVisits(
    page,
    pageSize,
    debouncedSearchTerm,
    selectedFilter,
    timeFrame
  )

  

  // age unit handler
  function getBestAgeUnit(dob: string): { value: number; unit: string } {
    const years = getAgeInUnit(dob, "years");
    if (years > 0) return { value: years, unit: years === 1 ? "yr" : "yrs" };

    const months = getAgeInUnit(dob, "months");
    if (months > 0) return { value: months, unit: months === 1 ? "mo" : "mos" };

    const weeks = getAgeInUnit(dob, "weeks");
    if (weeks > 0) return { value: weeks, unit: weeks === 1 ? "wk" : "wks" };

    const days = getAgeInUnit(dob, "days");
    return { value: days, unit: days === 1 ? "day" : "days" };
  }

  // Transform the Django API data to match our ScheduleRecord type
  const transformedData = useMemo((): ScheduleRecord[] => {
    if (!paginatedData?.results) return [];

    return paginatedData.results
      .map((visit: any) => {
        try {
          const patientDetails = visit.patient_details;
          if (!patientDetails) {
            console.warn("No patient details found for visit:", visit);
            return null;
          }

        const patientInfo = patientDetails.patient_info || patientDetails.personal_info || {}
        const { value: ageInfo, unit: ageUnit } = getBestAgeUnit(patientInfo.per_dob || "")
        const address = patientDetails.address || {}


          const formatDate = (dateStr: string) => {
            if (!dateStr) return new Date().toISOString().split("T")[0];
            try {
              return new Date(dateStr).toISOString().split("T")[0];
            } catch {
              return dateStr;
            }
          };

        const record: ScheduleRecord = {
          id: visit.followv_id || visit.id || 0,
          patient: {
            firstName: patientInfo.per_fname || "",
            lastName: patientInfo.per_lname || "",
            middleName: patientInfo.per_mname || "",
            gender: patientInfo.per_sex || "",
            age: ageInfo,
            ageTime: ageUnit,
            patientId: patientDetails.pat_id || patientInfo.pat_id || "",
          },
          scheduledDate: formatDate(visit.followv_date || visit.date),
          purpose: visit.followv_description || visit.description || visit.purpose || "Follow-up Visit",
          status: visit.followv_status || "Pending",
          sitio: address.add_sitio || "",
          type: patientDetails.pat_type || "",
          patrecType: patientDetails.patrec_type || "",
        }

        return record
      } catch (error) {
        console.error("Error transforming visit data:", error, visit)
        return null
      }
    }).filter(Boolean) // Remove null values
  }, [paginatedData])

  const totalPages = Math.ceil((paginatedData?.count || 0) / pageSize)

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search)
    setPage(1)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    setPage(1) 
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) 
  }

const handleTimeFrameChange = (timeFrame: string) => {
    setIsTimeFrameLoading(true);
    setTimeFrame(timeFrame)
    setPage(1)
  }

  // determine if missed (stable via useCallback)
  const getAppointmentStatus = useCallback((scheduledDate: string, currentStatus: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(scheduledDate);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today && currentStatus === "Pending") {
      return "Missed";
    }
    return currentStatus;
  }, []);

  const columns: ColumnDef<ScheduleRecord>[] = useMemo(() => [
    {
      accessorKey: "no",
      size: 80,
      header: "No.",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="flex justify-center items-center gap-2 cursor-pointer bg-blue-100 text-blue-800 px-3 py-1 rounded-md w-8 text-center font-semibold">
            {row.index + 1}
          </div>
        </div>
      )
    },
    {
      accessorKey: "patient",
      size: 250,
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const patient = row.original.patient;
        const fullName = `${patient.lastName}, ${patient.firstName} ${patient.middleName}`.trim();

        return (
          <div className="flex justify-start">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-gray-600">
                {patient.gender}, {patient.age} {patient.ageTime} old
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "scheduledDate",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Scheduled Date <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="text-center">
            <div className="font-medium">{row.original.scheduledDate}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "purpose",
      size: 200,
      header: "Purpose",
      cell: ({ row }) => (
        <div className="flex justify-center px-2">
          <div className="w-full break-words">{capitalize(row.original.purpose)}</div>
        </div>
      )
    },
    {
      accessorKey: "status",
      // size: 80,
      header: "Status",
      cell: ({ row }) => {
        const actualStatus = getAppointmentStatus(row.original.scheduledDate, row.original.status);
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800 text-transform: capitalize",
          completed: "bg-green-100 text-green-800 text-transform: capitalize",
          missed: "bg-red-100 text-red-800 text-transform: capitalize",
          cancelled: "bg-gray-100 text-gray-800 text-transform: capitalize",
        }

        return (
          <div className="flex justify-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[actualStatus as keyof typeof statusColors]}`}>{actualStatus}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "sitio",
      // size: 80,
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px]">
          <div className="text-center w-full">{row.original.sitio}</div>
        </div>
      )
    },
    {
      accessorKey: "type",
      // size: 80,
      header: "Type",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="w-full">{row.original.type}</div>
        </div>
      )
    }, 
    // {
    //   accessorKey: "action",
    //   size: 100,
    //   header: "Action",
    //   cell: ({ row }) => (
    //     <div className="flex justify-center">
    //       <TooltipProvider> 
    //         <TooltipLayout
    //           trigger={
    //             <div
    //               className="bg-white hover:bg-gray-50 text-black px-4 py- rounded cursor-pointer"
    //               onClick={() => {
    //                 console.log("View patient:", row.original.patient.patientId)
    //               }}
    //             >
    //               <ViewButton onClick={() => {}} />
    //             </div>
    //           }
    //           content="View Schedule Details"
    //         />
    //       </TooltipProvider>
    //     </div>
    //   )
    // }
  ], [getAppointmentStatus]);

  const filter = [
    { id: "All", name: "All" },
    { id: "pending", name: "Pending" },
    { id: "completed", name: "Completed" },
    { id: "missed", name: "Missed" },
    { id: "cancelled", name: "Cancelled" },
  ]

  // export columns
  const exportColumns = [
    { 
      key: "patient", 
      header: "Patient Name",
      format: (row: ScheduleRecord) => 
        `${row.patient.firstName}, ${row.patient.lastName} ${row.patient.middleName}`.trim()
    },
    { 
      key: "age", 
      header: "Age",
      format: (row: ScheduleRecord) => `${row.patient.age} ${row.patient.ageTime}`
    },
    { 
      key: "sex", 
      header: "Sex",
      format: (row: ScheduleRecord) => row.patient.gender
    },
    { 
      key: "scheduledDate", 
      header: "Scheduled Date",
      format: (row: ScheduleRecord) => row.scheduledDate || "Not Provided"
    },
    { 
      key: "sitio", 
      header: "Sitio",
      format: (row: ScheduleRecord) => row.sitio || "Not Provided"
    },
    { key: "pat_type", header: "Type", format: (row: ScheduleRecord) => row.type || "Not Provided" },
  ];

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Clear the temporary timeframe loading flag when query completes
  useEffect(() => {
    if (!isLoading) {
      setIsTimeFrameLoading(false);
    }
  }, [isLoading, paginatedData]);

  // Error state
  if (error) {
    return (
      <MainLayoutComponent title="Scheduled Appointments" description="View patient appointment schedules">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-2 text-lg font-semibold">Error loading data</p>
          <p className="text-sm text-gray-600 mb-4">{error?.message || "Failed to fetch follow-up visits"}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </MainLayoutComponent>
    );
  }

  const showLoadingState = isLoading || isTimeFrameLoading;

  return (
    <MainLayoutComponent title="Follow-up Visits" description="View patient appointment schedules">
      <div className="w-full h-full bg-white/40 p-2 flex flex-col">
        <div className="flex justify-between mb-4 w-full">
          <div>
            <ScheduleTab onTimeFrameChange={handleTimeFrameChange} />
          </div>

          {/* defaulters tracking */}
          <div className="flex justify-center items-center">
            <Link to="/health-appointments/defaulters-tracking">
              <Button variant="link">Defaulters Tracking</Button>
            </Link>
            
          </div>
        </div> 
        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex w-full gap-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                <Input placeholder="Search schedules..." className="pl-10 w-full bg-white" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
              </div>
              <SelectLayout 
                placeholder="Select status" 
                className="w-full md:w-[200px] bg-white text-black" 
                options={filter} 
                value={selectedFilter} 
                onChange={handleFilterChange} 
              />
            </div>
          </div>
        </div>

        <div className="h-full w-full rounded-md bg-white">
          <div className="w-full h-auto sm:h-16 bg- flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input type="number" className="w-14 h-8" value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))} />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <ExportButton
                data={transformedData}
                filename={`follow-up-visits-${new Date().toISOString().split("T")[0]}`}
                columns={exportColumns}
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            {showLoadingState ? (
             <TableLoading/>
            ) : transformedData.length > 0 ? (
              <DataTable columns={columns} data={transformedData} />
            ) : (
              <div className="flex justify-center h-48">
                <p className="flex text-gray-500 items-center"> 
                  <FileText size={28}/> 
                  No follow-up visits found for {timeFrame === "today" ? "today" : timeFrame === "thisWeek" ? "this week" : "this month"}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col border-t sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-gray-600 pl-0 sm:pl-4">
              Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, paginatedData?.count) || 0} of {paginatedData?.count} rows
            </p>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex justify-center">{totalPages > 1 && <PaginationLayout currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}</div>
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}
