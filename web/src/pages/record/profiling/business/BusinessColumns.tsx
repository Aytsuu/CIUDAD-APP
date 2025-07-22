import { ColumnDef } from "@tanstack/react-table";
import { BusinessRecord } from "../profilingTypes";
import { useNavigate } from "react-router";
import ViewButton from "@/components/ui/view-button";

export const businessColumns: ColumnDef<BusinessRecord>[] = [
  {
    accessorKey: "bus_id",
    header: "Business No.",
  },
  {
    accessorKey: "bus_name",
    header: "Business Name",
  },
  {
    accessorKey: "bus_gross_sales",
    header: "Gross Sales",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      `${row.original.bus_street}, Sitio ${row.original.sitio}`
    ) 
  },
  {
    accessorKey: "respondent",
    header: "Respondent",
  },
  {
    accessorKey: "bus_date_registered",
    header: "Date Registered",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = async () => {
        navigate("/business/form", {
          state: {
            params: {
              type: "viewing",
              busId: row.original.bus_id,
              rpId: row.original?.rp
            }
          }
        })
      }
      
      return (
        <ViewButton onClick={handleViewClick}/>
      )
    },
  },
];
