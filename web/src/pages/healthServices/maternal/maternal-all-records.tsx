import { useState } from "react";
import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import CardLayout from "@/components/ui/card/card-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { ArrowUpDown, Search, RefreshCw } from "lucide-react";
import { FileInput } from "lucide-react";
import WomanRoundedIcon from "@mui/icons-material/WomanRounded";
import PregnantWomanIcon from "@mui/icons-material/PregnantWoman";
import { TableSkeleton } from "../skeleton/table-skeleton";
import { useMaternalRecords } from "./queries/maternalFetchQueries";

export default function MaternalAllRecords() {
  interface maternalRecords {
    pat_id: string;
    age: number;

    personal_info: {
      per_fname: string;
      per_lname: string;
      per_mname: string;
      per_sex: string;
      per_dob?: string;
      ageTime: string;
    };

    address?: {
      add_street?: string;
      add_barangay?: string;
      add_city?: string;
      add_province?: string;
      add_external_sitio?: string;
      add_sitio?: string;
    };

    pat_type: "Transient" | "Resident";
    patrec_type?: string;
  }

  const {
    data: maternalRecordsData,
    isLoading,
    refetch,
  } = useMaternalRecords();
  const [isRefetching, setIsRefetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const transformData = (maternalData: any[]): maternalRecords[] => {
    if (!maternalData || !Array.isArray(maternalData)) return [];

    return maternalData.map((record) => {
      const personalInfo = record.personal_info;
      const dateOfBirth = personalInfo?.per_dob || "";

      let age = 0;
      const ageTime = "yrs";

      if (dateOfBirth) {
        age = Number.isNaN(calculateAge(dateOfBirth))
          ? 0
          : calculateAge(dateOfBirth);
      }

      const address = record.address;
      console.log("Pat type:", record.pat_type);

      return {
        pat_id: record.pat_id,
        age: age,
        personal_info: {
          per_fname: personalInfo?.per_fname || "",
          per_lname: personalInfo?.per_lname || "",
          per_mname: personalInfo?.per_mname || "",
          per_sex: personalInfo?.per_sex || "",
          ageTime: ageTime,
          per_dob: dateOfBirth || "",
        },
        address: {
          add_street: address?.add_street,
          add_barangay: address?.add_barangay,
          add_city: address?.add_city,
          add_province: address?.add_province,
          add_external_sitio: address?.add_external_sitio,
          add_sitio: address?.add_sitio || "N/A",
        },
        pat_type: record.pat_type || "N/A",
      };
    });
  };

  const columns: ColumnDef<maternalRecords>[] = [
    {
      accessorKey: "pat_id",
      header: "Patient ID",
      cell: ({ row }) => (
        <div className="flex w-full justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md text-center font-semibold">
            {row.original.pat_id}
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
        const patient = row.original.personal_info;
        const age = row.original.age || 0;
        const fullName =
          `${patient.per_lname}, ${patient.per_fname} ${patient.per_mname}`.trim();

        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {patient.per_sex}, {age} {patient.ageTime} old
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
      cell: ({ row }) => {
        const addressObj = row.original.address;
        const fullAddress = addressObj
          ? [
              addressObj.add_street,
              addressObj.add_barangay,
              addressObj.add_city,
              addressObj.add_province,
            ]
              .filter(Boolean)
              .join(", ") || "N/A"
          : "N/A";
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="w-full truncate">{fullAddress}</div>
          </div>
        );
      },
    },

    {
      accessorKey: "sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">
            {row.original.address?.add_sitio}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.pat_type}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <>
          <div className="flex justify-center gap-2 ">
            <TooltipLayout
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] border border-gray text-black px-4 py-2 rounded-lg cursor-pointer ">
                  <Link
                    to="/maternalindividualrecords"
                    state={{
                      params: {
                        patientData: {
                          pat_id: row.original.pat_id,
                          pat_type: row.original.pat_type,
                          age: row.original.age,
                          address: row.original.address,
                          personal_info: {
                            per_fname: row.original.personal_info.per_fname,
                            per_lname: row.original.personal_info.per_lname,
                            per_mname: row.original.personal_info.per_mname,
                            per_sex: row.original.personal_info.per_sex,
                            per_dob: row.original.personal_info.per_dob,
                            ageTime: row.original.personal_info.ageTime,
                          },
                          patrec_type: row.original.patrec_type,
                        },
                      },
                    }}
                  >
                    <p className="font-semibold">View</p>
                  </Link>
                </div>
              }
              content="View Record"
            />
          </div>
        </>
      ),
    },
  ];

  const data = transformData(maternalRecordsData);

  const filter = [
    { id: "All", name: "All" },
    { id: "Resident", name: "Resident" },
    { id: "Transient", name: "Transient" },
  ];
  const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

  const filteredData = data.filter((item) => {
    const matchesSearchTerm =
      searchTerm === "" ||
      `${item.personal_info.per_fname} ${item.personal_info.per_lname} ${item.personal_info.per_mname}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.pat_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "All" || item.pat_type === selectedFilter;

    return matchesSearchTerm && matchesFilter;
  });

  const totalRecords = filteredData.length;
  // const activePregnancies = data.filter((item) => item.pregnancy.status === "Active").length;

  const totalEntries = Math.ceil(filteredData.length / entriesCount);
  const maternalPagination = filteredData.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount
  );

  const handleRefetching = async () => {
    try {
      setIsRefetching(true);
      await refetch();
    } catch (error) {
      console.error("Error fetching records");
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <LayoutWithBack
      title="Maternal Health Records  "
      description="Manage and view mother's maternal information"
    >
      <div className="w-full h-full flex flex-col">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <CardLayout
              title="Total Maternal Patients"
              description="Total number of patients with maternal records"
              content={
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{totalRecords}</span>
                    <span className="text-xs text-muted-foreground">
                      Total patients
                    </span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <WomanRoundedIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              }
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />

            <CardLayout
              title="Active Pregnancies"
              description="Total patients with active pregnancies"
              content={
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{}</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{}% of total</span>
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <PregnantWomanIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              }
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />
          </div>
        </div>

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          {/* Search Input and Filter Dropdown */}
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div>
              <Button
                className="hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                variant="outline"
                onClick={handleRefetching}
                disabled={isRefetching || isLoading}
              >
                <RefreshCw
                  className={`${isRefetching ? "animate-spin" : ""}`}
                  size={20}
                />
              </Button>
            </div>
            <div className="flex w-full gap-x-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                  size={17}
                />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-full bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <SelectLayout
                placeholder="Select filter"
                label=""
                className="w-full md:w-[200px] bg-white text-black"
                options={filter}
                value={selectedFilter}
                onChange={setSelectedFilter}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">New Record</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link to="/prenatalform">Prenatal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/postpartumform">Postpartum</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/*  */}

        {/* Table Container */}
        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                defaultValue={entriesCount}
                onChange={(e) => setEntriesCount(Number(e.target.value))}
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
              <DataTable columns={columns} data={filteredData} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing 1-{Math.min(entriesCount || 10, filteredData.length)} of{" "}
              {filteredData.length} rows
            </p>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex justify-center">
              {maternalPagination.length > 0 && (
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalEntries}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
