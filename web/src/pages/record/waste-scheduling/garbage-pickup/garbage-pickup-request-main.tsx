// import { HistoryTable } from "@/components/ui/table/history-table";
// import { Button } from "@/components/ui/button/button";
// import { Input } from "@/components/ui/input";
// import { Search, FileInput } from "lucide-react";
// import { useState } from "react";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { getPendingColumns } from "./table-columns/pending-table-columns";
// import { AcceptedColumns } from "./table-columns/accepted-table-columns";
// import { getRejectedColumns } from "./table-columns/rejected-request-columns";
// import { CompletedColumns } from "./table-columns/completed-request-columns";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useGetGarbagePendingRequest, useGetGarbageRejectRequest } from "./queries/GarbageRequestFetchQueries";
// import { DataTable } from "@/components/ui/table/data-table";

// type RequestData = {
//   garb_id: string;
//   garb_requester: string;
//   garb_location: string;
//   garb_waste_type: string;
//   garb_pref_date?: string;
//   garb_pref_time?: string;
//   garb_created_at: string;
//   garb_additional_note?: string;
//   garb_req_status: "pending" | "accepted" | "completed" | "rejected";
//   dec_id?: string;
//   dec_date?: string;
//   dec_reason?: string;
//   file_id: "";
// };

// export const SampleData: RequestData[] = [
//   {
//     garb_id: "001",
//     garb_requester: "Maria Mercedes",
//     garb_location: "Sitio 2",
//     garb_waste_type: "Household Waste",
//     garb_pref_date: "Jun 5, 2025",
//     garb_pref_time: "8:00am",
//     garb_created_at: "2025-06-01T09:00:00Z",
//     garb_additional_note: "",
//     garb_req_status: "pending",
//     file_id: "",
//   },
//   {
//     garb_id: "002",
//     garb_requester: "John Santos",
//     garb_location: "Sitio 1",
//     garb_waste_type: "Recyclable Waste",
//     garb_pref_date: "Jun 6, 2025",
//     garb_pref_time: "9:30am",
//     garb_created_at: "2025-06-02T10:00:00Z",
//     garb_additional_note: "",
//     garb_req_status: "accepted",
//     dec_id: "DEC001",
//     dec_date: "2025-06-04T10:00:00Z",
//     file_id: "",
//   },
//   {
//     garb_id: "003",
//     garb_requester: "Ana Reyes",
//     garb_location: "Sitio 3",
//     garb_waste_type: "Household Waste",
//     garb_pref_date: "Jun 7, 2025",
//     garb_pref_time: "10:00am",
//     garb_created_at: "2025-06-03T11:00:00Z",
//     garb_additional_note: "",
//     garb_req_status: "completed",
//     dec_id: "DEC002",
//     dec_date: "2025-06-05T14:00:00Z",
//     file_id: "",
//   },
//   {
//     garb_id: "004",
//     garb_requester: "Carlos Mendoza",
//     garb_location: "Sitio 2",
//     garb_waste_type: "Hazardous Waste",
//     garb_created_at: "2025-06-04T08:30:00Z",
//     garb_req_status: "rejected",
//     dec_id: "DEC003",
//     dec_date: "2025-06-06T11:30:00Z",
//     dec_reason: "We don't handle hazardous waste",
//     file_id: "",
//   },
// ];

// function GarbagePickupRequestMain() {
//   const [editingRowId, setEditingRowId] = useState<number | null>(null);
//   const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "completed" | "rejected">("pending");
//   const {data: pendingReqData = [], isLoading: isLoadingPending}= useGetGarbagePendingRequest(); 
//   const {data: rejectedReqData = [], isLoading: isLoadingRejected} = useGetGarbageRejectRequest();
  
//   console.log('Rejected Data:', rejectedReqData)
//   const pendingColumns = getPendingColumns({ editingRowId, setEditingRowId });
//   const rejectedColumns = getRejectedColumns();
  


//   console.log("Pending Data:", pendingReqData)

