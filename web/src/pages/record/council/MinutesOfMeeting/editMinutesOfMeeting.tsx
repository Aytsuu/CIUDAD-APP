import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Button } from '@/components/ui/button/button.tsx';
import { Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form/form.tsx";
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { useState } from 'react';
import { minutesOfMeetingEditFormSchema } from '@/form-schema/council/minutesOfMeetingSchema';
import { useUpdateMinutesOfMeeting } from './queries/MOMUpdateQueries';

export default function EditMinutesOfMeeting({mom_title, mom_agenda, mom_date, mom_id, file_url, file_id, areas_of_focus, onSuccess}: {
    mom_title: string;
    mom_agenda: string;
    mom_date: string;
    mom_id: number;
    file_url: string;
    file_id: number;
    areas_of_focus: string[];
    onSuccess?: () => void;
}) {


    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => {
        return file_url ? [{
            id: `existing-${file_id || 'default'}`,
            type: 'document',
            status: 'uploaded' as const,
            publicUrl: file_url,
            previewUrl: file_url,
            storagePath: '',
            file: new File([], file_url.split('/').pop() || 'document')
        }] : [];
    });
    const [activeVideoId, setActiveVideoId] = useState<string>("");

    const{mutate: editMOM} = useUpdateMinutesOfMeeting(onSuccess);
    const form = useForm<z.infer<typeof minutesOfMeetingEditFormSchema>>({
        resolver: zodResolver(minutesOfMeetingEditFormSchema),
        defaultValues: {
            meetingTitle: mom_title,
            meetingAgenda: mom_agenda,
            meetingDate: mom_date,
            meetingAreaOfFocus: areas_of_focus,
            meetingFile: file_url || '', 
            mom_id: mom_id,
            momf_id: file_id,
        },
    });

    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    const onSubmit = (values: z.infer<typeof minutesOfMeetingEditFormSchema>) => {
        console.log('Values:', values)
        editMOM({
            mom_id: Number(values.mom_id),
            momf_id: Number(values.momf_id),
            values: {
                meetingTitle: values.meetingTitle,
                meetingAgenda: values.meetingAgenda,
                meetingDate: values.meetingDate,
                meetingAreaOfFocus: values.meetingAreaOfFocus,
                meetingFile: [], // submit empty because its not needed
            },
            mediaFiles
        });
    };


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
                        render={({ field }) => (
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

                    {/* Submit Button */}
                    <div className="flex items-center justify-end pt-4">
                        <Button type="submit" onClick={() => console.log('clicked')} className="w-[100px]">
                            Save
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}