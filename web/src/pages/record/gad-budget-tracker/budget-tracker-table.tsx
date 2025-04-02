import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Eye, Search, FileInput, ChevronLeft, Calendar, ArrowUpDown} from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { DataTable } from "@/components/ui/table/data-table";
import GADAddEntryForm from "./budget-tracker-create-form";
import { Input } from "@/components/ui/input";
import GADEditEntryForm from "./budget-tracker-edit-form";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem} from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button";

type header = {
  date: string;
  particulars: string;
  type: string;
  amount: number;
  remainingbal: number;
  additionalnotes: string;
};

const columns: ColumnDef<header>[] = [
  {
    accessorKey: "date",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Date
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("date")}</div>
        )
  },
  {
    accessorKey: "particulars",
    header: "Particulars",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "remainingbal",
    header: "Remaining Balance",
  },
  {
    accessorKey: "additionalnotes",
    header: "Additional Notes",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ }) => (
      <div className="flex justify-center gap-1">
        <TooltipLayout
          trigger={
            <DialogLayout
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                  {" "}
                  <Eye size={16} />
                </div>
              }
              className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
              title="Entry Details"
              description="Detailed overview of the entry. Click 'Edit' to update records and ensure accuracy."
              mainContent={
                <div className="w-full h-full">
                  <GADEditEntryForm />
                </div>
              }
            />
          }
          content="View"
        />
        <TooltipLayout
          trigger={
            <DialogLayout
              trigger={
                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                  {" "}
                  <Trash size={16} />
                </div>
              }
              className="max-w-[30%] h-1/3 flex flex-col"
              title="Delete Record"
              description=""
              mainContent=""
            />
          }
          content="Delete"
        />
      </div>
    ),
  },
];

const BudgetPlanView: header[] = [
  {
    date: "10-01-25",
    particulars: "Loremifasolati",
    type: "Income",
    amount: 500000,
    remainingbal: 20,
    additionalnotes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    date: "12-10-25",
    particulars: "Loremifasolati",
    type: "Expense",
    amount: 190200,
    remainingbal: 50,
    additionalnotes:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

function BudgetTracker() {
  const data = BudgetPlanView;
  let remainingBal = 0.00, amtUsed = 0.00, year = "2020"; 
   
  const filter = [
    {id: "All Entry Types", name: "All Entry Types"},
    {id: "Income", name: "Income"},
    {id: "Expense", name: "Expense"}
  ];

  const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
  const filteredData = selectedFilter === "All Entry Types" ? data 
  : data.filter((item) => item.type === selectedFilter);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // Example total number of pages

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="bg-snow w-full h-full">
          <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <Link to="/gad-budget-tracker-main"><div><ChevronLeft/></div></Link>
                    <div className="rounded-full border-2 border-solid border-darkBlue2 p-2 flex items-center"><Calendar></Calendar> </div>
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
                <Label className="text-red-500 text-md font-bold">Php {amtUsed.toFixed(2)}</Label>
              </div>
              <div className="flex flex-row gap-2">
                <Label className="w-35 text-md">Remaining Balance:</Label>
                <Label className="text-green-700 text-md font-bold">Php {remainingBal.toFixed(2)}</Label>
              </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4"> 
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1"> {/* Increased max-width */}
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                                size={17}
                            />
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" />
                        </div>
                        <div className="flex flex-row gap-2 justify-center items-center">
                            <Label>Filter: </Label>
                            <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="Payment Status" onChange={setSelectedFilter}></SelectLayout>
                        </div>                            
                  </div>
                <div className="">
                      <DialogLayout
                      trigger={
                      <div className="bg-primary text-white rounded-md p-3 text-sm font-semibold drop-shadow-sm">+ New Entry</div>
                      }
                      className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                      title="Add New Entry"
                      description="Fill in the details for your entry."
                      mainContent={
                        <div className="w-full h-full">
                          <GADAddEntryForm />
                        </div>
                      }
                    />
                </div>
          </div>
                  
          <div className="bg-white">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
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

            <DataTable columns={columns} data={filteredData}></DataTable>
        </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                {/* Showing Rows Info */}
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                  Showing 1-10 of 150 rows
                </p>

                {/* Pagination */}
                <div className="w-full sm:w-auto flex justify-center">
                <PaginationLayout className="" totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange}/>                
                </div>
          </div>
    </div>
  );
}

export default BudgetTracker;
