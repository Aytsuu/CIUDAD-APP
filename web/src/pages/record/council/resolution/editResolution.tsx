
// import { useState, useEffect } from 'react';
// import {Input} from '../../../../components/ui/input.tsx';
// import {Label} from '../../../../components/ui/label.tsx';
// import {DatePicker} from '../../../../components/ui/datepicker.tsx';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Button} from '../../../../components/ui/button/button.tsx';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
// import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
// import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';
// import { usingUpdateResolution } from './queries/resolution-update-queries.tsx';




// interface ResolutionEditFormProps {
//     res_num: number,
//     res_title: string,
//     res_date_approved: string,
//     res_area_of_focus: string[],
//     resolution_files:{
//         rf_id: number;
//         rf_url: string;
//     }[];
//     onSuccess?: () => void; 
// }


// function EditResolution({ res_num, res_title, res_date_approved, res_area_of_focus, resolution_files, onSuccess }: ResolutionEditFormProps) {
//     const [activeVideoId, setActiveVideoId] = useState<string>("");
//     // const [mediaFiles, setMediaFiles] = useState<any[]>(() => {
//     //     return resolution_files?.map(file => ({
//     //         id: `existing-${file.rf_id}`,
//     //         type: 'document',
//     //         status: 'uploaded' as const,
//     //         publicUrl: file.rf_url,
//     //         previewUrl: file.rf_url,
//     //         storagePath: '' 
//     //     })) || [];
//     // });

//     const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => 
//         resolution_files?.map(file => ({
//             id: `existing-${file.rf_id}`,
//             type: 'document' as const,
//             file: new File([], file.rf_url.split('/').pop() || `document-${file.rf_id}`), // Create dummy File object
//             publicUrl: file.rf_url,
//             storagePath: '', // You might want to set this if you have it
//             status: 'uploaded' as const,
//             previewUrl: file.rf_url
//         })) || []
//     );

//     const [isEditing, setIsEditing] = useState(false);


//     const form = useForm<z.infer<typeof resolutionFormSchema>>({
//         resolver: zodResolver(resolutionFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             res_title: res_title,        
//             res_date_approved: res_date_approved,
//             res_area_of_focus: res_area_of_focus,
//             res_file: undefined,
//         },
//     });




//     const meetingAreaOfFocus = [
//         { id: "gad", name: "GAD" },
//         { id: "finance", name: "Finance" },
//         { id: "council", name: "Council" },
//         { id: "waste", name: "Waste Committee" }
//     ];

//     const { mutate: updateEntry } = usingUpdateResolution(res_num, onSuccess);


//     function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
//         updateEntry(values)
//     }

//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}   className="space-y-4">

//                     {/*Resolution Title*/}
//                     <FormTextArea
//                         control={form.control}
//                         name="res_title"
//                         label="Resolution Title"  
//                         placeholder="Enter Resolution Title" 
//                     />         

//                     {/*Resolution Date Approved*/}
//                     <FormDateTimeInput
//                         control={form.control}
//                         name="res_date_approved"
//                         label="Date Approved"
//                         type="date"    
//                     />

//                     {/*Resolution File Upload*/}
//                     <FormField
//                         control={form.control}
//                         name="res_file"
//                         render={({ }) => (
//                             <FormItem>
//                                 <FormControl>
//                                     <MediaUpload
//                                         title="Resolution File"
//                                         description="Upload resolution documentation"
//                                         mediaFiles={mediaFiles}
//                                         setMediaFiles={setMediaFiles}
//                                         activeVideoId={activeVideoId}
//                                         setActiveVideoId={setActiveVideoId}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />                                

//                     {/*Resolution Area of Focus*/}
//                     <FormComboCheckbox
//                         control={form.control}
//                         name="res_area_of_focus"
//                         label="Select Area of Focus"
//                         options={meetingAreaOfFocus}
//                     />                               

//                     <div className="flex justify-end pt-5 space-x-2">
//                         <Button type="submit">Save Entry</Button>
//                     </div>
//             </form>
//         </Form>
//     );
// }

// export default EditResolution;





import { useState } from 'react';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Form, FormControl, FormField, FormItem, FormMessage, } from "@/components/ui/form/form";
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { ConfirmationModal } from '@/components/ui/confirmation-modal.tsx';
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';
import { usingUpdateResolution } from './queries/resolution-update-queries.tsx';




interface ResolutionEditFormProps {
    res_num: number,
    res_title: string,
    res_date_approved: string,
    res_area_of_focus: string[],
    resolution_files:{
        rf_id: number;
        rf_url: string;
    }[];
    onSuccess?: () => void; 
}


function EditResolution({ res_num, res_title, res_date_approved, res_area_of_focus, resolution_files, onSuccess }: ResolutionEditFormProps) {
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    // const [mediaFiles, setMediaFiles] = useState<any[]>(() => {
    //     return resolution_files?.map(file => ({
    //         id: `existing-${file.rf_id}`,
    //         type: 'document',
    //         status: 'uploaded' as const,
    //         publicUrl: file.rf_url,
    //         previewUrl: file.rf_url,
    //         storagePath: '' 
    //     })) || [];
    // });

    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => 
        resolution_files?.map(file => ({
            id: `existing-${file.rf_id}`,
            type: 'document' as const,
            file: new File([], file.rf_url.split('/').pop() || `document-${file.rf_id}`), // Create dummy File object
            publicUrl: file.rf_url,
            storagePath: '', // You might want to set this if you have it
            status: 'uploaded' as const,
            previewUrl: file.rf_url
        })) || []
    );

    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formValues, setFormValues] = useState<z.infer<typeof resolutionFormSchema>>();


    const form = useForm<z.infer<typeof resolutionFormSchema>>({
        resolver: zodResolver(resolutionFormSchema),
        mode: 'onChange',
        defaultValues: {
            res_title: res_title,        
            res_date_approved: res_date_approved,
            res_area_of_focus: res_area_of_focus,
            res_file: undefined,
        },
    });




    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    const { mutate: updateEntry } = usingUpdateResolution(onSuccess);


    function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
        updateEntry({ 
            ...values, 
            mediaFiles,
            res_num 
        });
        setIsEditing(false);
    }

    const handleSaveClick = (e: React.FormEvent) => {
        // e.preventDefault();
        setFormValues(form.getValues());
        setIsConfirmOpen(true);
    };

    const handleConfirmSave = () => {
        setIsConfirmOpen(false);
        form.handleSubmit(onSubmit)();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}   className="space-y-4">

                    {/*Resolution Title*/}
                    <FormTextArea
                        control={form.control}
                        name="res_title"
                        label="Resolution Title"  
                        placeholder="Enter Resolution Title"
                        readOnly={!isEditing} 
                    />         

                    {/*Resolution Date Approved*/}
                    <FormDateTimeInput
                        control={form.control}
                        name="res_date_approved"
                        label="Date Approved"
                        type="date"    
                        readOnly={!isEditing}
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
                        {!isEditing ? (
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent form submission
                                    setIsEditing(true); // Toggle editing mode
                                }}
                            >
                                Edit
                            </Button>
                        ) : (

                            <ConfirmationModal
                                trigger={
                                    <Button onClick={handleSaveClick}>Save</Button>
                                }
                                title="Confirm Save"
                                description="Are you sure you want to save the changes?"
                                actionLabel="Confirm"
                                onClick={handleConfirmSave} // This will be called when the user confirms
                            />    

                        )}
                    </div>
            </form>
        </Form>
    );
}

export default EditResolution;