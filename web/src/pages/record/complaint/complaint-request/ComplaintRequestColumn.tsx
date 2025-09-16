import type { ColumnDef } from "@tanstack/react-table";
import type { Complaint } from "../complaint-type";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck2,
  ArrowUpDown,
  MoreHorizontal,
  File,
  ArchiveIcon,
  Check,
  X,
} from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Checkbox } from "@/components/ui/checkbox";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";

const getStatusBadgeProps = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        className: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300",
        variant: "secondary" as const,
      };
    case "filed":
      return {
        className:
          "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
        variant: "secondary" as const,
      };
    case "raised":
      return {
        className:
          "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300",
        variant: "secondary" as const,
      };
    case "processing":
      return {
        className:
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300",
        variant: "secondary" as const,
      };
    case "settled":
      return {
        className:
          "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
        variant: "secondary" as const,
      };
    case "rejected":
      return {
        className:
          "bg-red-100 text-red-800 hover:bg-red-200 border-red-300",
        variant: "secondary" as const,
      };
    default:
      return {
        className:
          "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300",
        variant: "secondary" as const,
      };
  }
};

interface RequestComplaintColumnsProps {
  data: Complaint[];
  onRejectComplaint?: (complaintId: string) => void;
  onAcceptComplaint?: (complaintId: string) => void;
  onArchiveComplaint?: (complaintId: string) => void;
}

export const requestComplaintColumns = ({
  data,
  onRejectComplaint,
  onAcceptComplaint,
  onArchiveComplaint,
}: RequestComplaintColumnsProps): ColumnDef<Complaint>[] => [
  {
    id: "select",
    header: ({ table }) => {
      return (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="border-gray"
          />
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-gray"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 10,
  },
  {
    accessorKey: "comp_id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Complaint Id
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="relative flex items-center justify-center h-full">
          {/* Icon on the far left */}
          <div className="absolute left-2">
            <TooltipLayout
              trigger={<UserCheck2 className="text-orange-500" size={20} />}
              content="Pending"
            />
          </div>

          {/* Badge centered */}
          <Badge variant="outline" className="font-medium">
            {row.original.comp_id}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "complainant",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Complainant
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
      const complainants = row.original.complainant;

      if (!complainants || complainants.length === 0) {
        return <div className="text-gray-500">Anonymous</div>;
      }

      const name = complainants[0].cpnt_name;
      const firstComplainant =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() ||
        "Anonymous";
      const remainingCount = complainants.length - 1;

      return (
        <div className="font-normal text-gray-900">
          {firstComplainant}
          {remainingCount > 0 && (
            <Badge className="bg-white text-black hover:bg-slate-100">
              +{remainingCount} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "accused_persons",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Accused
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
      const accusedPersons = row.original.accused_persons;
      if (!accusedPersons || accusedPersons.length === 0) {
        return <div className="text-gray-500">No accused persons</div>;
      }

      const name = accusedPersons[0].acsd_name;
      const firstAccused =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      const remainingCount = accusedPersons.length - 1;

      return (
        <div className="font-normal text-gray-900">
          {firstAccused}
          {remainingCount > 0 && (
            <TooltipLayout
              trigger={
                <Badge className="bg-white text-black hover:bg-slate-100">
                  +{remainingCount}
                </Badge>
              }
              content="...more"
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "comp_incident_type",
    header: "Incident Type",
    cell: ({ row }) => (
      <div className="font-normal text-gray-900">
        {row.getValue("comp_incident_type")}
      </div>
    ),
  },
  {
    accessorKey: "comp_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("comp_status") as string;
      const badgeProps = getStatusBadgeProps(status);
      return (
        <div className="flex justify-center">
          <Badge 
            variant={badgeProps.variant}
            className={`font-medium ${badgeProps.className}`}
          >
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    cell: ({ row }) => {
      const complaint = row.original;

      const options = [
        {
          id: "view",
          name: (
            <Link
              to={`/complaint/${complaint.comp_id}`}
              state={{ complaint }}
              className="w-full h-full flex items-center gap-2"
            >
              <File size={16} className="text-darkGray" />
              View File
            </Link>
          ),
        },
        {
          id: "accept",
          name: (
            <div className="flex items-center gap-2 text-green-600 hover:text-green-700">
              <Check size={16} />
              Accept
            </div>
          ),
        },
        {
          id: "reject",
          name: (
            <div className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <X size={16} />
              Reject
            </div>
          ),
        },
        {
          id: "archive",
          name: (
            <div className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
              <ArchiveIcon size={16} />
              Archive
            </div>
          ),
        },
      ];

      const handleSelect = (id: string) => {
        switch (id) {
          case "accept":
            if (onAcceptComplaint) {
              onAcceptComplaint(String(complaint.comp_id));
            }
            console.log("Accept:", complaint.comp_id);
            break;
          case "reject":
            if (onRejectComplaint) {
              onRejectComplaint(String(complaint.comp_id));
            }
            console.log("Reject:", complaint.comp_id);
            break;
          case "archive":
            if (onArchiveComplaint) {
              onArchiveComplaint(String(complaint.comp_id));
            }
            console.log("Archive:", complaint.comp_id);
            break;
        }
      };

      return (
        <div className="flex items-center justify-center h-full min-w-[50px]">
          <DropdownLayout
            trigger={
              <button className="p-2 hover:bg-muted rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            }
            options={options}
            onSelect={handleSelect}
          />
        </div>
      );
    },
  },
];