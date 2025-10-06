import type { ColumnDef } from "@tanstack/react-table";
import type { Complaint } from "../complaint-type";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { usePostArchiveComplaint } from "../api-operations/queries/complaintPostQueries";
import { ArrowUpDown, MoreHorizontal, File, ArchiveIcon } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Checkbox } from "@/components/ui/checkbox";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { RaiseIssueDialog } from "../RaiseIssueDialog";

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "destructive" as const;
    case "filed":
      return "default" as const;
    case "raised":
      return "secondary" as const;
    case "processing":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

export const complaintColumns = (): ColumnDef<Complaint>[] => [
  {
    id: "select",
    header: ({ table }) => {
      return (
        <div className="flex justify-center items-center">
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
    header: () => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer">
        ID
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="relative flex items-center justify-center h-full font-medium text-black/70">
          {row.original.comp_id}
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
        <div className="font-normal text-gray-900 whitespace-nowrap">
          {firstComplainant}
          {remainingCount > 0 && (
            <Badge className="bg-white text-black hover:bg-slate-100">
              +{remainingCount}
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
        Respondent
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
      const accusedPersons = row.original.accused;
      if (!accusedPersons || accusedPersons.length === 0) {
        return <div className="text-gray-500">No accused persons</div>;
      }

      const name = accusedPersons[0].acsd_name;
      const firstAccused =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      const remainingCount = accusedPersons.length - 1;

      return (
        <div className="font-normal text-gray-900 whitespace-nowrap">
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
    accessorKey: "comp_datetime",
    header: "Date Submitted",
    cell: ({ row }) => {
      const data = row.getValue("comp_datetime") as string | number | Date;
      const formattedDate = new Date(data).toLocaleString([], {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      return <div className="font-normal text-gray-900 whitespace-nowrap">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "comp_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("comp_status") as string;
      const variant = getStatusBadgeVariant(status);

      return (
        <div className="flex justify-center">
          <Badge variant={variant}>{status}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    cell: ({ row }) => {
      const complaint = row.original;
      const archiveComplaint = usePostArchiveComplaint();

      const options = [
        {
          id: "view",
          name: (
            <Link
              to={`/complaint/view/`}
              className="w-full h-full flex items-center gap-2"
            >
              <File size={16} className="text-darkGray" />
              View File
            </Link>
          ),
        },
        {
          id: "raise",
          name: <RaiseIssueDialog complaintId={complaint.comp_id} />,
        },
        {
          id: "archive",
          name: (
            <div className="flex items-center gap-2">
              <ArchiveIcon size={16} className="text-darkGray" />
              Archive
            </div>
          ),
        },
      ];

      const handleSelect = (id: string) => {
        if (id === "archive") {
          archiveComplaint.mutateAsync(String(complaint.comp_id));
          console.log("Archive:", complaint.comp_id);
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
