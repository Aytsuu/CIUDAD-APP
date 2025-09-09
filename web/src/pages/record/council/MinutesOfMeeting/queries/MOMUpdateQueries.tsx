import { useQueryClient, useMutation } from "@tanstack/react-query";
import { restoreMinutesOfMeeting, archiveMinutesOfMeeting, updateMinutesOfMeeting } from "../restful-API/MOMPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import {z} from "zod"
import { minutesOfMeetingEditFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
import { showErrorToast } from "@/components/ui/toast";
import { showSuccessToast } from "@/components/ui/toast";

export const useRestoreMinutesOfMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mom_id: string) => restoreMinutesOfMeeting(mom_id),
        onMutate: () =>{
            toast.loading("Restoring record ...", { id: "restoreMOM" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });

            toast.success('Record restored successfully', {
                id: "restoreMOM",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error restore record:", err);
            toast.error("Failed to restore record", {
            id: "restoreMOM",
            duration: 2000
            });
        }
    })
}

export const useArchiveMinutesOfMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mom_id: string) => archiveMinutesOfMeeting(mom_id),
        onMutate: () =>{
            toast.loading("Deleting record ...", { id: "archiveMOM" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });

            toast.success('Record is archived successfully', {
                id: "archiveMOM",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error archiving record:", err);
            toast.error("Failed to archive record", {
            id: "archiveMOM",
            duration: 2000
            });
        }
    })
}



export type MOMFileType = {
    id: string;
    name: string;
    type: string;
    file: string | undefined;
}

type MOMData = z.infer<typeof minutesOfMeetingEditFormSchema> & {
    files: MOMFileType[]
}

export const useUpdateMinutesOfMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: MOMData) => updateMinutesOfMeeting(values.mom_id, values.meetingTitle, values.meetingAgenda, values.meetingDate, values.meetingAreaOfFocus, values.files),
        onMutate: () => {
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });
            queryClient.invalidateQueries({ queryKey: ['momFiles'] });

            showSuccessToast('Record updated successfully')
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error updating record:", err);
            showErrorToast("Failed to update record");
        }
    });
};





