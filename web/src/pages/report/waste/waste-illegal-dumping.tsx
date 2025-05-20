// import { useState } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { Trash, Search } from "lucide-react";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Input } from "@/components/ui/input";
// import { ArrowUpDown } from "lucide-react";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { useWasteReport } from "./queries/waste-ReportGetQueries";

// type Report = {
//   reportNo: string;
//   reportMatter: string;
//   location: string;
//   reportDetails: string;
//   violator: string;
//   reportedBy: string;
//   contactNo: string;
//   dateTime: string;
// };

// const columns: ColumnDef<Report>[] = [
//   {
//     accessorKey: "reportNo",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Report No.
//         <ArrowUpDown size={15} />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="capitalize">{row.getValue("reportNo")}</div>
//     ),
//   },
//   {
//     accessorKey: "reportMatter",
//     header: "Report Matter",
//   },
//   {
//     accessorKey: "location",
//     header: "Location",
//   },
//   {
//     accessorKey: "reportDetails",
//     header: "Report Details",
//   },
//   {
//     accessorKey: "violator",
//     header: "Violator",
//   },
//   {
//     accessorKey: "reportedBy",
//     header: "Reported By",
//   },
//   {
//     accessorKey: "contactNo",
//     header: "Contact No.",
//   },
//   {
//     accessorKey: "dateTime",
//     header: "Date and Time",
//   },
//   {
//     accessorKey: "image",
//     header: "Image",
//     cell: ({ row }) => (
//       <DialogLayout
//         trigger={
//           <div className="px-2.5 py-1.5 border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]">
//             View
//           </div>
//         }
//         className="max-w-[50%] h-2/3 flex flex-col"
//         title="Image Details"
//         description="Here is the image related to the report."
//         mainContent={
//           <img
//             src="path_to_your_image.jpg"
//             alt="Report Image"
//             className="w-full h-auto"
//           />
//         }
//       />
//     ),
//   },
//   {
//     accessorKey: "action",
//     header: "Action",
//     cell: ({ row }) => (
//       <TooltipLayout
//         trigger={
//           <div className="w-[35px] h-[35px] bg-[#ff2c2c] text-white border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]">
//             <Trash size={16} />
//           </div>
//         }
//         content="Delete"
//       />
//     ),
//   },
// ];

// const bodyData: Report[] = [
//   {
//     reportNo: "0001",
//     reportMatter: "Littering, Illegal dumping, Illegal disposal of garbage",
//     location: "Sitio 1",
//     reportDetails:
//       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     violator: "Unknown",
//     reportedBy: "Anonymous",
//     contactNo: "09xxxxxxxx",
//     dateTime: "01/11/25 05:00PM",
//   },
//   {
//     reportNo: "0002",
//     reportMatter: "Urinating, defecating, spitting in a public place",
//     location: "Sitio 1",
//     reportDetails:
//       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     violator: "Unknown",
//     reportedBy: "Anonymous",
//     contactNo: "09xxxxxxxx",
//     dateTime: "01/11/25 05:00PM",
//   },
// ];

// function WasteIllegalDumping() {
//   const data = bodyData;
//   const filterOptions = [
//     { id: "0", name: "All Report Matter" }, // Added "All Report Category" option
//     {
//       id: "1",
//       name: "Littering, Illegal dumping, Illegal disposal of garbage",
//     },
//     { id: "2", name: "Urinating, defecating, spitting in a public place" },
//     {
//       id: "3",
//       name: "Dirty frontage and immediate surroundings for establishment owners",
//     },
//     {
//       id: "4",
//       name: "Improper and untimely stacking of garbage outside residences or establishment",
//     },
//     {
//       id: "5",
//       name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)",
//     },
//     {
//       id: "6",
//       name: "Dirty public utility vehicles, or no trash can or receptacle",
//     },
//     {
//       id: "7",
//       name: "Spilling, scattering, littering of wastes by public utility vehicles",
//     },
//     {
//       id: "8",
//       name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads.",
//     },
//   ];

//   const [selectedFilterId, setSelectedFilterId] = useState("0");
//   const selectedFilterName =
//     filterOptions.find((option) => option.id === selectedFilterId)?.name || "";

//   const filteredData =
//     selectedFilterId === "0"
//       ? data
//       : data.filter(
//           (item) =>
//             item.reportMatter.trim().toLowerCase() ===
//             selectedFilterName.trim().toLowerCase()
//         );

