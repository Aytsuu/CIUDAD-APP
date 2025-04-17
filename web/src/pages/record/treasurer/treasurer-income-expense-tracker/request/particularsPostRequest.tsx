import { useQueryClient } from '@tanstack/react-query';
import { capitalize } from "@/helpers/capitalize";
import api from "@/api/api";

export const useAddParticular = () => {
    const queryClient = useQueryClient();

    const addIncomeParticular = async (name: string) => {
        try {
            const res = await api.post('treasurer/income-particular/', {
                incp_item: capitalize(name)
            });
                       
            await queryClient.invalidateQueries({ queryKey: ['incomeParticulars'] });
            
            return String(res.data.incp_id); 
        }
        catch (err) {
            console.error('Error adding particular:', err);
            throw err;
        }
    }

    const handleAddParticular = async (name: string, onAdded?: (newId: string) => void) => {
        if (!name.trim()) return;
        
        try {
            const newId = await addIncomeParticular(name);
            if (onAdded) {
                onAdded(newId);
            }
        } catch (error) {
            console.error("Failed to add particular:", error);
        }
    };

    return { handleAddParticular };
};