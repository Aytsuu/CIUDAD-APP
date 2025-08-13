import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, Loader2, FileInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { calculateAge } from "@/helpers/ageCalculator";
import { useChildHealthRecords } from "../forms/queries/fetchQueries";
import { ChildHealthRecord } from "../forms/muti-step-form/types";
import { useLoading } from "@/context/LoadingContext";
import { filterOptions } from "./types";
import { childColumns } from "./columns/all_col";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

export default function AllChildHealthRecords() {
  const { data: childHealthRecords, isLoading } = useChildHealthRecords();
  const { showLoading, hideLoading } = useLoading();

  const formatChildHealthData = useCallback((): ChildHealthRecord[] => {
    if (!childHealthRecords) return [];

    return childHealthRecords.map((record: any) => {
      const childInfo = record.patrec_details?.pat_details?.personal_info || {};
      const motherInfo =
        record.patrec_details?.pat_details?.family_head_info?.family_heads
          ?.mother?.personal_info || {};
      const fatherInfo =
        record.patrec_details?.pat_details?.family_head_info?.family_heads
          ?.father?.personal_info || {};
      const addressInfo = record.patrec_details?.pat_details?.address || {};

      return {
        chrec_id: record.chrec_id,
        pat_id: record.patrec_details?.pat_details?.pat_id || "",
        fname: childInfo.per_fname || "",
        lname: childInfo.per_lname || "",
        mname: childInfo.per_mname || "",
        sex: childInfo.per_sex || "",
        age: calculateAge(childInfo.per_dob).toString(),
        dob: childInfo.per_dob || "",
        householdno:
          record.patrec_details?.pat_details?.households?.[0]?.hh_id || "",
        address:
          [
            addressInfo.add_sitio,
            addressInfo.add_street,
            addressInfo.add_barangay,
            addressInfo.add_city,
            addressInfo.add_province,
          ]
            .filter((part) => part && part.trim() !== "")
            .join(", ") || "No address Provided",
        sitio: addressInfo.add_sitio || "",
        landmarks: addressInfo.add_landmarks || "",
        pat_type: record.patrec_details?.pat_details?.pat_type || "",
        mother_fname: motherInfo.per_fname || "",
        mother_lname: motherInfo.per_lname || "",
        mother_mname: motherInfo.per_mname || "",
        mother_contact: motherInfo.per_contact || "",
        mother_occupation:
          motherInfo.per_occupation || record.mother_occupation || "",
        father_fname: fatherInfo.per_fname || "",
        father_lname: fatherInfo.per_lname || "",
        father_mname: fatherInfo.per_mname || "",
        father_contact: fatherInfo.per_contact || "",
        father_occupation:
          fatherInfo.per_occupation || record.father_occupation || "",
        family_no: record.family_no || "Not Provided",
        birth_weight: record.birth_weight || 0,
        birth_height: record.birth_height || 0,
        type_of_feeding: record.type_of_feeding || "Unknown",
        delivery_type: record.place_of_delivery_type || "",
        place_of_delivery_type: record.place_of_delivery_type || "",
        pod_location: record.pod_location || "",
        pod_location_details: record.pod_location_details || "",
        health_checkup_count: record.health_checkup_count || 0,
        birth_order: record.birth_order || "",
        tt_status: record.tt_status || "", // Optional field for TT status
      };
    });
  }, [childHealthRecords]);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<ChildHealthRecord[]>([]);
  const [currentData, setCurrentData] = useState<ChildHealthRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);

  useEffect(() => {
    const formattedData = formatChildHealthData();
    const filtered = formattedData.filter((item) => {
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "resident" &&
          item.pat_type.toLowerCase() === "resident") ||
        (selectedFilter === "transient" &&
          item.pat_type.toLowerCase() === "transient");

      const matchesSearch =
        `${item.fname} ${item.lname} ${item.mname} ` +
        `${item.mother_fname} ${item.mother_lname} ${item.mother_mname} ` +
        `${item.father_fname} ${item.father_lname} ${item.father_mname} ` +
        `${item.address} ${item.sitio} ${item.family_no} ${item.pat_type}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedFilter,
    pageSize,
    childHealthRecords,
    formatChildHealthData,
  ]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  return (
    <>
      <MainLayoutComponent
        title="Child Health Record"
        description="Manage and View Child's Record"
      >
        <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter records"
              label=""
              className="bg-white w-full sm:w-48"
              options={filterOptions}
              value={selectedFilter}
              onChange={(value) => setSelectedFilter(value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <Link
              to="/child-health-record/newchildhealthrecord"
              state={{
                params: {
                  mode: "newchildhealthrecord", // This is the key part
                },
              }}
            >
              <Button className="w-full sm:w-auto">New Record</Button>
            </Link>
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-3 justify-start items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-[70px] h-8 flex items-center justify-center text-center"
                value={pageSize}
                onChange={(e) => {
                  const value = +e.target.value;
                  setPageSize(value >= 1 ? value : 1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div className="flex justify-end sm:justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    aria-label="Export data"
                    className="flex items-center gap-2"
                  >
                    <FileInput size={16} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-white w-full overflow-x-auto">
            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500  items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">loading....</span>
              </div>
            ) : (
              <DataTable columns={childColumns} data={currentData} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing{" "}
              {currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} rows
            </p>

            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </MainLayoutComponent>
    </>
  );
}
