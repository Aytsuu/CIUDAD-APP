import React, { useState } from 'react';
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from '@/components/ui/dialog/dialog-layout';// Adjust the import path as necessary
import WasteEventSched from "@/pages/waste-scheduling/waste-event-sched";
import WasteColSched from "@/pages/waste-scheduling/waste-col-sched";
import WasteHotSched from "@/pages/waste-scheduling/waste-hotspot-sched";

const WasteMainScheduling = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Function to handle selection change
    const handleChange = (value: string) => {
        setSelectedValue(value);
        setIsOpen(true); // Open the modal when a selection is made
    };

    return (
        <div>
            <SelectLayout
                label=""
                placeholder="Schedule"
                options={[
                    { id: 'SchedEvent', name: <DialogLayout
                        trigger={<div className="border-none bg-transparent hover:bg-transparent shadow-none text-black">Event/Meeting</div>}
                        className="" 
                        title="Schedule Details"
                        description="Fill out the form below."
                        mainContent={<WasteEventSched />}   
                    /> },
                    { id: 'SchedWstCol', name: <DialogLayout
                        trigger={<div className="border-none bg-transparent hover:bg-transparent shadow-none text-black">Waste Collection</div>}
                        className="" 
                        title="Schedule Details"
                        description="Fill out the form below."
                        mainContent={<WasteColSched />}
                    /> },
                    { id: 'SchedHots', name: <DialogLayout
                        trigger={<div className="border-none bg-transparent hover:bg-transparent shadow-none text-black">Hotspot</div>}
                        className="" 
                        title="Assignment Details"
                        description="Fill out the form below."
                        mainContent={<WasteHotSched />}
                    />  }
                ]}
                value={selectedValue}
                onChange={handleChange}
            />
        </div>
    );
};

export default WasteMainScheduling;