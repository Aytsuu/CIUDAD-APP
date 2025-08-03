import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowUpDown, Search, FileInput } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAge } from "@/helpers/ageCalculator";
import { api2 } from "@/api/api";
import { useState } from "react";
import { toast } from "sonner";

interface Address {
  add_street?: string;
  add_barangay?: string;
  add_city?: string;
  add_province?: string;
  sitio?: string;
  full_address?: string;
}

interface PersonalInfo {
  per_id?: number;
  per_lname?: string;
  per_fname?: string;
  per_mname?: string | null;
  per_suffix?: string | null;
  per_dob?: string;
  per_sex?: string;
  per_status?: string;
  per_edAttainment?: string;
  per_religion?: string;
  per_contact?: string;
}

export interface MedicineRequest {
  medreq_id?: number;
  address?: Address | null;
  personal_info?: PersonalInfo | null;
  requested_at?: string;
  fullfilled_at?: string | null;
  status?: string;
  rp_id?: string | null;
  pat_id?: string | null;
  total_quantity?: number;
}

const getMedicineRequests = async (): Promise<MedicineRequest[]> => {
  try {
    const [requestsResponse, itemsResponse] = await Promise.all([
      api2.get("/medicine/medicine-request/"),
      api2.get("/medicine/medicine-request-items/"),
    ]);

    const requests = requestsResponse.data || [];
    const itemsData = itemsResponse.data || [];

    const quantityMap = itemsData.reduce((acc: Record<number, number>, item: any) => {
      if (item?.medreq_id) {
        acc[item.medreq_id] = (acc[item.medreq_id] || 0) + (item.medreqitem_qty || 0);
      }
      return acc;
    }, {});

    return requests.map((request: any) => ({
      ...request,
      total_quantity: request.medreq_id ? quantityMap[request.medreq_id] || 0 : 0,
    }));
  } catch (error) {
    console.error("Error fetching medicine requests:", error);
    toast.error("Failed to load medicine requests");
    return [];
  }
};

const getPatientDisplayInfo = (request: MedicineRequest) => {
  const personalInfo = request.personal_info || {};
  const fullName = [
    personalInfo.per_lname,
    personalInfo.per_fname,
    personalInfo.per_mname
  ].filter(Boolean).join(' ').trim() || 'Unknown Patient';

  const dob = personalInfo.per_dob;
  const age = dob ? calculateAge(dob) : 'N/A';
  const sex = personalInfo.per_sex || 'N/A';
  const contact = personalInfo.per_contact || 'N/A';

  return { fullName, age, sex, contact };
};

export default function MedicineRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const { 
    data: medicineRequests = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<MedicineRequest[]>({
    queryKey: ["medicineRequests"],
    queryFn: getMedicineRequests,
    refetchOnMount: true,
    staleTime: 0,
  });

  const filteredData = React.useMemo(() => {
    return medicineRequests.filter((request) => {
      // Safely get searchable text
      const searchText = [
        request.medreq_id?.toString() || '',
        request.personal_info?.per_lname || '',
        request.personal_info?.per_fname || '',
        request.personal_info?.per_contact || ''
      ].join(' ').toLowerCase().trim();

      // Status filter
      const statusMatches =
        statusFilter === "all" ||
        (request.status || '').toLowerCase() === statusFilter.toLowerCase();

      return searchText.includes(searchQuery.toLowerCase()) && statusMatches;
    });
  }, [searchQuery, medicineRequests, statusFilter]);

  const totalPages = Math.max(Math.ceil(filteredData.length / pageSize), 1);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewDetails = (request: MedicineRequest) => {
    if (!request.medreq_id) {
      toast.warning("Cannot view details: Missing request ID");
      return;
    }
    navigate(`/medicine-request-detail`, {
      state: { request },
    });
  };

  const columns: ColumnDef<MedicineRequest>[] = [
    {
      accessorKey: "request_id",
      header: "Request ID",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">
            {row.original.medreq_id || 'N/A'}
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
        const { fullName, age, sex, contact } = getPatientDisplayInfo(row.original);
        const id = row.original.pat_id || row.original.rp_id;

        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {sex}, {age}
              </div>
              <div className="text-sm text-darkGray">{contact}</div>
              {id && (
                <div className="text-xs text-blue-600">
                  {row.original.pat_id ? `Patient ID: ${id}` : `Resident ID: ${id}`}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">
            {row.original.address?.full_address || "No address provided"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "requested_at",
      header: "Request Date",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[150px] px-2">
          <div className="text-center w-full">
            {row.original.requested_at 
              ? new Date(row.original.requested_at).toLocaleDateString() 
              : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_quantity",
      header: "Total Quantity",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full font-semibold text-blue-600">
            {row.original.total_quantity || 0}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.original.status || 'unknown').toLowerCase();
        const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
        
        return (
          <div className="flex justify-center min-w-[100px] px-2">
            <div
              className={`text-center w-full px-2 py-1 rounded-full text-xs ${
                status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : status === "fulfilled"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {statusDisplay}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewDetails(row.original)}
            disabled={!row.original.medreq_id}
            aria-label="View details"
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-lg mb-4">
          Failed to load medicine requests
        </div>
        <div className="flex gap-4">
          <Button onClick={() => refetch()}>
            Retry
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Medicine Requests
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view medicine requests
          </p>
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />

      <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search by ID, name, or contact..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          <SelectLayout
            placeholder="Filter status"
            label=""
            className="bg-white w-full sm:w-48"
            options={[
              { id: "all", name: "All Status" },
              { id: "pending", name: "Pending" },
              { id: "fulfilled", name: "Fulfilled" },
            ]}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1); // Reset to first page when filtering
            }}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto" asChild>
            <Link to="/medicine-request-form">New Request</Link>
          </Button>
        </div>
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-3 justify-start items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-[70px] h-8 flex items-center justify-center text-center"
              value={pageSize}
              onChange={(e) => {
                const value = Math.max(1, +e.target.value);
                setPageSize(value);
                setCurrentPage(1); // Reset to first page when changing page size
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div className="flex justify-end sm:justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  aria-label="Export data"
                  className="flex items-center gap-2"
                  disabled={filteredData.length === 0}
                >
                  <FileInput size={16} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {filteredData.length > 0 ? (
            <DataTable 
              columns={columns} 
              data={paginatedData}
            />
          ) : (
            <div className="w-full p-8 text-center">
              <div className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "No requests match your search criteria"
                  : "No medicine requests available"}
              </div>
              {(searchQuery || statusFilter !== "all") && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing{" "}
              {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              -
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} rows
            </p>

            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}