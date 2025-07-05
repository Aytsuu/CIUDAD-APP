import type { ColumnDef } from "@tanstack/react-table"
import type { Complaint } from "../complaint-type"
import { Link } from "react-router"
import { Button } from "@/components/ui/button/button"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ViewButton from "@/components/ui/view-button"

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
    accessorKey: "comp_category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.comp_category as string
      return (
        <Badge
          className={`font-medium ${
            category === "Low"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : category === "Normal"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "comp_incident_type",
    header: "Incident Type",
    cell: ({ row }) => <div className="font-normal text-gray-900">{row.getValue("comp_incident_type")}</div>,
  },
  {
    accessorKey: "cpnt.cpnt_name",
    header: "Complainant",
    cell: ({ row }) => <div className="font-normal text-gray-900">{row.original.cpnt.cpnt_name}</div>,
  },
  {
    accessorKey: "accused_persons",
    header: "Accused",
    cell: ({ row }) => {
      const accusedPersons = row.original.accused_persons
      if (!accusedPersons || accusedPersons.length === 0) {
        return <div className="text-gray-500 italic">No accused persons</div>
      }

      const firstAccused = accusedPersons[0].acsd_name
      const remainingCount = accusedPersons.length - 1

      return (
        <div className="font-normal text-gray-900">
          {firstAccused}
          {remainingCount > 0 && <span className="text-gray-500 font-normal ml-1">+{remainingCount} more</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "comp_datetime",
    header: "Date & Time",
    cell: ({ row }) => {
      const datetime = row.getValue("comp_datetime") as string
      return <div className="text-sm text-gray-900">{new Date(datetime).toLocaleString()}</div>
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <Link to={`/complaint-record/${row.original.comp_id}`} state={{ complaint: row.original }}>
          <ViewButton onClick={function (): void {
            throw new Error("Function not implemented.")
          } }/>
        </Link>
      </div>
    ),
  },
]
