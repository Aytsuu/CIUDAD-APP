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

type Donation = {
  don_num: string; // Reference number (if needed)
  don_donorfname: string; // Donor first name
  don_donorlname: string; // Donor last name
  don_item_name: string; // Item name
  don_qty: string; // Item quantity (as a string to match the schema)
  don_category: string; // Item category
  don_receiver: string; // Receiver
  don_description?: string; // Item description (optional)
  don_date: string; // Donation date
};

function DonationTracker() {
  const [data, setData] = useState<Donation[]>([]); // Initialize with an empty array
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState<string | null>(null); // Add an error state

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getdonationreq(); // Fetch data from the API
        setData(result); // Store the fetched data in state
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again."); // Set error message
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle delete functionality
  const handleDelete = async (don_num : string) => {
    try {
      await deldonationreq(don_num); // Pass refNo as a string
      setData((prevData) => prevData.filter((item) => item.don_num !== don_num));
    } catch (err) {
      console.error("Failed to delete donation:", err);
    }
  };

  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: "don_num", // Use don_num instead of refNo
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
      accessorKey: "don_donorfname", // Use don_donorfname instead of donor
      header: "Donor First Name",
    },
    {
      accessorKey: "don_donorlname", // Use don_donorlname instead of donor
      header: "Donor Last Name",
    },
    {
      accessorKey: "don_item_name", // Use don_item_name instead of itemName
      header: "Item Name",
    },
    {
      accessorKey: "don_category", // Use don_category instead of itemCat
      header: "Item Category",
    },
    {
      accessorKey: "don_qty", // Use don_qty instead of itemqty
      header: "Quantity",
    },
    {
      accessorKey: "don_date", // Use don_date instead of datelisted
      header: "Date",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex flex-col sm:flex-row gap-2">
          {/* View and Edit buttons */}
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
                      don_donorfname={row.original.don_donorfname}
                      don_donorlname={row.original.don_donorlname}
                      don_item_name={row.original.don_item_name}
                      don_qty={row.original.don_qty}
                      don_category={row.original.don_category}
                      don_receiver={row.original.don_receiver}
                      don_description={row.original.don_description}
                      don_date={row.original.don_date}
                      onSave={(values) => {
                        // Handle saving the updated donation data
                        console.log("Updated values:", values);
                        // Call your API to update the donation record
                      }}
                    />
                  </div>
                }
              />
            }
            content="View"
          />
          {/* Delete button */}
          <TooltipLayout
            trigger={
              <div
                className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"
                onClick={() => handleDelete(row.original.don_num)} 
              >
                <Trash size={16} />
              </div>
            }
            content="Delete"
          />
        </div>
      ),
    },
  ];

  // Filter options
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

  // Filter the data based on the selected filter
  const filteredData =
    selectedFilter === "All Donation Category"
      ? data
      : data.filter((item) => item.don_category === selectedFilter);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / 12);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * 12;
  const endIndex = startIndex + 12;
  const currentRows = filteredData.slice(startIndex, endIndex);

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error state
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

      {/* Combined Search, Filter, and Create Button Section */}
      <div className="relative w-full hidden lg:flex items-center gap-2 mb-4 justify-between">
        {/* Search Input with Icon */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
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
              <ClerkDonateCreate />
            </div>
          }
        />
      </div>

      {/* Table Section */}
      <div className="w-full border-none bg-white rounded-[5px]">
        <div className="flex gap-x-2 items-center p-3">
          <p className="text-xs sm:text-sm">Show</p>
          <Input type="number" className="w-14 h-8" defaultValue="10" />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>

        <DataTable columns={columns} data={currentRows} />
      </div>

      {/* Pagination Section */}
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