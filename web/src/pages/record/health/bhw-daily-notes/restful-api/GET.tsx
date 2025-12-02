"use client"

import { api2 } from "@/api/api"

export const checkAttendanceSummaryExists = async (staffId: string, month: string) => {
  try {
    const res = await api2.get("/reports/bhw/attendance-summary/check/", {
      params: {
        staff_id: staffId,
        month: month // Format: YYYY-MM
      }
    })
    return res.data
  } catch (error) {
    console.error("Failed to check attendance summary:", error)
    throw error
  }
}
