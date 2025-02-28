import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";

type Report = {
  reportNo: string;
  reportMatter: string;
  location: string;
  reportDetails: string;
  violator: string;
  reportedBy: string;
  contactNo: string;
  dateTime: string;
};

const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "reportNo",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Report No.
        <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("reportNo")}</div>
    ),
  },
  {
    accessorKey: "reportMatter",
    header: "Report Matter",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "reportDetails",
    header: "Report Details",
  },
  {
    accessorKey: "violator",
    header: "Violator",
  },
  {
    accessorKey: "reportedBy",
    header: "Reported By",
  },
  {
    accessorKey: "contactNo",
    header: "Contact No.",
  },
  {
    accessorKey: "dateTime",
    header: "Date and Time",
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <DialogLayout
        trigger={
          <div className="w-[35px] h-[35px] p-3 border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]">
            View
          </div>
        }
        className="max-w-[50%] h-2/3 flex flex-col"
        title="Image Details"
        description="Here is the image related to the report."
        mainContent={
          <img
            src="path_to_your_image.jpg"
            alt="Report Image"
            className="w-full h-auto"
          />
        }
      />
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <TooltipLayout
        trigger={
          <div className="w-[35px] h-[35px] bg-[#ff2c2c] text-white border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]">
            <Trash size={16} />
          </div>
        }
        content="Delete"
      />
    ),
  },
];

const bodyData: Report[] = [
  {
    reportNo: "0001",
    reportMatter: "Littering, Illegal dumping, Illegal disposal of garbage",
    location: "Sitio 1",
    reportDetails:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    violator: "Unknown",
    reportedBy: "Anonymous",
    contactNo: "09xxxxxxxx",
    dateTime: "01/11/25 05:00PM",
  },
  {
    reportNo: "0002",
    reportMatter: "Urinating, defecating, spitting in a public place",
    location: "Sitio 1",
    reportDetails:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    violator: "Unknown",
    reportedBy: "Anonymous",
    contactNo: "09xxxxxxxx",
    dateTime: "01/11/25 05:00PM",
  },
];

function WasteIllegalDumping() {
  const data = bodyData;
  const filterOptions = [
    { id: "0", name: "All Report Matter" }, // Added "All Report Category" option
    {
      id: "1",
      name: "Littering, Illegal dumping, Illegal disposal of garbage",
    },
    { id: "2", name: "Urinating, defecating, spitting in a public place" },
    {
      id: "3",
      name: "Dirty frontage and immediate surroundings for establishment owners",
    },
    {
      id: "4",
      name: "Improper and untimely stacking of garbage outside residences or establishment",
    },
    {
      id: "5",
      name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)",
    },
    {
      id: "6",
      name: "Dirty public utility vehicles, or no trash can or receptacle",
    },
    {
      id: "7",
      name: "Spilling, scattering, littering of wastes by public utility vehicles",
    },
    {
      id: "8",
      name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads.",
    },
  ];

  const [selectedFilterId, setSelectedFilterId] = useState("0"); // Default to "All Report Category"

  // Map the selected `id` to the corresponding `name`
  const selectedFilterName =
    filterOptions.find((option) => option.id === selectedFilterId)?.name || "";

  // Filter the data using the mapped `name`
  const filteredData =
    selectedFilterId === "0" // Check if "All Report Category" is selected
      ? data // Return all data
      : data.filter(
          (item) =>
            item.reportMatter.trim().toLowerCase() ===
            selectedFilterName.trim().toLowerCase()
        );

  return (
    <div className="w-full h-full px-4 md:px-8 lg:px-16">
      <div className="mb-4 mt-10">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            ILLEGAL DUMPING REPORTS
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view illegal dumping reports
          </p>
        </div>
        <hr className="border-gray mb-6 sm:mb-10" />

        {/* Combined Search, Filter, and Show Entries Section with Table */}
        <div className="bg-white rounded-[5px] p-5 w-full">
          <div className="flex gap-3 w-full mb-4">
            <div className="flex items-center gap-x-2">
              <p className="text-xs sm:text-sm">Show</p>
              <Input type="number" className="w-14 h-8" defaultValue="10" />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div className="flex-grow flex justify-end gap-2">
              <SelectLayout
                className="flex-initial w-[335px]"
                placeholder="Report Matter"
                options={filterOptions}
                value={selectedFilterId}
                label=""
                onChange={(id) => {
                  console.log("Selected ID:", id); // Debug the ID
                  setSelectedFilterId(id);
                }}
              />
              <Input placeholder="Search" className="w-[400px]" />
            </div>
          </div>

          <DataTable columns={columns} data={filteredData} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-10 of {filteredData.length} rows
          </p>

          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout className="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WasteIllegalDumping;
