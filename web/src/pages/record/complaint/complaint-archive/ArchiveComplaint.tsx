import { useState, useEffect, useMemo } from "react";
import ComplaintTable from "../ComplaintTable";
import ComplaintPagination from "../complaint-record/ComplaintPagination";
import { archiveComplaintColumns } from "./ComplaintArchiveColumn";
import { useGetComplaint } from "../api-operations/queries/complaintGetQueries";
import { filterComplaints } from "../complaint-record/FilterComplaint";
import { Complaint } from "../complaint-type";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import ComplaintFilterBar from "../complaint-record/ComplaintFilterBar";
import { Archive, Info } from "lucide-react";

export default function ArchiveComplaints() {
  const DEFAULT_PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: complaints = [], isLoading, error } = useGetComplaint();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Filter for archived complaints
  const archivedComplaints = useMemo(() => {
    return complaints.filter((c: Complaint) => c.comp_is_archive === true);
  }, [complaints]);

  const filteredData = useMemo(() => {
    return filterComplaints(archivedComplaints, searchQuery);
  }, [archivedComplaints, searchQuery, timeFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Calculate other counts for filter bar if needed
  const rejectedCount = useMemo(() => {
    return complaints.filter((c: Complaint) => 
      c.comp_status === 'Rejected' && !c.comp_is_archive
    ).length;
  }, [complaints]);

  const requestCount = useMemo(() => {
    return complaints.filter((c: Complaint) => 
      c.comp_status === 'Pending' && !c.comp_is_archive
    ).length;
  }, [complaints]);

  if (error) return <div>Error: {error.message}</div>;

  const columns = useMemo(
    () => archiveComplaintColumns(),
    [complaints]
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
              Archived Complaints
            </h1>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto rounded-full text-blue-500 hover:text-white hover:bg-blue-500 transition-colors duration-200"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-darkGray text-sm">
            Manage and review archived complaint records ({archivedComplaints.length} archived)
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
          rejected: false,
          requestCount: requestCount,
          rejectedCount: rejectedCount,
        }}
      />

      {/* Main Content */}
      {isLoading ? (
        <ComplaintTable
          data={[]}
          columns={columns}
          isLoading={isLoading}
        />
      ) : archivedComplaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 flex-1">
          <Archive size={64} className="mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Archived Complaints</h3>
          <p className="text-sm text-center max-w-md">
            There are currently no archived complaints in the system.
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}