import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePrenatalAppointment } from "../restful-api/put";

export const useUpdatePrenatalAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ par_id, updateData }: { par_id: string; updateData: any }) => 
            updatePrenatalAppointment(par_id, updateData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prenatalAppointments"] });
        }
    });
};
