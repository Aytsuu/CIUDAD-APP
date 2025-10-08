"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/table/data-table"
import { appointmentColumns, appointmentColumnsWithReason, pendingAppointmentColumns, type Appointment } from "./columns"

import MaternalAppointmentsTab from "./tabs"

// Sample data types
// type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "rejected"

// Sample data
const confirmedAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "Maria Santos",
    gender: "Female",
    age: 28,
    dateScheduled: "2024-01-15",
    requestedDate: "2024-01-10",
    status: "confirmed",
  },
  {
    id: 2,
    patientName: "Ana Cruz",
    gender: "Female",
    age: 32,
    dateScheduled: "2024-01-16",
    requestedDate: "2024-01-11",
    status: "confirmed",
  },
]

const pendingAppointments: Appointment[] = [
  {
    id: 3,
    patientName: "Rosa Garcia",
    gender: "Female",
    age: 25,
    dateScheduled: "2024-01-20",
    requestedDate: "2024-01-14",
    status: "pending",
  },
]

const cancelledAppointments: Appointment[] = [
  {
    id: 4,
    patientName: "Carmen Lopez",
    gender: "Female",
    age: 30,
    dateScheduled: "2024-01-12",
    requestedDate: "2024-01-08",
    status: "cancelled",
    reason: "Patient requested cancellation due to personal reasons",
  },
]

const rejectedAppointments: Appointment[] = [
  {
    id: 5,
    patientName: "Isabel Reyes",
    gender: "Female",
    age: 35,
    dateScheduled: "2024-01-18",
    requestedDate: "2024-01-13",
    status: "rejected",
    reason: "Requested time slot not available",
  },
]

const missedAppointments: Appointment[] = [
  {
    id: 6,
    patientName: "Laura Martinez",
    gender: "Female",
    age: 29,
    dateScheduled: "2024-01-22",
    requestedDate: "2024-01-17",
    status: "missed",
    reason: "Patient did not show up for the appointment",
  },
]

export default function MaternalAppointmentsMain() {
  const [selectedTab, setSelectedTab] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const tabCounts = {
    confirmed: confirmedAppointments.length,
    pending: pendingAppointments.length,
    cancelled: cancelledAppointments.length,
    rejected: rejectedAppointments.length,
    missed: missedAppointments.length,
  }

  const filterData = (data: Appointment[]) => {
    if (!searchTerm) return data
    return data.filter((appointment) => appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  return (
    <div className="w-full h-full border rounded-md p-4 bg-white">
      <div className="w-full mb-4">
        <MaternalAppointmentsTab onTabChange={handleTabChange} counts={tabCounts} />
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={17} />
          <Input
            placeholder="Search by patient name..."
            className="pl-10 w-full bg-white"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        {selectedTab === "confirmed" && (
          <div className="bg-white rounded-lg border">
            <DataTable columns={appointmentColumns} data={filterData(confirmedAppointments)} maxHeight="600px" />
          </div>
        )}
        {selectedTab === "pending" && (
          <div className="bg-white rounded-lg border">
            <DataTable columns={pendingAppointmentColumns} data={filterData(pendingAppointments)} maxHeight="600px" />
          </div>
        )}
        {selectedTab === "cancelled" && (
          <div className="bg-white rounded-lg border">
            <DataTable
              columns={appointmentColumnsWithReason}
              data={filterData(cancelledAppointments)}
              maxHeight="600px"
            />
          </div>
        )}
        {selectedTab === "rejected" && (
          <div className="bg-white rounded-lg border">
            <DataTable
              columns={appointmentColumnsWithReason}
              data={filterData(rejectedAppointments)}
              maxHeight="600px"
            />
          </div>
        )}
        {selectedTab === "missed" && (
          <div className="bg-white rounded-lg border">
            <DataTable
              columns={appointmentColumnsWithReason}
              data={filterData(missedAppointments)}
              maxHeight="600px"
            />
          </div>
        )}
      </div>
    </div>
  )
}
