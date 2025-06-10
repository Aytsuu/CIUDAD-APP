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





import React, { useState } from "react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import WasteEventSched from "@/pages/record/waste-scheduling/waste-event-sched";
import WasteColSched from "@/pages/record/waste-scheduling/waste-colllection/waste-col-sched";
import WasteHotSched from "@/pages/record/waste-scheduling/waste-hotspot-sched";
import { Plus } from "lucide-react";
import EventCalendar from "@/components/ui/calendar/EventCalendar";

const scheduleComponents: Record<string, React.ReactNode> = {
  SchedEvent: <WasteEventSched />,
  SchedWstCol: <WasteColSched />,
  SchedHots: <WasteHotSched />,
};

const WasteMainScheduling = () => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChange = (value: string) => {
    console.log("Selected Value (ID):", value);
    setSelectedValue(value);
  };

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

      {/* Filter and Create Button Section */}
      <div className="relative w-full flex items-center gap-2 mb-4">
        {/* Select Dropdown */}
        <div className="w-full sm:w-[200px]">
          <SelectLayout
            className="w-full bg-white"
            label=""
            placeholder="Schedule"
            options={[
              { id: "SchedEvent", name: "Event/Meeting" },
              { id: "SchedWstCol", name: "Waste Collection" },
              { id: "SchedHots", name: "Hotspot" },
            ]}
            value={selectedValue}
            onChange={handleChange}
          />
        </div>

        {/* Create Button */}
        <div className="w-full sm:w-auto">
          <DialogLayout
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            trigger={
              <div className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded cursor-pointer flex items-center justify-center w-full sm:w-auto">
                <Plus /> Create
              </div>
            }
            className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
            title=""
            description=""
            mainContent={
                selectedValue ? (
                    React.cloneElement(scheduleComponents[selectedValue] as React.ReactElement, {
                        onSuccess: () => setIsDialogOpen(false)
                    })
                ) : (
                    <div>Please select a schedule type.</div>
                )
            }
          />
        </div>
      </div>

      {/* Calendar Section */}
      <div className="w-full bg-white">
        <EventCalendar /> 
      </div>
    </div>
  );
};

export default WasteMainScheduling;

