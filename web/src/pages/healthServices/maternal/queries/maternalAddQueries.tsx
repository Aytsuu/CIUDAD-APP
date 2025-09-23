"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPrenatalRecord, addPostpartumRecord, addIllnessData } from "../restful-api/maternalPOST";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";


export const useAddPrenatalRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
      mutationFn: addPrenatalRecord,
      onSuccess: () => {
          queryClient.invalidateQueries({
              queryKey: ['prenatalRecords']
          })
          queryClient.invalidateQueries({
              queryKey: ['pregnancies']
          })
          queryClient.invalidateQueries({
              queryKey: ['patientRecords']
          })


          showSuccessToast("New Prenatal Record created successfully")
      },
      onError: () => {
          showErrorToast("Failed to create prenatal record")
      }
  })
}
  

export const useAddPostpartumRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addPostpartumRecord,
    onSuccess: () => {
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

      showSuccessToast("New postpartum record created successfully")
    },
    onError: () => {
      showErrorToast("Failed to create postpartum record")
    },
  })
}


export const useAddIllnessData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addIllnessData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["illnessRecords"],
      })

      showSuccessToast("Illness added successfully")
    },
    onError: () => {
      showErrorToast("Failed to add illness. Please try again.")
    }
  })
}