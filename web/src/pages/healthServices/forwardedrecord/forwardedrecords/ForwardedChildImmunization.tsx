import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ArrowUpDown, FileInput, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { calculateAge } from "@/helpers/ageCalculator";
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { useLoading } from "@/context/LoadingContext";

export const getChildHealthHistoryRecordRecords = async (): Promise<any[]> => {
  try {
    const response = await api2.get("/child-health/child-immunization-status/");
    return response.data;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};

export default function ForwardedCHimmunizationTable() {
  const { data: immunizationRecords, isLoading } = useQuery<any[]>({
    queryKey: ["ChildHealthHistoryRecordRecords"],
    queryFn: getChildHealthHistoryRecordRecords,
    refetchOnMount: true,
    staleTime: 300000,
    gcTime: 600000
  });

  const { showLoading, hideLoading } = useLoading();
  const formatRecordForTable = useCallback((): any[] => {
    if (!immunizationRecords) return [];

    return immunizationRecords.map((record: any) => {
      const childInfo = record.chrec_details?.patrec_details?.pat_details?.personal_info || {};
      const motherInfo = record.chrec_details?.patrec_details?.pat_details?.family_head_info?.family_heads?.mother?.personal_info || {};
      const fatherInfo = record.chrec_details?.patrec_details?.pat_details?.family_head_info?.family_heads?.father?.personal_info || {};
      const addressInfo = record.chrec_details?.patrec_details?.pat_details?.address || {};

      return {
        record,
        chrec_id: record.chrec || "",
        pat_id: record.chrec_details?.patrec_details?.pat_details?.pat_id || "",
        fname: childInfo.per_fname || "",
        lname: childInfo.per_lname || "",
        mname: childInfo.per_mname || "",
        sex: childInfo.per_sex || "",
        age: childInfo.per_dob ? calculateAge(childInfo.per_dob).toString() : "",
        dob: childInfo.per_dob || "",
        householdno: record.chrec_details?.patrec_details?.pat_details?.households?.[0]?.hh_id || "",
        address: [addressInfo.add_sitio, addressInfo.add_street, addressInfo.add_barangay, addressInfo.add_city, addressInfo.add_province].filter((part) => part && part.trim() !== "").join(", ") || "No address Provided",
        sitio: addressInfo.add_sitio || "",
        landmarks: addressInfo.add_landmarks || "",
        pat_type: record.chrec_details?.patrec_details?.pat_details?.pat_type || "",
        mother_fname: motherInfo.per_fname || "",
        mother_lname: motherInfo.per_lname || "",
        mother_mname: motherInfo.per_mname || "",
        mother_contact: motherInfo.per_contact || "",
        mother_occupation: motherInfo.per_occupation || record.mother_occupation || "",
        father_fname: fatherInfo.per_fname || "",
        father_lname: fatherInfo.per_lname || "",
        father_mname: fatherInfo.per_mname || "",
        father_contact: fatherInfo.per_contact || "",
        father_occupation: fatherInfo.per_occupation || record.father_occupation || "",
        family_no: record.chrec_details?.family_no || "Not Provided",
        birth_weight: record.chrec_details?.birth_weight || 0,
        birth_height: record.chrec_details?.birth_height || 0,
        type_of_feeding: record.chrec_details?.type_of_feeding || "Unknown",
        delivery_type: record.chrec_details?.place_of_delivery_type || "",
        place_of_delivery_type: record.chrec_details?.place_of_delivery_type || "",
        pod_location: record.chrec_details?.pod_location || "",
        pod_location_details: record.chrec_details?.pod_location_details || "",
        health_checkup_count: record.chrec_details?.health_checkup_count || 0,
        birth_order: record.chrec_details?.birth_order || "",
        tt_status: record.chrec_details?.tt_status || "" // Optional field for TT status
      };
    });
  }, [immunizationRecords]);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!immunizationRecords) return;

    const formattedData = formatRecordForTable();
    const filtered = formattedData.filter((item) => {
      const matchesSearch =
        `${item.fname} ${item.lname} ${item.mname} ` +
        `${item.mother_fname} ${item.mother_lname} ${item.mother_mname} ` +
        `${item.father_fname} ${item.father_lname} ${item.father_mname} ` +
        `${item.address} ${item.sitio} ${item.family_no} ${item.pat_type}`.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [searchQuery, selectedFilter, pageSize, immunizationRecords, formatRecordForTable]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "child",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Child <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {row.original.sex}, {row.original.age}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "mother",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Mother <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.mother_lname}, ${row.original.mother_fname} ${row.original.mother_mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div className="w-[250px] break-words">{row.original.address}</div>
        </div>
      )
    },
    {
      accessorKey: "family_no",
      header: "Family No.",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.family_no || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "delivery_type",
      header: "Delivery Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full capitalize">{row.original.delivery_type?.toLowerCase() || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "pat_type",
      header: "Patient Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full capitalize">{row.original.pat_type?.toLowerCase() || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <div className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-1.5 rounded cursor-pointer">
            <Link
              to={`/child-immunization`}
              state={{
                ChildHealthRecord: row.original,
                mode: "immunization"
              }}
            >
              View
            </Link>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 ">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Forwarded Child Health Immunization Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view child immunization records</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
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
                <Button variant="outline" aria-label="Export data" className="flex items-center gap-2">
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
          {isLoading ? (
            <div className="w-full h-[100px] flex text-gray-500  items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">loading....</span>
            </div>
          ) : (
            <DataTable columns={columns} data={currentData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
          </p>

          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
