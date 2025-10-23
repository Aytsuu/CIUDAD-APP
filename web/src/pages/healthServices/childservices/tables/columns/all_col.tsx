import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewButton from "@/components/ui/view-button";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const childColumns: ColumnDef<any>[] = [
  {
    accessorKey: "pat_id",
    header: "Patient ID",
    cell: ({ row }) => (
      <div className="flex w-full justify-center items-center px-2 py-3">
        <div className="bg-lightBlue text-darkBlue1 px-2 sm:px-3 py-1 rounded-md text-center font-semibold text-xs sm:text-sm">{row.original.pat_id || ""}</div>
      </div>
    ),
  },
  {
    accessorKey: "child",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer py-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span className="text-xs sm:text-sm font-medium">Child</span>
        <ArrowUpDown size={12} className="sm:w-4 sm:h-4" />
      </div>
    ),
    cell: ({ row }) => {
      const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
      return (
        <div className="flex justify-center items-center  px-2 py-3">
          <div className="flex flex-col space-y-1 items-center">
            <div className="font-medium text-xs sm:text-sm break-words leading-tight text-center">{toTitleCase(fullName)}</div>
            <div className="text-xs text-darkGray text-center">
              {toTitleCase(row.original.sex || "")}, {row.original.age} YO
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "mother",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer py-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span className="text-xs sm:text-sm font-medium">Mother</span>
        <ArrowUpDown size={12} className="sm:w-4 sm:h-4" />
      </div>
    ),
    cell: ({ row }) => {
      const fullName = `${row.original.mother_lname || ""}, ${row.original.mother_fname || ""} ${row.original.mother_mname || ""}`.trim();
      return (
        <div className="flex justify-center items-center px-2 py-3">
          <div className="font-medium text-xs sm:text-sm break-words leading-tight text-center">{toTitleCase(fullName) || "N/A"}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "father",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer py-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span className="text-xs sm:text-sm font-medium">Father</span>
        <ArrowUpDown size={12} className="sm:w-4 sm:h-4" />
      </div>
    ),
    cell: ({ row }) => {
      const fullName = `${row.original.father_lname || ""}, ${row.original.father_fname || ""} ${row.original.father_mname || ""}`.trim();
      return (
        <div className="flex justify-center items-center min-w-[120px] sm:min-w-[180px] px-2 py-3">
          <div className="font-medium text-xs sm:text-sm break-words leading-tight text-center">{toTitleCase(fullName) || "N/A"}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    size: 300,
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer py-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span className="text-xs sm:text-sm font-medium">Address</span>
        <ArrowUpDown size={12} className="sm:w-4 sm:h-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center px-2 py-3">
        <div className="w-[160px] sm:w-[250px] text-xs sm:text-sm break-words leading-relaxed text-center">{toTitleCase(row.original.address || "UNKNOWN")}</div>
      </div>
    ),
  },
  {
    accessorKey: "sitio",
    size: 80,
    header: () => (
      <div className="flex w-full justify-center items-center py-2">
        <span className="text-xs sm:text-sm font-medium">Sitio</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center  px-2 py-3">
        <div className="text-xs sm:text-sm text-center">{toTitleCase(row.original.sitio || "N/A")}</div>
      </div>
    ),
  },
  {
    accessorKey: "pat_type",
    size: 80,
    header: () => (
      <div className="flex w-full justify-center items-center py-2">
        <span className="text-xs sm:text-sm font-medium">Type</span>
      </div>
    ),
    cell: ({ row }) => {
      const patType = row.original.pat_type?.toLowerCase() || "";
      const isTransient = patType === "transient";

      return (
        <div className="flex justify-center items-center px-2 py-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isTransient ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}>
            {toTitleCase(row.original.pat_type || "")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "latest_child_history_date",
    size: 120,
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer py-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span className="text-xs sm:text-sm font-medium">Latest Record</span>
        <ArrowUpDown size={12} className="sm:w-4 sm:h-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center px-2 py-3">
        <div className="text-xs sm:text-sm text-center">
          {row.original.latest_child_history_date
            ? new Date(row.original.latest_child_history_date).toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
                day: "2-digit",
              })
            : "N/A"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "action",
    size: 100,
    header: () => (
      <div className="flex w-full justify-center items-center py-2">
        <span className="text-xs sm:text-sm font-medium">Action</span>
      </div>
    ),
    cell: ({ row }) => {
      const navigate = useNavigate();

      return (
        <div className="flex justify-center items-center min-w-[80px] px-2 py-3">
          <ViewButton
            onClick={() =>
              navigate(`/services/childhealthrecords/records`, {
                state: {
                  ChildHealthRecord: row.original,
                },
              })
            }
          />
        </div>
      );
    },
  },
];
