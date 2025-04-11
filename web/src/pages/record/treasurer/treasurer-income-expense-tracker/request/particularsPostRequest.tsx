import { useState } from "react";
import { capitalize } from "@/helpers/capitalize";
import api from "@/api/api";



interface Option {
    id: string;
    name: string;
}
  

export const useAddParticular = () => {

    const [particulars, setParticulars] = useState<Option[]>([]);

    const addIncomeParticular = async (name: string) =>{

        try{
            console.log("ADDED: ", name)
            const res = await api.post('treasurer/income-particular/',{
                incp_item: capitalize(name)
            });
            const newParticular = {
                id: String(res.data.id),    
                name: res.data.name,
            };
            setParticulars((prev) => [...prev, newParticular]);
            return newParticular;
        }
        catch (err){
            console.error(err);
        }
    }



    const handleAddParticular = async (name: string, onAdded?: (newId: string) => void) => {
        if (!name.trim()) return;
        
        try {
            const newParticular = await addIncomeParticular(name);
            if (newParticular && onAdded) {
                onAdded(newParticular.id); // Execute callback with new ID
            }
        } catch (error) {
            console.error("Failed to add particular:", error);
        }
    };

    return{
        handleAddParticular
    };

};