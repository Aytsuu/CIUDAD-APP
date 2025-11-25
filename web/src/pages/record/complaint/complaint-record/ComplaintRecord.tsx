import { useState, useEffect, useMemo } from "react";
import { useGetComplaint } from "../api-operations/queries/complaintGetQueries";
import { complaintColumns } from "./ComplaintColumn";
import { Complaint } from "../complaint-type";
import {
  filterComplaints,
  getUniqueTypes,
  getUniqueStatuses,
} from "./FilterComplaint";

import ComplaintFilterBar, { FilterState } from "./ComplaintFilterBar";
import ComplaintTable from "../ComplaintTable";
import ComplaintPagination from "./ComplaintPagination";
import { useBulkArchiveComplaints } from "../api-operations/queries/complaintPostQueries";

const initialFilters: FilterState = {
  types: [],
  statuses: [],
  dateRange: { start: null, end: null },
};

export default function ComplaintRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: complaints = [], isLoading, error } = useGetComplaint();
  const bulkArchiveComplaints = useBulkArchiveComplaints();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, pageSize]);

  // Filter for Accepted and Raised complaints that are not archived
  const acceptedAndRaisedComplaints = useMemo(() => {
    return complaints.filter(
      (c: Complaint) => c.comp_status === "Accepted" || c.comp_status === "Raised"
    );
  }, [complaints]);

  // Get unique types and statuses for filter dropdowns
  const availableTypes = useMemo(
    () => getUniqueTypes(complaints),
    [complaints]
  );

  const availableStatuses = useMemo(
    () => getUniqueStatuses(acceptedAndRaisedComplaints),
    [acceptedAndRaisedComplaints]
  );

  // Apply all filters
  const filteredData = useMemo(() => {
    return filterComplaints(acceptedAndRaisedComplaints, searchQuery, filters);
  }, [acceptedAndRaisedComplaints, searchQuery, filters]);

  // Paginate the filtered data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Calculate button counts
  const buttonCounts = useMemo(() => {
    const requestCount = complaints.filter(
      (c: Complaint) => c.comp_status === "Pending"
    ).length;

    const rejectedCount = complaints.filter(
      (c: Complaint) => c.comp_status === "Rejected"
    ).length;

    return { requestCount, rejectedCount };
  }, [complaints]);

  if (error) return <div>Error: {error.message}</div>;

  const columns = useMemo(() => complaintColumns(), [complaints]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col justify-center mb-4">
        <h1 className="flex flex-row font-semibold text-xl sm:text-2xl text-darkBlue2 items-center">
          Blotter
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view accepted and raised complaints
        </p>
      </div>
      <hr className="pb-4" />

      <ComplaintFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        availableTypes={availableTypes}
        availableStatuses={availableStatuses}
        buttons={{
          filter: true,
          request: true,
          archived: true,
          newReport: true,
          rejected: false,
          requestCount: buttonCounts.requestCount,
          rejectedCount: buttonCounts.rejectedCount,
        }}
      />

      <ComplaintTable
        data={paginatedData}
        columns={columns}
        isLoading={isLoading}
        onArchiveComplaints={async (complaintIds: string[]) => {
          await bulkArchiveComplaints.mutateAsync(complaintIds);
        }}
      />

      <ComplaintPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalData={filteredData.length}
        pageSize={pageSize}
      />
    </div>
  );
}