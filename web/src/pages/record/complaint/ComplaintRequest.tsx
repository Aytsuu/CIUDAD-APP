import { useState, useEffect, useMemo } from "react";
import ComplaintTable from "./ComplaintTable";
import ComplaintPagination from "./complaint-record/ComplaintPagination";
import { pendingComplaintColumns } from "./complaint-record/ComplaintColumn";
import { useGetComplaint } from "./api-operations/queries/complaintGetQueries";
import { filterComplaints } from "./complaint-record/FilterComplaint";
import { Complaint } from "./complaint-type";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import ComplaintFilterBar from "./complaint-record/ComplaintFilterBar";

export default function ComplaintRequest() {
  const DEFAULT_PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: complaints = [], isLoading, error } = useGetComplaint();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Filter for pending complaints that are not archived
  const pendingComplaints = useMemo(() => {
    return complaints.filter((c: Complaint) => 
      c.comp_status === 'Pending' && !c.comp_is_archive
    );
  }, [complaints]);

  const filteredData = useMemo(() => {
    return filterComplaints(pendingComplaints, searchQuery);
  }, [pendingComplaints, searchQuery, timeFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const rejectedCount = useMemo(() => {
    return complaints.filter((c: Complaint) => c.comp_status === 'Rejected').length;
  }, [complaints]);

  if (error) return <div>Error: {error.message}</div>;

  const columns = useMemo(
    () => pendingComplaintColumns(),
    []
  );

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
            <h1 className="text-2xl font-semibold text-darkBlue2">
              Request
            </h1>
          </div>
          <p className="text-darkGray text-sm">
            Manage and view pending blotter requests
          </p>
        </div>
      </div>
      <hr className="pb-4" />
      
      <ComplaintFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
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