//   const [currentPage, setCurrentPage] = useState(1);
//   const totalPages = Math.ceil(filteredData.length / 12);
//   const handlePageChange = (newPage: number) => {
//     setCurrentPage(newPage);
//   };

//   const startIndex = (currentPage - 1) * 12;
//   const endIndex = startIndex + 12;
//   const currentRows = filteredData.slice(startIndex, endIndex);

//   return (
//     <div className="w-full h-full">
//       <div className="flex-col items-center mb-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//           Illegal Dumping Reports
//         </h1>
//         <p className="text-xs sm:text-sm text-darkGray">
//           Manage and view illegal dumping reports
//         </p>
//       </div>
//       <hr className="border-gray mb-6 sm:mb-8" />

//       {/* Filter and Search Section (Right Side) */}
//       <div className="relative w-full hidden lg:flex items-center gap-2 mb-4">
//         {/* Search Input with Icon */}
//         <div className="relative w-full sm:w-[200px] lg:w-[300px]">
//           <Search
//             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//             size={17}
//           />
//           <Input placeholder="Search..." className="pl-10 w-full bg-white" />
//         </div>

//         {/* Filter Dropdown */}
//         <div className="w-full sm:w-auto">
//           <SelectLayout
//             className="w-full sm:w-[200px] lg:w-[250px] bg-white"
//             placeholder="Report Matter"
//             options={filterOptions}
//             value={selectedFilterId}
//             label=""
//             onChange={(id) => {
//               setSelectedFilterId(id);
//             }}
//           />
//         </div>
//       </div>

//       {/* Combined Search, Filter, and Show Entries Section with Table */}
//       <div className="w-full">
//         <div className="flex flex-col sm:flex-row gap-3 w-full p-3 bg-white">
//           {/* Show Entries Section (Left Side) */}
//           <div className="flex items-center gap-x-2">
//             <p className="text-xs sm:text-sm">Show</p>
//             <Input type="number" className="w-14 h-8" defaultValue="10" />
//             <p className="text-xs sm:text-sm">Entries</p>
//           </div>
//         </div>

//         <div className="bg-white flex">
//           <DataTable columns={columns} data={filteredData} />
//         </div>
//       </div>

//       <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//         <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//           Showing 1-10 of {filteredData.length} rows
//         </p>

//         <div className="w-full sm:w-auto flex justify-center">
//           <PaginationLayout
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default WasteIllegalDumping;


import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Search } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useWasteReport } from "./queries/waste-ReportGetQueries";

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
          <div className="px-2.5 py-1.5 border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]">
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

  const [selectedFilterId, setSelectedFilterId] = useState("0");
  const selectedFilterName =
    filterOptions.find((option) => option.id === selectedFilterId)?.name || "";

  const filteredData =
    selectedFilterId === "0"
      ? data
      : data.filter(
          (item) =>
            item.reportMatter.trim().toLowerCase() ===
            selectedFilterName.trim().toLowerCase()
        );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / 12);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * 12;
  const endIndex = startIndex + 12;
  const currentRows = filteredData.slice(startIndex, endIndex);

  return (
    <div className="w-full h-full">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Illegal Dumping Reports
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view illegal dumping reports
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Filter and Search Section (Right Side) */}
      <div className="relative w-full hidden lg:flex items-center gap-2 mb-4">
        {/* Search Input with Icon */}
        <div className="relative w-full sm:w-[200px] lg:w-[300px]">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
            size={17}
          />
          <Input placeholder="Search..." className="pl-10 w-full bg-white" />
        </div>

        {/* Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <SelectLayout
            className="w-full sm:w-[200px] lg:w-[250px] bg-white"
            placeholder="Report Matter"
            options={filterOptions}
            value={selectedFilterId}
            label=""
            onChange={(id) => {
              setSelectedFilterId(id);
            }}
          />
        </div>
      </div>

      {/* Combined Search, Filter, and Show Entries Section with Table */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row gap-3 w-full p-3 bg-white">
          {/* Show Entries Section (Left Side) */}
          <div className="flex items-center gap-x-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" defaultValue="10" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="bg-white flex">
          <DataTable columns={columns} data={filteredData} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-10 of {filteredData.length} rows
        </p>

        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default WasteIllegalDumping;
