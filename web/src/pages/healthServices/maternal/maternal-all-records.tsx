import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
// import { Link } from "react-router";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowUpDown, Search } from "lucide-react";
import { Link } from "react-router";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { FileInput } from "lucide-react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Label } from "@/components/ui/label";

export default function MaternalAllRecords() {
  type maternalRecords = {
    id: number;
    patient: {
      firstName: string;
      lastName: string;
      middleName: string;
      gender: string;
      age: number;
      ageTime: string;
    };
    address: string;
    sitio: "Logarta" | "Bolinawan";
    type: "Transient" | "Resident";
  };

  const columns: ColumnDef<maternalRecords>[] = [
    {
      accessorKey: "id",
      header: "Patient ID",
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
        const patient = row.original.patient;
        const fullName =
          `${patient.lastName}, ${patient.firstName} ${patient.middleName}`.trim();

        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {patient.gender}, {patient.age} {patient.ageTime} old
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
      cell: ({}) => (
        <>
          <div className="flex justify-center gap-2 ">
            <TooltipLayout 
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer ">  
                  <Link to="/maternalindividualrecords"><p className="font-semibold">View</p></Link>
                </div>
                } 
              content="View Record"/>
          </div>
        </>
      ),
    },
  ];

  const sampleData: maternalRecords[] = [
    {
      id: 1,
      patient: {
        lastName: "Caballes",
        firstName: "Katrina Shin",
        middleName: "Dayuja",
        gender: "Female",
        age: 20,
        ageTime: "yrs",
      },
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Transient",
    },

    {
      id: 2,
      patient: {
        lastName: "Siddiqui",
        firstName: "Katrina",
        middleName: "Sheen",
        gender: "Female",
        age: 25,
        ageTime: "yrs",
      },
      address: "Ka Juan Pajac Lapu-Lapu City",
      sitio: "Bolinawan",
      type: "Transient",
    },

    {
      id: 3,
      patient: {
        lastName: "Smith",
        firstName: "Loewe",
        middleName: "Dayuja",
        gender: "Female",
        age: 16,
        ageTime: "yrs",
      },
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Logarta",
      type: "Resident",
    },
  ];

  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [searchTerm, setSearchTerm] = useState("");
  const data = sampleData;

  const filter = [
    { id: "All", name: "All" },
    { id: "Resident", name: "Resident" },
    { id: "Transient", name: "Transient" },
  ];
  const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

  const filteredData =
    selectedFilter === "All"
      ? data
      : data.filter(
          (item) =>
            item.type === selectedFilter || item.sitio === selectedFilter
        );

  return (
    <LayoutWithBack 
      title="Maternal Health Records  "
      description="Manage and view mother's information"
    >
      <div className="w-full h-full flex flex-col">
        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          {/* Search Input and Filter Dropdown */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex w-full gap-x-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                  size={17}
                />
                <Input placeholder="Search..." className="pl-10 w-full bg-white" />
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
              <Input type="number" className="w-14 h-8" defaultValue="10" />
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
            {/* Table Placement */}
            <DataTable columns={columns} data={filteredData} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing 1-10 of 150 rows
            </p>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex justify-center">
              {/* <PaginationLayout className="" /> */}
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
