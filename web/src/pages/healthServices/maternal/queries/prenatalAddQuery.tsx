import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPrenatalRecord } from "../restful-api/prenatalPOST";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { CircleCheck } from "lucide-react";

export const useAddPrenatalRecord = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: Record<string, string>) =>  addPrenatalRecord(formData),
        onSuccess: (pf_id) => {
            queryClient.invalidateQueries({
                queryKey: ['prenatalRecords']
            })
            console.log("Successfully added prenatal record ID: ", pf_id)
            toast("New record created successfully", {
                icon: (
                  <CircleCheck size={24} className="fill-green-500 stroke-white" />
                ),
                action: {
                  label: "View",
                  onClick: () => navigate(-1),
                },
              });
        },
        onError: (error: Error) => {
            console.error('Mutation error: ', error.message)
        }
    })
}

