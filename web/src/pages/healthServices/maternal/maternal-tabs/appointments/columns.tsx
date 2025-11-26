"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button/button"
import { Check, X } from "lucide-react"
import RejectAppointmentDialog from "./reject-dialog"

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "rejected" | "missed" | "completed"

export interface Appointment {
  id: number
  patientName: string
  gender: "Male" | "Female"
  age: number
  dateScheduled: string
  approvedDate: string
  requestedDate: string
  status: AppointmentStatus
  reason?: string
}

function getStatusBadge(status: AppointmentStatus) {
  const variants = {
    confirmed: "bg-green-200 px-2 py-1 rounded-lg text-green-800",
    pending: "bg-yellow-200 px-2 py-1 rounded-lg text-orange-900 text-sm",
    cancelled: "bg-orange-200 px-2 py-1 rounded-lg text-orange-800",
    rejected: "bg-red-200 px-2 py-1 rounded-lg text-red-800",
    missed: "bg-gray-200 px-2 py-1 rounded-lg text-gray-800",
    completed: "bg-blue-200 px-2 py-1 rounded-lg text-blue-800",
  } as const

  return (
    <div className={`capitalize ${variants[status]}`}>
      {status}
    </div>
  )
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Columns for confirmed and completed
export const appointmentColumns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "id",
    header: "#",
    size: 80,
    cell: ({ row }) => {
      return <div className="font-medium text-muted-foreground">{row.index + 1}</div>
    },
  },
  {
    accessorKey: "patientName",
    header: "Patient Info",
    size: 250,
    cell: ({ row }) => {
      const appointment = row.original
      return (
         <div className="flex flex-col justify-center">
            <span className="font-medium text-sm leading-tight">{appointment.patientName}</span>
            <span className="text-muted-foreground text-xs">
               {appointment.gender}, {appointment.age} years old
            </span>
         </div>
      )
    },
  },
  {
    accessorKey: "dateScheduled",
    header: "Date Scheduled",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.dateScheduled)}</div>
    },
  },
  {
    accessorKey: "requestedDate",
    header: "Requested Date",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.requestedDate)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      return (
         <div className="w-full flex justify-center">
            {getStatusBadge(row.original.status)}
         </div>
      )
    },
  },
]

// columns for confirmed appointments
export const appointmentConfirmedColumns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "id",
    header: "#",
    size: 80,
    cell: ({ row }) => {
      return <div className="font-medium text-muted-foreground">{row.index + 1}</div>
    },
  },
  {
    accessorKey: "patientName",
    header: "Patient Info",
    size: 250,
    cell: ({ row }) => {
      const appointment = row.original
      return (
         <div className="flex flex-col justify-center">
            <span className="font-medium text-sm leading-tight">{appointment.patientName}</span>
            <span className="text-muted-foreground text-xs">
               {appointment.gender}, {appointment.age} years old
            </span>
         </div>
      )
    },
  },
  {
    accessorKey: "dateScheduled",
    header: "Date Scheduled",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.dateScheduled)}</div>
    },
  },
  {
    accessorKey: "requestedDate",
    header: "Requested Date",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.requestedDate)}</div>
    },
  },
  {
    accessorKey: "approvedDate",
    header: "Confirmed Date",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.approvedDate)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      return (
         <div className="w-full flex justify-center">
            {getStatusBadge(row.original.status)}
         </div>
      )
    },
  },
]

// Columns for Cancelled and Rejected tabs (with reason)
export const appointmentColumnsWithReason: ColumnDef<Appointment>[] = [
  {
    accessorKey: "id",
    header: "#",
    size: 80,
    cell: ({ row }) => {
      return <div className="font-medium text-muted-foreground">{row.index + 1}</div>
    },
  },
  {
    accessorKey: "patientName",
    header: "Patient Info",
    size: 220,
    cell: ({ row }) => {
      const appointment = row.original
      return (
         <div className="flex flex-col justify-center">
            <span className="font-medium text-sm leading-tight">{appointment.patientName}</span>
            <span className="text-muted-foreground text-xs">
              {appointment.gender}, {appointment.age} years old
            </span>
         </div>
      )
    },
  },
  {
    accessorKey: "dateScheduled",
    header: "Date Scheduled",
    size: 140,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.dateScheduled)}</div>
    },
  },
  {
    accessorKey: "requestedDate",
    header: "Requested Date",
    size: 140,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.requestedDate)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    cell: ({ row }) => {
      return (
         <div className="w-full flex justify-center">
            {getStatusBadge(row.original.status)}
         </div>
      )
    },
  },
  {
    accessorKey: "reason",
    header: () => {
      return <div className="text-left font-medium">Reason</div>
    },
    size: 250,
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground text-left max-w-xs">{row.original.reason || "—"}</div>
    },
  },
]

