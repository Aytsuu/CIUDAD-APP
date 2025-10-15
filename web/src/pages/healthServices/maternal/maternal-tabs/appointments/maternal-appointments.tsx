"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/table/data-table"
import { 
  appointmentColumns, 
  appointmentColumnsWithReason, 
  createPendingAppointmentColumns, 
  appointmentConfirmedColumns,
  type Appointment 
} from "./columns"

import MaternalAppointmentsTab from "./tabs"

import { usePrenatalAppointmentRequest } from "../../queries/maternalFetchQueries"
import { useUpdatePARequestApprove, useUpdatePARequestReject } from "../../queries/maternalUpdateQueries"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"
import { capitalize } from "@/helpers/capitalize"
import { calculateAge } from "@/helpers/ageCalculator"

export default function MaternalAppointmentsMain() {
  const [selectedTab, setSelectedTab] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")

  const { data: appointmentRequests, isLoading } = usePrenatalAppointmentRequest()
  
  // Mutations
  const approveMutation = useUpdatePARequestApprove()
  const rejectMutation = useUpdatePARequestReject()

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // Handle approve appointment
  const handleApprove = (appointmentId: number) => {
    approveMutation.mutate(appointmentId, {
      onSuccess: (data) => {
        showSuccessToast(`Appointment #${appointmentId} has been confirmed.`)
        console.log("Approved appointment:", data)
      },
      onError: (error: any) => {
        showErrorToast("Failed to approve appointment. Please try again.")
        console.error("Error approving appointment:", error)
      }
    })
  }

  // Handle reject appointment
  const handleReject = (appointmentId: number, reason: string) => {
    rejectMutation.mutate({ parId: appointmentId, reason }, {
      onSuccess: (data) => {
        showSuccessToast(`Appointment #${appointmentId} has been rejected.`)
        console.log("Rejected appointment:", data)
      },
      onError: (error: any) => {
        showErrorToast("Failed to reject appointment. Please try again.")
        console.error("Error rejecting appointment:", error)
      }
    })
  }

  const mapAppointmentData = (apiData: any[]): Appointment[] => {
    return apiData.map((item, index) => {
      let patientName = "Unknown Patient"
      if (item.personal_info) {
        const { per_fname, per_mname, per_lname, per_suffix } = item.personal_info
        const nameParts = [
          capitalize(per_lname),
          capitalize(per_fname),
          per_mname ? capitalize(per_mname) : null,
          per_suffix ? capitalize(per_suffix) : null,
        ].filter(Boolean)
        patientName = nameParts.join(" ")
      }

      // Calculate age from personal_info DOB
      const age = item.personal_info?.per_dob 
        ? parseInt(calculateAge(item.personal_info.per_dob)) || 0
        : 0

      // Get gender from personal_info
      const gender = item.personal_info?.per_sex === "MALE" ? "Male" : "Female"

      return {
        id: item.par_id || index + 1,
        patientName,
        gender: gender as "Male" | "Female",
        age,
        dateScheduled: item.requested_date || item.requested_at || "",
        approvedDate: item.approved_at || "",
        requestedDate: item.requested_at || "",
        status: (item.status === "approved" ? "confirmed" : item.status) as "confirmed" | "pending" | "cancelled" | "rejected" | "missed" | "completed",
        reason: item.reason || undefined,
      }
    })
  }

  // Get appointments from API
  const allAppointments = appointmentRequests?.requests ? mapAppointmentData(appointmentRequests.requests) : []

  // Filter appointments by status
  const confirmedAppointmentsData = allAppointments.filter((apt) => apt.status === "confirmed")
  const pendingAppointmentsData = allAppointments.filter((apt) => apt.status === "pending")
  const cancelledAppointmentsData = allAppointments.filter((apt) => apt.status === "cancelled")
  const rejectedAppointmentsData = allAppointments.filter((apt) => apt.status === "rejected")
  const missedAppointmentsData = allAppointments.filter((apt) => apt.status === "missed")
  const completedAppointmentsData = allAppointments.filter((apt) => apt.status === "completed")

  const tabCounts = {
    confirmed: appointmentRequests?.status_counts?.approved || 0,
    pending: appointmentRequests?.status_counts?.pending || 0,
    cancelled: appointmentRequests?.status_counts?.cancelled || 0,
    rejected: appointmentRequests?.status_counts?.rejected || 0,
    missed: appointmentRequests?.status_counts?.missed || 0,
    completed: appointmentRequests?.status_counts?.completed || 0,
  }

  const filterData = (data: Appointment[]) => {
    if (!searchTerm) return data
    return data.filter((appointment) => appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  // Generate pending columns with mutation handlers
  const pendingColumns = createPendingAppointmentColumns(
    handleApprove,
    handleReject,
    approveMutation.isPending,
    rejectMutation.isPending
  )

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
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        ) : (
          <>
            {selectedTab === "confirmed" && (
              <div className="bg-white rounded-lg border">
                <DataTable columns={appointmentConfirmedColumns} data={filterData(confirmedAppointmentsData)} maxHeight="600px" />
              </div>
            )}
            {selectedTab === "pending" && (
              <div className="bg-white rounded-lg border">
                <DataTable columns={pendingColumns} data={filterData(pendingAppointmentsData)} maxHeight="600px" />
              </div>
            )}
            {selectedTab === "cancelled" && (
              <div className="bg-white rounded-lg border">
                <DataTable
                  columns={appointmentColumnsWithReason}
                  data={filterData(cancelledAppointmentsData)}
                  maxHeight="600px"
                />
              </div>
            )}
            {selectedTab === "rejected" && (
              <div className="bg-white rounded-lg border">
                <DataTable
                  columns={appointmentColumnsWithReason}
                  data={filterData(rejectedAppointmentsData)}
                  maxHeight="600px"
                />
              </div>
            )}
            {selectedTab === "missed" && (
              <div className="bg-white rounded-lg border">
                <DataTable
                  columns={appointmentColumnsWithReason}
                  data={filterData(missedAppointmentsData)}
                  maxHeight="600px"
                />
              </div>
            )}
            {selectedTab === "completed" && (
              <div className="bg-white rounded-lg border">
                <DataTable
                  columns={appointmentColumns}
                  data={filterData(completedAppointmentsData)}
                  maxHeight="600px"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
