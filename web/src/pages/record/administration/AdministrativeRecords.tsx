import React from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, UserRoundCog, Plus } from "lucide-react";
import { administrationColumns } from "./AdministrationColumns";
import { getResidents } from "../profiling/restful-api/profilingGetAPI";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllAssignedFeatures,
  getFeatures,
  getPositions,
  getStaffs,
} from "./restful-api/administrationGetAPI";
import { AdministrationRecord } from "./administrationTypes";

export default function AdministrativeRecords() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Queries
  const { data: residents, isLoading: isLoadingResidents } = useQuery({
    queryKey: ["residents"],
    queryFn: getResidents,
    refetchOnMount: true,
    staleTime: 0,
  });

  const { data: staffs, isLoading: isLoadingStaffs } = useQuery({
    queryKey: ["staffs"],
    queryFn: getStaffs,
  });

  const { data: features, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ["features"],
    queryFn: getFeatures,
    refetchOnMount: true,
    staleTime: 0,
  });

  const { data: positions, isLoading: isLoadingPositions } = useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
    refetchOnMount: true,
    staleTime: 0,
  });

  const { data: allAssignedFeatures, isLoading: isLoadingAllAssignedFeatures } =
    useQuery({
      queryKey: ["assignedFeatures"],
      queryFn: getAllAssignedFeatures,
      refetchOnMount: true,
      staleTime: 0,
    });

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

  const paginatedStaffs = filteredStaffs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (
    isLoadingResidents ||
    isLoadingStaffs ||
    isLoadingFeatures ||
    isLoadingPositions ||
    isLoadingAllAssignedFeatures
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
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Administrative Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view staff information
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

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
          <SelectLayout
            placeholder="Filter by"
            label=""
            className="bg-white w-1/6"
            options={[]}
            value=""
            onChange={() => {}}
          />
          <Link
            to="/role"
            state={{
              params: {
                positions: positions,
                features: features,
                allAssignedFeatures: allAssignedFeatures,
              },
            }}
          >
            <Button>
              <UserRoundCog /> Role
            </Button>
          </Link>
          <Link
            to="/resident-form"
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
    </div>
  );
}
