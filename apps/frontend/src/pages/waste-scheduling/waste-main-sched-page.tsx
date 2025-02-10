import React, { useState } from 'react';
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from '@/components/ui/dialog/dialog-layout';
import WasteEventSched from "@/pages/waste-scheduling/waste-event-sched";
import WasteColSched from "@/pages/waste-scheduling/waste-col-sched";
import WasteHotSched from "@/pages/waste-scheduling/waste-hotspot-sched";

const scheduleComponents: Record<string, React.ReactNode> = {
  SchedEvent: <WasteEventSched />,
  SchedWstCol: <WasteColSched />,
  SchedHots: <WasteHotSched />,
};

const WasteMainScheduling = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const handleChange = (value: string) => {
    console.log("Selected Value (ID):", value);
    setSelectedValue(value);
  };

  return (
    <div>
      <SelectLayout
        label=""
        placeholder="Schedule"
        options={[
          { id: 'SchedEvent', name: 'Event/Meeting' }, // id for logic, name for display
          { id: 'SchedWstCol', name: 'Waste Collection' },
          { id: 'SchedHots', name: 'Hotspot' }
        ]}
        value={selectedValue}
        onChange={handleChange}
      />

      <DialogLayout
        trigger={
          <div className="border rounded border-input bg-black text-white shadow-sm hover:bg-accent hover:text-accent-foreground">
            Create
          </div>
        }
        className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
        title="Schedule Details"
        description="Fill out the form below."
        mainContent={scheduleComponents[selectedValue] || <div>Please select a schedule type.</div>}
      />
    </div>
  );
};

export default WasteMainScheduling;