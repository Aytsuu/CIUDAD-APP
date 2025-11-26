import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addMedicine } from "../../restful-api/medicine/MedlistPostAPI";


export const useAddMedicine = () => {
  const queryClient= useQueryClient();
  return useMutation({
    mutationFn: (data: any) => addMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ['medicineCategories'] }); 
      queryClient.invalidateQueries({ queryKey: ['medicinelistcount'] });

    },
  });
};



