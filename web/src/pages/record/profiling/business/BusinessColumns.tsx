import { ColumnDef } from "@tanstack/react-table";
import { BusinessRecord } from "../profilingTypes";
import { useNavigate } from "react-router";
import { getSitioList } from "../restful-api/profilingGetAPI";
import { useLoading } from "@/context/LoadingContext";
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
    accessorKey: "sitio",
    header: "Sitio",
  },
  {
    accessorKey: "bus_street",
    header: "Street",
  },
  {
    accessorKey: "respondent",
    header: "Respondent",
    cell: ({ row }) => (
      (`${row.original.bus_respondentLname}, ${row.original.bus_respondentFname}` 
        + ` ${row.original.bus_respondentMname ? `${row.original.bus_respondentMname[0]}.` : ''}`)
    )
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
      const {showLoading, hideLoading} = useLoading();

      const handleViewClick = async () => {
        showLoading();
        try {
          const sitio = await getSitioList();
          if(sitio) {
            navigate("/business/form", {
              state: {
                params: {
                  type: "viewing",
                  sitio: sitio,
                  business: row.original
                }
              }
            })
            hideLoading();
          }
        } catch (err) {
          hideLoading();
          throw new Error(err as string);
        }
      }
      
      return (
        <ViewButton onClick={handleViewClick}/>
      )
    },
  },
];
