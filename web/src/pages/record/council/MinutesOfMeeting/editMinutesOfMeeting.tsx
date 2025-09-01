import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Button } from '@/components/ui/button/button.tsx';
import { Form, FormControl, FormItem, FormMessage} from "@/components/ui/form/form.tsx";
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
// import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { useState } from 'react';
import { minutesOfMeetingEditFormSchema } from '@/form-schema/council/minutesOfMeetingSchema';
import { useUpdateMinutesOfMeeting } from './queries/MOMUpdateQueries';

export default function EditMinutesOfMeeting({mom_title, mom_agenda, mom_date, mom_id, momf_url, momf_id, areas_of_focus, onSuccess}: {
    mom_title: string;
    mom_agenda: string;
    mom_date: string;
    mom_id: number;
    momf_url: string;
    momf_id: number;
    areas_of_focus: string[];
    onSuccess?: () => void;
}) {

    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => {
        return momf_url
            ? [{
                id: `existing-${momf_id}`,
                name: momf_url.split('/').pop() || `file-${momf_id}`,
                type: 'document/pdf',
                url: momf_url
            }]
            : [];
    });
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [fileError, setFileError] = useState<string>("");

    const { mutate: editMOM, isPending } = useUpdateMinutesOfMeeting(onSuccess);
    const form = useForm<z.infer<typeof minutesOfMeetingEditFormSchema>>({
        resolver: zodResolver(minutesOfMeetingEditFormSchema),
        defaultValues: {
            meetingTitle: mom_title,
            meetingAgenda: mom_agenda,
            meetingDate: mom_date,
            meetingAreaOfFocus: areas_of_focus,
            mom_id: mom_id,
        },
    });

    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    const onSubmit = (values: z.infer<typeof minutesOfMeetingEditFormSchema>) => {
        if (!mediaFiles || mediaFiles.length === 0) {
            setFileError("Meeting file is required.");
            return;
        }
        setFileError("");
        const files = mediaFiles.map((media) => ({
            id: media.id,
            name: media.name,
            type: media.type,
            file: media.file
        }));
        editMOM({ ...values, files });
    };

    return (
        <div className="max-h-[80vh] overflow-y-auto p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormTextArea
                        control={form.control}
                        name="meetingTitle"
                        label="Meeting Tile"
                    />
                    
                    <FormTextArea
                        control={form.control}
                        name="meetingAgenda"
                        label="Meeting Agenda"
                    />

                    <FormDateTimeInput
                        control={form.control}
                        name="meetingDate"
                        label="Date"
                        type="date"
                    />

                    <FormItem>
                        <FormControl>
                            <MediaUpload
                                title="Meeting File"
                                description="Upload meeting documentation"
                                mediaFiles={mediaFiles}
                                setMediaFiles={setMediaFiles}
                                activeVideoId={activeVideoId}
                                setActiveVideoId={setActiveVideoId}
                                maxFiles={1}
                                acceptableFiles='document'
                            />
                        </FormControl>
                        <FormMessage />
                        {fileError && (
                            <div className="text-red-500 text-xs mt-2">{fileError}</div>
                        )}
                    </FormItem>

                    <FormComboCheckbox
                        control={form.control}
                        name="meetingAreaOfFocus"
                        label="Select Area of Focus"
                        options={meetingAreaOfFocus}
                    />
                    <div className="flex items-center justify-end pt-4">
                        <Button type="submit" onClick={() => console.log('clicked')} className="w-[100px]" disabled={isPending}>
                            {isPending ? "Updating..." : "Update"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}