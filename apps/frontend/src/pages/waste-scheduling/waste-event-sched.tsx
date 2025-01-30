import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/datepicker';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FilterAccordion } from '@/components/ui/filter-accordion'

const announcementOptions = [
    { id: "all", label: "All",  checked: false },
    { id: "allbrgystaff", label: "All Barangay Staff", checked: false },
    { id: "resdidents", label: "Residents", checked: false },
    { id: "wmstaff", label: "Waste Management Staff", checked: false },
    { id: "drivers", label: "Drivers", checked: false },
    { id: "cols", label: "Collectors", checked: false },
    { id: "watchmen", label: "Watchmen", checked: false },
  ];


function WasteEventSched() {

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleCategoryChange = (id: string, checked: boolean) => {
      setSelectedCategories((prev) =>
        checked ? [...prev, id] : prev.filter((category) => category !== id)
      );
    };
  
    const handleReset = () => {
      setSelectedCategories([]);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Label className="block text-center text-[30px] font-medium text-[#263D67]">SCHEDULE EVENT</Label><br/>
            <div>
                <Label>Calendar Event Name:</Label>
                <Input placeholder='Enter Event Name'></Input>
            </div><br/>
            <div>
                <Label>Location:</Label>
                <Input placeholder='Enter location/venue'></Input>
            </div><br/>
            <div>
                <Label>Date:</Label><br></br>
                <DatePicker></DatePicker>
            </div><br/>

            {/* Time */}
            
            <div>
                <Label>Organizer:</Label>
                <Input placeholder='Enter event organizer'></Input>
            </div><br/>
            <div>
                <Label>Invitees:</Label>
                <Input placeholder='Enter invitees, participants, collaborators, etc.'></Input>
            </div><br/>
            <div>
                <Label>Event Description:</Label>
                <Textarea placeholder='Enter event description (if there is any)'></Textarea>
            </div><br/>      
                <FilterAccordion
                    title="Do you want to post this schedule to the mobile app’s ANNOUNCEMENT page? If yes, select intended audience:"
                    options={announcementOptions.map((option) => ({
                    ...option,
                        checked: selectedCategories.includes(option.id),
                    }))}
                    selectedCount={selectedCategories.length}
                    onChange={handleCategoryChange}
                    onReset={handleReset}
                    />
            <br/>
            <div className="flex items-center justify-center">
                <Button className="inline-block rounded-md border border-[#263D67] bg-[#263D67] px-10 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-[#263D67] focus:outline-none focus:ring active:text-[#263D67]">Schedule</Button>
            </div>
        </div>
    );
}

export default WasteEventSched;