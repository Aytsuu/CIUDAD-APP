import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectGroup } from "@/components/ui/select";
import { DatePicker } from '@/components/ui/datepicker';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FilterAccordion } from '@/components/ui/filter-accordion'

const sitioOptions = [
    { id: "sitio1", label: "Sitio 1",  checked: false },
    { id: "sitio2", label: "Sitio 2", checked: false },
  ];

const announcementOptions = [
    { id: "all", label: "All",  checked: false },
    { id: "allbrgystaff", label: "All Barangay Staff", checked: false },
    { id: "resdidents", label: "Residents", checked: false },
    { id: "wmstaff", label: "Waste Management Staff", checked: false },
    { id: "drivers", label: "Drivers", checked: false },
    { id: "cols", label: "Collectors", checked: false },
    { id: "watchmen", label: "Watchmen", checked: false },
  ];

function WasteHotSched() {

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
            <Label className="block text-center text-[30px] font-medium text-[#263D67]">WATCHMAN FOR HOTSPOTS</Label>
            <Label>Sitio:</Label>
                        <FilterAccordion
                        title="Select Sitio"
                        options={sitioOptions.map((option) => ({
                          ...option,
                          checked: selectedCategories.includes(option.id),
                        }))}
                        selectedCount={selectedCategories.length}
                        onChange={handleCategoryChange}
                        onReset={handleReset}
                      /> <br/>
            <div>
                <Label>Watchman:</Label>
            <Select>
                <SelectTrigger>
                <SelectValue placeholder="Select Watchman" />
                </SelectTrigger>
                <SelectContent>
                <SelectGroup>
                <SelectLabel>Available Watchman</SelectLabel>
                    <SelectSeparator />
                    <SelectItem value="WasteColSitio1">Watchman 1</SelectItem>
                    <SelectItem value="WasteColSitio2">Watchman 2</SelectItem>
                </SelectGroup>
                </SelectContent>
            </Select>
            </div>
            <br/>
            <div>
                <Label>Date:</Label><br/>
                <DatePicker></DatePicker>
            </div>
            {/* Time */}
            <br/>
            <div>
                <Label>Additional Instructions:</Label>
                <Textarea placeholder='Enter additional instructions (if there is any)'></Textarea>
            </div>      
            <br/>
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

export default WasteHotSched;