import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PendingTable from "./tables/pending-table";
import AcceptedTable from "./tables/accepted-table";
import CompletedTable from "./tables/completed-table";
import RejectedTable from "./tables/rejected-table";


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
            Pending 
          </TabsTrigger>
          <TabsTrigger 
            value="accepted" 
            onClick={() => setActiveTab("accepted")} 
            className="data-[state=active]:bg-[#5B72CF]/20 data-[state=active]:text-[#5B72CF] data-[state=active]:border-[#5B72CF] hover:bg-[#5B72CF]/10 hover:text-[#5B72CF] transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Accepted 
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            onClick={() => setActiveTab("completed")} 
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Completed 
          </TabsTrigger>
          <TabsTrigger 
            value="rejected" 
            onClick={() => setActiveTab("rejected")} 
            className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800 data-[state=active]:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Rejected 
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-lg shadow-sm mt-6 dl mb-5">
          <TabsContent value="pending">
            <PendingTable/>
          </TabsContent>

          <TabsContent value="accepted">
            <AcceptedTable/>
          </TabsContent>

          <TabsContent value="completed">
            <CompletedTable />
          </TabsContent>

          <TabsContent value="rejected">
            <RejectedTable/>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default GarbagePickupRequestMain;