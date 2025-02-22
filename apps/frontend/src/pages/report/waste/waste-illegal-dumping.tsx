// import TableLayout from "@/components/ui/table/table-layout";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Trash } from "lucide-react";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

// const headerProp = ["Report No.", "Report Matter", "Location", "Report Details", "Violator", "Reported By", "Contact No.", "Date and Time", "Image", "Action" ];

// const bodyProp = [[ "0001", "Lorem Ipsum", "Sitio 1", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Unknown",
//     "Anonymous", "09xxxxxxxx", "01/11/25 05:00PM",
//     (<DialogLayout
//             trigger={<div className="w-[35px] h-[35px] p-5 border bordery-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]"> View </div>}
//             className="max-w-[50%] h-2/3 flex flex-col"
//             title="Image Details"
//             description="Here is the image related to the report."
//             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
//         />
//         ),
//     (<TooltipLayout
//         trigger={<div className="w-[35px] h-[35px] border bordery-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]"> <Trash/> </div>}
//         content="Delete"
//         />)
// ]];

// function WasteIllegalDumping() {
//     return (
//         <div className="mx-4 mb-4 mt-10">
//             <div className='flex justify-end mb-4'>
//                 <div className="relative w-1/3 mb-4">
//                     <label className="sr-only">Search</label>
//                     <input
//                         type="text"
//                         id="Search"
//                         placeholder="Search"
//                         className="rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm w-full"
//                     />
//                     <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
//                         <button type="button" className="text-gray-600 hover:text-gray-700">
//                             <span className="sr-only">Search</span>
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                                 strokeWidth="1.5"
//                                 stroke="currentColor"
//                                 className="size-4"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
//                                 />
//                             </svg>
//                         </button>
//                     </span>
//                 </div>
//             </div>

//             {/* Table for Report Details */}
//             <div className="bg-white border border-gray rounded-[5px] p-5">
//                 <TableLayout header={headerProp} rows={bodyProp} />
//             </div>

//             <div>
//                 <PaginationLayout />
//             </div>
//         </div>
//     );
// }

// export default WasteIllegalDumping;

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
            {" "}
            View{" "}
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
        } // Replace with actual image path
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
            {" "}
            <Trash size={16} />{" "}
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
    reportMatter: "Lorem Ipsum",
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
    reportMatter: "Lorem Ipsum",
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
  return (
    <div className="mx-4 mb-4 mt-10">
      <div className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">
        <p>ILLEGAL DUMPING REPORTS</p>
        <br></br>
      </div>
      {/* Table for Report Details */}
      <div className="bg-white border border-gray rounded-[5px] p-5">
        <div className="flex gap-3 w-full justify-end">
          <div>
            <SelectLayout
              className="w-50"
              label=""
              placeholder="Filter"
              options={[
                { id: "Date", name: "Date" },
                { id: "Report Matter", name: "Report Matter" },
                { id: "Location", name: "Location" },
              ]}
              value=""
              onChange={() => {}}
            />
          </div>
          <Input placeholder="Search" className="w-[400px]" />
        </div>{" "}
        <br />
        <DataTable columns={columns} data={bodyData} />
      </div>

      <div>
        <PaginationLayout className="" />
      </div>
    </div>
  );
}

export default WasteIllegalDumping;
