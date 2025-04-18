import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAccount } from "../restful-api/accountPostAPI";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";

export const useAddAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({accountInfo, residentId} : {
      accountInfo: Record<string, string>
      residentId: string
    }) => addAccount(accountInfo, residentId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["residents"]});
      toast("Account created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
      });
    }
  })
}