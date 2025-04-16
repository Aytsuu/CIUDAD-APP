import { ColumnDef } from "@tanstack/react-table";
import { BusinessRecord } from "../profilingTypes";
import { Button } from "@/components/ui/button/button";
import { CircleChevronRight, MoveRight } from "lucide-react";
import { Link } from "react-router";
import { Label } from "@/components/ui/label";

export const businessColumns = (
  businesses: Record<string, any>,
  sitio: Record<string, string>
): ColumnDef<BusinessRecord>[] => [
  {
    accessorKey: "id",
    header: "Business No.",
  },
  {
    accessorKey: "name",
    header: "Business Name",
  },
  {
    accessorKey: "grossSales",
    header: "Gross Sales",
  },
  {
    accessorKey: "sitio",
    header: "Sitio",
  },
  {
    accessorKey: "street",
    header: "Street",
  },
  {
    accessorKey: "respondent",
    header: "Respondent",
  },
  {
    accessorKey: "dateRegistered",
    header: "Date Registered",
  },
  {
    accessorKey: "registeredBy",
    header: "Registered By",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link
        to="/business/form"
        state={{
          params: {
            type: "viewing",
            sitio: sitio,
            business: businesses.find(
              (business: any) => business.bus_id == row.original.id
            ),
          },
        }}
      >
        <div className="group flex justify-center items-center gap-2 px-3 py-2
                  rounded-lg border-none shadow-none hover:bg-muted
                  transition-colors duration-200 ease-in-out">
          <Label className="text-black/40 cursor-pointer group-hover:text-buttonBlue
                  transition-colors duration-200 ease-in-out">
            View
          </Label> 
          <CircleChevronRight
            size={35}
            className="stroke-1 text-black/40 group-hover:fill-buttonBlue 
                group-hover:stroke-white transition-all duration-200 ease-in-out"
          />
        </div>
      </Link>
    ),
  },
];
