import { useState } from 'react';
import {Input} from '../components/ui/input.tsx';
import {Label} from '../components/ui/label.tsx';
import {DatePicker} from '../components/ui/datepicker.tsx';
import {Textarea} from '../components/ui/textarea.tsx';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem,SelectLabel,SelectSeparator,SelectGroup} from "../components/ui/select/select.tsx";
import {Button} from '../components/ui/button.tsx';
import {FilterAccordion} from '../components/ui/filter-accordion.tsx'
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
import { SelectLayout } from "@/components/ui/select/select-layout";


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import AddEventFormSchema from "@/form-schema/addevent-schema";



function AddEvent(){

    //css for the 1st modal of adding the event
    const inputlabelcss = "block text-sm font-medium text-gray-700 mb-1";
    const inputcss = "mt-[12px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]";
    const textbuttoncss = "text-[#394360] text-lg font-medium cursor-pointer";

    //css for the checkbox part
    const labelText = "block text-xs font-medium text-gray-700";
    const checkboxcss = "size-5";
    const checkboxclass = "inline-flex items-center gap-2";


    //for the modal
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
        { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO"},
        { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS"},
        { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA"},
    ];

    const GADCategory = [
        { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL"},
        { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE"},
        { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM"},
    ];

    const WasteCategory = [
        { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL"},
        { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE"},
        { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM"},
    ];

    const handleResetBarangayCouncil = () => {
        form.setValue('barangayCouncil', []);
    };

    const handleResetGADCommittee = () => {
        form.setValue('gadCommittee', []);
    };

    const handleResetWasteCommittee = () => {
        form.setValue('wasteCommittee', []);
    };



    const form = useForm<z.infer<typeof AddEventFormSchema>>({
        resolver: zodResolver(AddEventFormSchema),
        defaultValues: {
            eventTitle: "",
            eventDate: "",
            roomPlace: "",
            eventCategory: "",
            eventTime: "",
            eventDescription: "",
            barangayCouncil: [],
            gadCommittee: [],
            wasteCommittee: [],
        },
    });

    function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }


    return(
        <div>
            <div className="p-5 w-full mx-auto h-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="max-h-[370px]">
                            <div>
                                <FormField
                                    control={form.control}
                                    name="eventTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Event Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Event Title" className={inputcss} {...field}></Input>
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-[20px]">
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="eventDate"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Event Date</FormLabel>
                                            <FormControl>
                                                <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="eventTime"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Event Time</FormLabel>
                                            <FormControl>
                                                <input type="time" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />                                    
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-[20px]">
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="eventCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Event Category</FormLabel>
                                            <FormControl>
                                                <SelectLayout
                                                    label="Categories"
                                                    placeholder="Select Event Category"
                                                    options={[
                                                        {id: "meeting", name: "Meeting"},
                                                        {id: "activity", name: "Activity"}                                                   
                                                    ]}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="roomPlace"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Room / Place</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Room / Place" className={inputcss} {...field}></Input>
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="mt-[20px]">
                                <FormField
                                    control={form.control}
                                    name="eventDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Room / Place</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="w-full border border-[#B3B7BD] p-2 shadow-sm focus:outline-none h-40 mt-[12px] rounded-[5px] resize-none"
                                                placeholder="Enter Meeting Description"
                                                {...field}>
                                            </Textarea>
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />                                    
                            </div>
                            
                            <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8 pt-8">ATTENDEES</h1>
                            <div className="space-y-4 pb-20">
                                {/* Attendees Checkboxes */}
                                <FormField
                                    control={form.control}
                                    name="barangayCouncil"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel></FormLabel>
                                        <FormControl>
                                            <FilterAccordion
                                                title="BARANGAY COUNCUL"
                                                options={CouncilCategory.map((option) => ({
                                                    ...option,
                                                    checked: field.value?.includes(option.id) || false, // Use optional chaining
                                                }))}
                                                selectedCount={field.value?.length || 0} // Use optional chaining
                                                onChange={(id: string, checked: boolean) => {
                                                    const newSelected = checked
                                                        ? [...(field.value || []), id] // Provide a fallback
                                                        : (field.value || []).filter((category) => category !== id); // Provide a fallback
                                                    field.onChange(newSelected);
                                                }}
                                                onReset={handleResetBarangayCouncil} // resets the selected boxes
                                            />                                        
                                        </FormControl>
                                        <FormMessage /> 
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gadCommittee"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel></FormLabel>
                                        <FormControl>
                                            <FilterAccordion
                                                title="GAD COMMITTEE"
                                                options={GADCategory.map((option) => ({
                                                    ...option,
                                                    checked: field.value?.includes(option.id) || false, // Use optional chaining
                                                }))}
                                                selectedCount={field.value?.length || 0} // Use optional chaining
                                                onChange={(id: string, checked: boolean) => {
                                                    const newSelected = checked
                                                        ? [...(field.value || []), id] // Provide a fallback
                                                        : (field.value || []).filter((category) => category !== id); // Provide a fallback
                                                    field.onChange(newSelected);
                                                }}
                                                onReset={handleResetGADCommittee} // resets the selected boxes
                                            />                                        
                                        </FormControl>
                                        <FormMessage /> 
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="wasteCommittee"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel></FormLabel>
                                        <FormControl>
                                            <FilterAccordion
                                                title="WASTE COMMITTEE"
                                                options={WasteCategory.map((option) => ({
                                                    ...option,
                                                    checked: field.value?.includes(option.id) || false, // Use optional chaining
                                                }))}
                                                selectedCount={field.value?.length || 0} // Use optional chaining
                                                onChange={(id: string, checked: boolean) => {
                                                    const newSelected = checked
                                                        ? [...(field.value || []), id] // Provide a fallback
                                                        : (field.value || []).filter((category) => category !== id); // Provide a fallback
                                                    field.onChange(newSelected);
                                                }}
                                                onReset={handleResetWasteCommittee} // resets the selected boxes
                                            />                                        
                                        </FormControl>
                                        <FormMessage /> 
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex items-center justify-center">
                                <Button type="submit" className="mb-10 inline-block rounded-md border border-[#3D4C77] bg-[#3D4C77] px-8 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-[#263D67] focus:outline-none focus:ring active:text-[#263D67]">
                                    Schedule                                                                                                                          
                                </Button>
                            </div>                 
                        </div>                                                                      
                   </form>
                </Form>                
            </div>
        </div>
    );
}
export default AddEvent