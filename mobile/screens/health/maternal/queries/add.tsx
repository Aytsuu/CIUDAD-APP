import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPrenatalAppointment } from "../restful-api/post";
import { useToast } from "@/hooks/use-toast";

export const useAddPrenatalAppointment = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: addPrenatalAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['prenatalAppointments']
            });
            toast.success("New Prenatal Appointment created successfully");
        },
        onError: () => {
            toast.error("Failed to create prenatal appointment");
        }
    });
}
