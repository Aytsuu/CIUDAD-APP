import { useState } from 'react';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
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
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


interface ResolutionEditFormProps {
    res_num: string,
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
    
    const { user } = useAuth();
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => {
        return resolution_files?.map(file => ({
            id: `existing-${file.rf_id}`,
            name: `file-${file.rf_id}`, 
            type: 'document/pdf', // Default type or get from your file data
            url: file.rf_url 
        })) || [];
    }); 



    const [isEditing, setIsEditing] = useState(false);
    const [_isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [_formValues, setFormValues] = useState<z.infer<typeof resolutionFormSchema>>();


    const form = useForm<z.infer<typeof resolutionFormSchema>>({
        resolver: zodResolver(resolutionFormSchema),
        mode: 'onChange',
        defaultValues: {
            res_num: res_num,
            res_title: res_title,        
            res_date_approved: res_date_approved,
            res_area_of_focus: res_area_of_focus
        },
    });




    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    const { mutate: updateEntry, isPending } = usingUpdateResolution(onSuccess);


    function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
        const files = mediaFiles.map((media) => ({
            'id': media.id,
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))             

        updateEntry({ 
            ...values, 
            files,
            res_num,
            staff: user?.staff?.staff_id 
        });
        setIsEditing(false);
    }

    const handleSaveClick = (_e: React.FormEvent) => {
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
                    <MediaUpload
                        title=""
                        description="Upload/Edit resolution file"
                        mediaFiles={mediaFiles}
                        activeVideoId={activeVideoId}
                        setMediaFiles={setMediaFiles}
                        setActiveVideoId={setActiveVideoId}
                        acceptableFiles='document'
                        maxFiles={1}
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
                                disabled={ isPending }
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Edit"
                                )}
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