import { useQueryClient, useMutation } from "@tanstack/react-query";
import { restoreMinutesOfMeeting, archiveMinutesOfMeeting, updateMinutesOfMeeting } from "../restful-API/MOMPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { MediaUploadType } from "@/components/ui/media-upload";

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

export const useUpdateMinutesOfMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            mom_id,
            momf_id,
            values,
            mediaFiles
        }: {
            mom_id: number;
            momf_id: number;
            values: {
                meetingTitle: string;
                meetingAgenda: string;
                meetingDate: string;
                meetingAreaOfFocus: string[];
                meetingFile: string[];
            };
            mediaFiles: MediaUploadType;
        }) => updateMinutesOfMeeting(mom_id, momf_id, values, mediaFiles),
        onMutate: () => {
            toast.loading("Updating record...", { id: "updateMOM" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });
            queryClient.invalidateQueries({ queryKey: ['momFiles'] });
            queryClient.invalidateQueries({ queryKey: ['momAreasOfFocus'] });

            toast.success('Record updated successfully', {
                id: "updateMOM",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error updating record:", err);
            toast.error("Failed to update record", {
                id: "updateMOM",
                duration: 2000
            });
        }
    });
};





