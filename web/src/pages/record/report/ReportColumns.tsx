import { ColumnDef } from "@tanstack/react-table";
import { Activity, Bookmark, CheckCircle2, Clock, XCircle } from "lucide-react";
import { IRReport, ARReport } from "./ReportTypes";
import ViewButton from "@/components/ui/view-button";
import { useNavigate } from "react-router";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  getDateTimeFormat,
  getMonthName,
  getWeekNumber,
} from "@/helpers/dateHelper";
import { showErrorToast } from "@/components/ui/toast";
import { Label } from "@/components/ui/label";
import { useConvertCoordinatesToAddress } from "./queries/reportFetch";

// Define the columns for the data table
export const ResidentReportColumns = (): ColumnDef<IRReport>[] => [
  {
    accessorKey: "ir_area",
    header: "Incident Area",
  },
  {
    accessorKey: "ir_involved",
    header: "Involved/Affected",
  },
  {
    accessorKey: "ir_type",
    header: "Type",
  },
  {
    accessorKey: "ir_severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity_color: Record<string, any> = {
        LOW: "bg-green-100 border-green-400 text-green-700 hover:bg-green-100",
        MEDIUM:
          "bg-amber-100 border-amber-400 text-amber-700 hover:bg-amber-100",
        HIGH: "bg-red-100 border-red-400 text-red-700 hover:bg-red-100",
      };
      return (
        <div className="flex">
          <Badge
            className={`px-3 rounded-full ${
              severity_color[row.original.ir_severity as string]
            }`}
          >
            {row.original.ir_severity}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "ir_date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.ir_date, "short"),
  },
  {
    accessorKey: "ir_time",
    header: "Time",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = () => {
        navigate("view", {
          state: {
            params: {
              ir_id: row.original.ir_id,
              isVerified: false,
            },
          },
        });
      };

      return <ViewButton onClick={handleViewClick} />;
    },
  },
];

export const IRColumns = (): ColumnDef<IRReport>[] => [
  {
    accessorKey: "ir_area",
    header: "Incident Area",
    cell: ({ row }) => {
      const { data: deviceLocation } = useConvertCoordinatesToAddress(
        row.original.ir_track_lat,
        row.original.ir_track_lng
      );

      const area = deviceLocation ? deviceLocation?.display_name
        ?.split(",")
        .slice(0, 2)
        .join(",").toUpperCase() : row.original.ir_area?.toUpperCase()

      return (
        <div className="max-w-[250px] truncate" title={area}>
          <Label className="cursor-pointer">
            {area}
          </Label>
        </div>
      );
    },
  },
  {
    accessorKey: "ir_involved",
    header: "Involved",
    size: 80,
  },
  {
    accessorKey: "ir_type",
    header: "Type",
    cell: ({ row }) =>
      row.original.ir_type ? row.original.ir_type : "SECURADO REPORT",
  },
  {
    accessorKey: "ir_severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity_color: Record<string, any> = {
        LOW: "bg-green-100 border-green-400 text-green-700 hover:bg-green-100",
        MEDIUM:
          "bg-amber-100 border-amber-400 text-amber-700 hover:bg-amber-100",
        HIGH: "bg-red-100 border-red-400 text-red-700 hover:bg-red-100",
      };
      return (
        <div className="flex">
          <Badge
            className={`px-3 rounded-full ${
              severity_color[row.original.ir_severity as string]
            }`}
          >
            {row.original.ir_severity}
          </Badge>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "ir_date",
    header: "Date",
    cell: ({ row }) =>
      row.original.ir_date
        ? formatDate(row.original.ir_date, "short")
        : formatDate(row.original.ir_created_at, "short"),
    size: 100,
  },
  {
    accessorKey: "ir_time",
    header: "Time",
    cell: ({ row }) =>
      row.original.ir_time
        ? row.original.ir_time
        : getDateTimeFormat(row.original.ir_created_at, true),
    size: 100,
  },
  {
    accessorKey: "ir_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.ir_status;
      const styles: any = {
        pending: {
          color: "bg-yellow-50 text-yellow-600",
          icon: Clock,
        },
        "in-progress": {
          color: "bg-blue-50 text-blue-600",
          icon: Activity,
        },
        resolved: {
          color: "bg-green-50 text-green-600",
          icon: CheckCircle2,
        },
        closed: {
          color: "bg-gray-50 text-gray-600",
          icon: XCircle,
        },
      };

      const statusStyle = styles[status.toLowerCase()];

      return (
        <div className="flex gap-2 items-center">
          <div
            className={`p-2 rounded-full ${statusStyle.color.split(" ")[0]}`}
          >
            <statusStyle.icon
              className={`h-4 w-4 ${statusStyle.color.split(" ")[1]}`}
            />
          </div>
          <Label className={`${statusStyle.color.split(" ")[1]}`}>
            {status}
          </Label>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = () => {
        navigate("view", {
          state: {
            params: {
              ir_id: row.original.ir_id,
              isVerified: true,
            },
          },
        });
      };

      return <ViewButton onClick={handleViewClick} />;
    },
    size: 100,
  },
];

