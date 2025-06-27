import { ColumnDef } from "@tanstack/react-table";
import { Complaint } from "../complaint-type";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const complaintColumns = (data: Complaint[]): ColumnDef<Complaint>[] => [
  {
    accessorKey: "comp_id",
    header: "Complaint ID",
    cell: ({ row }) => (
      <Badge>{row.original.comp_id}</Badge>
    ),
  },
    {
    accessorKey: "comp_category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.comp_category as string;
      return (
        <Badge className={`max-w-xs text-white font-semibold truncate p-2
          ${ category === 'Low' ? 'bg-yellow-500' : 
              category === 'Normal' ? 'bg-orange-500' :
              'bg-red-500'
           } `}>{category}</Badge>
      );
    },
  },
  {
    accessorKey: "comp_incident_type",
    header: "Incident Type",
    cell: ({ row }) => <div>{row.getValue("comp_incident_type")}</div>,
  },
  {
    accessorKey: "cpnt.cpnt_name",
    header: "Complainant",
    cell: ({ row }) => <div>{row.original.cpnt.cpnt_name}</div>,
  },
  {
    accessorKey: "accused_persons",
    header: "Accused",
    cell: ({ row }) => {
      const accusedPersons = row.original.accused_persons;
      if (!accusedPersons || accusedPersons.length === 0) {
        return <div>No accused persons</div>;
      }

      // Display first accused person's name, with count if multiple
      const firstAccused = accusedPersons[0].acsd_name;
      const remainingCount = accusedPersons.length - 1;

      return (
        <div>
          {firstAccused}
          {remainingCount > 0 && (
            <span className="text-gray-500 text-sm">
              {" "}
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
      return <div>{new Date(datetime).toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <Link 
          to={`/complaint-record/${row.original.comp_id}`}
          state={{ complaint: row.original }}
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-8 h-8 p-0"
          >
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    ),
  },
];
