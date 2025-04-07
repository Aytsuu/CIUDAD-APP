// import { useState } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { Trash, Plus, Search, Eye } from "lucide-react";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import ClerkDonateCreate from "./donation-create";
// import ClerkDonateDeleteConf from "./donation-delete-conf";
// import ClerkDonateView from "./donation-view";
// import { DataTable } from "@/components/ui/table/data-table";
// import { ArrowUpDown } from "lucide-react";
// import { Input } from "@/components/ui/input";

// type Donation = {
//   refNo: string;
//   donor: string;
//   itemName: string;
//   itemCat: string;
//   itemqty: number;
//   datelisted: string;
// };

// const columns: ColumnDef<Donation>[] = [
//   {
//     accessorKey: "refNo",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Reference No.
//         <ArrowUpDown size={15} />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="capitalize">{row.getValue("refNo")}</div>
//     ),
//   },
//   {
//     accessorKey: "donor",
//     header: "Donor",
//   },
//   {
//     accessorKey: "itemName",
//     header: "Item Name",
//   },
//   {
//     accessorKey: "itemCat",
//     header: "Item Category",
//   },
//   {
//     accessorKey: "itemqty",
//     header: "Quantity",
//   },
//   {
//     accessorKey: "datelisted",
//     header: "Date",
//   },
//   {
//     accessorKey: "action",
//     header: "Action",
//     cell: ({ row }) => (
//       <div className="flex flex-col sm:flex-row gap-2">
//         <TooltipLayout
//           trigger={
//             <DialogLayout
//               trigger={
//                 <div
//                   className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"
//                 >
//                   <Eye size={16} />
//                 </div>
//               }
//               className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
//               title=""
//               description=""
//               mainContent={
//                 <div className="w-full h-full">
//                   <ClerkDonateView />
//                 </div>
//               }
//             />
//           }
//           content="View"
//         />
//         <TooltipLayout
//           trigger={
//             <DialogLayout
//               trigger={
//                 <div
//                   className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"
//                 >
//                   <Trash size={16} />
//                 </div>
//               }
//               className="max-w-[30%] h-1/3 flex flex-col"
//               title="Delete Record"
//               description=""
//               mainContent={<ClerkDonateDeleteConf />}
//             />
//           }
//           content="Delete"
//         />
//       </div>
//     ),
//   },
// ];

// const bodyData: Donation[] = [
//   {
//     refNo: "0001",
//     donor: "Loremifasolati",
//     itemName: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     itemCat: "Essential Goods",
//     itemqty: 20,
//     datelisted: "10-01-25",
//   },
//   {
//     refNo: "0002",
//     donor: "Loremifasolati",
//     itemName:
//       "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     itemCat: "Disaster Relief Supplies",
//     itemqty: 50,
//     datelisted: "12-10-25",
//   },
// ];

// function DonationTracker() {
//   const data = bodyData;
//   const filterOptions = [
//     { id: "All Donation Category", name: "All Donation Category" },
//     { id: "Monetary Donations", name: "Monetary Donations" },
//     { id: "Essential Goods", name: "Essential Goods" },
//     { id: "Medical Supplies", name: "Medical Supplies" },
//     { id: "Household Items", name: "Household Items" },
//     { id: "Educational Supplies", name: "Educational Supplies" },
//     { id: "Baby & Childcare Items", name: "Baby & Childcare Items" },
//     { id: "Animal Welfare Items", name: "Animal Welfare Items" },
//     { id: "Shelter & Homeless Aid", name: "Shelter & Homeless Aid" },
//     { id: "Disaster Relief Supplies", name: "Disaster Relief Supplies" },
//   ];

//   const [selectedFilter, setSelectedFilter] = useState(filterOptions[0].name);

//   const filteredData =
//     selectedFilter === "All Donation Category"
//       ? data
//       : data.filter((item) => item.itemCat === selectedFilter);

//       const [currentPage, setCurrentPage] = useState(1);
//       const totalPages = Math.ceil(filteredData.length / 12);
//       const handlePageChange = (newPage: number) => {
//       setCurrentPage(newPage);
//       };

//       const startIndex = (currentPage - 1) * 12;
//       const endIndex = startIndex + 12;
//       const currentRows = filteredData.slice(startIndex, endIndex);

//   return (
//     <div className="w-full h-full">
//       <div className="flex-col items-center mb-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//           Donation Records
//         </h1>
//         <p className="text-xs sm:text-sm text-darkGray">
//           Manage and view donation records
//         </p>
//       </div>
//       <hr className="border-gray mb-6 sm:mb-8" />

//       {/* Combined Search, Filter, and Create Button Section */}
//       <div className="relative w-full hidden lg:flex items-center gap-2 mb-4 justify-between">
//         {/* Search Input with Icon */}
//         <div className="flex gap-2">
//           <div className="relative flex-1">
//             <Search
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//               size={17}
//             />
//             <Input placeholder="Search..." className="pl-10 w-full bg-white" />
//           </div>

