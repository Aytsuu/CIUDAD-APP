import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import { Search, Trash, Eye, ArrowUpDown, FileInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { calculateAge } from "@/helpers/ageCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { useChildHealthRecords } from "../forms/queries/fetchQueries";
import { ChildHealthRecord } from "../forms/muti-step-form/types";
import { TableSkeleton } from "../../skeleton/table-skeleton";

export default function AllChildHealthRecords() {
  const { data: childHealthRecords, isLoading } = useChildHealthRecords();

  const formatChildHealthData = React.useCallback((): ChildHealthRecord[] => {
    if (!childHealthRecords) return [];

    return childHealthRecords.map((record: any) => {
      const childInfo = record.patrec_details?.pat_details?.personal_info || {};
      const motherInfo =
        record.patrec_details?.pat_details?.family_head_info?.family_heads
          ?.mother?.personal_info || {};
      const fatherInfo =
        record.patrec_details?.pat_details?.family_head_info?.family_heads
          ?.father?.personal_info || {};
      const addressInfo = record.patrec_details?.pat_details?.address || {};

      return {
        chrec_id: record.chrec_id,
        pat_id: record.patrec_details?.pat_details?.pat_id || "",
        fname: childInfo.per_fname || "",
        lname: childInfo.per_lname || "",
        mname: childInfo.per_mname || "",
        sex: childInfo.per_sex || "",
        age: calculateAge(childInfo.per_dob).toString(),
        dob: childInfo.per_dob || "",
        householdno:
          record.patrec_details?.pat_details?.households?.[0]?.hh_id || "",
        address:
          [
            addressInfo.add_street,
            addressInfo.add_barangay,
            addressInfo.add_city,
            addressInfo.add_province,
          ]
            .filter((part) => part && part.trim() !== "")
            .join(", ") || "No address Provided",
        sitio: addressInfo.add_sitio || "",
        landmarks: addressInfo.add_landmarks || "",
        pat_type: record.patrec_details?.pat_details?.pat_type || "",
        mother_fname: motherInfo.per_fname || "",
        mother_lname: motherInfo.per_lname || "",
        mother_mname: motherInfo.per_mname || "",
        mother_contact: motherInfo.per_contact || "",
        mother_occupation:
          motherInfo.per_occupation || record.mother_occupation || "",
        father_fname: fatherInfo.per_fname || "",
        father_lname: fatherInfo.per_lname || "",
        father_mname: fatherInfo.per_mname || "",
        father_contact: fatherInfo.per_contact || "",
        father_occupation:
          fatherInfo.per_occupation || record.father_occupation || "",
        family_no: record.family_no || "Not Provided",
        birth_weight: record.birth_weight || 0,
        birth_height: record.birth_height || 0,
        type_of_feeding: record.type_of_feeding || "Unknown",
        delivery_type: record.place_of_delivery_type || "",
        place_of_delivery_type: record.place_of_delivery_type || "",
        pod_location: record.pod_location || "",
        pod_location_details: record.pod_location_details || "",
        health_checkup_count: record.health_checkup_count || 0,
        birth_order: record.birth_order || "",
        tt_status: record.tt_status || "", // Optional field for TT status
      };
    });
  }, [childHealthRecords]);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<ChildHealthRecord[]>([]);
  const [currentData, setCurrentData] = useState<ChildHealthRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filterOptions = [
    { id: "all", name: "All Records" },

    { id: "resident", name: "Resident" },
    { id: "transient", name: "Transient" },
  ];

  useEffect(() => {
    const formattedData = formatChildHealthData();
    const filtered = formattedData.filter((item) => {
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "resident" &&
          item.pat_type.toLowerCase() === "resident") ||
        (selectedFilter === "transient" &&
          item.pat_type.toLowerCase() === "transient");

      const matchesSearch =
        `${item.fname} ${item.lname} ${item.mname} ` +
        `${item.mother_fname} ${item.mother_lname} ${item.mother_mname} ` +
        `${item.father_fname} ${item.father_lname} ${item.father_mname} ` +
        `${item.address} ${item.sitio} ${item.family_no} ${item.pat_type}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedFilter,
    pageSize,
    childHealthRecords,
    formatChildHealthData,
  ]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  const columns: ColumnDef<ChildHealthRecord>[] = [
    {
      accessorKey: "child",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Child <ArrowUpDown size={15} />
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
                {row.original.sex}, {row.original.age} old
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "mother",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mother <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const fullName =
          `${row.original.mother_lname}, ${row.original.mother_fname} ${row.original.mother_mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
            </div>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "father",
    //   header: ({ column }) => (
    //     <div
    //       className="flex w-full justify-center items-center gap-2 cursor-pointer"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Father <ArrowUpDown size={15} />
    //     </div>
    //   ),
    //   cell: ({ row }) => {
    //     const fullName = `${row.original.father_lname}, ${row.original.father_fname} ${row.original.father_mname}`.trim();
    //     return (
    //       <div className="flex justify-start min-w-[200px] px-2">
    //         <div className="flex flex-col w-full">
    //           <div className="font-medium truncate">{fullName}</div>
    //           <div className="text-sm text-darkGray truncate">
    //             Occupation: {row.original.father_occupation}
    //           </div>
    //         </div>
    //       </div>
    //     );
    //   },
    // },
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
        <div className="flex justify-start px-2">
          <div className="w-[250px] break-words">{row.original.address}</div>
        </div>
      ),
    },
    // {
    //   accessorKey: "sitio",
    //   header: "Sitio",
    //   cell: ({ row }) => (
    //     <div className="flex justify-center min-w-[120px] px-2">
    //       <div className="text-center w-full">{row.original.sitio}</div>
    //     </div>
    //   ),
    // },
    // {
    //   accessorKey: "landmarks",
    //   header: "Landmarks",
    //   cell: ({ row }) => (
    //     <div className="flex justify-center min-w-[120px] px-2">
    //       <div className="text-center w-full">{row.original.landmarks}</div>
    //     </div>
    //   ),
    // },
    {
      accessorKey: "family_no",
      header: "Family No.",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.family_no}</div>
        </div>
      ),
    },

    {
      accessorKey: "sitio",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sitio <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.sitio}</div>
        </div>
      ),
    },
    // {
    //   accessorKey: "delivery_type",
    //   header: "Delivery Type",
    //   cell: ({ row }) => (
    //     <div className="flex justify-center min-w-[120px] px-2">
    //       <div className="text-center w-full">{row.original.delivery_type}</div>
    //     </div>
    //   ),
    // },
    // {
    //   accessorKey: "feeding_type",
    //   header: "Feeding Type",
    //   cell: ({ row }) => (
    //     <div className="flex justify-center min-w-[100px] px-2">
    //       <div className="text-center w-full capitalize">{row.original.feeding_type.toLowerCase()}</div>
    //     </div>
    //   ),
    // },
    {
      accessorKey: "pat_type",
      header: "Patient Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full capitalize">
            {row.original.pat_type.toLowerCase()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <div className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-1.5 rounded cursor-pointer">
            <Link
              to={`/child-health-records`}
              state={{
                ChildHealthRecord: row.original,
                mode: "addnewchildhealthrecord",
              }}
            >
              View{" "}
            </Link>
          </div>
        </div>
      ),
    },
  ];

  // const navigate = useNavigate();
  // function toChildHealthForm() {
  //   navigate("/newAddChildHRForm", {
  //     state: { recordType: "nonexistingPatient" },
  //   });
  // }

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-col items-center">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Child Health Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view child's information
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
                placeholder="Search..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter records"
              label=""
              className="bg-white w-full sm:w-48"
              options={filterOptions}
              value={selectedFilter}
              onChange={(value) => setSelectedFilter(value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <Link
              to="/child-health-record/newchildhealthrecord"
              state={{
                params: {
                  mode: "newchildhealthrecord", // This is the key part
                },
              }}
            >
              <Button className="w-full sm:w-auto">New Record</Button>
            </Link>
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
                  <Button
                    variant="outline"
                    aria-label="Export data"
                    className="flex items-center gap-2"
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
            {isLoading ? (
              <TableSkeleton columns={columns} rowCount={5} />
            ) : (
              <DataTable columns={columns} data={currentData} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing{" "}
              {currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
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
    </>
  );
}
