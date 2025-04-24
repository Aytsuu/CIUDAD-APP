import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import VaccinationForm from "./VaccinationForm";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowUpDown, Eye, Trash, Search, Plus, FileInput } from "lucide-react";
import { Link } from "react-router-dom";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getVaccinationRecords } from "./restful-api/GetVaccination"; // import { archiveVaccinationRecord } from "../REQUEST/archive"; // You'll need to create this
import { toast } from "sonner";
import { Toaster } from "sonner";
import { CircleCheck, Loader2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";

export type VaccinationRecord = {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: string;
  age: number;
  address: string;
  sitio: string;
  type: string;
  isArchived: boolean;
};

export default function AllVaccinationRecords() {
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [recordToArchive, setRecordToArchive] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [value, setValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch vaccination records from API
  const { data: vaccinationRecords, isLoading } = useQuery<VaccinationRecord[]>(
    {
      queryKey: ["vaccinationRecords"],
      queryFn: getVaccinationRecords,
      refetchOnMount: true,
      staleTime: 0,
    }
  );

  // Format the data for display
  const formatVaccinationData = React.useCallback((): VaccinationRecord[] => {
    if (!vaccinationRecords) return [];
    return vaccinationRecords.map((record: any) => ({
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      middleName: record.middleName,
      gender: record.gender,
      age: record.age,
      ageTime: record.ageTime,
      address: record.address,
      sitio: record.sitio,
      type: record.type,
      isArchived: record.isArchived,
    }));
  }, [vaccinationRecords]);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    return formatVaccinationData().filter((record) => {
      const searchText = `${record.id} 
        ${record.firstName} 
        ${record.lastName} 
        ${record.address} 
        ${record.sitio}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatVaccinationData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Archive confirmation handler
  const confirmArchiveRecord = async () => {
    // if (recordToArchive !== null) {
    //   setIsArchiveConfirmationOpen(false);
    //   const toastId = toast.loading(
    //     <div className="flex items-center gap-2">
    //       <Loader2 className="h-4 w-4 animate-spin" />
    //       Archiving vaccination record...
    //     </div>,
    //     { duration: Infinity }
    //   );
    //   try {
    //     await archiveVaccinationRecord(recordToArchive);
    //     queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
    //     toast.success("Vaccination record archived successfully", {
    //       id: toastId,
    //       icon: <CircleCheck size={20} className="text-green-500" />,
    //       duration: 2000,
    //     });
    //   } catch (error) {
    //     console.error("Failed to archive record:", error);
    //     toast.error("Failed to archive vaccination record", {
    //       id: toastId,
    //       duration: 5000,
    //     });
    //   } finally {
    //     setRecordToArchive(null);
    //   }
    // }
  };

  // Columns definition
  const columns: ColumnDef<VaccinationRecord>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
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
        const fullName =
          `${row.original.lastName}, ${row.original.firstName} ${row.original.middleName}`.trim();

        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {row.original.gender}, {row.original.age}
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
          <TooltipLayout
            trigger={
              <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                <Link to={`/invVaccinationRecord/${row.original.id}`}>
                  <Eye size={15} />
                </Link>
              </div>
            }
            content="View"
          />
          <TooltipLayout
            trigger={
              <div
                className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"
                onClick={() => {
                  setRecordToArchive(row.original.id);
                  setIsArchiveConfirmationOpen(true);
                }}
              >
                <Trash size={16} />
              </div>
            }
            content="Archive"
          />
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
    <>
      <Toaster position="top-right" />
      <div className="w-full h-full flex flex-col">
        {/* Header Section */}
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Vaccination Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
          {/* Search Input and Filter Dropdown */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex gap-x-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                  size={17}
                />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-72 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <SelectLayout
                placeholder="Filter records"
                label=""
                className="bg-white"
                options={[
                  { id: "1", name: "All Types" },
                  { id: "2", name: "Recent" },
                  { id: "3", name: "Archived" },
                ]}
                value=""
                onChange={() => {}}
              />
            </div>
          </div>

          {/* <div className="w-full sm:w-auto">
            <DialogLayout
              trigger={
                <Button
                  className="w-full sm:w-auto"
                >
                  New Record
                </Button>
              }
              className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] h-full sm:h-auto"
              title="Vaccination"
              mainContent={<VaccinationForm recordType={value} />}
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </div> */}

          <div>
            <Button className="w-full sm:w-auto">
              <Link to={`/vaccinationForm`}>New Record</Link>
            </Button>
          </div>
        </div>

        {/* Table Container */}
        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={pageSize}
                onChange={(e) => {
                  const value = +e.target.value;
                  setPageSize(value >= 1 ? value : 1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Export data">
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

      <ConfirmationDialog
        isOpen={isArchiveConfirmationOpen}
        onOpenChange={setIsArchiveConfirmationOpen}
        onConfirm={confirmArchiveRecord}
        title="Archive Vaccination Record"
        description="Are you sure you want to archive this record? It will be preserved in the system but removed from active records."
      />
    </>
  );
}
