"use client"

import { useState } from "react"
import type { JSX } from "react" // Declare JSX variable

interface MaternalAppointmentsTabProps {
  onTabChange: (tab: string) => void
  counts?: {
   confirmed: number
   pending: number
   cancelled: number
   rejected: number
   missed: number
  }
}

export default function MaternalAppointmentsTab({
  onTabChange,
  counts = { confirmed: 0, pending: 0, cancelled: 0, rejected: 0, missed: 0 },
}: MaternalAppointmentsTabProps): JSX.Element {
  const [selectedTab, setSelectedTab] = useState("pending")

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    onTabChange(tab)
  }

  const getTabStyle = (tab: string) => {
    const baseClasses =
      "flex w-full justify-center items-center cursor-pointer text-black/70 transition-colors duration-200 ease-in-out rounded-md p-2 h-[40px] px-4"

    if (selectedTab === tab) {
      // Active tab styles
      return `${baseClasses} bg-white shadow-md border text-blue-500`
    } else {
      // Inactive tab styles
      return `${baseClasses} bg-blue-50 text-gray-500 hover:text-black`
    }
  }

  return (
    <div className="flex flex-col w-full">
      <div className="rounded-md">
         <div className="flex flex-row bg-blue-50 p-1 rounded-md gap-2">
            <div className={getTabStyle("pending")} onClick={() => handleTabChange("pending")}>
              <h2 className="text-sm font-semibold">Pending</h2>
              {counts.confirmed > 0 && (
                <span className="ml-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-medium">
                  {counts.confirmed}
                </span>
              )}
            </div>
            <div className={getTabStyle("confirmed")} onClick={() => handleTabChange("confirmed")}>
              <h2 className="text-sm font-semibold">Confirmed</h2>
              {counts.pending > 0 && (
                <span className="ml-2 rounded-full bg-gray-500 text-white px-2 py-0.5 text-xs font-medium">
                  {counts.pending}
                </span>
              )}
            </div>
            <div className={getTabStyle("cancelled")} onClick={() => handleTabChange("cancelled")}>
              <h2 className="text-sm font-semibold">Cancelled</h2>
              {counts.cancelled > 0 && (
                <span className="ml-2 rounded-full bg-gray-500 text-white px-2 py-0.5 text-xs font-medium">
                  {counts.cancelled}
                </span>
              )}
            </div>
            <div className={getTabStyle("rejected")} onClick={() => handleTabChange("rejected")}>
              <h2 className="text-sm font-semibold">Rejected</h2>
              {counts.rejected > 0 && (
                <span className="ml-2 rounded-full bg-gray-500 text-white px-2 py-0.5 text-xs font-medium">
                  {counts.rejected}
                </span>
              )}
            </div>
            <div className={getTabStyle("missed")} onClick={() => handleTabChange("missed")}>
              <h2 className="text-sm font-semibold">Missed</h2>
              {counts.missed > 0 && (
                <span className="ml-2 rounded-full bg-gray-500 text-white px-2 py-0.5 text-xs font-medium">
                  {counts.missed}
                </span>
              )}
            </div>
         </div>
      </div>
    </div>
  )
}
