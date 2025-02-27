import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Eye } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import GADAddEntryForm from "./budget-tracker-create-form";
import { Input } from "@/components/ui/input";
import GADEditEntryForm from "./budget-tracker-edit-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";


type header = {
  date: string;
  particulars: string;
  type: "Income" | "Expense";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  let remainingBal = 0.00, amtUsed = 0.00, budgetYear = "2020"; 
  const filter = [
    {id: "0", name: "All Entry Types"},
    {id: "1", name: "Income"},
    {id: "2", name: "Expense"}
  ];

  const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
  const filteredData = selectedFilter === "All Entry Types" ? data 
  : data.filter((item) => item.type === selectedFilter);


  return (
    <div className="mx-4 mb-4 mt-10">
        <div className="text-4xl font-semibold leading-none tracking-tight text-darkBlue1">
            <p>Budget for Year {budgetYear}</p><br></br>
        </div>  
        <div className="bg-white border border-gray-300 rounded-[5px] p-5">
            <div className="flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex flex-row gap-7">
                            <Input className="w-[20rem]" placeholder="Search" />
                            <div className="flex flex-row gap-2 justify-center items-center">
                                <Label>Filter: </Label>
                                <SelectLayout className="" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                            </div> 
                      </div>
                      <div className="">
                                  <DialogLayout
                                    trigger={
                                    <Button>+ New Entry</Button>
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
             
                <DataTable columns={columns} data={filteredData} />
                <div>
                  <PaginationLayout className= ""/>
                </div>

            </div>
        </div>

        <div className="flex flex-row gap-[5rem] mt-4">
            <div className="flex flex-row gap-2 text-red-500">
              <Label className="w-30">Amount Used:</Label>  
              <Label>Php {amtUsed.toFixed(2)}</Label>
            </div>
            <div className="flex flex-row gap-2 text-green-700">
              <Label className="w-30">Remaining Balance:</Label>
              <Label>Php {remainingBal.toFixed(2)}</Label>
            </div>
        </div>
    </div>
  );
}

export default BudgetTracker;
