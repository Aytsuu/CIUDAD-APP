import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { useInvoiceQuery, type Receipt } from "./queries/receipt-getQueries";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext";

function ReceiptPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilterId, setSelectedFilterId] = useState("all");

  // Use debounce for search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { showLoading, hideLoading } = useLoading();

  // Fetch data with backend filtering and pagination
  const { data: receiptData = { results: [], count: 0 }, isLoading } = useInvoiceQuery(
    currentPage,
    pageSize,
    debouncedSearchQuery, 
    selectedFilterId
  );

  console.log("RECEIPTT DATA", receiptData)

  // Extract data from paginated response
  const fetchedData = receiptData.results || [];
  const totalCount = receiptData.count || 0;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

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
      cell: ({ row }) => {
        const nature = row.getValue("inv_nat_of_collection") as string;
        
        // Define color schemes for different nature types
        const getColorScheme = (nature: string) => {
          const normalized = nature?.toLowerCase() || '';
          
          if (normalized.includes('employment')) {
            return 'bg-blue-100 text-blue-800 border-blue-200';
          } else if (normalized.includes('file action')) {
            return 'bg-green-100 text-green-800 border-green-200';
          } else if (normalized.includes('20')) {
            return 'bg-purple-100 text-purple-800 border-purple-200';
          } else if (normalized.includes('18')) {
            return 'bg-orange-100 text-orange-800 border-orange-200';
          } else if (normalized.includes('permit')) {
            return 'bg-teal-100 text-teal-800 border-teal-200';
          } else if (normalized.includes('barangay')) {
            return 'bg-indigo-100 text-indigo-800 border-indigo-200';
          } else {
            return 'bg-gray-100 text-gray-800 border-gray-200';
          }
        };
        
        return (
          <div className="flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorScheme(nature)}`}>
              {nature}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: "inv_amount",
      header: "Amount",
      cell: ({ row }) => {
        const value = row.getValue("inv_amount");
        return `₱ ${value}`;
      }
    },
    {
      accessorKey: "inv_change",
      header: "Change",
      cell: ({ row }) => `₱ ${(Number(row.getValue("inv_change")) || 0).toFixed(2)}`
    },
    {
      accessorKey: "inv_discount_reason",
      header: "Discount Reason",
      cell: ({ row }) => {
        const value = row.getValue("inv_discount_reason") as string;
        return value ? value : "None";
      }
    },
  ];

  // Dynamically generate filter options from inv_nat_of_collection
  const filterOptions = useMemo(() => {
    const uniqueNatures = Array.from(
      new Set(fetchedData.map(item => item.inv_nat_of_collection))
    ).filter(Boolean) as string[];

    return [
      { id: "all", name: "All" },
      ...uniqueNatures.map(nature => ({ id: nature, name: nature })),
    ];
  }, [fetchedData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleFilterChange = (id: string) => {
    setSelectedFilterId(id);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

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
              onChange={handleSearchChange}
            />
          </div>
          <SelectLayout
            className="w-full sm:w-[200px] bg-white"
            placeholder="Filter"
            options={filterOptions}
            value={selectedFilterId}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="flex items-center gap-x-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => {
                const newPageSize = Number.parseInt(value);
                setPageSize(newPageSize);
                setCurrentPage(1); // Reset to page 1 when changing page size
              }}
            >
              <SelectTrigger className="w-20 h-8 bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-2 text-gray-600">Loading receipts record...</span>
          </div>
        ) : (
          <DataTable columns={columns} data={fetchedData} header={true} />
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, totalCount)} of{" "}
          {totalCount} rows
        </p>
        {totalCount > 0 && (
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