

// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus, Stamp, Search } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import AddEvent from '@/pages/record/council/Calendar/AddEvent-Modal';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { DataTable } from "@/components/ui/table/data-table"
// import { ArrowUpDown } from "lucide-react"
// import { ColumnDef } from "@tanstack/react-table"




// export const columns: ColumnDef<Receipts>[] = [
//     {
//         accessorKey: "inv_serial_num",
//         header: ({ column }) => (
//             <div
//                 className="flex w-full justify-center items-center gap-2 cursor-pointer"
//                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//             >
//                 Serial No.
//                 <ArrowUpDown size={15} />
//             </div>
//         ),
//         cell: ({ row }) => (
//             <div className="capitalize w-[140px]">{row.getValue("inv_serial_num")}</div>
//         )
//     },
//     {
//         accessorKey: "inv_date_issued",
//         header: "Date Issued",
//     },
//     {
//         accessorKey: "inv_payor",
//         header: "Payor",
//     },
//     {
//         accessorKey: "inv_pay_method",
//         header: "Payment Method",
//     },       
//     {
//         accessorKey: "inv_nat_collection",
//         header: "Nature of Collection",
//     },
//     {
//         accessorKey: "inv_amount",
//         header: "Amount",
//     },          
//     // {
//     //     accessorKey: "action", // Key for action data
//     //     header: "Action", // Column header
//     //     cell: ({row}) => ( // Add action button to all existing rows
//     //         // DialogLayout component to show detailed report on click
//     //         <div className="flex justify-between gap-2 pr-3">
//     //             <TooltipLayout
//     //                 trigger={
//     //                     <DialogLayout
//     //                         trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
//     //                         className="max-w-[50%] h-2/3 flex flex-col"
//     //                         title="Image Details"
//     //                         description="Here is the image related to the report."
//     //                         mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
//     //                     />
//     //                 }
//     //                 content="View"
//     //             />
//     //             <TooltipLayout  
//     //                 trigger={
//     //                     <DialogLayout
//     //                         trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Stamp size={16} /></div>}
//     //                         className="max-w-[700px] h-[400px] flex flex-col overflow-auto"
//     //                         title="Mark Attendance"
//     //                         description="Confirm participant attendance."
//     //                         mainContent={""} // Replace with actual image path
//     //                     />
//     //                 }
//     //                 content="Mark"
//     //             />
//     //         </div>
//     //     ),
//     //     enableSorting: false, // Disable sorting
//     //     enableHiding: false, // Disable hiding
//     // },
// ]

// type Receipts = {
//     inv_serial_num: string
//     inv_date_issued: string
//     inv_payor: string
//     inv_pay_method: string
//     inv_nat_collection: string
//     inv_amount: string

// }

// export const ReceiptRecord: Receipts[] = [
//     {
//         inv_serial_num: "100-2301",
//         inv_date_issued: "02/10/24",
//         inv_payor: "Jean Howeress",
//         inv_pay_method: "Cash",
//         inv_nat_collection: "Barangay Certification",
//         inv_amount: "P200.00"
//     },

// ]

// function ReceiptPage() {

//     const data = ReceiptRecord;

//     const filterOptions = [
//         { id: "all", name: "All" },
//         { id: "Barangay Certification", name: "Barangay Certification" }, // Match your data
//         { id: "Business Permit", name: "Business Permit" }, // Example additional option
//     ];

//     const [filter, setFilter] = useState<string>("all"); // Default to "all"

//     const filteredData = filter === "all"
//         ? ReceiptRecord
//         : ReceiptRecord.filter(record => record.inv_nat_collection.includes(filter)); // Filter based on the selected value    

//     return (
//         <div className="w-full h-full p-4">
//             <div className="flex-col items-center mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//                     Receipts
//                 </h1>
//                 <p className="text-xs sm:text-sm text-darkGray">
//                     List of recorded receipt transactions and corresponding collection details.
//                 </p>
//             </div>
//             <hr className="border-gray mb-6 sm:mb-10" />       

