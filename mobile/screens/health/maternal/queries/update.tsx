import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelPrenatalAppointment } from "../restful-api/put";

export const useCancelPrenatalAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ par_id, updateData }: { par_id: string; updateData: any }) => 
            cancelPrenatalAppointment(par_id, updateData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prenatalAppointments"] });
        }
    });
};
