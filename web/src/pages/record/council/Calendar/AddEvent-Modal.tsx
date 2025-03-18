// import { useState } from 'react';
// import {Input} from '../../../../components/ui/input.tsx';
// import {Label} from '../../../../components/ui/label.tsx';
// import {DatePicker} from '../../../../components/ui/datepicker.tsx';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem,SelectLabel,SelectSeparator,SelectGroup} from "../../../../components/ui/select/select.tsx";
// import {Button} from '../../../../components/ui/button.tsx';
// import {FilterAccordion} from '../../../../components/ui/filter-accordion.tsx'
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
// import { SelectLayout } from "@/components/ui/select/select-layout";



// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import AddEventFormSchema from "@/form-schema/addevent-schema";



// function AddEvent(){

//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

//     //for the modal
//     const [events, setEvents] = useState<{ start: Date; end: Date; title: string }[]>([]);
//     const [showAttendees, setShowAttendees] = useState(false);
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const handleAddEvent = () => {
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//     };

//     //dropdown w/checkbox 
//     const CouncilCategory = [
//         { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO"},
//         { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS"},
//         { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA"},
//     ];

//     const GADCategory = [
//         { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL"},
//         { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE"},
//         { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM"},
//     ];

//     const WasteCategory = [
//         { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL"},
//         { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE"},
//         { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM"},
//     ];

//     const handleResetBarangayCouncil = () => {
//         form.setValue('barangayCouncil', []);
//     };

//     const handleResetGADCommittee = () => {
//         form.setValue('gadCommittee', []);
//     };

//     const handleResetWasteCommittee = () => {
//         form.setValue('wasteCommittee', []);
//     };



//     const form = useForm<z.infer<typeof AddEventFormSchema>>({
//         resolver: zodResolver(AddEventFormSchema),
//         defaultValues: {
//             eventTitle: "",
//             eventDate: "",
//             roomPlace: "",
//             eventCategory: "",
//             eventTime: "",
//             eventDescription: "",
//             barangayCouncil: [],
//             gadCommittee: [],
//             wasteCommittee: [],
//         },
//     });

//     function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
//         // Do something with the form values.
//         // ✅ This will be type-safe and validated.
//         console.log(values)
//     }


//     return(
//         <div>
//             <div className="p-5 w-full mx-auto h-full">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="max-h-[370px]">
//                             <div>
//                                 <FormField
//                                     control={form.control}
//                                     name="eventTitle"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                         <FormLabel>Event Title</FormLabel>
//                                         <FormControl>
//                                             <Input placeholder="Enter Event Title" className={inputcss} {...field}></Input>
//                                         </FormControl>
//                                         <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventDate"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Event Date</FormLabel>
//                                             <FormControl>
//                                                 <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                             </FormControl>
//                                             <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventTime"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Event Time</FormLabel>
//                                             <FormControl>
//                                                 <input type="time" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                             </FormControl>
//                                             <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />                                    
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventCategory"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Event Category</FormLabel>
//                                             <FormControl>
//                                                 <SelectLayout
//                                                     className={inputcss}
//                                                     label="Categories"
//                                                     placeholder="Select Event Category"
//                                                     options={[
//                                                         {id: "meeting", name: "Meeting"},
//                                                         {id: "activity", name: "Activity"}                                                   
//                                                     ]}
//                                                     value={field.value}
//                                                     onChange={field.onChange}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="roomPlace"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Room / Place</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Enter Room / Place" className={inputcss} {...field}></Input>
//                                             </FormControl>
//                                             <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-[20px]">
//                                 <FormField
//                                     control={form.control}
//                                     name="eventDescription"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                         <FormLabel>Event Description</FormLabel>
//                                         <FormControl>
//                                             <Textarea
//                                                 className="w-full p-2 shadow-sm h-40 mt-[12px] rounded-[5px] resize-none"
//                                                 placeholder="Enter Meeting Description"
//                                                 {...field}>
//                                             </Textarea>
//                                         </FormControl>
//                                         <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />                                    
//                             </div>
                            
//                             <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8 pt-8">ATTENDEES</h1>
//                             <div className="space-y-4 pb-20">
//                                 {/* Attendees Checkboxes */}
//                                 <FormField
//                                     control={form.control}
//                                     name="barangayCouncil"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <FilterAccordion
//                                                 title="BARANGAY COUNCIL"
//                                                 options={CouncilCategory.map((option) => ({
//                                                     ...option,
//                                                     checked: field.value?.includes(option.id) || false, // Use optional chaining
//                                                 }))}
//                                                 selectedCount={field.value?.length || 0} // Use optional chaining
//                                                 onChange={(id: string, checked: boolean) => {
//                                                     const newSelected = checked
//                                                         ? [...(field.value || []), id] // Provide a fallback
//                                                         : (field.value || []).filter((category) => category !== id); // Provide a fallback
//                                                     field.onChange(newSelected);
//                                                 }}
//                                                 onReset={handleResetBarangayCouncil} // resets the selected boxes
//                                             />                                        
//                                         </FormControl>
//                                         <FormMessage /> 
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="gadCommittee"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <FilterAccordion
//                                                 title="GAD COMMITTEE"
//                                                 options={GADCategory.map((option) => ({
//                                                     ...option,
//                                                     checked: field.value?.includes(option.id) || false, // Use optional chaining
//                                                 }))}
//                                                 selectedCount={field.value?.length || 0} // Use optional chaining
//                                                 onChange={(id: string, checked: boolean) => {
//                                                     const newSelected = checked
//                                                         ? [...(field.value || []), id] // Provide a fallback
//                                                         : (field.value || []).filter((category) => category !== id); // Provide a fallback
//                                                     field.onChange(newSelected);
//                                                 }}
//                                                 onReset={handleResetGADCommittee} // resets the selected boxes
//                                             />                                        
//                                         </FormControl>
//                                         <FormMessage /> 
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="wasteCommittee"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <FilterAccordion
//                                                 title="WASTE COMMITTEE"
//                                                 options={WasteCategory.map((option) => ({
//                                                     ...option,
//                                                     checked: field.value?.includes(option.id) || false, // Use optional chaining
//                                                 }))}
//                                                 selectedCount={field.value?.length || 0} // Use optional chaining
//                                                 onChange={(id: string, checked: boolean) => {
//                                                     const newSelected = checked
//                                                         ? [...(field.value || []), id] // Provide a fallback
//                                                         : (field.value || []).filter((category) => category !== id); // Provide a fallback
//                                                     field.onChange(newSelected);
//                                                 }}
//                                                 onReset={handleResetWasteCommittee} // resets the selected boxes
//                                             />                                        
//                                         </FormControl>
//                                         <FormMessage /> 
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                             <div className="flex items-center justify-end pb-10">
//                                 <Button type="submit">
//                                     Schedule                                                                                                                          
//                                 </Button>
//                             </div>                 
//                         </div>                                                                      
//                    </form>
//                 </Form>                
//             </div>
//         </div>
//     );
// }
// export default AddEvent






// import { useState } from 'react';
// import { Input } from '../../../../components/ui/input.tsx';
// import { Label } from '../../../../components/ui/label.tsx';
// import { Textarea } from '../../../../components/ui/textarea.tsx';
// import { Button } from '../../../../components/ui/button.tsx';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Checkbox } from "@/components/ui/checkbox";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import AddEventFormSchema from "@/form-schema/addevent-schema";

// function AddEvent() {
//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

//     const form = useForm<z.infer<typeof AddEventFormSchema>>({
//         resolver: zodResolver(AddEventFormSchema),
//         defaultValues: {
//             eventTitle: "",
//             eventDate: "",
//             roomPlace: "",
//             eventCategory: "",
//             eventTime: "",
//             eventDescription: "",
//             barangayCouncil: [],
//             gadCommittee: [],
//             wasteCommittee: [],
//         },
//     });

//     const CouncilCategory = [
//         { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO" },
//         { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS" },
//         { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA" },
//     ];

//     const GADCategory = [
//         { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL" },
//         { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE" },
//         { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM" },
//     ];

//     const WasteCategory = [
//         { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL" },
//         { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE" },
//         { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM" },
//     ];

//     function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
//         console.log(values);
//     }

//     return (
//         <div>
//             <div className="p-5 w-full mx-auto h-full">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="max-h-[370px]">
//                             <FormField
//                                 control={form.control}
//                                 name="eventTitle"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Event Title</FormLabel>
//                                         <FormControl>
//                                             <Input placeholder="Enter Event Title" className={inputcss} {...field} />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventDate"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Date</FormLabel>
//                                                 <FormControl>
//                                                     <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventTime"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Time</FormLabel>
//                                                 <FormControl>
//                                                     <input type="time" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventCategory"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Category</FormLabel>
//                                                 <FormControl>
//                                                     <SelectLayout
//                                                         className={inputcss}
//                                                         label="Categories"
//                                                         placeholder="Select Event Category"
//                                                         options={[
//                                                             { id: "meeting", name: "Meeting" },
//                                                             { id: "activity", name: "Activity" }
//                                                         ]}
//                                                         value={field.value}
//                                                         onChange={field.onChange}
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="roomPlace"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Room / Place</FormLabel>
//                                                 <FormControl>
//                                                     <Input placeholder="Enter Room / Place" className={inputcss} {...field} />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-[20px]">
//                                 <FormField
//                                     control={form.control}
//                                     name="eventDescription"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Event Description</FormLabel>
//                                             <FormControl>
//                                                 <Textarea
//                                                     className="w-full p-2 shadow-sm h-40 mt-[12px] rounded-[5px] resize-none"
//                                                     placeholder="Enter Meeting Description"
//                                                     {...field}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8 pt-8">ATTENDEES</h1>

//                             {/* Accordion for Attendees */}
//                             <FormField
//                                 control={form.control}
//                                 name="barangayCouncil"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="barangay-council">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             BARANGAY COUNCIL
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {CouncilCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <FormField
//                                 control={form.control}
//                                 name="gadCommittee"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="gad-committee">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             GAD COMMITTEE
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {GADCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <FormField
//                                 control={form.control}
//                                 name="wasteCommittee"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="waste-committee">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             WASTE COMMITTEE
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {WasteCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <div className="flex items-center justify-end pb-10 pt-10   ">
//                                 <Button type="submit">
//                                     Schedule
//                                 </Button>
//                             </div>
//                         </div>
//                     </form>
//                 </Form>
//             </div>
//         </div>
//     );
// }

// export default AddEvent;








// import { useState } from 'react';
// import {Input} from '../../../../components/ui/input.tsx';
// import {Label} from '../../../../components/ui/label.tsx';
// import {DatePicker} from '../../../../components/ui/datepicker.tsx';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem,SelectLabel,SelectSeparator,SelectGroup} from "../../../../components/ui/select/select.tsx";
// import {Button} from '../../../../components/ui/button.tsx';
// import {FilterAccordion} from '../../../../components/ui/filter-accordion.tsx'
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";



// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import AddEventFormSchema from "@/form-schema/addevent-schema";


// import AttendanceSheetView from './AttendanceSheetView.tsx';



// function AddEvent(){

//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

//     //for the modal
//     const [events, setEvents] = useState<{ start: Date; end: Date; title: string }[]>([]);
//     const [showAttendees, setShowAttendees] = useState(false);
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const handleAddEvent = () => {
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//     };

//     const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

//     //dropdown w/checkbox 
//     const CouncilCategory = [
//         { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO"},
//         { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS"},
//         { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA"},
//     ];

//     const GADCategory = [
//         { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL"},
//         { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE"},
//         { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM"},
//     ];

//     const WasteCategory = [
//         { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL"},
//         { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE"},
//         { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM"},
//     ];

//     const handleResetBarangayCouncil = () => {
//         form.setValue('barangayCouncil', []);
//     };

//     const handleResetGADCommittee = () => {
//         form.setValue('gadCommittee', []);
//     };

//     const handleResetWasteCommittee = () => {
//         form.setValue('wasteCommittee', []);
//     };



//     const form = useForm<z.infer<typeof AddEventFormSchema>>({
//         resolver: zodResolver(AddEventFormSchema),
//         defaultValues: {
//             eventTitle: "",
//             eventDate: "",
//             roomPlace: "",
//             eventCategory: "",
//             eventTime: "",
//             eventDescription: "",
//             barangayCouncil: [],
//             gadCommittee: [],
//             wasteCommittee: [],
//         },
//     });

//     function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
//         // Do something with the form values.
//         // ✅ This will be type-safe and validated.
//         console.log(values)
//     }


//     return(
//         <div>
//             <div className="p-5 w-full mx-auto h-full">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="max-h-[370px]">
//                             <div>
//                                 <FormField
//                                     control={form.control}
//                                     name="eventTitle"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                         <FormLabel>Event Title</FormLabel>
//                                         <FormControl>
//                                             <Input placeholder="Enter Event Title" className={inputcss} {...field}></Input>
//                                         </FormControl>
//                                         <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventDate"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Event Date</FormLabel>
//                                             <FormControl>
//                                                 <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                             </FormControl>
//                                             <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventTime"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Event Time</FormLabel>
//                                             <FormControl>
//                                                 <input type="time" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                             </FormControl>
//                                             <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />                                    
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventCategory"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Event Category</FormLabel>
//                                             <FormControl>
//                                                 <SelectLayout
//                                                     className={inputcss}
//                                                     label="Categories"
//                                                     placeholder="Select Event Category"
//                                                     options={[
//                                                         {id: "meeting", name: "Meeting"},
//                                                         {id: "activity", name: "Activity"}                                                   
//                                                     ]}
//                                                     value={field.value}
//                                                     onChange={field.onChange}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="roomPlace"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Room / Place</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Enter Room / Place" className={inputcss} {...field}></Input>
//                                             </FormControl>
//                                             <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-[20px]">
//                                 <FormField
//                                     control={form.control}
//                                     name="eventDescription"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                         <FormLabel>Event Description</FormLabel>
//                                         <FormControl>
//                                             <Textarea
//                                                 className="w-full p-2 shadow-sm h-40 mt-[12px] rounded-[5px] resize-none"
//                                                 placeholder="Enter Meeting Description"
//                                                 {...field}>
//                                             </Textarea>
//                                         </FormControl>
//                                         <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />                                    
//                             </div>
                            
//                             <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8 pt-8">ATTENDEES</h1>
//                             <div className="space-y-4 pb-20">
//                                 {/* Attendees Checkboxes */}
//                                 <FormField
//                                     control={form.control}
//                                     name="barangayCouncil"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel></FormLabel>
//                                             <FormControl>
//                                                 <FilterAccordion
//                                                     title="BARANGAY COUNCIL"
//                                                     options={CouncilCategory.map((option) => ({
//                                                         ...option,
//                                                         checked: field.value?.includes(option.id) || false,
//                                                     }))}
//                                                     selectedCount={field.value?.length || 0}
//                                                     onChange={(id: string, checked: boolean) => {
//                                                         const newSelected = checked
//                                                             ? [...(field.value || []), id]
//                                                             : (field.value || []).filter((category) => category !== id);
//                                                         field.onChange(newSelected);
//                                                         // Update selected attendees
//                                                         setSelectedAttendees((prev) => {
//                                                             const updatedAttendees = new Set(prev);
//                                                             newSelected.forEach((attendee) => updatedAttendees.add(attendee));
//                                                             return Array.from(updatedAttendees);
//                                                         });
//                                                     }}
//                                                     onReset={handleResetBarangayCouncil}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="gadCommittee"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel></FormLabel>
//                                             <FormControl>
//                                                 <FilterAccordion
//                                                     title="GAD COMMITTEE"
//                                                     options={GADCategory.map((option) => ({
//                                                         ...option,
//                                                         checked: field.value?.includes(option.id) || false,
//                                                     }))}
//                                                     selectedCount={field.value?.length || 0}
//                                                     onChange={(id: string, checked: boolean) => {
//                                                         const newSelected = checked
//                                                             ? [...(field.value || []), id]
//                                                             : (field.value || []).filter((category) => category !== id);
//                                                         field.onChange(newSelected);
//                                                         // Update selected attendees
//                                                         setSelectedAttendees((prev) => {
//                                                             const updatedAttendees = new Set(prev);
//                                                             newSelected.forEach((attendee) => updatedAttendees.add(attendee));
//                                                             return Array.from(updatedAttendees);
//                                                         });
//                                                     }}
//                                                     onReset={handleResetGADCommittee}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="wasteCommittee"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel></FormLabel>
//                                             <FormControl>
//                                                 <FilterAccordion
//                                                     title="WASTE COMMITTEE"
//                                                     options={WasteCategory.map((option) => ({
//                                                         ...option,
//                                                         checked: field.value?.includes(option.id) || false,
//                                                     }))}
//                                                     selectedCount={field.value?.length || 0}
//                                                     onChange={(id: string, checked: boolean) => {
//                                                         const newSelected = checked
//                                                             ? [...(field.value || []), id]
//                                                             : (field.value || []).filter((category) => category !== id);
//                                                         field.onChange(newSelected);
//                                                         // Update selected attendees
//                                                         setSelectedAttendees((prev) => {
//                                                             const updatedAttendees = new Set(prev);
//                                                             newSelected.forEach((attendee) => updatedAttendees.add(attendee));
//                                                             return Array.from(updatedAttendees);
//                                                         });
//                                                     }}
//                                                     onReset={handleResetWasteCommittee}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                             <div className="flex items-center justify-end pb-10">
//                                 <DialogLayout
//                                     trigger={
//                                         <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                             Next
//                                         </div>
//                                     }
//                                     className="max-w-[1000px] max-h-full flex flex-col overflow-auto scrollbar-custom"
//                                     title="Attendance Details"
//                                     description="Please review upon submitting."
//                                     mainContent={<AttendanceSheetView  selectedAttendees={selectedAttendees}/>}
//                                 />
//                             </div>                 
//                         </div>                                                                      
//                    </form>
//                 </Form>                
//             </div>
//         </div>
//     );
// }
// export default AddEvent








// import { useState } from 'react';
// import { Input } from '../../../../components/ui/input.tsx';
// import { Label } from '../../../../components/ui/label.tsx';
// import { Textarea } from '../../../../components/ui/textarea.tsx';
// import { Button } from '../../../../components/ui/button.tsx';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Checkbox } from "@/components/ui/checkbox";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import AddEventFormSchema from "@/form-schema/addevent-schema";
// import AttendanceSheetView from './AttendanceSheetView.tsx';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";


// function AddEvent() {
//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

//     const form = useForm<z.infer<typeof AddEventFormSchema>>({
//         resolver: zodResolver(AddEventFormSchema),
//         defaultValues: {
//             eventTitle: "",
//             eventDate: "",
//             roomPlace: "",
//             eventCategory: "",
//             eventTime: "",
//             eventDescription: "",
//             barangayCouncil: [],
//             gadCommittee: [],
//             wasteCommittee: [],
//         },
//     });

//     const CouncilCategory = [
//         { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO" },
//         { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS" },
//         { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA" },
//     ];

//     const GADCategory = [
//         { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL" },
//         { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE" },
//         { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM" },
//     ];

//     const WasteCategory = [
//         { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL" },
//         { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE" },
//         { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM" },
//     ];

//     function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
//         console.log(values);
//     }

//     return (
//         <div>
//             <div className="p-5 w-full mx-auto h-full">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="max-h-[370px]">
//                             <FormField
//                                 control={form.control}
//                                 name="eventTitle"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Event Title</FormLabel>
//                                         <FormControl>
//                                             <Input placeholder="Enter Event Title" className={inputcss} {...field} />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventDate"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Date</FormLabel>
//                                                 <FormControl>
//                                                     <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventTime"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Time</FormLabel>
//                                                 <FormControl>
//                                                     <input type="time" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventCategory"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Category</FormLabel>
//                                                 <FormControl>
//                                                     <SelectLayout
//                                                         className={inputcss}
//                                                         label="Categories"
//                                                         placeholder="Select Event Category"
//                                                         options={[
//                                                             { id: "meeting", name: "Meeting" },
//                                                             { id: "activity", name: "Activity" }
//                                                         ]}
//                                                         value={field.value}
//                                                         onChange={field.onChange}
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="roomPlace"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Room / Place</FormLabel>
//                                                 <FormControl>
//                                                     <Input placeholder="Enter Room / Place" className={inputcss} {...field} />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-[20px]">
//                                 <FormField
//                                     control={form.control}
//                                     name="eventDescription"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Event Description</FormLabel>
//                                             <FormControl>
//                                                 <Textarea
//                                                     className="w-full p-2 shadow-sm h-40 mt-[12px] rounded-[5px] resize-none"
//                                                     placeholder="Enter Meeting Description"
//                                                     {...field}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8 pt-8">ATTENDEES</h1>

//                             {/* Accordion for Attendees */}
//                             <FormField
//                                 control={form.control}
//                                 name="barangayCouncil"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="barangay-council">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             BARANGAY COUNCIL
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {CouncilCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <FormField
//                                 control={form.control}
//                                 name="gadCommittee"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="gad-committee">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             GAD COMMITTEE
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {GADCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <FormField
//                                 control={form.control}
//                                 name="wasteCommittee"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="waste-committee">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             WASTE COMMITTEE
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {WasteCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <div className="flex items-center justify-end pb-10 pt-10">
//                                 <DialogLayout
//                                     trigger={
//                                         <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                             Next
//                                         </div>
//                                     }
//                                     className="max-w-[1000px] max-h-full flex flex-col overflow-auto scrollbar-custom"
//                                     title="Attendance Details"
//                                     description="Please review upon submitting."
//                                     mainContent={<AttendanceSheetView/>}
//                                 />
//                             </div>       
//                         </div>
//                     </form>
//                 </Form>
//             </div>
//         </div>
//     );  
// }

// export default AddEvent;







// SAKTOOO
// import { useState } from 'react';
// import { Input } from '../../../../components/ui/input.tsx';
// import { Label } from '../../../../components/ui/label.tsx';
// import { Textarea } from '../../../../components/ui/textarea.tsx';
// import { Button } from '../../../../components/ui/button.tsx';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Checkbox } from "@/components/ui/checkbox";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import AddEventFormSchema from "@/form-schema/addevent-schema";
// import AttendanceSheetView from './AttendanceSheetView.tsx';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";


// function AddEvent() {
//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

//     const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
//     const [eventTitle, setEventTitle] = useState<string>("");
//     const [eventDate, setEventDate] = useState<string>("");
//     const [eventTime, setEventTime] = useState<string>("");
//     const [eventPlace, setEventPlace] = useState<string>("");

//     const form = useForm<z.infer<typeof AddEventFormSchema>>({
//         resolver: zodResolver(AddEventFormSchema),
//         defaultValues: {
//             eventTitle: "",
//             eventDate: "",
//             roomPlace: "",
//             eventCategory: "",
//             eventTime: "",
//             eventDescription: "",
//             barangayCouncil: [],
//             gadCommittee: [],
//             wasteCommittee: [],
//         },
//     });

//     const CouncilCategory = [
//         { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO" },
//         { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS" },
//         { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA" },
//     ];

//     const GADCategory = [
//         { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL" },
//         { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE" },
//         { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM" },
//     ];

//     const WasteCategory = [
//         { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL" },
//         { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE" },
//         { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM" },
//     ];

//     function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
//         console.log(values);
//     }

//     return (
//         <div>
//             <div className="p-5 w-full mx-auto h-full">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="max-h-[370px]">
//                             <FormField
//                                 control={form.control}
//                                 name="eventTitle"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Event Title</FormLabel>
//                                         <FormControl>
//                                             <Input 
//                                                 placeholder="Enter Event Title" 
//                                                 className={inputcss} 
//                                                 {...field} 
//                                                 onChange={(e) => {
//                                                     field.onChange(e); // Update form state
//                                                     setEventTitle(e.target.value); // Update local state
//                                                 }}
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventDate"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Date</FormLabel>
//                                                 <FormControl>
//                                                     <input 
//                                                         type="date" 
//                                                         {...field} 
//                                                         className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md"
//                                                         onChange={(e) => {
//                                                             field.onChange(e); 
//                                                             setEventDate(e.target.value); 
//                                                         }}                                                        
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventTime"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Time</FormLabel>
//                                                 <FormControl>
//                                                     <input 
//                                                         type="time" 
//                                                         {...field} 
//                                                         className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md" 
//                                                         onChange={(e) => {
//                                                             field.onChange(e); // Update form state
//                                                             setEventTime(e.target.value); // Update local state
//                                                         }}
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventCategory"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Category</FormLabel>
//                                                 <FormControl>
//                                                     <SelectLayout
//                                                         className={inputcss}
//                                                         label="Categories"
//                                                         placeholder="Select Event Category"
//                                                         options={[
//                                                             { id: "meeting", name: "Meeting" },
//                                                             { id: "activity", name: "Activity" }
//                                                         ]}
//                                                         value={field.value}
//                                                         onChange={field.onChange}
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="roomPlace"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Room / Place</FormLabel>
//                                                 <FormControl>
//                                                     <Input 
//                                                         placeholder="Enter Room / Place" 
//                                                         className={inputcss} 
//                                                         {...field} 
//                                                         onChange={(e) => {
//                                                             field.onChange(e); // Update form state
//                                                             setEventPlace(e.target.value); // Update local state
//                                                         }}                                                        
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-[20px]">
//                                 <FormField
//                                     control={form.control}
//                                     name="eventDescription"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Event Description</FormLabel>
//                                             <FormControl>
//                                                 <Textarea
//                                                     className="w-full p-2 shadow-sm h-40 mt-[12px] rounded-[5px] resize-none"
//                                                     placeholder="Enter Meeting Description"
//                                                     {...field}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8 pt-8">ATTENDEES</h1>

//                             {/* Accordion for Attendees */}
//                             <FormField
//                                 control={form.control}
//                                 name="barangayCouncil"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="barangay-council">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             BARANGAY COUNCIL
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {CouncilCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                         // Update selected attendees
//                                                                         setSelectedAttendees((prev) => {
//                                                                             const updatedAttendees = new Set(prev);
//                                                                             if (checked) {
//                                                                                 updatedAttendees.add(option.label); // Add the label when checked
//                                                                             } else {
//                                                                                 updatedAttendees.delete(option.label); // Remove the label when unchecked
//                                                                             }
//                                                                             return Array.from(updatedAttendees);
//                                                                         });
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <FormField
//                                 control={form.control}
//                                 name="gadCommittee"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="gad-committee">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             GAD COMMITTEE
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {GADCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                         // Update selected attendees
//                                                                         setSelectedAttendees((prev) => {
//                                                                             const updatedAttendees = new Set(prev);
//                                                                             if (checked) {
//                                                                                 updatedAttendees.add(option.label); // Add the label when checked
//                                                                             } else {
//                                                                                 updatedAttendees.delete(option.label); // Remove the label when unchecked
//                                                                             }
//                                                                             return Array.from(updatedAttendees);
//                                                                         });
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <FormField
//                                 control={form.control}
//                                 name="wasteCommittee"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel></FormLabel>
//                                         <FormControl>
//                                             <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="waste-committee">
//                                                     <AccordionTrigger className="hover:no-underline">
//                                                         <div className="flex gap-4">
//                                                             WASTE COMMITTEE
//                                                         </div>
//                                                     </AccordionTrigger>
//                                                     <AccordionContent className="flex flex-col gap-3">
//                                                         {WasteCategory.map((option) => (
//                                                             <div key={option.id} className="flex items-center gap-3">
//                                                                 <Checkbox
//                                                                     id={option.id}
//                                                                     checked={field.value?.includes(option.id) || false}
//                                                                     onCheckedChange={(checked) => {
//                                                                         const newSelected = checked
//                                                                             ? [...(field.value || []), option.id]
//                                                                             : (field.value || []).filter((id) => id !== option.id);
//                                                                         field.onChange(newSelected);
//                                                                         // Update selected attendees
//                                                                         setSelectedAttendees((prev) => {
//                                                                             const updatedAttendees = new Set(prev);
//                                                                             if (checked) {
//                                                                                 updatedAttendees.add(option.label); // Add the label when checked
//                                                                             } else {
//                                                                                 updatedAttendees.delete(option.label); // Remove the label when unchecked
//                                                                             }
//                                                                             return Array.from(updatedAttendees);
//                                                                         });                                                                        
//                                                                     }}
//                                                                 />
//                                                                 <Label htmlFor={option.id} className="cursor-pointer">
//                                                                     {option.label}
//                                                                 </Label>
//                                                             </div>
//                                                         ))}
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <div className="flex items-center justify-end pt-10 pb-10">
//                                 <Button type="submit">
//                                     Schedule                                                                                                                          
//                                 </Button>
//                             </div>          

//                             <div className="flex items-center justify-end pb-10 pt-10">
//                                 <DialogLayout
//                                     trigger={
//                                         <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                             Next
//                                         </div>
//                                     }
//                                     className="max-w-[1000px] max-h-full flex flex-col overflow-auto scrollbar-custom"
//                                     title="Attendance Details"
//                                     description="Please review upon submitting."
//                                     mainContent={<AttendanceSheetView selectedAttendees={selectedAttendees} activity={eventTitle} date={eventDate} time={eventTime} place={eventPlace}/>}
//                                 />
//                             </div>       
//                         </div>
//                     </form>
//                 </Form>
//             </div>
//         </div>
//     );  
// }

// export default AddEvent;




// import { useState } from 'react';
// import { Input } from '../../../../components/ui/input.tsx';
// import { Label } from '../../../../components/ui/label.tsx';
// import { Textarea } from '../../../../components/ui/textarea.tsx';
// import { Button } from '../../../../components/ui/button.tsx';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Checkbox } from "@/components/ui/checkbox";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import AddEventFormSchema from "@/form-schema/council/addevent-schema.ts";
// import AttendanceSheetView from './AttendanceSheetView.tsx';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";


// function AddEvent() {
//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

//     const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
//     const [eventTitle, setEventTitle] = useState<string>("");
//     const [eventDate, setEventDate] = useState<string>("");
//     const [eventTime, setEventTime] = useState<string>("");
//     const [eventPlace, setEventPlace] = useState<string>("");
//     const [eventCategory, setEventCategory] = useState<string>("");



//     const form = useForm<z.infer<typeof AddEventFormSchema>>({
//         resolver: zodResolver(AddEventFormSchema),
//         defaultValues: {
//             eventTitle: "",
//             eventDate: "",
//             roomPlace: "",
//             eventCategory: "",
//             eventTime: "",
//             eventDescription: "",
//             barangayCouncil: [],
//             gadCommittee: [],
//             wasteCommittee: [],
//         },
//     });

//     const CouncilCategory = [
//         { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO" },
//         { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS" },
//         { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA" },
//     ];

//     const GADCategory = [
//         { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL" },
//         { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE" },
//         { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM" },
//     ];

//     const WasteCategory = [
//         { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL" },
//         { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE" },
//         { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM" },
//     ];

//     // function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
//     //     console.log(values);
//     // }

//     function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
//         console.log(values);

//     }

//     return (
//         <div>
//             <div className="p-5 w-full mx-auto h-full">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="max-h-[370px]">
//                             <FormField
//                                 control={form.control}
//                                 name="eventTitle"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Event Title</FormLabel>
//                                         <FormControl>
//                                             <Input 
//                                                 placeholder="Enter Event Title" 
//                                                 className={inputcss} 
//                                                 {...field} 
//                                                 onChange={(e) => {
//                                                     field.onChange(e); // Update form state
//                                                     setEventTitle(e.target.value); // Update local state
//                                                 }}
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventDate"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Date</FormLabel>
//                                                 <FormControl>
//                                                     <input 
//                                                         type="date" 
//                                                         {...field} 
//                                                         className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md"
//                                                         onChange={(e) => {
//                                                             field.onChange(e); 
//                                                             setEventDate(e.target.value); 
//                                                         }}                                                        
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventTime"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Time</FormLabel>
//                                                 <FormControl>
//                                                     <input 
//                                                         type="time" 
//                                                         {...field} 
//                                                         className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md" 
//                                                         onChange={(e) => {
//                                                             field.onChange(e); // Update form state
//                                                             setEventTime(e.target.value); // Update local state
//                                                         }}
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 mt-[20px]">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="eventCategory"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Event Category</FormLabel>
//                                                 <FormControl>
//                                                     <SelectLayout
//                                                         className={inputcss}
//                                                         label="Categories"
//                                                         placeholder="Select Event Category"
//                                                         options={[
//                                                             { id: "meeting", name: "Meeting" },
//                                                             { id: "activity", name: "Activity" }
//                                                         ]}
//                                                         value={field.value}
//                                                         onChange={(value) => {
//                                                             field.onChange(value);
//                                                             setEventCategory(value); // Update local state for event category
//                                                         }}
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="roomPlace"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>Room / Place</FormLabel>
//                                                 <FormControl>
//                                                     <Input 
//                                                         placeholder="Enter Room / Place" 
//                                                         className={inputcss} 
//                                                         {...field} 
//                                                         onChange={(e) => {
//                                                             field.onChange(e); // Update form state
//                                                             setEventPlace(e.target.value); // Update local state
//                                                         }}                                                        
//                                                     />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-[20px]">
//                                 <FormField
//                                     control={form.control}
//                                     name="eventDescription"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Event Description</FormLabel>
//                                             <FormControl>
//                                                 <Textarea
//                                                     className="w-full p-2 shadow-sm h-40 mt-[12px] rounded-[5px] resize-none"
//                                                     placeholder="Enter Meeting Description"
//                                                     {...field}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             {/* Accordion for Attendees */}
//                             {eventCategory === "meeting" && (
//                                 <>
//                                     <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8 pt-8">ATTENDEES</h1>

//                                     <FormField
//                                         control={form.control}
//                                         name="barangayCouncil"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel></FormLabel>
//                                                 <FormControl>
//                                                     <Accordion type="single" collapsible className="w-full">
//                                                         <AccordionItem value="barangay-council">
//                                                             <AccordionTrigger className="hover:no-underline">
//                                                                 <div className="flex gap-4">
//                                                                     BARANGAY COUNCIL
//                                                                 </div>
//                                                             </AccordionTrigger>
//                                                             <AccordionContent className="flex flex-col gap-3">
//                                                                 {CouncilCategory.map((option) => (
//                                                                     <div key={option.id} className="flex items-center gap-3">
//                                                                         <Checkbox
//                                                                             id={option.id}
//                                                                             checked={field.value?.includes(option.id) || false}
//                                                                             onCheckedChange={(checked) => {
//                                                                                 const newSelected = checked
//                                                                                     ? [...(field.value || []), option.id]
//                                                                                     : (field.value || []).filter((id) => id !== option.id);
//                                                                                 field.onChange(newSelected);
//                                                                                 // Update selected attendees
//                                                                                 setSelectedAttendees((prev) => {
//                                                                                     const updatedAttendees = new Set(prev);
//                                                                                     if (checked) {
//                                                                                         updatedAttendees.add(option.label); // Add the label when checked
//                                                                                     } else {
//                                                                                         updatedAttendees.delete(option.label); // Remove the label when unchecked
//                                                                                     }
//                                                                                     return Array.from(updatedAttendees);
//                                                                                 });
//                                                                             }}
//                                                                         />
//                                                                         <Label htmlFor={option.id} className="cursor-pointer">
//                                                                             {option.label}
//                                                                         </Label>
//                                                                     </div>
//                                                                 ))}
//                                                             </AccordionContent>
//                                                         </AccordionItem>
//                                                     </Accordion>
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />

//                                     <FormField
//                                         control={form.control}
//                                         name="gadCommittee"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel></FormLabel>
//                                                 <FormControl>
//                                                     <Accordion type="single" collapsible className="w-full">
//                                                         <AccordionItem value="gad-committee">
//                                                             <AccordionTrigger className="hover:no-underline">
//                                                                 <div className="flex gap-4">
//                                                                     GAD COMMITTEE
//                                                                 </div>
//                                                             </AccordionTrigger>
//                                                             <AccordionContent className="flex flex-col gap-3">
//                                                                 {GADCategory.map((option) => (
//                                                                     <div key={option.id} className="flex items-center gap-3">
//                                                                         <Checkbox
//                                                                             id={option.id}
//                                                                             checked={field.value?.includes(option.id) || false}
//                                                                             onCheckedChange={(checked) => {
//                                                                                 const newSelected = checked
//                                                                                     ? [...(field.value || []), option.id]
//                                                                                     : (field.value || []).filter((id) => id !== option.id);
//                                                                                 field.onChange(newSelected);
//                                                                                 // Update selected attendees
//                                                                                 setSelectedAttendees((prev) => {
//                                                                                     const updatedAttendees = new Set(prev);
//                                                                                     if (checked) {
//                                                                                         updatedAttendees.add(option.label); // Add the label when checked
//                                                                                     } else {
//                                                                                         updatedAttendees.delete(option.label); // Remove the label when unchecked
//                                                                                     }
//                                                                                     return Array.from(updatedAttendees);
//                                                                                 });
//                                                                             }}
//                                                                         />
//                                                                         <Label htmlFor={option.id} className="cursor-pointer">
//                                                                             {option.label}
//                                                                         </Label>
//                                                                     </div>
//                                                                 ))}
//                                                             </AccordionContent>
//                                                         </AccordionItem>
//                                                     </Accordion>
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />

//                                     <FormField
//                                         control={form.control}
//                                         name="wasteCommittee"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel></FormLabel>
//                                                 <FormControl>
//                                                     <Accordion type="single" collapsible className="w-full">
//                                                         <AccordionItem value="waste-committee">
//                                                             <AccordionTrigger className="hover:no-underline">
//                                                                 <div className="flex gap-4">
//                                                                     WASTE COMMITTEE
//                                                                 </div>
//                                                             </AccordionTrigger>
//                                                             <AccordionContent className="flex flex-col gap-3">
//                                                                 {WasteCategory.map((option) => (
//                                                                     <div key={option.id} className="flex items-center gap-3">
//                                                                         <Checkbox
//                                                                             id={option.id}
//                                                                             checked={field.value?.includes(option.id) || false}
//                                                                             onCheckedChange={(checked) => {
//                                                                                 const newSelected = checked
//                                                                                     ? [...(field.value || []), option.id]
//                                                                                     : (field.value || []).filter((id) => id !== option.id);
//                                                                                 field.onChange(newSelected);
//                                                                                 // Update selected attendees
//                                                                                 setSelectedAttendees((prev) => {
//                                                                                     const updatedAttendees = new Set(prev);
//                                                                                     if (checked) {
//                                                                                         updatedAttendees.add(option.label); // Add the label when checked
//                                                                                     } else {
//                                                                                         updatedAttendees.delete(option.label); // Remove the label when unchecked
//                                                                                     }
//                                                                                     return Array.from(updatedAttendees);
//                                                                                 });
//                                                                             }}
//                                                                         />
//                                                                         <Label htmlFor={option.id} className="cursor-pointer">
//                                                                             {option.label}
//                                                                         </Label>
//                                                                     </div>
//                                                                 ))}
//                                                             </AccordionContent>
//                                                         </AccordionItem>
//                                                     </Accordion>
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </>
//                             )}

//                             {/* Button for scheduling */}
//                             {eventCategory === "activity" ? (
//                                 <div className="flex items-center justify-end pt-10 pb-10">
//                                     <Button type="submit">
//                                         Schedule                                                                                                                          
//                                     </Button>
//                                 </div>
//                             ) :
//                             (                                
//                                 <div className="flex items-center justify-end pb-10 pt-10">                               
//                                     <DialogLayout
//                                         trigger={
//                                             <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                                 Next
//                                             </div>
//                                         }
//                                         className="max-w-[1000px] max-h-full flex flex-col overflow-auto scrollbar-custom"
//                                         title="Attendance Details"
//                                         description="Please review upon submitting."
//                                         mainContent={<AttendanceSheetView selectedAttendees={selectedAttendees} activity={eventTitle} date={eventDate} time={eventTime} place={eventPlace}/>}
//                                     />
//                                 </div>   
//                             )}  
//                         </div>
//                     </form>
//                 </Form>
//             </div>
//         </div>
//     );  
// }

// export default AddEvent;





import { useState } from 'react';
import { Input } from '../../../../components/ui/input.tsx';
import { Label } from '../../../../components/ui/label.tsx';
import { Textarea } from '../../../../components/ui/textarea.tsx';
import { Button } from '../../../../components/ui/button.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AddEventFormSchema from "@/form-schema/council/addevent-schema.ts";
import AttendanceSheetView from './AttendanceSheetView.tsx';
import DialogLayout from "@/components/ui/dialog/dialog-layout";



function AddEvent() {
    const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
    const [eventTitle, setEventTitle] = useState<string>("");
    const [eventDate, setEventDate] = useState<string>("");
    const [eventTime, setEventTime] = useState<string>("");
    const [eventPlace, setEventPlace] = useState<string>("");
    const [eventCategory, setEventCategory] = useState<string>("");
    const [eventDescription, setEventDescription] = useState<string>("");

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
    const [allowModalOpen, setAllowModalOpen] = useState<boolean>(false);

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

    const CouncilCategory = [
        { id: "HON. HANNAH SHEEN OBEJERO", label: "HON. HANNAH SHEEN OBEJERO" },
        { id: "HON. SARAH MAE DUTS", label: "HON. SARAH MAE DUTS" },
        { id: "HON. JARLENE S. GARCIA", label: "HON. JARLENE S. GARCIA" },
        { id: "HON. WATIS L. LOVE", label: "HON. WATIS L. LOVE" },
        { id: "HON. HOWLAN H. HOUSING", label: "HON. HOWLAN H. HOUSING" },
    ];

    const GADCategory = [
        { id: "GAD SECRETARY BABEL", label: "GAD SECRETARY BABEL" },
        { id: "GAD TREASURER MABLE", label: "GAD TREASURER MABLE" },
        { id: "GAD LOREM IPSUM", label: "GAD LOREM IPSUM" },
        { id: "HON. PAYN I. SGAIN", label: "HON. PAYN I. SGAIN" },
        { id: "HON. COME J. HOUQUINE", label: "HON. COME J. HOUQUINE" },
        { id: "ESCUHAS LAS PALABRAS", label: "ESCUHAS LAS PALABRAS" },
    ];

    const WasteCategory = [
        { id: "WASTE SECRETARY BABEL", label: "WASTE SECRETARY BABEL" },
        { id: "WASTE TREASURER MABLE", label: "WASTE TREASURER MABLE" },
        { id: "WASTE LOREM IPSUM", label: "WASTE LOREM IPSUM" },
        { id: "INDA MIDDLE OFTHE", label: "INDA MIDDLE OFTHE" },
    ];

    // function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
    //     console.log(values);
    // }

    function formatTimeTo12Hour(time: string) {
        const [hours, minutes] = time.split(':');
        const formattedHours = (parseInt(hours) % 12) || 12; // Convert to 12-hour format
        const ampm = parseInt(hours) < 12 ? 'AM' : 'PM';
        return `${formattedHours}:${minutes} ${ampm}`;
    }

    function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
        const formattedTime = formatTimeTo12Hour(values.eventTime);

        // Create a new object with the formatted time
        const formattedValues = {
            ...values,
            eventTime: formattedTime, // Replace the original time with the formatted time
        };
    
        console.log(formattedValues); 
    }

    const { formState } = form;


    const handleNextClick = async () => {
        // Trigger form validation
        const isValid = await form.trigger();

        console.log("Form is valid:", isValid);
        if (isValid) {
            setAllowModalOpen(true); // Allow the modal to open
            setIsModalOpen(true); // Open the modal
        } else {
            setAllowModalOpen(false); // Prevent the modal from opening
        }
    };

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            // Always allow closing the modal
            setIsModalOpen(false);
        } else if (allowModalOpen) {
            // Only allow opening the modal if the form is valid
            setIsModalOpen(true);
        }
    };


    return (
        <div>
            <div className="p-5 w-full mx-auto h-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="max-h-[370px]">
                            <FormField
                                control={form.control}
                                name="eventTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Title</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter Event Title" 
                                                className={inputcss} 
                                                {...field} 
                                                onChange={(e) => {
                                                    field.onChange(e); // Update form state
                                                    setEventTitle(e.target.value); // Update local state
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4 mt-[20px]">
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="eventDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Event Date</FormLabel>
                                                <FormControl>
                                                    <input 
                                                        type="date" 
                                                        {...field} 
                                                        className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md"
                                                        onChange={(e) => {
                                                            field.onChange(e); 
                                                            setEventDate(e.target.value); 
                                                        }}                                                        
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
                                        name="eventTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Event Time</FormLabel>
                                                <FormControl>
                                                    <input 
                                                        type="time" 
                                                        {...field} 
                                                        className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md" 
                                                        onChange={(e) => {
                                                            field.onChange(e); // Update form state
                                                            setEventTime(e.target.value); // Update local state
                                                        }}
                                                    />
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
                                                        className={inputcss}
                                                        label="Categories"
                                                        placeholder="Select Event Category"
                                                        options={[
                                                            { id: "meeting", name: "Meeting" },
                                                            { id: "activity", name: "Activity" }
                                                        ]}
                                                        value={field.value}
                                                        onChange={(value) => {
                                                            field.onChange(value);
                                                            setEventCategory(value); // Update local state for event category
                                                        }}
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
                                                    <Input 
                                                        placeholder="Enter Room / Place" 
                                                        className={inputcss} 
                                                        {...field} 
                                                        onChange={(e) => {
                                                            field.onChange(e); // Update form state
                                                            setEventPlace(e.target.value); // Update local state
                                                        }}                                                        
                                                    />
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
                                            <FormLabel>Event Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="w-full p-2 shadow-sm h-40 mt-[12px] rounded-[5px] resize-none"
                                                    placeholder="Enter Meeting Description"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e); // Update form state
                                                        setEventDescription(e.target.value); // Update local state
                                                    }}     
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Accordion for Attendees */}
                            {eventCategory === "meeting" && (
                                <>
                                    <h1 className="flex justify-center font-bold text-[20px] text-[#394360] pb-8 pt-8">ATTENDEES</h1>

                                    <FormField
                                        control={form.control}
                                        name="barangayCouncil"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel></FormLabel>
                                                <FormControl>
                                                    <Accordion type="single" collapsible className="w-full">
                                                        <AccordionItem value="barangay-council">
                                                            <AccordionTrigger className="hover:no-underline">
                                                                <div className="flex gap-4">
                                                                    BARANGAY COUNCIL
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="flex flex-col gap-3">
                                                                {CouncilCategory.map((option) => (
                                                                    <div key={option.id} className="flex items-center gap-3">
                                                                        <Checkbox
                                                                            id={option.id}
                                                                            checked={field.value?.includes(option.id) || false}
                                                                            onCheckedChange={(checked) => {
                                                                                const newSelected = checked
                                                                                    ? [...(field.value || []), option.id]
                                                                                    : (field.value || []).filter((id) => id !== option.id);
                                                                                field.onChange(newSelected);
                                                                                // Update selected attendees
                                                                                setSelectedAttendees((prev) => {
                                                                                    const updatedAttendees = new Set(prev);
                                                                                    if (checked) {
                                                                                        updatedAttendees.add(option.label); // Add the label when checked
                                                                                    } else {
                                                                                        updatedAttendees.delete(option.label); // Remove the label when unchecked
                                                                                    }
                                                                                    return Array.from(updatedAttendees);
                                                                                });
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={option.id} className="cursor-pointer">
                                                                            {option.label}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
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
                                                    <Accordion type="single" collapsible className="w-full">
                                                        <AccordionItem value="gad-committee">
                                                            <AccordionTrigger className="hover:no-underline">
                                                                <div className="flex gap-4">
                                                                    GAD COMMITTEE
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="flex flex-col gap-3">
                                                                {GADCategory.map((option) => (
                                                                    <div key={option.id} className="flex items-center gap-3">
                                                                        <Checkbox
                                                                            id={option.id}
                                                                            checked={field.value?.includes(option.id) || false}
                                                                            onCheckedChange={(checked) => {
                                                                                const newSelected = checked
                                                                                    ? [...(field.value || []), option.id]
                                                                                    : (field.value || []).filter((id) => id !== option.id);
                                                                                field.onChange(newSelected);
                                                                                // Update selected attendees
                                                                                setSelectedAttendees((prev) => {
                                                                                    const updatedAttendees = new Set(prev);
                                                                                    if (checked) {
                                                                                        updatedAttendees.add(option.label); // Add the label when checked
                                                                                    } else {
                                                                                        updatedAttendees.delete(option.label); // Remove the label when unchecked
                                                                                    }
                                                                                    return Array.from(updatedAttendees);
                                                                                });
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={option.id} className="cursor-pointer">
                                                                            {option.label}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
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
                                                    <Accordion type="single" collapsible className="w-full">
                                                        <AccordionItem value="waste-committee">
                                                            <AccordionTrigger className="hover:no-underline">
                                                                <div className="flex gap-4">
                                                                    WASTE COMMITTEE
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="flex flex-col gap-3">
                                                                {WasteCategory.map((option) => (
                                                                    <div key={option.id} className="flex items-center gap-3">
                                                                        <Checkbox
                                                                            id={option.id}
                                                                            checked={field.value?.includes(option.id) || false}
                                                                            onCheckedChange={(checked) => {
                                                                                const newSelected = checked
                                                                                    ? [...(field.value || []), option.id]
                                                                                    : (field.value || []).filter((id) => id !== option.id);
                                                                                field.onChange(newSelected);
                                                                                // Update selected attendees
                                                                                setSelectedAttendees((prev) => {
                                                                                    const updatedAttendees = new Set(prev);
                                                                                    if (checked) {
                                                                                        updatedAttendees.add(option.label); // Add the label when checked
                                                                                    } else {
                                                                                        updatedAttendees.delete(option.label); // Remove the label when unchecked
                                                                                    }
                                                                                    return Array.from(updatedAttendees);
                                                                                });
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={option.id} className="cursor-pointer">
                                                                            {option.label}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Button for scheduling */}
                            {eventCategory === "activity" ? (
                                <div className="flex items-center justify-end pt-10 pb-10">
                                    <Button type="submit">
                                        Schedule                                                                                                                          
                                    </Button>
                                </div>
                            ) :
                            (                                
                                <div className="flex items-center justify-end pb-10 pt-10">                               
                                    <DialogLayout
                                        trigger={
                                            <div 
                                                className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center"
                                                onClick={handleNextClick} 
                                            >
                                                Next
                                            </div>
                                        }
                                        className="max-w-[1000px] max-h-full flex flex-col overflow-auto scrollbar-custom"
                                        title="Attendance Details"
                                        description="Please review upon submitting."
                                        mainContent={<AttendanceSheetView selectedAttendees={selectedAttendees} activity={eventTitle} date={eventDate} time={eventTime} place={eventPlace} category={eventCategory} description={eventDescription}/>}
                                        isOpen={isModalOpen} 
                                        onOpenChange={handleModalOpenChange} 
                                    />
                                </div>   
                            )}  
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );  
}

export default AddEvent;

