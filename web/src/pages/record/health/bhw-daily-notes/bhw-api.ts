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
  const response = await api2.post("/reports/bhw/daily-notes/create/", data)
  return response.data
}