export const ARColumns = (
  isCreatingWeeklyAR: boolean,
  compositions: any
): ColumnDef<ARReport>[] => [
  {
    accessorKey: "select",
    header: ({ table }) => {
      if (isCreatingWeeklyAR) {
        return (
          <div className="w-full h-full flex items-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => {
                table.toggleAllPageRowsSelected(!!value);
              }}
              aria-label="Select all"
              className="border border-gray-400 w-5 h-5"
            />
          </div>
        );
      }
    },
    cell: ({ row }) => {
      const unsigned = row.original.status?.toLowerCase() == "unsigned";

      if (isCreatingWeeklyAR) {
        React.useEffect(() => {
          selectionValidator();
        }, [isCreatingWeeklyAR, row.getIsSelected()]);

        const selectionValidator = React.useCallback(() => {
          if (row.getIsSelected() && unsigned) {
            showErrorToast(`Report No. ${row.original.id} is Unsigned`);
            row.toggleSelected(false);
          }

          if (
            row.getIsSelected() &&
            getWeekNumber(row.original.date) !==
              getWeekNumber(new Date().toISOString())
          ) {
            showErrorToast(
              `Report #${row.original.id} is from Week ${getWeekNumber(
                row.original.date
              )} of 
              ${getMonthName(row.original.date)} ${new Date(
                row.original.date
              ).getFullYear()}.`
            );
            row.toggleSelected(false);
          }
        }, [isCreatingWeeklyAR, row.getIsSelected()]);

        const isInWeeklyAR = compositions.some(
          (comp: any) => comp.ar.id === row.original.id
        );

        if (isInWeeklyAR) {
          return (
            <TooltipLayout
              trigger={
                <div className="w-full flex justify-center items-end">
                  <Bookmark
                    size={22}
                    className="stroke-none fill-green-500 cursor-pointer"
                  />
                </div>
              }
              content="Already in weekly AR"
            />
          );
        }

        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              if (unsigned) {
                showErrorToast("Cannot add Unsigned reports");
                return;
              }
              row.toggleSelected(!!value);
            }}
            aria-label="Select row"
            className="border border-gray w-5 h-5"
          />
        );
      }
    },
    size: 30,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Report ID",
    cell: ({ row }) => `AR-${row.original.id}`,
    size: 100
  },
  {
    accessorKey: "ar_title",
    header: "Incident/Activity",
  },
  {
    accessorKey: "ar_area",
    header: "Area",
  },
  {
    accessorKey: "date",
    header: "Created",
    size: 100
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          className={`rounded-full border ${
            status?.toLowerCase() === "signed"
              ? "bg-green-100 text-green-700 border-green-400 hover:bg-green-100 shadow-none"
              : "bg-amber-100 text-amber-700 border-amber-400 hover:bg-amber-100 shadow-none"
          }`}
        >
          {status}
        </Badge>
      );
    },
    size: 100
  },
  {
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = () => {
        navigate("/report/action/document", {
          state: {
            params: {
              type: "AR",
              data: {
                id: row.original.id,
              },
            },
          },
        });
      };

      return <ViewButton onClick={handleViewClick} />;
    },
    size: 100
  },
];
