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
  },
  {
    accessorKey: "bus_date_verified",
    header: "Date Registered",
    cell: ({row}) => (
      formatDate(row.original.bus_date_verified, true)
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = async () => {
        navigate("/profiling/business/form", {
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
  },
  {
    accessorKey: "bus_date_of_registration",
    header: "Date Submitted",
    cell: ({row}) => (
      formatDate(row.original.bus_date_of_registration, true)
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = async () => {
        navigate("/profiling/business/form", {
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
    accessorKey: "businesses",
    header: "Owned Businesses",
    cell: ({row}) => {
      const businesses = row.original.businesses;
      const formattedBusinesses = React.useMemo(() => formatOwnedBusinesses(businesses), [businesses])

      return (
        <Combobox 
          options={formattedBusinesses}
          value={String(row.original.businesses.length)}
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
      formatDate(row.original.br_date_registered, true)
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
