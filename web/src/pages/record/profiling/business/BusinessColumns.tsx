import { ColumnDef } from "@tanstack/react-table";
import { BusinessRecord, BusinessRespondent } from "../ProfilingTypes";
import { useNavigate } from "react-router";
import ViewButton from "@/components/ui/view-button";
import { formatDate } from "@/helpers/dateHelper";
import { Combobox } from "@/components/ui/combobox";
import { formatOwnedBusinesses } from "../ProfilingFormats";
import React from "react";

export const activeColumns: ColumnDef<BusinessRecord>[] = [
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
    cell: ({row}) => (
      <div className="flex justify-center items-center gap-2">
        <p>{row.original.respondent}</p>
        {row.original.rp && <div className="w-2 h-2 rounded-full bg-blue-600"/>}
        {row.original.br && <div className="w-2 h-2 rounded-full bg-blue-300"/>}
      </div>
    )
  },
  {
    accessorKey: "bus_date_verified",
    header: "Date Registered",
    cell: ({row}) => (
      formatDate(row.original.bus_date_verified, "long" as any)
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = async () => {
        navigate("form", {
          state: {
            params: {
              type: "viewing",
              busId: row.original.bus_id,
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

export const pendingColumns: ColumnDef<BusinessRecord>[] = [
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
    cell: ({row}) => (
      <div className="flex">
        <p>{row.original.respondent}</p>
        <div className="w-4 h-4 rounded-full bg-blue-500"/>
      </div>
    )
  },
  {
    accessorKey: "bus_date_of_registration",
    header: "Date Submitted",
    cell: ({row}) => (
      formatDate(row.original.bus_date_of_registration, "long")
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = async () => {
        navigate("form", {
          state: {
            params: {
              type: "request",
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

export const respondentColumns: ColumnDef<BusinessRespondent>[] = [
  {
    accessorKey: "br_id",
    header: "Respondent No.",
  },
  {
    accessorKey: "lname",
    header: "Last Name",
  },
  {
    accessorKey: "fname",
    header: "Last Name",
  },
  {
    accessorKey: "mname",
    header: "Last Name",
  },
  {
    accessorKey: "suffix",
    header: "Suffix",
  },
   {
    accessorKey: "sex",
    header: "Sex",
    cell: ({row}) => (
      row.original.sex[0]
    )
  },
  {
    accessorKey: "businesses",
    header: "Owned Businesses",
    cell: ({row}) => {
      const navigate = useNavigate();
      const businesses = row.original.businesses;
      const formattedBusinesses = React.useMemo(() => formatOwnedBusinesses(businesses), [businesses])

      return (
        <Combobox 
          options={formattedBusinesses}
          value={String(row.original.businesses.length)}
          onChange={(value) => {
            navigate("/profiling/business/record/form", {
              state: {
                params: {
                  type: "viewing",
                  busId: value?.split(' ')[0],
                }
              }
            })
          }}
          emptyMessage="No businesses owned"
          placeholder="Search business"
          staticVal={true}
          size={300}
        />
      )
    }
  },
  {
    accessorKey: "br_date_registered",
    header: "Date Regitered",
    cell: ({row}) => (
      formatDate(row.original.br_date_registered, "long")
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        navigate('details', {
          state: {
            params: {
              type: 'viewing',
              data: {
                respondentId: row.original.br_id
              }
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
