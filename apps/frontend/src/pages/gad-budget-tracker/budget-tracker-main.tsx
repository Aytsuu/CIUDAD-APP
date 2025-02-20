import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Eye, Plus } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import GADAddEntryForm from "./budget-tracker-create-form";
import { Input } from "@/components/ui/input";
import GADEditEntryForm from "./budget-tracker-edit-form";

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
      >
        Date
        <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("date")}</div>,
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
    cell: ({ row }) => (
      <div className="grid grid-cols-2">
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
              title=""
              description=""
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

const bodyData: header[] = [
  {
    date: "10-01-25",
    particulars: "Loremifasolati",
    type: "secret",
    amount: 500000,
    remainingbal: 20,
    additionalnotes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    date: "12-10-25",
    particulars: "Loremifasolati",
    type: "ambot",
    amount: 190200,
    remainingbal: 50,
    additionalnotes:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

function BudgetTracker() {
  return (
    <div className="w-full h-full">
      <div className="mx-4 mb-4 mt-10">
        <div className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">
          <p>VIEW BUDGET</p>
          <br></br>
        </div>
        <div className="bg-white border border-gray w-full rounded-[5px] p-5 table-fixed">
          {/* Top Row: Amount Used and Remaining Balance (Left) */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <div className="flex gap-2">
                <div>Amount Used:</div>
                <div className="font-semibold">Php 65,000.00</div>
              </div>
              <div className="flex gap-2">
                <div>Remaining Balance:</div>
                <div className="font-semibold">Php 455,000.00</div>
              </div>
            </div>

            {/* Search Bar, Filter, and Create (Right) */}
            <div className="flex gap-3 items-center">
              <Input placeholder="Search" className="w-[200px]" />
              <div>
                <SelectLayout
                  className="w-50"
                  label=""
                  placeholder="Filter"
                  options={[
                    { id: "Date", name: "Date" },
                    { id: "Type", name: "Type" },
                  ]}
                  value=""
                  onChange={() => {}}
                />
              </div>
              <div>
                <DialogLayout
                  trigger={
                    <div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointer flex items-center">
                      {" "}
                      Create <Plus className="ml-2" />
                    </div>
                  }
                  className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                  title=""
                  description=""
                  mainContent={
                    <div className="w-full h-full">
                      <GADAddEntryForm />
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <DataTable columns={columns} data={bodyData} />
        </div>

        {/* Pagination */}
        <div>
          <PaginationLayout className="" />
        </div>
      </div>
    </div>
  );
}

export default BudgetTracker;
