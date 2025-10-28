import type { ColumnDef } from "@tanstack/react-table";
import type { Complaint, Complainant, Accused } from "../complaint-type";
import { Link } from "react-router";
import { ArrowUpDown, AlertCircle, CircleChevronRight } from "lucide-react";
import {MdCheckCircle, MdCancel, MdTrendingUp, MdAccessTimeFilled, MdError, MdSecurity, MdGavel, MdHomeRepairService, MdVolumeUp, MdHelpOutline, MdMoreHoriz} from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent,} from "@/components/ui/popover";

interface ComplaintColumnsOptions {
  statusFilter?: string | null; 
  showAllStatuses?: boolean; 
}

export const complaintColumns = (options: ComplaintColumnsOptions = {}): ColumnDef<Complaint>[] => {
  const { statusFilter = null, showAllStatuses = true } = options;

  return [
    {
      id: "select",
      header: ({ table }) => {
        return (
          <div className="flex justify-center items-center">
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
      header: () => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer">
          ID
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="relative flex items-center justify-center h-full font-semibold text-black">
            {row.original.comp_id}
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
          <div className="flex justify-between items-center font-semibold text-gray-700 whitespace-nowrap">
            <div>{firstComplainant.toUpperCase()}</div>
            {remainingCount > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex justify-center items-center w-9 h-9 cursor-pointer bg-white px-1 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <MdMoreHoriz />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-2 w-auto max-w-md">
                  <div className="flex flex-col gap-1 items-start">
                    {complainants
                      .slice(1)
                      .map((person: Complainant, idx: number) => (
                        <div
                          key={person.cpnt_id ?? idx}
                          className="flex items-center gap-x-2 text-gray-700 w-full"
                        >
                          <span className="flex-shrink-0">
                            {person.rp_id ? (
                              <div className="bg-green-500 px-4 py-1 rounded-full font-semibold text-white text-sm">
                                Resident
                              </div>
                            ) : (
                              <div className="bg-blue-500 px-4 py-1 rounded-full font-semibold text-white text-sm">
                                Non-resident
                              </div>
                            )}
                          </span>
                          <span className="break-words min-w-0 flex-1">
                            {person.cpnt_name.toUpperCase()}
                          </span>
                        </div>
                      ))}
                  </div>
                </PopoverContent>
              </Popover>
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
          Respondent
          <ArrowUpDown size={14} />
        </div>
      ),
      cell: ({ row }) => {
        const accusedPersons = row.original.accused;
        if (!accusedPersons || accusedPersons.length === 0) {
          return <div className="text-gray-500">No accused persons</div>;
        }

        const name = accusedPersons[0].acsd_name;
        const firstAccused =
          name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        const remainingCount = accusedPersons.length - 1;

        return (
          <div className="flex justify-between items-center font-semibold text-gray-700 whitespace-nowrap">
            <div>{firstAccused.toUpperCase()}</div>
            {remainingCount > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex justify-center items-center w-9 h-9 cursor-pointer bg-white px-1 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <MdMoreHoriz />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-2 w-auto max-w-md">
                  <div className="flex flex-col gap-1 items-start">
                    {accusedPersons
                      .slice(1)
                      .map((person: Accused, idx: number) => (
                        <div
                          key={person.acsd_id ?? idx}
                          className="flex items-center gap-x-2 text-gray-700 w-full"
                        >
                          <span className="flex-shrink-0">
                            {person.rp_id ? (
                              <div className="bg-green-500 px-5 py-1 rounded-full font-semibold text-white text-sm">
                                Resident
                              </div>
                            ) : (
                              <div className="bg-blue-500 px-4 py-1 rounded-full font-semibold text-white text-sm">
                                Non-resident
                              </div>
                            )}
                          </span>
                          <span className="break-words min-w-0 flex-1">
                            {person.acsd_name.toUpperCase()}
                          </span>
                        </div>
                      ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "comp_incident_type",
      header: "Incident Type",
      cell: ({ row }) => {
        const type = (
          row.getValue("comp_incident_type") as string
        )?.toLowerCase();

        const typeStyles: Record<string, string> = {
          theft: "bg-yellow-100 text-yellow-700",
          assault: "bg-red-100 text-red-700",
          "property damage": "bg-blue-100 text-blue-700",
          "noise complaint": "bg-green-100 text-green-700",
        };

        const iconMap: Record<string, React.ReactNode> = {
          theft: <MdSecurity size={18} />,
          assault: <MdGavel size={18} />,
          "property damage": <MdHomeRepairService size={18} />,
          "noise complaint": <MdVolumeUp size={18} />,
        };

        const displayType = type
          ? type.charAt(0).toUpperCase() + type.slice(1)
          : "Unknown";

        const typeClass = typeStyles[type] || "bg-gray-100 text-gray-700";
        const icon = iconMap[type] || <MdHelpOutline size={18} />;

        return (
          <div className="flex justify-center items-center w-full h-full">
            <span
              className={`flex items-center justify-center gap-2 w-full h-full px-3 py-2 rounded-md text-sm font-medium text-center ${typeClass}`}
            >
              {icon} {displayType}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "comp_status",
      header: "Status",
      cell: ({ row }) => {
        // If statusFilter is provided and showAllStatuses is false, show only that status
        if (statusFilter && !showAllStatuses) {
          const status = statusFilter.toLowerCase();

          const statusStyles: Record<string, string> = {
            resolved: "bg-green-100 text-green-700",
            rejected: "bg-red-100 text-red-700",
            ongoing: "bg-yellow-100 text-yellow-700",
            pending: "bg-orange-100 text-orange-700",
            raised: "bg-blue-100 text-blue-700",
            accepted: "bg-green-100 text-green-700",
            filed: "bg-blue-100 text-blue-700",
            processing: "bg-yellow-100 text-yellow-700",
          };

          const iconMap: Record<string, React.ReactNode> = {
            resolved: <MdCheckCircle size={18} />,
            rejected: <MdCancel size={18} />,
            ongoing: <MdTrendingUp size={18} />,
            pending: <MdAccessTimeFilled size={18} />,
            raised: <MdError size={18} />,
            accepted: <MdCheckCircle size={18} />,
            filed: <MdCheckCircle size={18} />,
            processing: <MdTrendingUp size={18} />,
          };

          const displayStatus =
            status.charAt(0).toUpperCase() + status.slice(1);

          return (
            <div className="flex justify-center items-center">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  statusStyles[status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {iconMap[status] || <AlertCircle size={16} />} {displayStatus}
              </span>
            </div>
          );
        }

        // Otherwise, show dynamic status based on row data
        const status = (row.getValue("comp_status") as string)?.toLowerCase();

        const statusStyles: Record<string, string> = {
          resolved: "bg-green-100 text-green-700",
          rejected: "bg-red-100 text-red-700",
          ongoing: "bg-yellow-100 text-yellow-700",
          pending: "bg-orange-100 text-orange-700",
          raised: "bg-blue-100 text-blue-700",
          accepted: "bg-green-100 text-green-700",
          processing: "bg-yellow-100 text-yellow-700",
        };

        const iconMap: Record<string, React.ReactNode> = {
          resolved: <MdCheckCircle size={18} />,
          rejected: <MdCancel size={18} />,
          ongoing: <MdTrendingUp size={18} />,
          pending: <MdAccessTimeFilled size={18} />,
          raised: <MdError size={18} />,
          accepted: <MdCheckCircle size={18} />,
          processing: <MdTrendingUp size={18} />,
          settled: <MdCheckCircle size={18} />,
        };

        const displayStatus = status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Unknown";

        return (
          <div className="flex justify-center items-center">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                statusStyles[status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {iconMap[status] || <AlertCircle size={16} />} {displayStatus}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => {
        return (
          <Link to="/complaint/view/" state={{ complaint: row.original }}>
            <div
              className="group flex justify-center items-center gap-2 px-3 py-2
                    rounded-lg border-none shadow-none hover:bg-muted
                    transition-colors duration-200 ease-in-out"
            >
              <Label
                className="text-black/40 cursor-pointer group-hover:text-buttonBlue
                    transition-colors duration-200 ease-in-out"
              >
                View
              </Label>
              <CircleChevronRight
                size={35}
                className="stroke-1 text-black/40 group-hover:fill-buttonBlue 
                  group-hover:stroke-white transition-all duration-200 ease-in-out"
              />
            </div>
          </Link>
        );
      },
    },
  ];
};

// Convenience functions for specific use cases
export const pendingComplaintColumns = () =>
  complaintColumns({ statusFilter: "pending", showAllStatuses: false });

export const resolvedComplaintColumns = () =>
  complaintColumns({ statusFilter: "resolved", showAllStatuses: false });

export const rejectedComplaintColumns = () =>
  complaintColumns({ statusFilter: "rejected", showAllStatuses: false });

export const acceptedComplaintColumns = () =>
  complaintColumns({ statusFilter: "accepted", showAllStatuses: false });

export const raisedComplaintColumns = () =>
  complaintColumns({ statusFilter: "raised", showAllStatuses: false });

export const allComplaintColumns = () =>
  complaintColumns({ showAllStatuses: true });