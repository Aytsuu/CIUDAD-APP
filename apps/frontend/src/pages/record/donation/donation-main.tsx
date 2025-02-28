import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Eye, Plus, Search } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import ClerkDonateCreate from "./donation-create";
import ClerkDonateDeleteConf from "./donation-delete-conf";
import ClerkDonateView from "./donation-view";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col sm:flex-row gap-2">
        <TooltipLayout
          trigger={
            <DialogLayout
              trigger={
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Eye size={16} />
                </Button>
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
                <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                  <Trash size={16} />
                </Button>
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
  const filterOptions = [
    { id: "All Donation Category", name: "All Donation Category" },
    { id: "Monetary Donations", name: "Monetary Donations" },
    { id: "Essential Goods", name: "Essential Goods" },
    { id: "Medical Supplies", name: "Medical Supplies" },
    { id: "Household Items", name: "Household Items" },
    { id: "Educational Supplies", name: "Educational Supplies" },
    { id: "Baby & Childcare Items", name: "Baby & Childcare Items" },
    { id: "Animal Welfare Items", name: "Animal Welfare Items" },
    { id: "Shelter & Homeless Aid", name: "Shelter & Homeless Aid" },
    { id: "Disaster Relief Supplies", name: "Disaster Relief Supplies" },
  ];

  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0].name);

  
  const filteredData =
    selectedFilter === "All Donation Category"
      ? data
      : data.filter((item) => item.itemCat === selectedFilter);

  return (
    <div className="w-full h-full">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Donation Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view donation records
          </p>
        </div>
        <hr className="border-gray mb-6 sm:mb-10" />

        {/* Combined Search, Filter, and Create Button Section */}
        <div className="w-full flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search Input with Icon */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input placeholder="Search..." className="pl-10 w-full bg-white" />
            </div>

            {/* Filter Dropdown */}
            <div className="w-full sm:w-[200px]">
              <SelectLayout
                className="w-full bg-white"
                label=""
                placeholder="Filter by"
                options={filterOptions}
                value={selectedFilter}
                onChange={(value) => setSelectedFilter(value)}
              />
            </div>
          </div>

          {/* Create Button */}
          <div className="w-full sm:w-auto">
            <DialogLayout
              trigger={
                <Button className="w-full sm:w-auto">
                  <Plus /> Create
                </Button>
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

        {/* Table Section */}
        <div className="w-full border-none bg-white rounded-[5px] p-5">
          <div className="flex gap-x-2 items-center p-4">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" defaultValue="10" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>

          <DataTable columns={columns} data={filteredData} />
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-10 of {filteredData.length} rows
          </p>

          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout className="" />
          </div>
        </div>
      </div>
  );
}

export default DonationTracker;