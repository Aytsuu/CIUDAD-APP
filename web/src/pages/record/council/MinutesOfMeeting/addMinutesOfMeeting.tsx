import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Button } from '@/components/ui/button/button.tsx';
import { Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form/form.tsx";
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { minutesOfMeetingFormSchema } from '@/form-schema/council/minutesOfMeetingSchema';
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { useState } from 'react';
import { useInsertMinutesOfMeeting } from './queries/MOMInsertQueries';


export default function AddMinutesOfMeeting({onSuccess}: {
    onSuccess?: () => void;
}) {
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const {mutate: addMOM} = useInsertMinutesOfMeeting(onSuccess)
    const form = useForm<z.infer<typeof minutesOfMeetingFormSchema>>({
        resolver: zodResolver(minutesOfMeetingFormSchema),
            defaultValues: {
            meetingTitle: "",        
            meetingAgenda: "",
            meetingDate: "",
            meetingAreaOfFocus: [],
            meetingFile: ""
        },
    });

    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];


    const onSubmit = (values: z.infer<typeof minutesOfMeetingFormSchema>)  => {
        console.log("Values", values);
        console.log('Media Files:', mediaFiles)
        addMOM({ values, mediaFiles });

    }

    // useEffect(() => {
    //         if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
    //         form.setValue('meetingFile', mediaFiles[0].publicUrl);
    //     } else {
    //         form.setValue('meetingFile', 'no-image-url-fetched');
    //     }
    // }, [mediaFiles, form]);

    return(
       <div className="max-h-[80vh] overflow-y-auto p-4">
            {/* Form Inside Dialog */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Title Field */}
                    <FormTextArea
                        control={form.control}
                        name="meetingTitle"
                        label="Meeting Tile"    
                    />

                    {/*Meeting Agenda */}
                     <FormTextArea
                        control={form.control}
                        name="meetingAgenda"
                        label="Meeting Agenda"    
                    />                                 

                    {/* Date Approved Field */}
                    <FormDateTimeInput
                        control={form.control}
                        name="meetingDate"
                        label="Date"
                        type="date"    
                    />

                    <FormField
                        control={form.control}
                        name="meetingFile"
                        render={({ }) => (
                            <FormItem>
                                <FormControl>
                                    <MediaUpload
                                        title="Meeting File"
                                        description="Upload meeting documentation"
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
                    
                    {/* Categories Field */}
                    <FormComboCheckbox
                        control={form.control}
                        name="meetingAreaOfFocus"
                        label="Select Area of Focus"
                        options={meetingAreaOfFocus}
                    />

                    {/* Submit Button (Inside Dialog) */}
                    <div className="flex items-center justify-end pt-4">
                        <Button type="submit" className="w-[100px]">
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}