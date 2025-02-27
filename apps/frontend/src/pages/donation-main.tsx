import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Eye, Plus } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import ClerkDonateCreate from "./donation-create";
import ClerkDonateDeleteConf from "./donation-delete-conf";
import ClerkDonateView from "./donation-view";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";

type Donation = {
  refNo: string;
  donor: string;
  itemName: string;
  itemCat: string;
  itemqty: number;
  datelisted: string;
};

const columns: ColumnDef<Donation>[] = [
  {
    accessorKey: "refNo",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Reference No.
        <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("refNo")}</div>
    ),
  },
  {
    accessorKey: "donor",
    header: "Donor",
  },
  {
    accessorKey: "itemName",
    header: "Item Name",
  },
  {
    accessorKey: "itemCat",
    header: "Item Category",
  },
  {
    accessorKey: "itemqty",
    header: "Quantity",
  },
  {
    accessorKey: "datelisted",
    header: "Date ",
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
                  <ClerkDonateView />
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
              mainContent={<ClerkDonateDeleteConf />}
            />
          }
          content="Delete"
        />
      </div>
    ),
  },
];

const bodyData: Donation[] = [
  {
    refNo: "0001",
    donor: "Loremifasolati",
    itemName: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    itemCat: "Essential Goods",
    itemqty: 20,
    datelisted: "10-01-25",
  },
  {
    refNo: "0002",
    donor: "Loremifasolati",
    itemName:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    itemCat: "Disaster Relief Supplies",
    itemqty: 50,
    datelisted: "12-10-25",
  },
];

function DonationTracker() {
  const data = bodyData;
  const filter = [
    { id: "0", name: "All Donation Category" },
    { id: "1", name: "Monetary Donations" },
    { id: "2", name: "Essential Goods" },
    { id: "3", name: "Medical Supplies" },
    { id: "4", name: "Household Items" },
    { id: "5", name: "Educational Supplies" },
    { id: "6", name: "Baby & Childcare Items" },
    { id: "7", name: "Animal Welfare Items" },
    { id: "8", name: "Shelter & Homeless Aid " },
    { id: "9", name: "Disaster Relief Supplies" },
  ];

  const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

  const filteredData =
    selectedFilter === "All Donation Category"
      ? data
      : data.filter((item) => item.itemCat === selectedFilter);

  return (
    <div className="w-full h-full">
      <div className="mx-4 mb-4 mt-10">
        <div className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">
          <p>DONATIONS</p>
          <br></br>
        </div>
        <div className="bg-white border border-gray w-full rounded-[5px] p-5 table-fixed">
          <div className="flex justify-end mb-4 gap-3">
            <div>
              <SelectLayout
                className=""
                options={filter}
                placeholder="Filter"
                value={selectedFilter}
                label=""
                onChange={setSelectedFilter}
              ></SelectLayout>
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
                    <ClerkDonateCreate />
                  </div>
                }
              />
            </div>
          </div>
          <DataTable columns={columns} data={filteredData} />
        </div>

        <div>
          <PaginationLayout className="" />
        </div>
      </div>
    </div>
  );
}

export default DonationTracker;
