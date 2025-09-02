
// "use client"
// import { useState } from 'react';
// import {Input} from '../../../../components/ui/input.tsx';
// import {Label} from '../../../../components/ui/label.tsx';
// import {DatePicker} from '../../../../components/ui/datepicker.tsx';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Button} from '../../../../components/ui/button/button.tsx';
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form.tsx";
// import { ChevronLeft } from "lucide-react";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { ArrowLeft } from 'lucide-react';
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from "@/components/ui/accordion";

// import { Link } from 'react-router';


// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';
// import Tiptap from '@/components/ui/tiptap/tiptap.tsx';

// function AddResolution() {
//     const form = useForm<z.infer<typeof resolutionFormSchema>>({
//         resolver: zodResolver(resolutionFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             resTitle: "",        
//             resDate: "",
//             resDetails: "",
//             resAreaOfFocus: [],
//         },
//     });

//     let resAreaOfFocus = [
//         "Council", "GAD", 
//         "Waste Committee", "Finance"
//     ];

//     function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
//         console.log("Values", values);
//     }

//     return (
//         <div className="flex w-full mx-auto h-full justify-center">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                     <div className="text-[#394360] pb-2">
//                         <Link to="/res-page">
//                             <Button 
//                                 className="text-black p-2 self-start"
//                                 variant={"outline"}
//                             >
//                                 <ChevronLeft />
//                             </Button>                     
//                         </Link>
//                     </div>

//                     {/* Ordinance Description Field */}
//                     <FormField
//                         control={form.control}
//                         name="resDetails"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel></FormLabel>
//                                 <FormControl>
//                                     <Tiptap description={field.value} onChange={field.onChange} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     <div className="flex items-center justify-end p-[40px]">
//                         {/* Dialog with Form Inside */}
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                     Next
//                                 </div>
//                             }
//                             className="max-w-[30%] max-h-[460px] flex flex-col overflow-auto scrollbar-custom"
//                             title="Resolution Details"
//                             description="Add details."
//                             mainContent={
//                                 <div>
//                                     {/* Form Inside Dialog */}
//                                     <Form {...form}>
//                                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                                             {/* Ordinance Title Field */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name="resTitle"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Resolution Title</FormLabel>
//                                                         <FormControl>
//                                                             <Textarea
//                                                                 className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
//                                                                 placeholder="Enter Ordinance Title"
//                                                                 {...field}>
//                                                             </Textarea>                                                            
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Date Approved Field */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name="resDate"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Date Approved</FormLabel>
//                                                         <FormControl>
//                                                             <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Categories Field */}
//                                             <Accordion type="single" collapsible>
//                                                 <AccordionItem value="category-list">
//                                                     <AccordionTrigger>Select Categories</AccordionTrigger>
//                                                     <AccordionContent>
//                                                         <div className="space-y-2">
//                                                             {resAreaOfFocus.map((area, index) => (
//                                                                 <FormField
//                                                                     key={index}
//                                                                     control={form.control}
//                                                                     name="resAreaOfFocus"
//                                                                     render={({ field }) => {
//                                                                         const selectedCategory = field.value ?? [];
//                                                                         return (
//                                                                             <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
//                                                                                 <FormControl>
//                                                                                     <Checkbox
//                                                                                         id={`area-${index}`}
//                                                                                         className="h-5 w-5"
//                                                                                         checked={selectedCategory.includes(area)}
//                                                                                         onCheckedChange={(checked) => {
//                                                                                             field.onChange(
//                                                                                                 checked
//                                                                                                     ? [...selectedCategory, area]
//                                                                                                     : selectedCategory.filter((name: string) => name !== area)
//                                                                                             );
//                                                                                         }}
//                                                                                     />
//                                                                                 </FormControl>
//                                                                                 <FormLabel
//                                                                                     htmlFor={`category-${index}`}
//                                                                                     className="cursor-pointer whitespace-normal break-words flex-1"
//                                                                                     style={{ wordBreak: "break-all" }} // Ensures long words break
//                                                                                 >
//                                                                                     {area}
//                                                                                 </FormLabel>
//                                                                             </FormItem>
//                                                                         );
//                                                                     }}
//                                                                 />
//                                                             ))}
//                                                         </div>
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion>

//                                             {/* Submit Button (Inside Dialog) */}
//                                             <div className="flex items-center justify-end pt-6">
//                                                 <Button type="submit" className="w-[100px]">
//                                                     Create
//                                                 </Button>
//                                             </div>
//                                         </form>
//                                     </Form>
//                                 </div>
//                             }
//                         />
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default AddResolution;



import { useState } from 'react';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Form, FormControl, FormField, FormItem, FormMessage, } from "@/components/ui/form/form";
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';
import { useCreateResolution } from './queries/resolution-add-queries.tsx';




interface ResolutionCreateFormProps {
    onSuccess?: () => void; 
}


function AddResolution({ onSuccess }: ResolutionCreateFormProps) {
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");


    //Create mutation
    const { mutate: createResolution } = useCreateResolution(onSuccess);


    const form = useForm<z.infer<typeof resolutionFormSchema>>({
        resolver: zodResolver(resolutionFormSchema),
        mode: 'onChange',
        defaultValues: {
            res_title: "",        
            res_date_approved: "",
            res_area_of_focus: [],
            res_file: undefined,
        },
    });


    // useEffect(() => {
    //     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
    //         form.setValue('res_file', mediaFiles.map(file => ({
    //             name: file.file.name,
    //             type: file.file.type,
    //             path: file.storagePath || '',
    //             url: file.publicUrl || ''
    //         })));
    //     } else {
    //         form.setValue('res_file', []);
    //     }
    // }, [mediaFiles, form]);



    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
        createResolution(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}   className="space-y-4">

                    {/*Resolution Title*/}
                    <FormTextArea
                        control={form.control}
                        name="res_title"
                        label="Resolution Title"  
                        placeholder="Enter Resolution Title" 
                    />         

                    {/*Resolution Date Approved*/}
                    <FormDateTimeInput
                        control={form.control}
                        name="res_date_approved"
                        label="Date Approved"
                        type="date"    
                    />

                    {/*Resolution File Upload*/}
                    <FormField
                        control={form.control}
                        name="res_file"
                        render={({ }) => (
                            <FormItem>
                                <FormControl>
                                    <MediaUpload
                                        title="Resolution File"
                                        description="Upload resolution documentation"
                                        mediaFiles={mediaFiles}
                                        setMediaFiles={setMediaFiles}
                                        activeVideoId={activeVideoId}
                                        setActiveVideoId={setActiveVideoId}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />                                

                    {/*Resolution Area of Focus*/}
                    <FormComboCheckbox
                        control={form.control}
                        name="res_area_of_focus"
                        label="Select Area of Focus"
                        options={meetingAreaOfFocus}
                    />                               

                    <div className="flex justify-end pt-5 space-x-2">
                        <Button type="submit">Save Entry</Button>
                    </div>
            </form>
        </Form>
    );
}

export default AddResolution;
