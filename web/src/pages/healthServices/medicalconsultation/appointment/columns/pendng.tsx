// components/columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, MapPin, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu";
import { Link } from "react-router-dom";

export const medicalAppointmentPendingColumns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "Appointment ID",
    cell: ({ row }) => (
      <div className="font-medium text-blue-600">APT-{row.original.id}</div>
    ),
  },
  {
    accessorKey: "personal_info",
    header: "Patient Information",
    cell: ({ row }) => {
      const personalInfo = row.original.personal_info;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {personalInfo?.per_lname}, {personalInfo?.per_fname} 
              {personalInfo?.per_mname ? ` ${personalInfo.per_mname}` : ''}
              {personalInfo?.per_suffix ? ` ${personalInfo.per_suffix}` : ''}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {personalInfo?.per_contact}
          </div>
          <div className="text-xs text-gray-400">
            {personalInfo?.per_sex} • {personalInfo?.per_dob ? new Date(personalInfo.per_dob).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.original.address;
      return (
        <div className="max-w-[200px]">
          {address ? (
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  {[
                    address.per_street,
                    address.per_sitio,
                    address.per_barangay,
                    address.per_city,
                    address.per_province
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">No address</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "chief_complaint",
    header: "Chief Complaint",
    cell: ({ row }) => (
      <div 
        className="max-w-[200px] truncate" 
        title={row.original.chief_complaint}
      >
        {row.original.chief_complaint || "No complaint specified"}
      </div>
    ),
  },
  {
    accessorKey: "scheduled_date",
    header: "Scheduled Date",
    cell: ({ row }) => {
      const date = new Date(row.original.scheduled_date);
      return (
        <div className="space-y-1">
          <div className="font-medium">{date.toLocaleDateString()}</div>
          <Badge variant="outline" className="capitalize">
            {row.original.meridiem}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Requested On",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return (
        <div className="text-sm">
          {date.toLocaleDateString()}
          <div className="text-xs text-gray-400">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
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
              onClick={() => navigator.clipboard.writeText(appointment.id.toString())}
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
            <DropdownMenuItem 
              onClick={() => {
                // Copy patient contact
                const contact = appointment.personal_info?.per_contact;
                if (contact) {
                  navigator.clipboard.writeText(contact);
                }
              }}
            >
              Copy Patient Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];