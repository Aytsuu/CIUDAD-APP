import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";
import { WasteEventFormData } from "@/form-schema/waste/waste-event-schema";

// Update waste event
export const useUpdateWasteEvent = () => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();
    const router = useRouter();

    return useMutation({
        mutationFn: async ({ weNum, eventData }: { weNum: number; eventData: WasteEventFormData }) => {
            const formattedDate = eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : null;
            const formattedTime = eventData.time || null;

            const payload = {
                we_name: eventData.eventName,
                we_location: eventData.location,
                we_date: formattedDate,
                we_time: formattedTime,
                we_description: eventData.eventDescription || '',
                we_organizer: eventData.organizer, // This will be the staff name
                we_invitees: null, // Removed invitees field to match web
                // Include announcement data
                selectedAnnouncements: eventData.selectedAnnouncements || [],
                eventSubject: eventData.eventSubject || ''
            };

            const response = await api.put(`waste/waste-event/${weNum}/`, payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['activeWasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['archivedWasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            
            toast.success("Event updated successfully!");
            router.back();
        },
        onError: (error: any) => {
            toast.error("Failed to update event. Please try again.");
        }
    });
};
