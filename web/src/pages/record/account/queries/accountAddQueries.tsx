import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAccount } from "../restful-api/accountPostAPI";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export const useAddAccount = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({accountInfo} : {
      accountInfo: Record<string, string>
    }) => addAccount(accountInfo),
    onSuccess: () => {
      toast("Account created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
    }
  })
}