import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    createOrdinance, 
    updateOrdinance, 
    deleteOrdinance, 
    uploadOrdinance,
    OrdinanceData 
} from "../rest-api/ordinanceGetAPI";

// Create ordinance mutation
export const useCreateOrdinance = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createOrdinance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordinancesData"] });
        },
    });
};

// Update ordinance mutation
export const useUpdateOrdinance = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<OrdinanceData> }) => 
            updateOrdinance(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordinancesData"] });
        },
    });
};

// Delete ordinance mutation
export const useDeleteOrdinance = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteOrdinance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordinancesData"] });
        },
    });
};

// Upload ordinance mutation
export const useUploadOrdinance = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: uploadOrdinance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordinancesData"] });
        },
    });
};
