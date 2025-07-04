import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowUpDown, Search, FileInput } from "lucide-react";
import { Link } from "react-router-dom";
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

export interface MedicineRequest {
  medreq_id: number;
  address: {
    add_street: string;
    add_barangay: string;
    add_city: string;
    add_province: string;
    sitio: string;
    full_address: string;
  } | null;
  personal_info: {
    per_id: number;
    per_lname: string;
    per_fname: string;
    per_mname: string | null;
    per_suffix: string | null;
    per_dob: string;
    per_sex: string;
    per_status: string;
    per_edAttainment: string;
    per_religion: string;
    per_contact: string;
  };
  requested_at: string;
  fullfilled_at: string | null;
  status: string;
  rp_id: string | null;
  pat_id: string | null;
  total_quantity: number; // Changed from items_count to total_quantity
}

// API functions
const getMedicineRequests = async (): Promise<MedicineRequest[]> => {
  const response = await api2.get("/medicine/medicine-request/");
  const requests = response.data;

  // Get items for each request to calculate total quantities
  const itemsResponse = await api2.get("/medicine/medicine-request-items/");
  const itemsData = itemsResponse.data;

  // Calculate total quantity per request (sum of all item quantities)
  const quantityMap = itemsData.reduce(
    (acc: Record<number, number>, item: any) => {
      const requestId = item.medreq_id;
      acc[requestId] = (acc[requestId] || 0) + (item.medreqitem_qty || 0);
      return acc;
    },
    {}
  );

  // Add total_quantity to each request
  return requests.map((request: any) => ({
    ...request,
    total_quantity: quantityMap[request.medreq_id] || 0,
  }));
};

export default function MedicineRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: medicineRequests, isLoading } = useQuery<MedicineRequest[]>({
    queryKey: ["medicineRequests"],
    queryFn: getMedicineRequests,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Filter data based on search query and status
  const filteredData = React.useMemo(() => {
    if (!medicineRequests) return [];

    return medicineRequests.filter((request) => {
      const searchText = `${request.medreq_id} 
        ${request.personal_info.per_lname} 
        ${request.personal_info.per_fname} 
        ${request.personal_info.per_contact}`.toLowerCase();

      const statusMatches =
        statusFilter === "all" ||
        request.status.toLowerCase() === statusFilter.toLowerCase();

      return searchText.includes(searchQuery.toLowerCase()) && statusMatches;
    });
  }, [searchQuery, medicineRequests, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<MedicineRequest>[] = [
    {
      accessorKey: "request_id",
      header: "Request ID",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.medreq_id}</div>
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
        const fullName = `${row.original.personal_info.per_lname}, ${
          row.original.personal_info.per_fname
        } ${row.original.personal_info.per_mname || ""}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {row.original.personal_info.per_sex},{" "}
                {calculateAge(row.original.personal_info.per_dob)}
              </div>
              <div className="text-sm text-darkGray">
                {row.original.personal_info.per_contact}
              </div>
              {/* Show Patient ID or Resident ID */}
              <div className="text-xs text-blue-600">
                {row.original.pat_id ? `Patient ID: ${row.original.pat_id}` : 
                 row.original.rp_id ? `Resident ID: ${row.original.rp_id}` : 
                 "No ID"}
              </div>
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
            {row.original.address
              ? row.original.address.full_address
              : "No address provided"}
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
            {new Date(row.original.requested_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_quantity", // Changed from items_count
      header: "Total Quantity",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full font-semibold text-blue-600">
            {row.original.total_quantity}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div
            className={`text-center w-full px-2 py-1 rounded-full text-xs ${
              row.original.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : row.original.status === "fulfilled"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.status}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm">
            <Link
              to={`/medicine-request-detail`}
              state={{ request: row.original }}
            >
              View
            </Link>
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

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-col items-center ">
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
            onChange={(value) => setStatusFilter(value)}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Link to={`/medicine-requests/new`}>New Request</Link>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex  sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-3 justify-start items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-[70px] h-8 flex items-center justify-center text-center"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
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
                >
                  <FileInput />
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
          <DataTable columns={columns} data={paginatedData} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 ">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
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
        </div>
      </div>
  );
}