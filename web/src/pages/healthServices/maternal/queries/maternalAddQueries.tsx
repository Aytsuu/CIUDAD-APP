import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPrenatalRecord, addSpouse } from "../restful-api/maternalPOST";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { CircleCheck } from "lucide-react";

export const useAddPrenatalRecord = () => {
  const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: addPrenatalRecord,
        onSuccess: (pf_id) => {
            queryClient.invalidateQueries({
                queryKey: ['prenatalRecords']
            })
            toast("New record created successfully", {
              icon: (
                <CircleCheck size={24} className="fill-green-500 stroke-white" />
              ),
              action: {
                label: "View",
                onClick: () => navigate(-1),
              },
            });
            console.log("Successfully added prenatal record ID: ", pf_id)
        },
        onError: (error: Error) => {
            console.error('Prenatal record error: ', error.message)
        }
    })
}

export const useAddSpouse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: addSpouse,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['spouses']
            })
        },
        onError: (error: Error) => {
            console.error('Spouse creation error: ', error.message)
            toast.error("Failed to add spouse: " + error.message)
        }
    })
}
