import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState, useEffect } from "react";
import { Link } from "react-router";

type Record = {
  complaintNo: string;
  complainantName: string;
  complainantAddress: string;
  accusedName: string;
  accusedAddress: string;
  incidentDate: string;
  dateSubmitted: string;
};

const columns: ColumnDef<Record>[] = [
  {
    accessorKey: "complaintNo",
    header: "Complaint No.",
  },
  {
    accessorKey: "complainantName",
    header: "Complainant Name",
  },
  {
    accessorKey: "complainantAddress",
    header: "Complainant Address",
  },
  {
    accessorKey: "accusedName",
    header: "Accused Name",
  },
  {
    accessorKey: "accusedAddress",
    header: "Accused Address",
  },
  {
    accessorKey: "incidentDate",
    header: "Incident Date",
  },
  {
    accessorKey: "dateSubmitted",
    header: "Date Submitted",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link to="/blotter-view-record">
        <Button variant="outline">View</Button>
      </Link>
    ),
  },
];

// Sample data - expanded to test pagination
const generateSampleRecords = (): Record[] => {
  const sampleRecords: Record[] = [];
  
  // First, add the original record
  sampleRecords.push({
    complaintNo: "CMPL-001",
    complainantName: "John Doe",
    complainantAddress: "123 Main St, City",
    accusedName: "Jane Smith",
    accusedAddress: "456 Oak Ave, City",
    incidentDate: "2025-01-15",
    dateSubmitted: "2025-01-16",
  });
  
  // Generate additional sample records
  for (let i = 2; i <= 150; i++) {
    sampleRecords.push({
      complaintNo: `CMPL-${i.toString().padStart(3, '0')}`,
      complainantName: `Complainant ${i}`,
      complainantAddress: `Address ${i}, City`,
      accusedName: `Accused ${i}`,
      accusedAddress: `Accused Address ${i}`,
      incidentDate: `2025-01-${(i % 28) + 1}`,
      dateSubmitted: `2025-01-${(i % 28) + 2}`,
    });
  }
  
  return sampleRecords;
};

const allRecords: Record[] = generateSampleRecords();

export default function BlotterRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<Record[]>(allRecords);
  const [currentData, setCurrentData] = useState<Record[]>([]);
  const [totalPages, setTotalPages] = useState(Math.ceil(allRecords.length / pageSize));

  // Filter data based on search query
  useEffect(() => {
    const filtered = allRecords.filter(record => {
      const searchText = `${record.complaintNo} ${record.complainantName} ${record.complainantAddress} ${record.accusedName} ${record.accusedAddress} ${record.incidentDate} ${record.dateSubmitted}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
    
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, pageSize]);

  // Update data based on page and page size
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
    if (!isNaN(value) && value > 0) {
      setPageSize(value);
    } else {
      setPageSize(10); // Default to 10 if invalid input
    }    
  };

  // Handle page change from the PaginationLayout component
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col justify-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Resident Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view resident information
        </p>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Search and filters - Stacks on mobile */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1 bg-white">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-72"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <SelectLayout
            placeholder="Filter by"
            label=""
            className="bg-white"
            options={[
              { id: "1", name: "Date" },
              { id: "2", name: "Sitio" },
            ]}
            value=""
            onChange={() => {}}
          />
        </div>
        <Link to="/blotter-report">
          <Button className="bg-buttonBlue hover:bg-buttonBlue/90 text-white flex flex-row">
            <Plus />
            Report
          </Button>
        </Link>
      </div>

      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white flex p-3">
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
        </div>

        <div className="bg-white">
          <DataTable columns={columns} data={currentData} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        {/* Showing Rows Info */}
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
        </p>

        {/* Pagination */}
        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}