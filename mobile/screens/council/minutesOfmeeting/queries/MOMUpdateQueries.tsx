import { useQueryClient, useMutation } from "@tanstack/react-query";
import { restoreMinutesOfMeeting, archiveMinutesOfMeeting,  updateMinutesOfMeeting, handleMOMFileUpdates, handleMOMSuppDocUpdates } from "../restful-API/MOMPutAPI";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";
import { minutesOfMeetingEditFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
import z from "zod"

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

export type MOMFileType = {
    id: string;
    name: string | undefined;
    type: string | undefined;
    file: string | undefined;
}
export type MOMSuppDoc = {
    id: string;
    name: string | undefined;
    type: string | undefined;
    file: string | undefined;
}

type MOMData = z.infer<typeof minutesOfMeetingEditFormSchema> & {
    files: MOMFileType[],
    suppDocs: MOMSuppDoc[],
}

export const useUpdateMinutesOfMeeting = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: MOMData) => {
      const res = await updateMinutesOfMeeting(values.mom_id, values.meetingTitle, values.meetingAgenda, values.meetingDate, values.meetingAreaOfFocus, values.files);

    //   await handleMOMFileUpdates(values.mom_id, values.files);

      await handleMOMSuppDocUpdates(values.mom_id, values.suppDocs)
     
      return values.mom_id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['momRecords'] });
      queryClient.invalidateQueries({ queryKey: ['momFiles'] });
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






