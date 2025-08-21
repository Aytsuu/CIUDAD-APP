"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPrenatalRecord, addPostpartumRecord } from "../restful-api/maternalPOST";
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
          queryClient.invalidateQueries({
              queryKey: ['pregnancies']
          })
          queryClient.invalidateQueries({
              queryKey: ['patientRecords']
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


export const useAddPostpartumRecord = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addPostpartumRecord,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["postpartumRecords"],
      })
      queryClient.invalidateQueries({
        queryKey: ["vitalSigns"],
      })
      queryClient.invalidateQueries({
        queryKey: ["followUpVisits"],
      })
      queryClient.invalidateQueries({
        queryKey: ["spouses"],
      })

      toast("Postpartum record created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      })
      console.log("Successfully added postpartum record ID: ", data.ppr_id)
    },
    onError: (error: Error) => {
      console.error("Postpartum record error: ", error.message)
      toast.error("Failed to add postpartum record: " + error.message)
    },
  })
}
