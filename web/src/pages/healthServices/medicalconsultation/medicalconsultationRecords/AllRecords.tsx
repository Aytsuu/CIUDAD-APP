import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { FileInput, Search, Trash, Eye } from "lucide-react";

export default function AllMedicalConRecords() {
  type medConRecord = {
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
    purok: string;
    type: string;
    date: Date;
    noOfRecords: number;
  };

  // Table columns configuration
  const columns: ColumnDef<medConRecord>[] = [
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
      header: "Patient",
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
      header: "Address",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.address}</div>
        </div>
      ),
    },

    {
      accessorKey: "purok",
      header: "Purok",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.purok}</div>
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
      accessorKey: "noOfRecords",
      header: "No. of records",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({}) => (
        <div className="flex justify-center gap-2 ">
          <TooltipLayout
            trigger={
              <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                <Link to="/invMedRecords">
                  <Eye size={15} />
                </Link>
              </div>
            }
            content="View"
          />
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                    <Trash size={16} />
                  </div>
                }
                title=""
                description=""
                className=""
                mainContent={<></>}
              />
            }
            content="Delete"
          />
        </div>
      ),
    },
  ];

  // Sample data
  const sampleData: medConRecord[] = [
    {
      id: 1,
      patient: {
        lastName: "Caballes",
        firstName: "Katrina Shin",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
      },
      address: "BOnsai Bolinawan Carcar City",
      purok: "Bolinawan",
      type: "transient",
      date: new Date("2024-03-15"),
      noOfRecords: 2,
    },
    {
      id: 2,
      patient: {
        lastName: "Doe",
        firstName: "John",
        middleName: "M",
        gender: "Male",
        age: 35,
        ageTime: "yr",
      },
      address: "123 Main Street",
      purok: "Central",
      type: "resident",
      date: new Date("2024-03-20"),
      noOfRecords: 1,
    },
  ];

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<medConRecord[]>(sampleData);
  const [currentData, setCurrentData] = useState<medConRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();


  const handleNewRecord = () => {
    // Assuming the type is passed as a prop or state
    let recordType = "nophilhealth"; // Ensure this matches the comparison below
    if (recordType === "philhealth") {
      navigate("/PHmedicalForm", { state: { recordType: "nonExistingPatient" } });
    }else { // Ensure this matches the value above
      navigate("/nonPHmedicalForm", { //medical consultation
        state: { recordType: "nonExistingPatient" },
      });
    }
  };

  useEffect(() => {
    const filtered = sampleData.filter((record) => {
      const searchText = `${record.id} 
        ${record.patient.firstName} 
        ${record.patient.lastName} 
        ${record.address} 
       `.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setPageSize(!isNaN(value) && value > 0 ? value : 10);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Medical Consultation Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
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
                onChange={handleSearchChange}
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

        <div className="w-full sm:w-auto">

        
            <Button onClick={handleNewRecord}>New Record</Button>
       
        </div>
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-8"
              value={pageSize}
              onChange={handlePageSizeChange}
              min="1"
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
          <DataTable columns={columns} data={currentData} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
          </p>

          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
