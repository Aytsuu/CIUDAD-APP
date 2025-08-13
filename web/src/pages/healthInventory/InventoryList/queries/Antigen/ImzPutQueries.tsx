import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateImzSuppliesList } from "../../restful-api/Antigen/ImzPutAPI";


export const useUpdateImzSupply = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ imz_id, imz_name }: { imz_id: number; imz_name: string }) => 
        updateImzSuppliesList(imz_id, imz_name),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["antigen"] });
        
      },
      onError: (error: Error) => {
        console.error("Error updating IMZ supply:", error);
      },
    });
  };