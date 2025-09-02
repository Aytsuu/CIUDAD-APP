import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { Archive, Search, Info } from "lucide-react";
import type { Complaint } from "../complaint-type";
import { archiveComplaintColumns } from "./archive-complaint-columns";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { useGetArchivedComplaints } from "../api-operations/queries/complaintGetQueries";

export const ArchiveComplaints = () => {
  const {
    data: archivedComplaints = [],
    isLoading,
    error,
  } = useGetArchivedComplaints();
  const [paginatedData, setPaginatedData] = useState<Complaint[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedData(archivedComplaints.slice(startIndex, endIndex));
  }, [archivedComplaints, currentPage, itemsPerPage]);

  const columns = archiveComplaintColumns(archivedComplaints);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
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
                size="icon"
                className="p-0 h-auto w-auto 
                rounded-full
             text-blue-500 
             hover:text-white 
             hover:bg-blue-500 
             transition-colors duration-200"
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-darkGray text-sm">
              Manage and review archived complaint records (
              {archivedComplaints.length} archived complaints)
            </p>
          </div>
        </div>
        <hr />
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative flex-1 max-w-md bg-white rounded-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
          <Input type="text" placeholder="Search..." className="pl-10" />
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full bg-white ">
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>

      {/* Empty State */}
      {!isLoading && archivedComplaints.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Archive size={64} className="mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Archived Complaints</h3>
          <p className="text-sm text-center max-w-md">
            There are currently no archived complaints in the system.
          </p>
        </div>
      )}
    </div>
  );
};