//           {/* Filter Dropdown */}
//           <div className="w-full sm:w-[200px]">
//             <SelectLayout
//               className="w-full bg-white"
//               label=""
//               placeholder="Filter by"
//               options={filterOptions}
//               value={selectedFilter}
//               onChange={(value) => setSelectedFilter(value)}
//             />
//           </div>
//         </div>
//         <DialogLayout
//           trigger={
//             <div className="flex items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
//               <Plus size={15} /> Create
//             </div>
//           }
//           className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
//           title=""
//           description=""
//           mainContent={
//             <div className="w-full h-full">
//               <ClerkDonateCreate />
//             </div>
//           }
//         />
//       </div>

//       {/* Table Section */}
//       <div className="w-full border-none bg-white rounded-[5px]">
//         <div className="flex gap-x-2 items-center p-3">
//           <p className="text-xs sm:text-sm">Show</p>
//           <Input type="number" className="w-14 h-8" defaultValue="10" />
//           <p className="text-xs sm:text-sm">Entries</p>
//         </div>

//         <DataTable columns={columns} data={filteredData} />
//       </div>

//       {/* Pagination Section */}
//       <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//         <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//           Showing 1-10 of {filteredData.length} rows
//         </p>

//         <div className="w-full sm:w-auto flex justify-center">
//           <PaginationLayout  currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={handlePageChange}/>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DonationTracker;

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Plus, Search, Eye, Edit } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import ClerkDonateCreate from "./donation-create";
import ClerkDonateView from "./donation-view";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input"
import { getdonationreq } from "./request-db/donationGetRequest";
import { putdonationreq } from "./request-db/donationPutRequest";
import { deldonationreq } from "./request-db/donationDelRequest";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Donation = {
  don_num: number;
  don_donorfname: string; 
  don_donorlname: string;
  don_item_name: string;
  don_qty: number;
  don_category: string;
  don_receiver: string;
  don_description?: string;
  don_date: string;
};

function DonationTracker() {
  const [data, setData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [isDialogOpen, setIsDialogOpen] = useState(false); 

  const fetchData = async () => {
    try {
      console.log("Fetching data...");
      const result = await getdonationreq();
      console.log("Data received:", result);
      
      if (!Array.isArray(result)) {
        throw new Error("Invalid data format");
      }
      
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load donations");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (don_num: number) => {
    try {
      const toastId = toast.loading("Deleting donation...");
      await deldonationreq(don_num.toString());
      
      toast.success("Donation deleted successfully", {
        id: toastId,
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
      setData(prevData => prevData.filter(item => item.don_num !== don_num));
    } catch (err) {
      toast.error("Failed to delete donation", {
        duration: 2000
      });
      console.error("Delete error:", err);
    }
  };

  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: "don_num",
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
        <div className="capitalize">{row.getValue("don_num")}</div>
      ),
    },
    {
      accessorKey: "don_donorfname",
      header: "Donor First Name",
    },
    {
      accessorKey: "don_donorlname", 
      header: "Donor Last Name",
    },
    {
      accessorKey: "don_item_name", 
      header: "Item Name",
    },
    {
      accessorKey: "don_category", 
      header: "Item Category",
    },
    {
      accessorKey: "don_qty", 
      header: "Quantity",
    },
    {
      accessorKey: "don_date", 
      header: "Date",
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
                  <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
                    <Eye size={16} />
                  </div>
                }
                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                title="Donation Details"
                description="View or edit donation details."
                mainContent={
                  <div className="w-full h-full">
                    <ClerkDonateView
                      don_num={row.original.don_num}
                      don_donorfname={row.original.don_donorfname}
                      don_donorlname={row.original.don_donorlname}
                      don_item_name={row.original.don_item_name}
                      don_qty={row.original.don_qty}
                      don_category={row.original.don_category}
                      don_receiver={row.original.don_receiver}
                      don_description={row.original.don_description}
                      don_date={row.original.don_date}  
                      onSaveSuccess={fetchData}            
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
                  onClick={() => handleDelete(row.original.don_num)} 
                />                    
              </div>   
            }
            content="Delete"
          />
        </div>
      ),
    },
  ];

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
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData =
    selectedFilter === "All Donation Category"
      ? data
      : data.filter((item) => item.don_category === selectedFilter);

  const totalPages = Math.ceil(filteredData.length / 12);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * 12;
  const endIndex = startIndex + 12;
  const currentRows = filteredData.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

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
      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="relative w-full hidden lg:flex items-center gap-2 mb-4 justify-between">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input placeholder="Search..." className="pl-10 w-full bg-white" />
          </div>

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
        <DialogLayout
          trigger={
            <div className="flex items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
              <Plus size={15} /> Create
            </div>
          }
          className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
          title=""
          description=""
          mainContent={
            <div className="w-full h-full">
              <ClerkDonateCreate onSuccess={() => setIsDialogOpen(false)}/>
            </div>
          }
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>

      <div className="w-full border-none bg-white rounded-[5px]">
        <div className="flex gap-x-2 items-center p-3">
          <p className="text-xs sm:text-sm">Show</p>
          <Input type="number" className="w-14 h-8" defaultValue="10" />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>

        <DataTable columns={columns} data={filteredData} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} rows
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

export default DonationTracker;