//             <div className='w-full mb-4'>
//                 {/**FILTER (SELECT)*/}
//                 <div className="flex flex-col md:flex-row justify-start gap-3">
//                     <div className="relative w-full md:w-auto">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
//                         <Input placeholder="Search" className="pl-10 bg-white w-full md:w-[400px]" />
//                     </div>

//                     <SelectLayout
//                         className="bg-white"
//                         label=""
//                         placeholder="Filter"
//                         options={filterOptions}
//                         value={filter}
//                         onChange={(value) => setFilter(value)} // Update the filter state
//                     />                              
//                 </div>
//             </div>   

//             <div className="w-full bg-white border border-none">
//                 <div className="flex gap-x-2 items-center p-4">
//                     <p className="text-xs sm:text-sm">Show</p>
//                     <Input type="number" className="w-14 h-8" defaultValue="10" />
//                     <p className="text-xs sm:text-sm">Entries</p>
//                 </div>                                     

//                 <DataTable columns={columns} data={filteredData} />
//             </div>     

//             <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//                 {/* Showing Rows Info */}
//                 <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//                     Showing 1-10 of 150 rows
//                 </p>

//                 {/* Pagination */}
//                 <div className="w-full sm:w-auto flex justify-center">
//                     {/* <PaginationLayout className="" /> */}
//                 </div>
//             </div>                                
//         </div>
//     );
// }
// export default ReceiptPage;






//LATEST WORKING BUT NO PAGINATION
// import { useState } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button/button";
// import { Search } from "lucide-react";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import { DataTable } from "@/components/ui/table/data-table";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { Input } from "@/components/ui/input";
// import { ArrowUpDown } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { useInvoiceQuery, type Receipt } from "./queries/receipt-getQueries";

// function ReceiptPage() {
//   const { data: fetchedData = [], isLoading } = useInvoiceQuery();

//   const columns: ColumnDef<Receipt>[] = [
//     {
//       accessorKey: "inv_serial_num",
//       header: ({ column }) => (
//         <div
//           className="flex w-full justify-center items-center gap-2 cursor-pointer"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Serial No.
//           <ArrowUpDown size={15} />
//         </div>
//       ),
//       cell: ({ row }) => (
//         <div className="capitalize">{row.getValue("inv_serial_num")}</div>
//       )
//     },
//     {
//         accessorKey: "inv_date",
//         header: ({ column }) => (
//             <div
//                 className="flex w-full justify-center items-center gap-2 cursor-pointer"
//                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//             >
//                 Date Issued.
//             <   ArrowUpDown size={15} />
//             </div>
//         ),
//         // header: "Date Issued",
//         cell: ({ row }) => {
//             const date = new Date(row.getValue("inv_date"));
            
//             // Format as MM/DD/YYYY at h:mm AM/PM
//             const formattedDate = date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             }); // Outputs "06/02/2025"

//             const formattedTime = date.toLocaleTimeString('en-US', {
//             hour: 'numeric',
//             minute: '2-digit',
//             hour12: true,
//             }); // Outputs "8:02 AM"

//             return (
//             <div>
//                 {`${formattedDate} at ${formattedTime}`}
//             </div>
//             );
//         },
//     },
//     {
//       accessorKey: "inv_payor",
//       header: "Payor",
//     },
//     {
//       accessorKey: "inv_pay_method",
//       header: "Payment Method",
//     },       
//     {
//       accessorKey: "inv_nat_of_collection",
//       header: "Nature of Collection",
//     },
//     {
//       accessorKey: "inv_amount",
//       header: "Amount",
//     },
//   ];

//   const filterOptions = [
//     { id: "all", name: "All" },
//     { id: "Barangay Certification", name: "Barangay Certification" },
//     { id: "Business Permit", name: "Business Permit" },
//   ];

//   const [selectedFilterId, setSelectedFilterId] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
  
//   const filteredData = selectedFilterId === "all"
//     ? fetchedData
//     : fetchedData.filter(item => 
//         item.inv_nat_of_collection.trim().toLowerCase() === selectedFilterId.trim().toLowerCase()
//       );

//   const totalPages = Math.ceil(filteredData.length / 10);
//   const handlePageChange = (newPage: number) => {
//     setCurrentPage(newPage);
//   };

