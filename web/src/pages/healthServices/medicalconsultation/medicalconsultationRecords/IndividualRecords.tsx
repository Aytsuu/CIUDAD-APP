import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import CardLayout from "@/components/ui/card/card-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { FileInput, Search, Trash, Eye, ChevronLeft } from "lucide-react";
import { Label } from "@radix-ui/react-dropdown-menu";

export default function InvMedicalConRecords() {
  type medConRecord = {
    id: number;

    bp: string;
    hr: string;
    rr: string;
    temp: string;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Table columns
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
      accessorKey: "bp",
      header: "BP",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="w-[90px]">{row.original.bp}</div>
        </div>
      ),
    },
    {
      accessorKey: "hr",
      header: "HR",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="w-[50px]">{row.original.hr}</div>
        </div>
      ),
    },
    {
      accessorKey: "rr",
      header: "RR",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="w-[50px]">{row.original.rr}</div>
        </div>
      ),
    },
    {
      accessorKey: "temp",
      header: "Temp.",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="w-[50px]">{row.original.temp}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({}) => (
        <div className="flex justify-center gap-2 ">
          <TooltipLayout
            trigger={
              <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                <Eye size={15} />
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
      bp: "123/45 mmhg",
      hr: "23 bpm",
      rr: "34 cpm",
      temp: "34 C",
    },
  ];

  // State management
  const [isPhilHealth, setIsPhilHealth] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<medConRecord[]>(sampleData);
  const [currentData, setCurrentData] = useState<medConRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Navigation handler with recordType
  const toMedicalForm = () => {
    const formPath = isPhilHealth ? "/PHmedicalForm" : "/nonPHmedicalForm";

    navigate(formPath, {
      state: {
        recordType: "existingPatient",
        formType: isPhilHealth ? "philhealth" : "nonPhilhealth",
      },
    });
  };

  useEffect(() => {
    const filtered = sampleData.filter((record) => {
      const searchText = `${record.id} 
    
        ${record.bp} 
        ${record.hr}`.toLowerCase();
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

  return (
    <>
      <div className="flex flex-col sm:flex-row  gap-4 mb-8">
        <Link to="/allMedRecords">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
          >
            <ChevronLeft />
          </Button>
        </Link>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
           Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
        <CardLayout
          title="Patient Information"
          titleClassName="text-blue text-xl"
          cardClassName="mb-8"
          content={
            <div className="w-full flex gap-3 flex-col mt-[-10px]">
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-20 ">
                {/* Name */}
                <div className="flex gap-2 ">
                  <Label className="font-medium whitespace-nowrap">Name:</Label>
                  <span className="truncate">
                    Caballes, Katrina Shin Dayuja
                  </span>
                </div>

                {/* Age */}
                <div className="flex gap-2">
                  <Label className="font-medium whitespace-nowrap">Age:</Label>
                  <span>10</span>
                </div>

                {/* Sex */}
                <div className="flex gap-2">
                  <Label className="font-medium whitespace-nowrap">Sex:</Label>
                  <span>Female</span>
                </div>
              </div>
              {/* Address */}
              <div className="flex gap-2 flex-grow sm:flex-grow-0">
                <Label className="font-medium whitespace-nowrap">
                  Address:
                </Label>
                <span className="truncate">
                  Bonsai Bolinawan, Carcar City, Cebu
                </span>
              </div>
            </div>
          }
        />
        <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
          <div className="w-full  flex justify-end">
            <Button onClick={toMedicalForm}>New record</Button>
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
    </>
  );
}
