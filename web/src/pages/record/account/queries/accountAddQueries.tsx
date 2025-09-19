import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAccount } from "../restful-api/accountPostAPI";

export const useAddAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({accountInfo, residentId} : {
      accountInfo: Record<string, any>
      residentId: string
    }) => {
      return addAccount(accountInfo, residentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["residents"]});
    }
  })
}
