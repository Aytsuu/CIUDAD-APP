import React, { useState, useEffect } from "react"; // Add useEffect
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Search, FileInput } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { calculateAge } from "@/helpers/ageCalculator";
import { SelectLayout } from "@/components/ui/select/select-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api/api";
import { Link } from "react-router";

// Interfaces remain the same
interface Address {
  add_street?: string;
  sitio?: string;
  add_barangay?: string;
  add_city?: string;
  add_province?: string;
}

interface PersonalInfo {
  per_lname: string;
  per_fname: string;
  per_mname: string | null;
  per_sex: string;
  per_dob: string;
  per_addresses: Address[];
}

interface Resident {
  pat_id: string;
  rp_id: string | null;
  personal_info: PersonalInfo;
  vaccine_not_received: string;
}

interface VaccineData {
  [vaccine_name: string]: Resident[];
}

export interface UnvaccinatedResident {
  vaccine_name: string;
  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  dob: string;
  sitio: string;
  address: string;
  pat_type: string;
}

export const getUnvaccinatedResidents = async (): Promise<VaccineData> => {
  try {
    const response = await api.get("/vaccination/residents/unvaccinated/");
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch unvaccinated residents:", error);
    throw error;
  }
};

export default function AllVaccinationRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: unvaccinated, isLoading } = useQuery<VaccineData>({
    queryKey: ["unvaccinatedResidents"],
    queryFn: getUnvaccinatedResidents,
    refetchOnMount: true,
    staleTime: 0,
  });

  const formattedData: UnvaccinatedResident[] = React.useMemo(() => {
    if (!unvaccinated || typeof unvaccinated !== "object") {
      return [];
    }

    return Object.entries(unvaccinated).flatMap(([vaccine_name, residents]) =>
      Array.isArray(residents)
        ? residents.map((resident: Resident) => {
            const personalInfo = resident.personal_info || {};
            const addresses = personalInfo.per_addresses || [];
            const primaryAddress = addresses[0] || {};

            return {
              vaccine_name: resident.vaccine_not_received || "Unknown",
              pat_id: resident.pat_id || "N/A",
              fname: personalInfo.per_fname || "N/A",
              lname: personalInfo.per_lname || "N/A",
              mname: personalInfo.per_mname || "N/A",
              sex: personalInfo.per_sex || "N/A",
              dob: personalInfo.per_dob || "N/A",
              age: personalInfo.per_dob
                ? calculateAge(personalInfo.per_dob).toString()
                : "N/A",
              sitio: primaryAddress.sitio || "N/A",
              address:
                [
                  primaryAddress.add_street,
                  primaryAddress.sitio,
                  primaryAddress.add_barangay,
                  primaryAddress.add_city,
                  primaryAddress.add_province,
                ]
                  .filter(Boolean)
                  .join(", ") || "N/A",
              pat_type: "Resident",
            };
          })
        : []
    );
  }, [unvaccinated]);

  const filteredData = React.useMemo(() => {
    return formattedData.filter((record) => {
      const searchText =
        `${record.pat_id} ${record.lname} ${record.fname} ${record.sitio} ${record.vaccine_name}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formattedData]);

  // Reset currentPage to 1 when searchQuery changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Optional: Navigate to the page containing the first matching row
  // useEffect(() => {
  //   if (searchQuery && filteredData.length > 0) {
  //     const firstMatchIndex = formattedData.findIndex((record) => {
  //       const searchText =
  //         `${record.pat_id} ${record.lname} ${record.fname} ${record.sitio} ${record.vaccine_name}`.toLowerCase();
  //       return searchText.includes(searchQuery.toLowerCase());
  //     });
  //     if (firstMatchIndex !== -1) {
  //       const targetPage = Math.floor(firstMatchIndex / pageSize) + 1;
  //       setCurrentPage(targetPage);
  //     }
  //   }
  // }, [searchQuery, formattedData, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<UnvaccinatedResident>[] = [
    {
      accessorKey: "vaccine_name",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vaccine Not Received <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[160px] px-2">
          <div className="text-center w-full text-red-600 font-medium">
            {row.original.vaccine_name}
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
        const fullName =
          `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
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
      },
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.address}</div>
        </div>
      ),
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
      accessorKey: "pat_type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.pat_type}</div>
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
      <div className="w-full flex gap-2 mr-2 mb-5">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Button className="w-full sm:w-auto">
            <Link to={`/patNewVacRecForm`}>New Record</Link>
          </Button>
        </div>
      </div>

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
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
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
