import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Eye, Search, FileInput, ChevronLeft, Calendar, ArrowUpDown } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { DataTable } from "@/components/ui/table/data-table";
import GADAddEntryForm from "./budget-tracker-create-form";
import { Input } from "@/components/ui/input";
import GADEditEntryForm from "./budget-tracker-edit-form";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { type GADBudgetEntry, useDeleteGADBudget } from "./queries/BTDeleteQueries";
import { useGetGADBudgets } from "./queries/BTFetchQueries";

function BudgetTracker() {
  const [budget_item, setTotalBalance] = useState<number>(0);
  const [year] = useState(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Entry Types");

  const { 
    data: budgetEntries = [], 
    isLoading, 
    error,
    refetch 
  } = useGetGADBudgets();

  const { mutate: deleteEntry } = useDeleteGADBudget();
  const handleDelete = async (gbud_num: number) => {
    deleteEntry(gbud_num);
  };

  useEffect(() => {
    if (budgetEntries.length > 0) {
      const income = budgetEntries
        .filter((entry) => entry.gbud_type === "Income")
        .reduce((sum, entry) => sum + (Number(entry.gbud_amount) || 0), 0);

      const expenses = budgetEntries
        .filter((entry) => entry.gbud_type === "Expense")
        .reduce((sum, entry) => sum + (Number(entry.gbud_amount) || 0), 0);

      setTotalBalance(income - expenses);
      // setAmountUsed(expenses);
    }
  }, [budgetEntries]);

  const filterOptions = [
    { id: "All Entry Types", name: "All Entry Types" },
    { id: "Income", name: "Income" },
    { id: "Expense", name: "Expense" },
  ];

  // Filter data based on search query and selected filter
  const filteredData = budgetEntries.filter((entry) => {
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

  const columns: ColumnDef<GADBudgetEntry>[] = [
    {
      accessorKey: "gbud_date",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
        accessorKey: "gbud_remaining_bal",
        header: "Remaining Balance",
        cell: ({ row }) => (
          <div>Php {Number(row.getValue("gbud_remaining_bal")).toFixed(2)}</div>
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
                      onSaveSuccess={refetch}
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

  if (isLoading) {
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
    return <div className="text-red-500">{error.message}</div>;
  }

  return (
    <div className="bg-snow w-full h-full">
      {/* Header and Summary Section */}
      <div className="flex flex-col gap-3 mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
          <Link to="/gad-budget-tracker-main">
            <ChevronLeft />
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

      {/* Budget Summary */}
      <div className="flex flex-row gap-5 mb-5">
        <div className="flex flex-row gap-2">
          <Label className="w-35 text-md">Budget:</Label>
          <Label className="text-red-500 text-md font-bold">
            Php {budget_item.toFixed(2)}
          </Label>
        </div>
    </div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
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
              options={filterOptions}
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
                    refetch();
                  }}
                />
              </div>
            }
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
      </div>

      {/* Data Table */}
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
          {filteredData.length} rows
        </p>
        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
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


//frontend
//Remaining Balance per row
//remove amount used
//separate income and expense

//backend
//retrieve gad budget from budget_plan_detail then display it as remaining balance (expense amount - (closes to current_date = remaining bal))
//every expense deducts per row on the remaining bal. column
//search-create particulars