// import { useState } from "react";
// import { capitalize } from "@/helpers/capitalize";
// import api from "@/api/api";



// interface Option {
//     id: string;
//     name: string;
// }
  

// export const useAddParticular = () => {

//     const [particulars, setParticulars] = useState<Option[]>([]);

//     const addIncomeParticular = async (name: string) =>{

//         try{
//             console.log("ADDED: ", name)
//             const res = await api.post('treasurer/income-particular/',{
//                 incp_item: capitalize(name)
//             });
//             const newParticular = {
//                 id: String(res.data.id),    
//                 name: res.data.name,
//             };
//             setParticulars((prev) => [...prev, newParticular]);
//             return newParticular;
//         }
//         catch (err){
//             console.error(err);
//         }
//     }



//     const handleAddParticular = async (name: string, onAdded?: (newId: string) => void) => {
//         if (!name.trim()) return;
        
//         try {
//             const newParticular = await addIncomeParticular(name);
//             if (newParticular && onAdded) {
//                 onAdded(newParticular.id); // Execute callback with new ID
//             }
//         } catch (error) {
//             console.error("Failed to add particular:", error);
//         }
//     };

//     return{
//         handleAddParticular
//     };

// };






//LATEST WORKINGG
import { useQueryClient } from '@tanstack/react-query';
import { capitalize } from "@/helpers/capitalize";
import api from "@/api/api";


export const useAddParticular = () => {
    const queryClient = useQueryClient();

    const addIncomeParticular = async (name: string) => {
        try {
            console.log("ADDED: ", name)
            const res = await api.post('treasurer/income-particular/', {
                incp_item: capitalize(name)
            });
            
            // Invalidate the query to trigger a refetch
            await queryClient.invalidateQueries({ queryKey: ['incomeParticulars'] });
            
            return {
                id: String(res.data.id),    
                name: res.data.name,
            };
        }
        catch (err) {
            console.error(err);
            throw err; // Re-throw to handle in the calling component
        }
    }

    const handleAddParticular = async (name: string, onAdded?: (newId: string) => void) => {
        if (!name.trim()) return;
        
        try {
            const newParticular = await addIncomeParticular(name);
            if (newParticular && onAdded) {
                onAdded(newParticular.id);
            }
        } catch (error) {
            console.error("Failed to add particular:", error);
        }
    };

    return { handleAddParticular };
};






// import { useQueryClient } from '@tanstack/react-query';
// import { capitalize } from "@/helpers/capitalize";
// import api from "@/api/api";




// export const useAddParticular = () => {
//     const queryClient = useQueryClient();

//     const addIncomeParticular = async (name: string) => {
//         try {
//             console.log("ADDED: ", name);
            
//             // Optimistically generate a temporary ID
//             const tempId = `temp-${Date.now()}`;
            
//             // Create optimistic update
//             queryClient.setQueryData(['incomeParticulars'], (oldData: any[] = []) => [
//                 ...oldData,
//                 { id: tempId, name: capitalize(name) }
//             ]);
            
//             // Make the actual API call
//             const res = await api.post('treasurer/income-particular/', {
//                 incp_item: capitalize(name)
//             });
            
//             // Update the cache with the real data
//             queryClient.setQueryData(['incomeParticulars'], (oldData: any[] = []) => 
//                 oldData.map(item => 
//                     item.id === tempId 
//                         ? { id: String(res.data.id), name: res.data.name }
//                         : item
//                 )
//             );
            
//             // Still invalidate to ensure we have the latest data
//             await queryClient.invalidateQueries({ queryKey: ['incomeParticulars'] });
            
//             return {
//                 id: String(res.data.id),    
//                 name: res.data.name,
//             };
//         }
//         catch (err) {
//             // On error, rollback the optimistic update
//             queryClient.setQueryData(['incomeParticulars'], (oldData: any[] = []) => 
//                 oldData.filter(item => !item.id.startsWith('temp-'))
//             );
//             console.error(err);
//             throw err;
//         }
//     }


//     const handleAddParticular = async (name: string, onAdded?: (newId: string) => void) => {
//         if (!name.trim()) return;
        
//         try {
//             const newParticular = await addIncomeParticular(name);
//             if (newParticular && onAdded) {
//                 onAdded(newParticular.id);
//             }
//         } catch (error) {
//             console.error("Failed to add particular:", error);
//         }
//     };

//     return { handleAddParticular };
// };