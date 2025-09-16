import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAccount } from "../restful-api/accountPostAPI";

export const useAddAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({accountInfo, residentId} : {
      accountInfo: Record<string, string>
      residentId: string
    }) => addAccount(accountInfo, residentId),
    onSuccess: (data) => {
      console.log('Account creation successful:', data);
      queryClient.invalidateQueries({queryKey: ["residents"]});
    },
    onError: (error: any) => {
      console.error('Account creation failed:', error);
    }
  })
}
