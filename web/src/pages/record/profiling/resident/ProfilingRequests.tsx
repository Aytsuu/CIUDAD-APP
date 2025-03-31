import React from "react";
import { ClockArrowUp, FileInput, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { useNavigate } from "react-router";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { requestColumns } from "./RequestColumns";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";

export default function ProfilingRequest() {

  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  return (
    <MainLayoutComponent
      title="Awaiting Approval"
      description="Submissions under review and pending authorization"
    >

      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="relative w-full flex gap-2 mr-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
          <Input
            placeholder="Search..."
            className="pl-10 bg-white w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Link to="/registration-request">
            <Button variant="outline">
              <ClockArrowUp /> Pending
            </Button>
          </Link>
          <Link to='/resident-form' 
            state={{
                params: {
                  title: 'Resident Registration', 
                  description: 'Provide your details to complete the registration process.',
                }
              }}
            >
            <Button className="bg-buttonBlue text-white hover:bg-buttonBlue/90">
              <Plus size={15} /> Register
            </Button>
          </Link>
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
                if (value >= 1) {
                  setPageSize(value);
                } else {
                  setPageSize(1); // Reset to 1 if invalid
                }
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem]">
                <FileInput /> Export
              </Button>
            }
            options={[
              { id: '', name: "Export as CSV"},
              { id: '', name: "Export as Excel"},
              { id: '', name: "Export as PDF"},
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <DataTable columns={requestColumns} data={[]} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            {/* Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredResidents.length)} of {filteredResidents.length} rows */}
          </p>
          {/* {paginatedResidents.length > 0 && <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
          />} */}
        </div>
      </div>
    </MainLayoutComponent>
  );
}
