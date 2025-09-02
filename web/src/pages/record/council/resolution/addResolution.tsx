import { useState, useEffect } from 'react';
import {Input} from '../../../../components/ui/input.tsx';
import {Label} from '../../../../components/ui/label.tsx';
import {DatePicker} from '../../../../components/ui/datepicker.tsx';
import {Textarea} from '../../../../components/ui/textarea.tsx';
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
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";



interface ResolutionCreateFormProps {
    onSuccess?: () => void; 
}


function AddResolution({ onSuccess }: ResolutionCreateFormProps) {

    const { user } = useAuth();
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");


    //Create mutation
    const { mutate: createResolution, isPending } = useCreateResolution(onSuccess);


    const form = useForm<z.infer<typeof resolutionFormSchema>>({
        resolver: zodResolver(resolutionFormSchema),
        mode: 'onChange',
        defaultValues: {
            res_title: "",        
            res_date_approved: "",
            res_area_of_focus: [],
        },
    });


    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
        
        const files = mediaFiles.map((media) => ({
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))        

        const allValues = {
            ...values,
            files,
            staff: user?.staff?.staff_id
        }

        createResolution(allValues)
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
                    <MediaUpload
                        title=""
                        description="Upload Resolution File"
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
                        <Button type="submit" disabled={ isPending }>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
            </form>
        </Form>
    );
}

export default AddResolution;