// Columns for Pending tab with action buttons
export const createPendingAppointmentColumns = (
  onApprove: (appointmentId: number) => void,
  onReject: (appointmentId: number, reason: string) => void,
  isApproving?: boolean,
  isRejecting?: boolean
): ColumnDef<Appointment>[] => [
  {
    accessorKey: "id",
    header: "#",
    size: 80,
    cell: ({ row }) => {
      return <div className="font-medium text-muted-foreground">{row.index + 1}</div>
    },
  },
  {
    accessorKey: "patientName",
    header: "Patient Info",
    size: 250,
    cell: ({ row }) => {
      const appointment = row.original
      return (
         <div className="flex flex-col justify-center">
            <span className="font-medium text-sm leading-tight">{appointment.patientName}</span>
            <span className="text-muted-foreground text-xs">
              {appointment.gender}, {appointment.age} years old
            </span>
        </div>
      )
    },
  },
  {
    accessorKey: "dateScheduled",
    header: "Date Scheduled",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.dateScheduled)}</div>
    },
  },
  {
    accessorKey: "requestedDate",
    header: "Requested Date",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.requestedDate)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      return (
        <div className="w-full flex justify-center">
            {getStatusBadge(row.original.status)}
         </div>
      )
    },
  },
  {
    id: "actions",
    header: "Action",
    size: 180,
    cell: ({ row }) => {
      const appointment = row.original
      return (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs bg-green-500 text-white hover:bg-green-600 hover:text-white"
            onClick={() => onApprove(appointment.id)}
            disabled={isApproving || isRejecting}
          >
            <Check className="h-3.5 w-3.5" />
            {isApproving ? "Approving..." : "Approve"}
          </Button>
          <RejectAppointmentDialog
            patientName={appointment.patientName}
            onReject={(reason) => onReject(appointment.id, reason)}
            isLoading={isRejecting}
          />
        </div>
      )
    },
  },
]

// Legacy columns for backward compatibility (without handlers)
export const pendingAppointmentColumns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "id",
    header: "#",
    size: 80,
    cell: ({ row }) => {
      return <div className="font-medium text-muted-foreground">{row.index + 1}</div>
    },
  },
  {
    accessorKey: "patientName",
    header: "Patient Info",
    size: 250,
    cell: ({ row }) => {
      const appointment = row.original
      return (
         <div className="flex flex-col justify-center">
            <span className="font-medium text-sm leading-tight">{appointment.patientName}</span>
            <span className="text-muted-foreground text-xs">
              {appointment.gender}, {appointment.age} years old
            </span>
        </div>
      )
    },
  },
  {
    accessorKey: "dateScheduled",
    header: "Date Scheduled",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.dateScheduled)}</div>
    },
  },
  {
    accessorKey: "requestedDate",
    header: "Requested Date",
    size: 150,
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.requestedDate)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      return (
        <div className="w-full flex justify-center">
            {getStatusBadge(row.original.status)}
         </div>
      )
    },
  },
  {
    id: "actions",
    header: "Action",
    size: 180,
    cell: ({ row }) => {
      const appointment = row.original
      return (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs bg-green-500 text-white hover:bg-green-600 hover:text-green-300"
            onClick={() => {
              console.log("Confirming appointment:", appointment.id)
              // Add your confirm logic here
            }}
          >
            <Check className="h-3.5 w-3.5" />
            Confirm
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs bg-red-600 text-white hover:bg-red-600 hover:text-red-300"
            onClick={() => {
              console.log("Rejecting appointment:", appointment.id)
              // Add your reject logic here
            }}
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      )
    },
  },
]