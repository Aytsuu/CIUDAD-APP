"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBHWDailyNote, createBHWAttendanceSummary } from "../restful-api/POST" 
import { showSuccessToast, showErrorToast } from "@/components/ui/toast"

export const useCreateBHWDailyNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBHWDailyNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bhwDailyNotes"],
      })
      queryClient.invalidateQueries({
        queryKey: ["staffWithBHWNotes"],
      })

      showSuccessToast("BHW Daily Note created successfully")
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.error || "Failed to create BHW Daily Note"
      showErrorToast(errorMessage)
    },
  })
}

export const useCreateBHWAttendanceSummary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBHWAttendanceSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bhwStaffWithNotes"],
      })
      queryClient.invalidateQueries({
        queryKey: ["bhwAttendanceSummary"],
      })

      showSuccessToast("Attendance summary created successfully")
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.error || "Failed to create attendance summary"
      showErrorToast(errorMessage)
    },
  })
}
