import { useQueryClient, useMutation } from "@tanstack/react-query";
import { restoreMinutesOfMeeting, archiveMinutesOfMeeting, deleteMOMAreas, updateMinutesOfMeeting, handleMOMAreaOfFocus, handleMOMFileUpdates, handleMOMSuppDocUpdates } from "../restful-API/MOMPutAPI";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";
import { minutesOfMeetingEditFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
import z from "zod"
import { MediaFileType } from "@/components/ui/multi-media-upload";
import { DocumentFileType } from "@/components/ui/document-upload";
import { api } from "@/api/api";

export const useRestoreMinutesOfMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext()
    const router = useRouter();

    return useMutation({
        mutationFn: (mom_id: string) => restoreMinutesOfMeeting(mom_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });

            toast.success('Record restored successfully')
            onSuccess?.();
            router.back()
        },
        onError: (err) => {
            console.error("Error restore record:", err);
            toast.error("Failed to restore record")
        }
    })
}

export const useArchiveMinutesOfMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext()
    const router = useRouter()

    return useMutation({
        mutationFn: (mom_id: string) => archiveMinutesOfMeeting(mom_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });

            toast.success('Record is archived successfully')
            
            onSuccess?.();
            router.back()
        },
        onError: (err) => {
            console.error("Error archiving record:", err);
            toast.error("Failed to archive record")
        }
    })
}


type MOMUpdateValues = {
  mom_id: number;
  momf_id: number;
  meetingTitle: string;
  meetingAgenda: string;
  meetingDate: string;
  meetingAreaOfFocus: string[];
  documentFiles: DocumentFileType[];
  mediaFiles: MediaFileType[];
};

export const useUpdateMinutesOfMeeting = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: MOMUpdateValues) => {
      const res = await updateMinutesOfMeeting(values.mom_id, values.meetingTitle, values.meetingAgenda, values.meetingDate);

      await deleteMOMAreas(values.mom_id);

      await handleMOMAreaOfFocus(values.mom_id, values.meetingAreaOfFocus);

      await handleMOMFileUpdates(values.mom_id, values.momf_id, values.documentFiles);

      await handleMOMSuppDocUpdates(values.mom_id, values.mediaFiles)
     
      return values.mom_id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['momRecords'] });
      queryClient.invalidateQueries({ queryKey: ['momFiles'] });
      queryClient.invalidateQueries({ queryKey: ['momAreasOfFocus'] });
      queryClient.invalidateQueries({ queryKey: ['momSuppDocs'] });

      toast.success('Minutes of Meeting updated successfully');
      onSuccess?.();
      router.back();
    },
    onError: (err) => {
      console.error("Error updating Minutes of Meeting:", err);
      toast.error("Failed to update Minutes of Meeting");
    }
  });
};






