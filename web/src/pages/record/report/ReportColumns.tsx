import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleAlert, MoveRight } from "lucide-react";
import { IRReport, ARReport } from "./ReportTypes";
import { Button } from "@/components/ui/button/button";
import ViewButton from "@/components/ui/view-button";
import { useNavigate } from "react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import React from "react";

// Define the columns for the data table
export const IRColumns = (): ColumnDef<IRReport>[] => [
  {
    accessorKey: "ir_id",
    header: "Report No.",
  },
  {
    accessorKey: "ir_location",
    header: "Location",
    cell: ({ row }) => {
      const sitio = row.original.ir_sitio;
      const street = row.original.ir_street;

      return `Sitio ${sitio}, ${street} `;
    },
  },
  {
    accessorKey: "ir_add_details",
    header: "Description",
  },
  {
    accessorKey: "ir_type",
    header: "Type",
  },
  {
    accessorKey: "ir_reported_by",
    header: "Reported By",
  },
  {
    accessorKey: "ir_time",
    header: "Time",
  },
  {
    accessorKey: "ir_date",
    header: "Date",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = () => {
        navigate("form", {
          state: {
            params: {
              data: row.original,
            },
          },
        });
      };

      return <ViewButton onClick={handleViewClick} />;
    },
  },
];

export const ARColumns = (
  isCreatingWeeklyAR: boolean
): ColumnDef<ARReport>[] => [
  {
    accessorKey: "select",
    header: ({ table }) => {
      if (isCreatingWeeklyAR) {
        return (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {

              table.toggleAllPageRowsSelected(!!value)
            }}
            aria-label="Select all"
            className="border border-gray w-5 h-5"
          />
        );
      }
    },
    cell: ({ row }) => {
      if (isCreatingWeeklyAR) {

        React.useEffect(() => {
          selectionValidator();
        }, [isCreatingWeeklyAR, row.getIsSelected()])

        const selectionValidator = React.useCallback(() => {
          if(row.getIsSelected() && row.original.ar_status === 'Unsigned') {
            toast(`Report No. ${row.original.ar_id} is Unsigned`, {
              icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
              style: {
                border: "1px solid rgb(225, 193, 193)",
                padding: "16px",
                color: "#b91c1c",
                background: "#fef2f2",
              }
            });
            row.toggleSelected(false);
          }
        },[isCreatingWeeklyAR, row.getIsSelected()])
      
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              if(row.original.ar_status === 'Unsigned') {
                toast("Cannot add unsigned reports", {
                  icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
                  style: {
                    border: "1px solid rgb(225, 193, 193)",
                    padding: "16px",
                    color: "#b91c1c",
                    background: "#fef2f2",
                  }
                })
                return;
              }
              row.toggleSelected(!!value)
            }}
            aria-label="Select row"
            className="border border-gray w-5 h-5"
          />
        );
      }
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Report No.",
  },
  {
    accessorKey: "ar_title",
    header: "Incident/Activity",
  },
  {
    accessorKey: "ar_location",
    header: "Location",
    cell: ({ row }) => {
      const sitio = row.original.ar_sitio;
      const street = row.original.ar_street;

      return `Sitio ${sitio}, ${street} `;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = () => {
        navigate("/report/acknowledgement/document", {
          state: {
            params: {
              type: "AR",
              data: row.original,
            },
          },
        });
      };

      return <ViewButton onClick={handleViewClick} />;
    },
  },
];
