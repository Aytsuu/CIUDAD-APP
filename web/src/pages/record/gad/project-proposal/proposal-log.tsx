import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ProposalLog } from "./projprop-types";
import { useGetAllProposalLogs } from "./queries/fetchqueries";

function ProjectProposalLogTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: logs = [], isLoading, error } = useGetAllProposalLogs();

  const statusOptions = [
    { id: "all", name: "All" },
    { id: "Pending", name: "Pending" },
    { id: "Amend", name: "Amend" },
    { id: "Resubmitted", name: "Resubmitted" },
    { id: "Approved", name: "Approved" },
    { id: "Rejected", name: "Rejected" },
    { id: "Viewed", name: "Viewed" },
  ];

  const sortedData = useMemo(() => {
    return [...logs].sort((a, b) => {
      // Handle null dates by putting them at the end
      if (!a.gprl_date_approved_rejected) return 1;
      if (!b.gprl_date_approved_rejected) return -1;

      return (
        new Date(b.gprl_date_approved_rejected).getTime() -
        new Date(a.gprl_date_approved_rejected).getTime()
      );
    });
  }, [logs]);

  const filteredData = sortedData.filter((log) => {
    const searchString =
      `${log.gprl_id} ${log.gpr_title} ${log.gprl_status} ${log.gprl_date_submitted}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || log.gprl_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<ProposalLog>[] = [
    {
      accessorKey: "gpr_title",
      header: "Proposal Title",
      cell: ({ row }) => {
        const title = row.original.gpr_title || "Untitled Proposal";
        return <div className="text-center">{title}</div>;
      },
    },
    {
      accessorKey: "gprl_date_submitted",
      header: "Date Submitted",
      cell: ({ row }) => {
        const date = new Date(
          row.original.gprl_date_submitted
        ).toLocaleDateString();
        return <div className="text-center">{date}</div>;
      },
    },
    {
      accessorKey: "gprl_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.gprl_status;
        let statusClass = "";
        switch (status) {
          case "Approved":
            statusClass = "text-green-500";
            break;
          case "Rejected":
            statusClass = "text-red-500";
            break;
          case "Pending":
            statusClass = "text-blue";
            break;
          case "Viewed":
            statusClass = "text-darkGray";
            break;
          case "Amend":
            statusClass = "text-yellow-500";
            break;
          case "Resubmitted":
            statusClass = "text-indigo-600";
            break;
        }
        return <div className={`text-center ${statusClass}`}>{status}</div>;
      },
    },
    {
      accessorKey: "staff_details",
      header: "Staff",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.staff_details?.full_name || "Unassigned"}
          {row.original.staff_details?.position && (
            <div className="text-xs text-gray-500">
              {row.original.staff_details.position}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "gprl_date_approved_rejected",
      header: "Date Actioned",
      cell: ({ row }) => {
        const date = row.original.gprl_date_approved_rejected
          ? new Date(row.original.gprl_date_approved_rejected).toLocaleString()
          : "-";
        return <div className="text-center">{date}</div>;
      },
    },
    {
      accessorKey: "gprl_reason",
      header: "Reason/Remarks",
      cell: ({ row }) => (
        <div className="text-center">{row.original.gprl_reason || "-"}</div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading proposal logs</div>;
  }

  return (
    <div className="w-full h-full">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Proposal Logs
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          View and manage proposal logs
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="relative w-full flex gap-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
            size={17}
          />
          <Input
            placeholder="Search..."
            className="pl-10 bg-white w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SelectLayout
            className="bg-white"
            label=""
            placeholder="Filter by Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
                setCurrentPage(1);
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedData} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
          </p>
          {filteredData.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectProposalLogTable;
