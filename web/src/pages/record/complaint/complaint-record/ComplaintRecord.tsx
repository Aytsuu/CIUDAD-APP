import { useState, useEffect, useMemo } from "react";
import { useGetComplaint } from "../complaint-hooks";
import { complaintColumns } from "./ComplaintColumn";
import { Complaint } from "../complaint-type";
import { filterComplaints } from "./FilterComplaint";

import ComplaintFilterBar from "./ComplaintFilterBar";
import ComplaintTable from "./ComplaintTable";
import ComplaintPagination from "./ComplaintPagination";
import { useAuth } from "@/context/AuthContext";


export default function ComplaintRecord() {
  const DEFAULT_PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: complaints = [], isLoading, error } = useGetComplaint();

  const nonArchivedComplaints = useMemo(() => {
    return complaints.filter((c: Complaint) => !c.comp_is_archive);
  }, [complaints]);

  const filteredData = useMemo(() => {
    return filterComplaints(nonArchivedComplaints, searchQuery, timeFilter);
  }, [nonArchivedComplaints, searchQuery, timeFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // if (isLoading) return <BlotterRecordSkeleton />;
  if (error) return <div>Error: {error.message}</div>;

  const columns = useMemo(() => complaintColumns(complaints), [complaints]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col justify-center mb-4">
        <h1 className="flex flex-row font-semibold text-xl sm:text-2xl text-darkBlue2 items-center">
          Complaint Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view complaint information
        </p>
      </div>
      <hr className="pb-4"/>
      <ComplaintFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      <ComplaintTable data={paginatedData} columns={columns} />

      <ComplaintPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalData={filteredData.length}
        pageSize={pageSize}
      />
    </div>
  );
}




