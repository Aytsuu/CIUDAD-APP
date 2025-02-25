import React, { useState } from "react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import WasteEventSched from "@/pages/waste-scheduling/waste-event-sched";
import WasteColSched from "@/pages/waste-scheduling/waste-col-sched";
import WasteHotSched from "@/pages/waste-scheduling/waste-hotspot-sched";
import CalendarComp from "@/components/event-calendar";

const scheduleComponents: Record<string, React.ReactNode> = {
  SchedEvent: <WasteEventSched />,
  SchedWstCol: <WasteColSched />,
  SchedHots: <WasteHotSched />,
};

const WasteMainScheduling = () => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleChange = (value: string) => {
    console.log("Selected Value (ID):", value);
    setSelectedValue(value);
  };

  const [events, setEvents] = useState<
    { start: Date; end: Date; title: string }[]
  >([]);

  return (
    <div className="w-full">
      <div className="p-10">
          <div className="flex justify-end gap-2">
            <SelectLayout
              className=""
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
            <DialogLayout
              trigger={
                <div className="w-[50px] h-[35px] border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]">
                  Create
                </div>
              }
              className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
              title=""
              description=""
              mainContent={
                scheduleComponents[selectedValue] || (
                  <div>Please select a schedule type.</div>
                )
              }
            />
          </div>
          <CalendarComp
              events={events}
              setEvents={setEvents}
              className="w-full"
            />
        </div>
      </div>
  );
};

export default WasteMainScheduling;
