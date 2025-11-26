"use client"

import { api2 } from "@/api/api"

export interface BHWDailyNotePayload {
  staffId: string
  pat_id: string
  dateToday: string
  description?: string
  age: string
  gender: "Male" | "Female"
  weight?: number
  height?: number
  muac?: number
  nutritionalStatus?: {
    wfa: string
    lhfa: string
    wfh: string
    muac?: number
    muac_status: string
  }
  illnesses?: Array<{
    illnessName: string
    count: number
  }>
  numOfWorkingDays?: number
  daysPresent?: number
  daysAbsent?: number
  notedBy?: string
  approvedBy?: string
}

export const createBHWDailyNote = async (data: BHWDailyNotePayload) => {
  try {
    const res = await api2.post("/reports/bhw/daily-notes/create/", data)
    return res.data
  } catch (error) {
    console.error("Failed to create BHW Daily Note:", error)
    throw error
  }
}