//   const acceptedData = SampleData.filter(item => item.garb_req_status === "accepted");
//   const completedData = SampleData.filter(item => item.garb_req_status === "completed");
//   const rejectedData = SampleData.filter(item => item.garb_req_status === "rejected");

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   if (isLoadingPending || isLoadingRejected) {
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
//     <div className="w-full h-full">
//       <div className="flex flex-col gap-3 mb-3">
//         <div className='flex flex-row gap-4'>
//           <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//             Garbage Pickup Request
//           </h1>
//         </div>
//         <p className="text-xs sm:text-sm text-darkGray">
//           Manage garbage pickup requests.
//         </p>
//       </div>
//       <hr className="border-gray mb-7 sm:mb-8" />

//       <Tabs defaultValue="pending" className="mb-6">
//         <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white h-[50px] rounded-lg shadow-sm border border-gray-100 text-center">
//           <TabsTrigger value="pending" onClick={() => setActiveTab("pending")} className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800 data-[state=active]:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center">
//             Pending ({pendingReqData.length})
//           </TabsTrigger>
//           <TabsTrigger value="accepted" onClick={() => setActiveTab("accepted")} className="data-[state=active]:bg-[#5B72CF]/20 data-[state=active]:text-[#5B72CF] data-[state=active]:border-[#5B72CF] hover:bg-[#5B72CF]/10 hover:text-[#5B72CF] transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center">
//             Accepted ({acceptedData.length})
//           </TabsTrigger>
//           <TabsTrigger value="completed" onClick={() => setActiveTab("completed")} className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center">
//             Completed ({completedData.length})
//           </TabsTrigger>
//           <TabsTrigger value="rejected" onClick={() => setActiveTab("rejected")} className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800 data-[state=active]:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center">
//             Rejected ({rejectedReqData.length})
//           </TabsTrigger>
//         </TabsList>

//         {/* Search UI only (non-functional) */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full mt-4">
//           <div className="relative w-full sm:w-auto sm:flex-1 max-w-2xl">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
//             <Input 
//               placeholder="Search" 
//               className="pl-10 w-full bg-white text-sm"
//               readOnly
//             />
//           </div>     
//         </div>

//         <div className="bg-white rounded-lg shadow-sm mt-6">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
//             <div>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline">
//                     <FileInput className="mr-2" size={16} />
//                     Export
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   <DropdownMenuItem>Export as CSV</DropdownMenuItem>
//                   <DropdownMenuItem>Export as Excel</DropdownMenuItem>
//                   <DropdownMenuItem>Export as PDF</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>                    
//             </div>
//           </div>

//           <TabsContent value="pending">
//             <HistoryTable 
//               columns={pendingColumns} 
//               data={pendingReqData}
//             />
//           </TabsContent>

//           <TabsContent value="accepted">
//             <HistoryTable 
//               columns={AcceptedColumns} 
//               data={acceptedData.map(item => ({
//                 garb_id: item.garb_id,
//                 garb_location: item.garb_location,
//                 garb_requester: item.garb_requester,
//                 garb_waste_type: item.garb_waste_type,
//                 garb_created_at: formatDate(item.garb_created_at),
//                 dec_id: item.dec_id || "N/A",
//                 dec_date: item.dec_date ? formatDate(item.dec_date) : "Not available"
//               }))}
//             />
//           </TabsContent>

//           <TabsContent value="completed">
//             <HistoryTable 
//               columns={CompletedColumns} 
//               data={completedData.map(item => ({
//                 garb_id: item.garb_id || "N/A",
//                 garb_requester: item.garb_requester || "Unknown",
//                 garb_location: item.garb_location || "Unknown",
//                 garb_waste_type: item.garb_waste_type || "Unknown",
//                 garb_created_at: item.garb_created_at ? formatDate(item.garb_created_at) : "Unknown date",
//                 dec_id: item.dec_id || "N/A",
//                 dec_date: item.dec_date ? formatDate(item.dec_date) : "Unknown date"
//               }))}
//             />
//           </TabsContent>

//           <TabsContent value="rejected">
//             <HistoryTable 
//                 columns={rejectedColumns}
//                 data={rejectedReqData}
//               />
//           </TabsContent>
//         </div>
//       </Tabs>
//     </div>
//   );
// }

// export default GarbagePickupRequestMain;

// import { useState } from "react";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useGetGarbagePendingRequest, useGetGarbageRejectRequest } from "./queries/GarbageRequestFetchQueries";
// import PendingTable from "./tables/pending-table";
// import AcceptedTable from "./tables/accepted-table";
// import CompletedTable from "./tables/completed-table";
// import RejectedTable from "./tables/rejected-table";

// function GarbagePickupRequestMain() {
//   const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "completed" | "rejected">("pending");
//   const { data: pendingReqData = [], isLoading: isLoadingPending } = useGetGarbagePendingRequest(); 
//   const { data: rejectedReqData = [], isLoading: isLoadingRejected } = useGetGarbageRejectRequest();

//   if (isLoadingPending || isLoadingRejected) {
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
//     <div className="w-full h-full">
//       <div className="flex flex-col gap-3 mb-3">
//         <div className='flex flex-row gap-4'>
//           <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//             Garbage Pickup Request
//           </h1>
//         </div>
//         <p className="text-xs sm:text-sm text-darkGray">
//           Manage garbage pickup requests.
//         </p>
//       </div>
//       <hr className="border-gray mb-7 sm:mb-8" />

//       <Tabs defaultValue="pending" className="mb-6">
//         <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white h-[50px] rounded-lg shadow-sm border border-gray-100 text-center">
//           <TabsTrigger value="pending" onClick={() => setActiveTab("pending")} className="...">
//             Pending ({pendingReqData.length})
//           </TabsTrigger>
//           <TabsTrigger value="accepted" onClick={() => setActiveTab("accepted")} className="...">
//             Accepted (0)
//           </TabsTrigger>
//           <TabsTrigger value="completed" onClick={() => setActiveTab("completed")} className="...">
//             Completed (0)
//           </TabsTrigger>
//           <TabsTrigger value="rejected" onClick={() => setActiveTab("rejected")} className="...">
//             Rejected ({rejectedReqData.length})
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="pending">
//           <PendingTable data={pendingReqData} />
//         </TabsContent>

//         <TabsContent value="accepted">
//           <AcceptedTable />
//         </TabsContent>

//         <TabsContent value="completed">
//           <CompletedTable />
//         </TabsContent>

//         <TabsContent value="rejected">
//           <RejectedTable data={rejectedReqData} />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// export default GarbagePickupRequestMain;

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PendingTable from "./tables/pending-table";
import AcceptedTable from "./tables/accepted-table";
import CompletedTable from "./tables/completed-table";
import RejectedTable from "./tables/rejected-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, FileInput } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu";

function GarbagePickupRequestMain() {
  const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "completed" | "rejected">("pending");


  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-3 mb-3">
        <div className='flex flex-row gap-4'>
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
            Garbage Pickup Request
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage garbage pickup requests.
        </p>
      </div>
      <hr className="border-gray mb-7 sm:mb-8" />

      <Tabs defaultValue="pending" className="mb-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white h-[50px] rounded-lg shadow-sm border border-gray-100 text-center">
          <TabsTrigger 
            value="pending" 
            onClick={() => setActiveTab("pending")} 
            className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800 data-[state=active]:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Pending (0)
          </TabsTrigger>
          <TabsTrigger 
            value="accepted" 
            onClick={() => setActiveTab("accepted")} 
            className="data-[state=active]:bg-[#5B72CF]/20 data-[state=active]:text-[#5B72CF] data-[state=active]:border-[#5B72CF] hover:bg-[#5B72CF]/10 hover:text-[#5B72CF] transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Accepted (0)
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            onClick={() => setActiveTab("completed")} 
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Completed (0)
          </TabsTrigger>
          <TabsTrigger 
            value="rejected" 
            onClick={() => setActiveTab("rejected")} 
            className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800 data-[state=active]:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Rejected (0)
          </TabsTrigger>
        </TabsList>

        {/* Search UI */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full mt-4">
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input 
              placeholder="Search" 
              className="pl-10 w-full bg-white text-sm"
              readOnly
            />
          </div>     
        </div>

        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileInput className="mr-2" size={16} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>                    
            </div>
          </div>

          <TabsContent value="pending">
            <PendingTable />
          </TabsContent>

          <TabsContent value="accepted">
            <AcceptedTable />
          </TabsContent>

          <TabsContent value="completed">
            <CompletedTable />
          </TabsContent>

          <TabsContent value="rejected">
            <RejectedTable />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default GarbagePickupRequestMain;