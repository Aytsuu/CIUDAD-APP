import { ColumnDef } from "@tanstack/react-table";
import { BusinessRecord, BusinessRespondent } from "../ProfilingTypes";
import { useNavigate } from "react-router";
import ViewButton from "@/components/ui/view-button";
import { formatDate } from "@/helpers/dateHelper";
import { Combobox } from "@/components/ui/combobox";
import { formatOwnedBusinesses } from "../ProfilingFormats";
import React from "react";
import { formatCurrency } from "@/helpers/currencyFormat";
import { Badge } from "@/components/ui/badge";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

export const activeColumns: ColumnDef<BusinessRecord>[] = [
  {
    accessorKey: "bus_id",
    header: "Business ID",
  },
  {
    accessorKey: "bus_name",
    header: "Business Name",
  },
  {
    accessorKey: "size",
    header: "Business Size",
    cell: ({ row }) => {
      const color: any = {
        MICRO: "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-50",
        SMALL: "bg-green-50 border-green-300 text-green-700 hover:bg-green-50",
        MEDIUM: "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-50",
        LARGE: "bg-red-50 border-red-300 text-red-700 hover:bg-red-50",
      };

      const tooltip: any = {
        MICRO:
          "Assets: <₱3M | Sales: <₱3M | Examples: Sari-sari stores, small neighborhood businesses",
        SMALL:
          "Assets: ₱3M-₱15M | Growing businesses with several employees | Local market focus",
        MEDIUM:
          "Assets: ₱15M-₱100M | Established businesses with structured operations | Regional reach",
        LARGE:
          "Assets: >₱100M | Major corporations | National/International operations",
      };

      const amount = row.original.bus_gross_sales;
      let size = "MICRO";
      if (+amount < 3000000) size = "MICRO";
      else if (+amount < 20000000) size = "SMALL";
      else if (+amount < 1000000000) size = "MEDIUM";
      else size = "LARGE";

      return (
        <TooltipLayout
          trigger={
            <div>
              <Badge className={`rounded-full ${color[size]}`}>{size}</Badge>
            </div>
          }
          content={tooltip[size]}
          contentClassName="w-64"
        />
      );
    },
  },
  {
    accessorKey: "bus_gross_sales",
    header: "Gross Sales",
    cell: ({ row }) => formatCurrency(+row.original.bus_gross_sales),
  },
  {
    accessorKey: "bus_location",
    header: "Location",
  },
  {
    accessorKey: "bus_date_verified",
    header: "Registered",
    cell: ({ row }) =>
      formatDate(row.original.bus_date_verified, "short" as any),
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
            },
          },
        });
      };

      return <ViewButton onClick={handleViewClick} />;
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
    cell: ({ row }) =>
      `${row.original.bus_street}, Sitio ${row.original.sitio}`,
  },
  {
    accessorKey: "respondent",
    header: "Respondent",
    cell: ({ row }) => (
      <div className="flex">
        <p>{row.original.respondent}</p>
        <div className="w-4 h-4 rounded-full bg-blue-500" />
      </div>
    ),
  },
  {
    accessorKey: "bus_date_of_registration",
    header: "Date Submitted",
    cell: ({ row }) =>
      formatDate(row.original.bus_date_of_registration, "long" as any),
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
              rpId: row.original?.rp,
            },
          },
        });
      };

      return <ViewButton onClick={handleViewClick} />;
    },
  },
];

export const respondentColumns: ColumnDef<BusinessRespondent>[] = [
  {
    accessorKey: "br_id",
    header: "Respondent ID",
    size: 200,
  },
  {
    accessorKey: "br_lname",
    header: "Last Name",
  },
  {
    accessorKey: "br_fname",
    header: "First Name",
  },
  {
    accessorKey: "br_mname",
    header: "Middle Name",
  },
  {
    accessorKey: "br_dob",
    header: "Date of Birth",
    cell: ({ row }) => formatDate(row.original.br_dob, "short" as any),
  },
  {
    accessorKey: "br_sex",
    header: "Sex",
  },
  {
    accessorKey: "businesses",
    header: "Owned Businesses",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const businesses = row.original.businesses;
      const formattedBusinesses = React.useMemo(
        () => formatOwnedBusinesses(businesses),
        [businesses]
      );

      return (
        <Combobox
          options={formattedBusinesses}
          value={String(row.original.businesses.length)}
          onChange={(value) => {
            navigate("/profiling/business/record/form", {
              state: {
                params: {
                  type: "viewing",
                  busId: value?.split(" ")[0],
                },
              },
            });
          }}
          emptyMessage="No businesses owned"
          placeholder="Search business"
          staticVal={true}
          size={300}
        />
      );
    },
  },
  {
    accessorKey: "br_date_registered",
    header: "Registered",
    cell: ({ row }) =>
      formatDate(row.original.br_date_registered, "short" as any),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        navigate("details", {
          state: {
            params: {
              type: "viewing",
              data: {
                respondentId: row.original.br_id,
              },
            },
          },
        });
      };

      return <ViewButton onClick={handleViewClick} />;
    },
  },
];
