import type { ColumnDef } from "@tanstack/react-table";
import type { Complaint } from "../complaint-type";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import ViewButton from "@/components/ui/view-button";

export const complaintColumns = (data: Complaint[]): ColumnDef<Complaint>[] => [
  {
    accessorKey: "comp_id",
    header: "Complaint ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium">
        {row.original.comp_id}
      </Badge>
    ),
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
    accessorKey: "complainant", // match the backend field name exactly
    header: "Complainant",
    cell: ({ row }) => {
      const complainants = row.original.complainant; // this should be an array

      if (!complainants || complainants.length === 0) {
        return <div className="text-gray-500">Anonymous</div>;
      }

      const firstComplainant = complainants[0].cpnt_name || "Anonymous";
      const remainingCount = complainants.length - 1;

      return (
        <div className="font-normal text-gray-900">
          {firstComplainant}
          {remainingCount > 0 && (
            <span className="text-gray-500 font-normal ml-1">
              +{remainingCount} more
            </span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "accused_persons",
    header: "Accused",
    cell: ({ row }) => {
      const accusedPersons = row.original.accused_persons;
      if (!accusedPersons || accusedPersons.length === 0) {
        return <div className="text-gray-500">No accused persons</div>;
      }

      const firstAccused = accusedPersons[0].acsd_name;
      const remainingCount = accusedPersons.length - 1;

      return (
        <div className="font-normal text-gray-900">
          {firstAccused}
          {remainingCount > 0 && (
            <span className="text-gray-500 font-normal ml-1">
              +{remainingCount} more
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "comp_datetime",
    header: "Date & Time",
    cell: ({ row }) => {
      const datetime = row.getValue("comp_datetime") as string;
      return (
        <div className="text-sm text-gray-900">
          {new Date(datetime).toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <Link
          to={`/complaint/${row.original.comp_id}`}
          state={{ complaint: row.original }}
        >
          <ViewButton onClick={() => {}} />
        </Link>
      </div>
    ),
  },
];
