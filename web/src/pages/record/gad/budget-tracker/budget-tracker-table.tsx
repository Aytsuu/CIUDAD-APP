import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import {
  Trash,
  Eye,
  Search,
  FileInput,
  ChevronLeft,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { DataTable } from "@/components/ui/table/data-table";
import GADAddEntryForm from "./budget-tracker-create-form";
import { Input } from "@/components/ui/input";
import GADEditEntryForm from "./budget-tracker-edit-form";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button";
import { getbudgettrackreq } from "./requestAPI/BTGetRequest";
import { delbudgettrackreq } from "./requestAPI/BTDelRequest";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type GADBudgetEntry = {
  gbud_num: number;
  gbud_date: string;
  gbud_particulars: string;
  gbud_type: string;
  gbud_amount: number;
  gbud_remaining_bal: number;
  gbud_add_notes: string;
};

function BudgetTracker() {
  const [data, setData] = useState<GADBudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [amountUsed, setAmountUsed] = useState<number>(0);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    try {    
      const result = await getbudgettrackreq();

      if (!Array.isArray(result)) {
        throw new Error("Invalid data format");
      }

      setData(result);

      const income = result
        .filter((entry) => entry.gbud_type === "Income")
        .reduce((sum, entry) => sum + (Number(entry.gbud_amount) || 0), 0);

      const expenses = result
        .filter((entry) => entry.gbud_type === "Expense")
        .reduce((sum, entry) => sum + (Number(entry.gbud_amount) || 0), 0);

      setTotalBalance(income - expenses);
      setAmountUsed(expenses);

    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load budget entries"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gbud_num: number) => {
    try {
      const toastId = toast.loading("Deleting entry...");
      await delbudgettrackreq(gbud_num.toString());
      
      toast.success("Entry deleted successfully", {
        id: toastId,
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete entry", {
        duration: 2000
      });
    }
  };

  const columns: ColumnDef<GADBudgetEntry>[] = [
    {
      accessorKey: "gbud_date",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown size={14} />
        </div>
      ),
      cell: ({ row }) => <div className="">{row.getValue("gbud_date")}</div>,
    },
    {
      accessorKey: "gbud_particulars",
      header: "Particulars",
    },
    {
      accessorKey: "gbud_type",
      header: "Type",
    },
    {
      accessorKey: "gbud_amount",
      header: "Amount",
      cell: ({ row }) => (
        <div>Php {Number(row.getValue("gbud_amount")).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "gbud_add_notes",
      header: "Additional Notes",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-1">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                    <Eye size={16} />
                  </div>
                }
                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                title="Entry Details"
                description="View detailed information about this budget entry."
                mainContent={
                  <div className="w-full h-full">
                    <GADEditEntryForm
                      gbud_num={row.original.gbud_num}
                      gbud_type={row.original.gbud_type}
                      gbud_amount={row.original.gbud_amount}
                      gbud_particulars={row.original.gbud_particulars}
                      gbud_add_notes={row.original.gbud_add_notes}
                      onSaveSuccess={() => {
                        fetchData();
                        toast.success("Entry updated successfully", {
                          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                          duration: 2000
                        });
                      }}
                    />
                  </div>
                }
              />
            }
            content="View"
          />
          <TooltipLayout
            trigger={
              <div className="flex items-center h-8">
                <ConfirmationModal
                  trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"><Trash size={16} /></div>}
                  title="Confirm Delete"
                  description="Are you sure you want to delete this entry?"
                  actionLabel="Confirm"
                  onClick={() => handleDelete(row.original.gbud_num)} 
                />                    
              </div>   
            }
            content="Delete"
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const filter = [
    { id: "All Entry Types", name: "All Entry Types" },
    { id: "Income", name: "Income" },
    { id: "Expense", name: "Expense" },
  ];

  const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

  // Filter data based on search query and selected filter
  const filteredData = data.filter((entry) => {
    const matchesFilter = selectedFilter === "All Entry Types" || 
                         entry.gbud_type === selectedFilter;
    
    const matchesSearch = `${entry.gbud_particulars} ${entry.gbud_type} ${entry.gbud_amount} ${entry.gbud_add_notes}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="bg-snow w-full h-full">
        <div className="flex flex-col gap-3 mb-4">
          <Skeleton className="h-10 w-1/4 mb-3 opacity-30" />
          <Skeleton className="h-6 w-1/3 opacity-30" />
        </div>
        <Skeleton className="h-6 w-full mb-6 opacity-30" />
        
        <div className="flex flex-row gap-5 mb-5">
          <Skeleton className="h-6 w-1/4 opacity-30" />
          <Skeleton className="h-6 w-1/4 opacity-30" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <Skeleton className="h-10 w-1/2 opacity-30" />
          <Skeleton className="h-10 w-1/4 opacity-30" />
        </div>
        
        <Skeleton className="h-64 w-full opacity-30" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-snow w-full h-full">
      <div className="flex flex-col gap-3 mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
          <Link to="/gad-budget-tracker-main">
            <div>
              <ChevronLeft />
            </div>
          </Link>
          <div className="rounded-full border-2 border-solid border-darkBlue2 p-2 flex items-center">
            <Calendar />
          </div>
          <div className="ml-2">{year}</div>
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view income and expense records for year {year}.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-6" />

      <div className="flex flex-row gap-5 mb-5">
        <div className="flex flex-row gap-2">
          <Label className="w-35 text-md">Amount Used:</Label>
          <Label className="text-red-500 text-md font-bold">
            Php {amountUsed.toFixed(2)}
          </Label>
        </div>
        <div className="flex flex-row gap-2">
          <Label className="w-35 text-md">Remaining Balance:</Label>
          <Label className="text-green-700 text-md font-bold">
            Php {totalBalance.toFixed(2)}
          </Label>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 w-full bg-white text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex flex-row gap-2 justify-center items-center">
            <Label>Filter: </Label>
            <SelectLayout
              className="bg-white"
              options={filter}
              placeholder="Filter"
              value={selectedFilter}
              label="Entry Type"
              onChange={(value) => {
                setSelectedFilter(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div>
          <DialogLayout
            trigger={
              <div className="bg-primary text-white rounded-md p-3 text-sm font-semibold drop-shadow-sm">
                + New Entry
              </div>
            }
            className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
            title="Add New Entry"
            description="Fill in the details for your entry."
            mainContent={
              <div className="w-full h-full">
                <GADAddEntryForm 
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    fetchData();
                  }}/>
              </div>
            }
          />
        </div>
      </div>

      <div className="bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input 
              type="number" 
              className="w-14 h-8" 
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
                setCurrentPage(1);
              }}
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

        <DataTable columns={columns} data={paginatedData} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
          {filteredData.length} rows
        </p>

        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            className=""
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
}

export default BudgetTracker;