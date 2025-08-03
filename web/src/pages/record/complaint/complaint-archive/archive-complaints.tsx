import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { Archive, Search } from "lucide-react";
import type { Complaint } from "../complaint-type";
import { archiveComplaintColumns } from "./archive-complaint-columns";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";

const ArchiveComplaints = () => {
  const [data, setData] = useState<Complaint[]>([]);
  const [paginatedData, setPaginatedData] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch archived complaints (filter where is_archive is true)
  useEffect(() => {
    const fetchArchivedComplaints = async () => {
      try {
        setIsLoading(true);

        // Replace this with your actual API call
        // const response = await fetch('/api/complaints?archived=true');
        // const complaints = await response.json();

        // Mock data for demonstration - replace with actual API call
        const mockData: Complaint[] = [
          // Add your mock archived complaints here
          // Make sure is_archive is true for archived complaints
        ];

        // Filter only archived complaints
        // const archivedComplaints = mockData.filter(complaint => complaint.is_archive === true);
        // setData(archivedComplaints);
      } catch (error) {
        console.error("Error fetching archived complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchivedComplaints();
  }, []);

  // Handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedData(data.slice(startIndex, endIndex));
  }, [data, currentPage, itemsPerPage]);

  const columns = archiveComplaintColumns(data);

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <div className="flex gap-3 mb-2">
          {/* Column 1 - Button */}
          <div className="flex items-center">
            <Link to="/complaint">
              <Button className="text-black p-2" variant="outline">
                <BsChevronLeft />
              </Button>
            </Link>
          </div>

          {/* Column 2 - Text Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-darkBlue2">
                Archived Complaints
              </h1>
            </div>
            <p className="text-darkGray text-sm">
              Manage and review archived complaint records ({data.length}{" "}
              archived complaints)
            </p>
          </div>
        </div>
        <hr />
      </div>

      {/* Filter and search */}
      <div className="mb-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search by complaint ID, complainant, accused, or incident type..."
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
        </div>
        {/* <DynamicFilter
          title="Product Filters"
          //   onFilterChange={handleFilterChange}
          availableFilters={["date", "category", "price", "status"]}
        /> */}
      </div>
      {/* Data Table */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>

      {/* Custom Empty State (if needed) */}
      {!isLoading && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Archive size={64} className="mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Archived Complaints</h3>
          <p className="text-sm text-center max-w-md">
            There are currently no archived complaints in the system. Complaints
            will appear here once they are archived.
          </p>
        </div>
      )}
    </div>
  );
};

export default ArchiveComplaints;
