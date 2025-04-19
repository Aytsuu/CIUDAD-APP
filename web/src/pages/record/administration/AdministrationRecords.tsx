import React from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { Search, UserRoundCog, Plus } from "lucide-react";
import { administrationColumns } from "./AdministrationColumns";
import { Skeleton } from "@/components/ui/skeleton";
import { AdministrationRecord } from "./administrationTypes";
import { useFeatures, useStaffs, useResidents } from "./queries/administrationFetchQueries";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

export default function AdministrationRecords() {
  // Initializing states
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const { data: residents, isLoading: isLoadingResidents } = useResidents();
  const { data: staffs, isLoading: isLoadingStaffs } = useStaffs();
  const { data: features, isLoading: isLoadingFeatures } = useFeatures();

  // Format staff data for table
  const formatStaffData = React.useCallback((): AdministrationRecord[] => {
    if (!staffs) return [];

    return staffs.map((staff: any) => {
      const position = staff.pos;
      const personal = staff.rp.per;

      return {
        id: staff.staff_id || "",
        lname: personal.per_lname || "",
        fname: personal.per_fname || "",
        mname: personal.per_mname || "",
        suffix: personal.per_suffix || "",
        dateOfBirth: personal.per_dob || "",
        contact: personal.per_contact || "",
        position: position.pos_title || "",
        dateAssigned: staff.staff_assign_date || "",
      };
    });
  }, [staffs]);

  // Filtering formatted staff data (searching)
  const filteredStaffs = React.useMemo(() => {
    let filtered = formatStaffData();

    return filtered.filter((record: any) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [staffs, searchQuery]);

  const totalPage = Math.ceil(filteredStaffs.length / pageSize);

  // Dividing the data according to specified entries
  const paginatedStaffs = filteredStaffs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoadingResidents || isLoadingStaffs
    || isLoadingFeatures
  ) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  return (
    <MainLayoutComponent
      title="Administrative Records"
      description="Manage and view staff information"
    >
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 ">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 w-full bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/administration/role"
            state={{
              params: {
                features: features,
              },
            }}
          >
            <Button>
              <UserRoundCog /> Role
            </Button>
          </Link>
          <Link
            to="/resident/form"
            state={{
              params: {
                title: "Staff Registration",
                description:
                  "Ensure that all required fields are filled out correctly before submission.",
                origin: "administration",
                residents: residents,
              },
            }}
          >
            <Button>
              <Plus /> Register a Staff
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white p-3">
          <div className="flex gap-x-2 items-center">
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
        </div>
        <div className="bg-white w-full overflow-x-auto">
          {/* Table Placement */}
          <DataTable columns={administrationColumns} data={paginatedStaffs} />

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredStaffs.length)} of{" "}
              {filteredStaffs.length} rows
            </p>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex justify-center">
              {paginatedStaffs.length > 0 && (
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}
