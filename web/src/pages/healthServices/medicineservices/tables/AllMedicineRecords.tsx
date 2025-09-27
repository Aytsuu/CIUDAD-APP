import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowUpDown, Search, FileInput, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery } from "@tanstack/react-query";
import { calculateAge } from "@/helpers/ageCalculator";
import { getMedicineRecords } from "../restful-api/getAPI";
// import { useNavigate } from "react-router";
import { MedicineRecord } from "../types";

export default function AllMedicineRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("all");
  // const queryClient = useQueryClient();
  // const navigate = useNavigate();

  // Fetch medicine records from API
  const { data: medicineRecords, isLoading } = useQuery<MedicineRecord[]>({
    queryKey: ["medicineRecords"],
    queryFn: getMedicineRecords,
    refetchOnMount: true,
    staleTime: 0
  });

  const formatMedicineData = React.useCallback((): MedicineRecord[] => {
    if (!medicineRecords) return [];

    return medicineRecords.map((record: any) => {
      const info = record.patient_details.personal_info || {};
      const address = record.patient_details.address || {};

      // Construct address string - returns empty string if no address components
      const addressString =
        [address.add_street, address.add_barangay, address.add_city, address.add_province]
          .filter((part) => part && part.trim().length > 0) // Remove empty parts
          .join(", ") || ""; // Join with commas or return empty string

      return {
        pat_id: record.pat_id,
        fname: info.per_fname || "",
        lname: info.per_lname || "",
        mname: info.per_mname || "",
        sex: info.per_sex || "",
        age: calculateAge(info.per_dob).toString(),
        dob: info.per_dob || "",
        householdno: record.patient_details?.households?.[0]?.hh_id || "",
        street: address.add_street || "",
        sitio: address.add_sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: record.patient_details.pat_type || "",
        medicine_count: record.medicine_count || 0,
        address: addressString 
      };
    });
  }, [medicineRecords]);

  // Filter data based on search query and patient type
  const filteredData = React.useMemo(() => {
    return formatMedicineData().filter((record) => {
      const searchText = `${record.pat_id} 
        ${record.lname} 
        ${record.fname} 
        ${record.sitio}`.toLowerCase();

      const typeMatches = patientTypeFilter === "all" || (record.pat_type ?? "").toLowerCase() === patientTypeFilter.toLowerCase();

      return searchText.includes(searchQuery.toLowerCase()) && typeMatches;
    });
  }, [searchQuery, formatMedicineData, patientTypeFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: ColumnDef<MedicineRecord>[] = [
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient <ArrowUpDown size={15} />
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
      accessorKey: "address",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.address ? row.original.address : "No address provided"}</div>
        </div>
      )
    },
    {
      accessorKey: "sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.sitio || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.pat_type}</div>
        </div>
      )
    },
    {
      accessorKey: "medicine_count",
      header: "No of Records",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.medicine_count}</div>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
            <Link
              to="/IndivMedicineRecord"
              state={{
                params: {
                  patientData: {
                    pat_id: row.original.pat_id,
                    pat_type: row.original.pat_type,
                    age: row.original.age,
                    addressFull: row.original.address || "No address provided",
                    address: {
                      add_street: row.original.street,
                      add_barangay: row.original.barangay,
                      add_city: row.original.city,
                      add_province: row.original.province,
                      add_sitio: row.original.sitio
                    },
                    households: [{ hh_id: row.original.householdno }],
                    personal_info: {
                      per_fname: row.original.fname,
                      per_mname: row.original.mname,
                      per_lname: row.original.lname,
                      per_dob: row.original.dob,
                      per_sex: row.original.sex
                    }
                  }
                }
              }}
            >
              View
            </Link>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-col items-center ">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Medicine Records</h1>
            <p className="text-xs sm:text-sm text-darkGray">Manage and view patient's medicine records</p>
          </div>
        </div>
        <hr className="border-gray-300 mb-4" />

        <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
              <Input placeholder="Search..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <SelectLayout
              placeholder="Filter records"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All Types" },
                { id: "resident", name: "Resident" },
                { id: "transient", name: "Transient" }
              ]}
              value={patientTypeFilter}
              onChange={(value) => setPatientTypeFilter(value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Link
                to="/medicine-request-form"
                state={{
                  params: {
                    mode: "fromallrecordtable"
                  }
                }}
              >
                New Request
              </Link>{" "}
            </Button>
          </div>
        </div>

        {/* Table Container */}
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

          <div className="bg-white w-full overflow-x-auto">{isLoading ? <Loader2 className="animate-spin text-gray-500 w-6 h-6 mx-auto my-4" /> : <DataTable columns={columns} data={paginatedData} />}</div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 ">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
            </p>

            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}