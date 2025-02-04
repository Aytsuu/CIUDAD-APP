import React, { useState } from 'react';
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from '@/components/ui/dialog/dialog-layout';// Adjust the import path as necessary
import WasteEventSched from "@/pages/waste-scheduling/waste-event-sched";
import WasteColSched from "@/pages/waste-scheduling/waste-col-sched";
import WasteHotSched from "@/pages/waste-scheduling/waste-hotspot-sched";
import { Button } from '@/components/ui/button';

const WasteMainScheduling = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Function to handle selection change
    const handleChange = (value: string) => {
        setSelectedValue(value);
        setIsOpen(true); // Open the modal when a selection is made
    };

    // Function to render the main content based on selection
    const renderMainContent = () => {
        switch (selectedValue) {
            case 'Event/Meeting':
                return <WasteEventSched />;
            case 'Waste Collection':
                return <WasteColSched />;
            case 'Hotspot':
                return <WasteHotSched />;
            default:
                return null;
        }
    };

    return (
        <div>
            <SelectLayout
                label=""
                placeholder="Schedule"
                options={[
                    { id: 'SchedEvent', name: 'Event/Meeting' },
                    { id: 'SchedWstCol', name: 'Waste Collection' },
                    { id: 'SchedHots', name: 'Hotspot' }
                ]}
                value={selectedValue}
                onChange={handleChange}
            />

            <DialogLayout
                trigger={<Button className="btn">Open Modal</Button>} // This can be a placeholder
                className="your-modal-class" // Add your modal class here
                title="Schedule Details"
                description="Fill out the form below."
                mainContent={renderMainContent()} // Render the main content based on selection
            />
        </div>
    );
};

export default WasteMainScheduling;