//   const startIndex = (currentPage - 1) * 10;
//   const endIndex = startIndex + 10;
//   const currentRows = filteredData.slice(startIndex, endIndex);

//   if (isLoading) {
//     return (
//       <div className="w-full h-full">
//         <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//         <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//         <Skeleton className="h-10 w-full mb-4 opacity-30" />
//         <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full p-4">
//       <div className="flex-col items-center mb-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//           Receipts
//         </h1>
//         <p className="text-xs sm:text-sm text-darkGray">
//           List of recorded receipt transactions and corresponding collection details.
//         </p>
//       </div>
//       <hr className="border-gray mb-6 sm:mb-10" />

//       <div className="relative w-full flex items-center gap-2 mb-4">
//         <div className="relative w-full sm:w-[200px] lg:w-[300px]">
//           <Search
//             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//             size={17}
//           />
//           <Input placeholder="Search" className="pl-10 w-full bg-white" />
//         </div>

//         <div className="w-full sm:w-auto">
//           <SelectLayout
//             className="w-full sm:w-[200px] bg-white"
//             placeholder="Filter"
//             options={filterOptions}
//             value={selectedFilterId}
//             label=""
//             onChange={(id) => setSelectedFilterId(id)}
//           />
//         </div>
//       </div>

//       <div className="w-full">
//         <div className="flex flex-col sm:flex-row gap-3 w-full p-3 bg-white">
//           <div className="flex items-center gap-x-2">
//             <p className="text-xs sm:text-sm">Show</p>
//             <Input type="number" className="w-14 h-8" defaultValue="10" />
//             <p className="text-xs sm:text-sm">Entries</p>
//           </div>
//         </div>

//         <div className="bg-white flex">
//           <DataTable columns={columns} data={currentRows} />
//         </div>
//       </div>

//       <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//         <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//           Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} rows
//         </p>
//       </div>
//     </div>
//   );
// }

// export default ReceiptPage;







import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useInvoiceQuery, Receipt } from "../queries/receipt-getQueries";

function ReceiptPage() {
  const { data: fetchedData = [], isLoading } = useInvoiceQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const columns: ColumnDef<Receipt>[] = [
    {
      accessorKey: "inv_serial_num",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Serial No.
          <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("inv_serial_num")}</div>
      )
    },
    {
      accessorKey: "inv_date",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Issued
          <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("inv_date"));
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        return <div>{`${formattedDate} at ${formattedTime}`}</div>;
      },
    },
    {
      accessorKey: "inv_payor",
      header: "Payor",
    },
    {
      accessorKey: "inv_pay_method",
      header: "Payment Method",
    },       
    {
      accessorKey: "inv_nat_of_collection",
      header: "Nature of Collection",
    },
    {
      accessorKey: "inv_amount",
      header: "Amount",
    },
  ];

  const filterOptions = [
    { id: "all", name: "All" },
    { id: "Barangay Certification", name: "Barangay Certification" },
    { id: "Business Permit", name: "Business Permit" },
  ];

  const [selectedFilterId, setSelectedFilterId] = useState("all");

  // Filter data based on selected filter and search query
  const filteredData = fetchedData.filter((item: Receipt) => {
    const matchesFilter = selectedFilterId === "all" || 
      item.inv_nat_of_collection?.toLowerCase() === selectedFilterId.toLowerCase();
    
    const matchesSearch = !searchQuery || 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesFilter && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Receipts
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          List of recorded receipt transactions and corresponding collection details.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-full bg-white" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          <SelectLayout
            className="w-full sm:w-[200px] bg-white"
            placeholder="Filter"
            options={filterOptions}
            value={selectedFilterId}
            onChange={(id) => {
              setSelectedFilterId(id);
              setCurrentPage(1); // Reset to first page when changing filter
            }}
          />
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="flex items-center gap-x-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input 
              type="number" 
              className="w-14 h-8" 
              min="1"
              value={pageSize}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value));
                setPageSize(value);
                setCurrentPage(1);
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
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
        {filteredData.length > 0 && (
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

export default ReceiptPage;