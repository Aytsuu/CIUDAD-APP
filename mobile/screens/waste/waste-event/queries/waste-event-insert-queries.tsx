import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";
import { useToastContext } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { WasteEventFormData } from "@/form-schema/waste/waste-event-schema";

// Create waste event
export const useCreateWasteEvent = () => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();
    const { user } = useAuth();
    const router = useRouter();

    return useMutation({
        mutationFn: async (eventData: WasteEventFormData) => {
            const staffId = user?.staff?.staff_id;
            
            if (!staffId) {
                throw new Error("Staff information not available. Please log in again.");
            }

            const formattedDate = eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : null;
            const formattedTime = eventData.time || null;

            // Get organizer name from staff list if organizer is an ID
            // For now, organizer is expected to be the staff ID, we'll get the name in the form component
            const payload = {
                we_name: eventData.eventName,
                we_location: eventData.location,
                we_date: formattedDate,
                we_time: formattedTime,
                we_description: eventData.eventDescription || '',
                we_organizer: eventData.organizer, // This will be the staff name
                we_invitees: null, // Removed invitees field to match web
                we_is_archive: false,
                staff: staffId,
                // Include announcement data
                selectedAnnouncements: eventData.selectedAnnouncements || [],
                eventSubject: eventData.eventSubject || ''
            };

            const response = await api.post('waste/waste-event/', payload);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['wasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['activeWasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            
            // Show appropriate success message
            if (data?.announcement_created) {
                toast.success("Event scheduled and announcement sent successfully!");
            } else {
                toast.success("Event has been scheduled successfully!");
            }

            router.back();
        },
        onError: (error: any) => {
            toast.error("Failed to schedule event. Please try again.");
        }
    });
};
