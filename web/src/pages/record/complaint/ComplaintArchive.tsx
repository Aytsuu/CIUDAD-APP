import { useState, useEffect, useMemo } from "react";
import ComplaintTable from "./ComplaintTable";
import ComplaintPagination from "./complaint-record/ComplaintPagination";
import { pendingComplaintColumns } from "./complaint-record/ComplaintColumn";
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

export default function ComplaintArchive() {
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

  // Filter for pending complaints
  const archivedComplaints = useMemo(() => {
    return complaints.filter((c: Complaint) => c.comp_status === "Archived");
  }, [complaints]);

  // Get unique types for filter dropdown (from pending complaints)
  const availableTypes = useMemo(
    () => getUniqueTypes(archivedComplaints),
    [archivedComplaints]
  );

  // Since we're already filtering for Pending, status filter may not be needed
  // But we include it in case you want to use it for sub-statuses later
  const availableStatuses = useMemo(
    () => getUniqueStatuses(archivedComplaints),
    [archivedComplaints]
  );

  // Apply all filters
  const filteredData = useMemo(() => {
    return filterComplaints(archivedComplaints, searchQuery, filters);
  }, [archivedComplaints, searchQuery, filters]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const rejectedCount = useMemo(() => {
    return complaints.filter((c: Complaint) => c.comp_status === "Rejected")
      .length;
  }, [complaints]);

  if (error) return <div>Error: {error.message}</div>;

  const columns = useMemo(() => pendingComplaintColumns(), []);

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
            <h1 className="text-2xl font-semibold text-darkBlue2">Archive</h1>
          </div>
          <p className="text-darkGray text-sm">
            View all resolved or past complaints that are no longer active.
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
          request: false,
          archived: false,
          newReport: false,
          rejected: true,
          rejectedCount: rejectedCount,
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