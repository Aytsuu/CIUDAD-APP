// import React, { useState } from "react";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import WasteEventSched from "@/pages/record/waste-scheduling/waste-event-sched";
// import WasteColSched from "@/pages/record/waste-scheduling/waste-colllection/waste-col-sched";
// import WasteHotSched from "@/pages/record/waste-scheduling/waste-hotspot-sched";
// import { Plus } from "lucide-react";
// import EventCalendar from "@/components/ui/calendar/EventCalendar";

// const scheduleComponents: Record<string, React.ReactNode> = {
//   SchedEvent: <WasteEventSched />,
//   SchedWstCol: <WasteColSched />,
//   SchedHots: <WasteHotSched />,
// };

// const WasteMainScheduling = () => {
//   const [selectedValue, setSelectedValue] = useState<string>("");

//   const handleChange = (value: string) => {
//     console.log("Selected Value (ID):", value);
//     setSelectedValue(value);
//   };

//   return (
//     <div className="w-full h-full">
//       {/* Header Section */}
//       <div className="flex-col items-center mb-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//           Calendar
//         </h1>
//         <p className="text-xs sm:text-sm text-darkGray">
//           Manage and view scheduled tasks and events.
//         </p>
//       </div>
//       <hr className="border-gray mb-6 sm:mb-8" />

//       {/* Filter and Create Button Section */}
//       <div className="relative w-full flex items-center gap-2 mb-4">
//         {/* Select Dropdown */}
//         <div className="w-full sm:w-[200px]">
//           <SelectLayout
//             className="w-full bg-white"
//             label=""
//             placeholder="Schedule"
//             options={[
//               { id: "SchedEvent", name: "Event/Meeting" },
//               { id: "SchedWstCol", name: "Waste Collection" },
//               { id: "SchedHots", name: "Hotspot" },
//             ]}
//             value={selectedValue}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Create Button */}
//         <div className="w-full sm:w-auto">
//           <DialogLayout
//             trigger={
//               <div className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded cursor-pointer flex items-center justify-center w-full sm:w-auto">
//                 <Plus /> Create
//               </div>
//             }
//             className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
//             title=""
//             description=""
//             mainContent={
//               scheduleComponents[selectedValue] || (
//                 <div>Please select a schedule type.</div>
//               )
//             }
//           />
//         </div>
//       </div>

//       {/* Calendar Section */}
//       <div className="w-full bg-white">
//         <EventCalendar /> 
//       </div>
//     </div>
//   );
// };

// export default WasteMainScheduling;

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from 'lucide-react';
import React, { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import EventCalendar from "@/components/ui/calendar/EventCalendar";
import WasteColSched from "./waste-colllection/waste-col-sched";
import WasteHotspotMain from "./waste-hotspot/waste-hotspot-main";
import WasteEventSched from "./waste-event-sched";


interface ScheduleComponentProps {
  [key: string]: React.ReactNode;
}

const WasteMainScheduling = () => {

  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="w-full h-full">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Calendar
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view scheduled tasks and events.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Tabs Section */}
       <Tabs defaultValue="calendar" className="mb-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white h-[50px] rounded-lg shadow-sm border border-gray-100 text-center">
           <TabsTrigger 
            value="calendar" 
            onClick={() => setActiveTab("calendar")} 
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 data-[state=active]:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Calendar 
          </TabsTrigger>
          <TabsTrigger 
            value="waste-collection" 
            onClick={() => setActiveTab("waste-collection")} 
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 data-[state=active]:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Waste Collection 
          </TabsTrigger>
          <TabsTrigger 
            value="hotspot" 
            onClick={() => setActiveTab("hotspot")} 
            className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-800 data-[state=active]:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Hotspot 
          </TabsTrigger>
          <TabsTrigger 
            value="waste-events" 
            onClick={() => setActiveTab("waste-events")} 
            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800 data-[state=active]:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Waste Events 
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendar Section */}
          <div className="w-full bg-white">
            <EventCalendar />
          </div>
        </TabsContent>

        <TabsContent value="waste-collection" className="space-y-4">
          {/* <WasteColSched /> */}
        </TabsContent>

        <TabsContent value="hotspot" className="space-y-4">
          <WasteHotspotMain/>
        </TabsContent>

        <TabsContent value="waste-events" className="space-y-4">
          {/* <WasteEventSched /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WasteMainScheduling;

