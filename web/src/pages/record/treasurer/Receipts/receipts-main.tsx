
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import { Search } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useInvoiceQuery, type Receipt } from "./queries/receipt-getQueries";
// import { useInvoiceQuery, type Receipt } from "./queries/receipt-getQueries";

function ReceiptPage() {
  const { data: fetchedData = [], isLoading } = useInvoiceQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const columns: ColumnDef<Receipt>[] = [
    {
      accessorKey: "inv_serial_num",
      header: "Serial No.",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("inv_serial_num")}</div>
      )
    },
    {
      accessorKey: "inv_date",
      header: "Date Issued",
      cell: ({ row }) => {
        const dateValue = row.getValue("inv_date");
        if (!dateValue || typeof dateValue === 'object' && Object.keys(dateValue).length === 0) {
          return <div className="text-gray-400">No date</div>;
        }
        
        try {
          const date = new Date(dateValue as string | number | Date);
          if (isNaN(date.getTime())) {
            return <div className="text-gray-400">Invalid date</div>;
          }
          
          const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          return <div>{`${formattedDate} at ${formattedTime}`}</div>;
        } catch (error) {
          return <div className="text-gray-400">Error</div>;
        }
      },
    },
    {
      accessorKey: "inv_payor",
      header: "Payor",
    },    
    {
      accessorKey: "inv_nat_of_collection",
      header: "Nature of Collection",
    },
    {
      accessorKey: "inv_amount",
      header: "Amount",
    },
    {
      accessorKey: "inv_change",
      header: "Change",
      cell: ({ row }) => {
        const value = row.getValue("inv_change") as string | number | null | undefined;
        const num = value !== null && value !== undefined && value !== "" ? Number(value) : null;
        if (num === null || isNaN(num)) {
          return <div className="text-gray-400">—</div>;
        }
        return (
          <div className={`font-medium ${num >= 0 ? "text-green-700" : "text-red-600"}`}>
            ₱{num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      }
    },
  ];

  const filterOptions = [
    { id: "all", name: "All" },
    { id: "Barangay Certification", name: "Barangay Certification" },
    { id: "Business Permit", name: "Business Permit" },
  ];

  const [selectedFilterId, setSelectedFilterId] = useState("all");

  // Filter data based on selected filter and search query
  const filteredData = fetchedData.filter(item => {
    const matchesFilter = selectedFilterId === "all" || 
      item.inv_nat_of_collection?.toLowerCase() === selectedFilterId.toLowerCase();
    
    const matchesSearch = !searchQuery || 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesFilter && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Receipts
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          List of recorded receipt transactions and corresponding collection details.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-full bg-white" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          <SelectLayout
            className="w-full sm:w-[200px] bg-white"
            placeholder="Filter"
            options={filterOptions}
            value={selectedFilterId}
            onChange={(id) => {
              setSelectedFilterId(id);
              setCurrentPage(1); // Reset to first page when changing filter
            }}
          />
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="flex items-center gap-x-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input 
              type="number" 
              className="w-14 h-8" 
              min="1"
              value={pageSize}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value));
                setPageSize(value);
                setCurrentPage(1);
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <DataTable columns={columns} data={paginatedData} header={true} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
          {filteredData.length} rows
        </p>
        {filteredData.length > 0 && (
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

export default ReceiptPage;