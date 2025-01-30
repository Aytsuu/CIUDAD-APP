import { useState } from 'react';
import {Input} from '../components/ui/input.tsx';
import {Label} from '../components/ui/label.tsx';
import {DatePicker} from '../components/ui/datepicker.tsx';
import {Textarea} from '../components/ui/textarea.tsx';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem,SelectLabel,SelectSeparator,SelectGroup} from "../components/ui/select.tsx";
import {Button} from '../components/ui/button.tsx';
import {FilterAccordion} from '../components/ui/filter-accordion.tsx'

function AddEvent(){

    //css for the 1st modal of adding the event
    const inputlabelcss = "block text-sm font-medium text-gray-700 mb-1";
    const inputcss = "mt-[12px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]";
    const textbuttoncss = "text-[#394360] text-lg font-medium cursor-pointer";

    //css for the checkbox part
    const labelText = "block text-xs font-medium text-gray-700";
    const checkboxcss = "size-5";
    const checkboxclass = "inline-flex items-center gap-2";


    const [events, setEvents] = useState<{ start: Date; end: Date; title: string }[]>([]);
    const [showAttendees, setShowAttendees] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddEvent = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    //dropdown w/checkbox 
    const CouncilCategory = [
        { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO", checked: false },
        { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS", checked: false },
        { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA", checked: false },
    ];

    const WasteCategory = [
        { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL", checked: false },
        { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE", checked: false },
        { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM", checked: false },
    ];

    const GADCategory = [
        { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL", checked: false },
        { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE", checked: false },
        { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM", checked: false },
    ];

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleCategoryChange = (id: string, checked: boolean) => {
      setSelectedCategories((prev) =>
        checked ? [...prev, id] : prev.filter((category) => category !== id)
      );
    };
  
    const handleReset = () => {
      setSelectedCategories([]);
    };


    return(
        <div className="fixed inset-0 flex items-center justify-center bg-black/15 z-50">
            <div className="p-8 w-[800px] mx-auto h-144 bg-white shadow-lg rounded-[10px]">
                <form className="space-y-4">
                    {/* First Modal Section */}
                    {!showAttendees ? (
                        <>
                        <div className="flex justify-between items-center mb-6 pl-[571px]">
                            <button
                                className={textbuttoncss}
                                onClick={() => setShowAttendees(true)} // Switch to the attendees section
                                type="button"
                                >
                                NEXT &gt;
                            </button>
                        </div>

                        <div className="mt-10">
                            <Label className={inputlabelcss}>Meeting Title</Label>
                            <Input id="meetTitle" placeholder="Enter Meeting Title" className={inputcss}></Input>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                {/* <label className={inputlabelcss}>Date</label> */}
                                <Label className={inputlabelcss}>Date</Label>
                                {/* <input type="date" id="date" className={inputcss} /> */}
                                <DatePicker></DatePicker>
                            </div>
                            <div>
                                <Label className={inputlabelcss}>Room / Place</Label>
                                <Input id="place" placeholder="Enter Room / Place" className={inputcss}></Input>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className={inputlabelcss}>Category</Label>
                                    <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Categories</SelectLabel>
                                        <SelectSeparator />
                                        <SelectItem value="Meeting">Meeting</SelectItem>
                                        <SelectItem value="Activity">Activity</SelectItem>
                                    </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className={inputlabelcss}>Time</label>
                                <input type="time" id="time" className={inputcss} />
                            </div>
                        </div>

                        <div>
                        <Label className={inputlabelcss}>Meeting Description</Label>
                            <Textarea
                                className="w-full border border-[#B3B7BD] p-2 shadow-sm focus:outline-none h-40 mt-[12px] rounded-[5px] resize-none"
                                placeholder="Enter Meeting Description">
                            </Textarea>
                        </div>
                        </>
                    ) : (
                        // Attendees Section
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <button
                                className={textbuttoncss}
                                onClick={() => setShowAttendees(false)} // Switch back to the first section
                                type="button"
                                >
                                &lt; BACK
                                </button>
                            </div>
                            <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8">ATTENDEES</h1>
                            <div className="space-y-4 pb-20 overflow-y-auto max-h-[300px] scrollbar-custom pr-2">
                                {/* Attendees Checkboxes */}
                                <FilterAccordion
                                    title="BARANGAY COUNCIL"
                                    options={CouncilCategory.map((option) => ({
                                    ...option,
                                    checked: selectedCategories.includes(option.id),
                                    }))}
                                    selectedCount={selectedCategories.length}
                                    onChange={handleCategoryChange}
                                    onReset={handleReset}
                                />

                                <FilterAccordion
                                    title="WASTE COMMITTEE"
                                    options={WasteCategory.map((option) => ({
                                    ...option,
                                    checked: selectedCategories.includes(option.id),
                                    }))}
                                    selectedCount={selectedCategories.length}
                                    onChange={handleCategoryChange}
                                    onReset={handleReset}
                                />

                                <FilterAccordion
                                    title="GENDER AND DEVELOPMENT COMMITTEE"
                                    options={GADCategory.map((option) => ({
                                    ...option,
                                    checked: selectedCategories.includes(option.id),
                                    }))}
                                    selectedCount={selectedCategories.length}
                                    onChange={handleCategoryChange}
                                    onReset={handleReset}
                                />
                            </div>
                            <div className="flex items-center justify-center">
                                <Button type="submit" className="inline-block rounded-md border border-[#3D4C77] bg-[#3D4C77] px-8 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-[#263D67] focus:outline-none focus:ring active:text-[#263D67]">
                                    Schedule                                                                                                                          
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
export default AddEvent