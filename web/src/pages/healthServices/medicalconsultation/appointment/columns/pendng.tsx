// components/columns.ts (add these to your existing columns file)
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu";
import { Link } from "react-router";

export const medicalAppointmentPendingColumns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "Appointment ID",
    cell: ({ row }) => (
      <div className="font-medium">APT-{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "patient_name",
    header: "Patient Name",
    cell: ({ row }) => {
      const appointment = row.original;
      // Assuming your serializer includes patient name through rp relationship
      const patientName = appointment.rp?.per?.full_name || 
                         `${appointment.rp?.per?.per_lname}, ${appointment.rp?.per?.per_fname}`;
      return <div>{patientName || "N/A"}</div>;
    },
  },
  {
    accessorKey: "chief_complaint",
    header: "Chief Complaint",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("chief_complaint")}>
        {row.getValue("chief_complaint")}
      </div>
    ),
  },
  {
    accessorKey: "scheduled_date",
    header: "Scheduled Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("scheduled_date"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "meridiem",
    header: "Time",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("meridiem")}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Requested On",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        Pending
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(appointment.id)}
            >
              Copy Appointment ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/services/medical/appointments/${appointment.id}`}>
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/services/medical/appointments/${appointment.id}/process`}>
                Process Appointment
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];