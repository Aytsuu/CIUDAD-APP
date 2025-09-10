import type { ColumnDef } from "@tanstack/react-table";
import type { Complaint } from "../complaint-type";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import ViewButton from "@/components/ui/view-button";
import { ArrowUpDown } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Checkbox } from "@/components/ui/checkbox";

export const archiveComplaintColumns = (data: Complaint[]): ColumnDef<Complaint>[] => [
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
        <div className="relative flex items-center justify-center">
          <Badge variant="outline" className="font-medium bg-gray-50 text-gray-700">
            COMP-2025-{row.original.comp_id}
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
        <div className="font-normal text-gray-700">
          {firstComplainant}
          {remainingCount > 0 && (
            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 ml-2">
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
      const firstAccused = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      const remainingCount = accusedPersons.length - 1;

      return (
        <div className="font-normal text-gray-700">
          {firstAccused}
          {remainingCount > 0 && (
            <TooltipLayout
              trigger={
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 ml-2">
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
      <div className="font-normal text-gray-700">
        {row.getValue("comp_incident_type")}
      </div>
    ),
  },
  {
    accessorKey: "comp_status",
    header: "Final Status",
    cell: ({ row }) => {
      const status = row.getValue("comp_status") as string;
      return (
        <div>
          <Badge variant="secondary" className="bg-gray-200 text-gray-800">
            {status}
          </Badge>
        </div>
      );
    },
  },
  // {
    // accessorKey: "date_archived",
    // header: ({ column }) => (
    //   <div
    //     className="flex w-full justify-center items-center gap-2 cursor-pointer"
    //     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //   >
    //     Date Archived
    //     <ArrowUpDown size={14} />
    //   </div>
    // ),
  //   cell: ({ row }) => {
  //   //   const dateArchived = row.original.date_archived;
  //     return (
  //       <div className="font-normal text-gray-700">
  //         {/* {dateArchived ? new Date(dateArchived).toLocaleDateString() : "N/A"} */}
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="min-w-[50px]">
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