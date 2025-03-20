import React from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Plus, ClockArrowUp, FileInput, Search } from "lucide-react";
import { Link } from "react-router";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { exportToCSV, exportToExcel, exportToPDF } from "./ExportFunctions";
import { residentColumns } from "./ResidentColumns";
import { ResidentRecord } from "../profilingTypes";

import { useQuery } from "@tanstack/react-query";
import { getResidents } from "../restful-api/profilingGetAPI";

const FilterComponent = ({ onFilterChange }) => {
  const [filterType, setFilterType] = React.useState("");

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value);
    onFilterChange({ type: value });
  };

  return (
    <div className="flex gap-2 items-start">
      <SelectLayout
        placeholder="Filter by"
        className="bg-white"
        options={[
          { id: "1", name: "By Sitio" },
          { id: "2", name: "By location" },
        ]}
        value={filterType}
        onChange={handleFilterTypeChange}
      />
    </div>
  );
};

export default function ProfilingMain() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeFilter, setActiveFilter] = React.useState<{
    type: string | null;
  }>({ type: null });

  // Fetch residents and staffs using useQuery
  const { data: residents, isLoading: isLoadingResidents } = useQuery({
    queryKey: ['residents'],
    queryFn: getResidents,
  });
  
  const formatResidentData = (): ResidentRecord[] => {
    
    return residents.map((item: any) => {
      const [{reg_date} = {}] = item.registered
      const [{fam_id, building} = {}] = item.family

      return {
        id: item.per_id || '',
        householdNo: building?.hh_id || '',
        sitio: '',
        familyNo: fam_id || '',
        lname: item.per_lname || '',
        fname: item.per_fname || '',
        mname: item.per_mname || '',
        suffix: item.per_suffix || '',  
        dateRegistered: reg_date || '',
      }
    });
  };

  // Filter residents based on search query and active filter
  const filteredResidents = React.useMemo(() => {
    let filtered = residents;

    if (searchQuery) {
      filtered = filtered.filter((record: any) =>
        Object.values(record).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [residents, searchQuery, activeFilter]);

  if(isLoadingResidents) {
    return <p>Loading...</p>
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-darkBlue2">Resident Records</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view resident information</p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <FilterComponent onFilterChange={setActiveFilter} />
        </div>
        <div className="flex gap-2">
          <Link to="/registration-request">
            <Button variant="outline">
              <ClockArrowUp /> Pending
            </Button>
          </Link>
          <Link to='/resident-registration' 
            state={{
                params: {
                  title: 'Resident Registration', 
                  description: 'Provide your details to complete the registration process.'
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
              onChange={(e) => setPageSize(Math.max(1, +e.target.value))}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline">
                <FileInput className="mr-2" /> Export
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
          <DataTable columns={residentColumns(residents)} data={formatResidentData()} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredResidents.length)} of {filteredResidents.length} rows
          </p>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={0}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}