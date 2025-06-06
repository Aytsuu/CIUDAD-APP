import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addImzSupplies } from "../../restful-api/Antigen/ImzPostAPI";
import { ImmunizationType } from "@/form-schema/inventory/lists/inventoryListSchema";


export const useAddImzSupplies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImmunizationType) => addImzSupplies(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizationsupplies"] });
    },
  });
};
