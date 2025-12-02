import { useState, useEffect, useMemo } from "react";
import ComplaintTable from "./ComplaintTable";
import ComplaintPagination from "./complaint-record/ComplaintPagination";
import { cancelledComplaintColumns } from "./complaint-record/ComplaintColumn";
import { useGetComplaint } from "./api-operations/queries/complaintGetQueries";
import {
  filterComplaints,
  getUniqueTypes,
  getUniqueStatuses,
} from "./complaint-record/FilterComplaint";
import { Complaint } from "./complaint-type";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import ComplaintFilterBar, {
  FilterState,
} from "./complaint-record/ComplaintFilterBar";

const initialFilters: FilterState = {
  types: [],
  statuses: [],
  dateRange: { start: null, end: null },
};

export default function ComplaintCancelled() {
  const DEFAULT_PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: complaints = [], isLoading, error } = useGetComplaint();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, pageSize]);

  // Filter for CANCELLED complaints only
  const cancelledComplaints = useMemo(() => {
    return complaints.filter((c: Complaint) => c.comp_status === "Cancelled");
  }, [complaints]);

  // Get counts for all statuses
  const statusCounts = useMemo(() => {
    return {
      pending: complaints.filter((c: Complaint) => c.comp_status === "Pending").length,
      rejected: complaints.filter((c: Complaint) => c.comp_status === "Rejected").length,
      cancelled: complaints.filter((c: Complaint) => c.comp_status === "Cancelled").length,
      accepted: complaints.filter((c: Complaint) => c.comp_status === "Accepted").length,
      raised: complaints.filter((c: Complaint) => c.comp_status === "Raised").length,
    };
  }, [complaints]);

  // Get unique types for filter dropdown (from CANCELLED complaints)
  const availableTypes = useMemo(
    () => getUniqueTypes(cancelledComplaints),
    [cancelledComplaints]
  );

  // Get unique statuses (from CANCELLED complaints)
  const availableStatuses = useMemo(
    () => getUniqueStatuses(cancelledComplaints),
    [cancelledComplaints]
  );

  // Apply all filters to CANCELLED complaints
  const filteredData = useMemo(() => {
    return filterComplaints(cancelledComplaints, searchQuery, filters);
  }, [cancelledComplaints, searchQuery, filters]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  if (error) return <div>Error: {error.message}</div>;

  // Use cancelled complaint columns
  const columns = useMemo(() => cancelledComplaintColumns(), []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-3 mb-2">
        <div className="flex items-center">
          <Link to="/complaint">
            <Button className="text-black p-2" variant="outline">
              <BsChevronLeft />
            </Button>
          </Link>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-darkBlue2">Cancelled Complaints</h1>
          </div>
          <p className="text-darkGray text-sm">
            View and manage cancelled blotter requests
          </p>
        </div>
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
          request: true, // Show request button to navigate back
          newReport: false,
          rejected: true, // Show rejected button
          cancelled: false, // Current page is already "Cancelled"
          rejectedCount: statusCounts.rejected,
          cancelledCount: statusCounts.cancelled,
          requestCount: statusCounts.pending,
        }}
      />

      <ComplaintTable
        data={paginatedData}
        columns={columns}
        isLoading={isLoading}
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