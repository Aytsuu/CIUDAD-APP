import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";


import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { calculateAge } from "@/helpers/ageCalculator";
import { useMedicalRecord } from "../queries/fetchQueries";
import { MedicalRecord } from "../types";
import { getAllMedicalRecordsColumns,exportColumns } from "./columns/all_col";
import { useLoading } from "@/context/LoadingContext";
import { ExportButton } from "@/components/ui/export";

export default function AllMedicalConsRecord() {
  const [value, setValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("all");
  const { showLoading, hideLoading } = useLoading();
  

  const { data: MedicalRecord, isLoading } = useMedicalRecord();

    useEffect(() => {
      if (isLoading) {
        showLoading();
      } else {
        hideLoading();
      }
    }, [isLoading]);
  const formatMedicalData = React.useCallback((): MedicalRecord[] => {
    if (!MedicalRecord) return [];

    return MedicalRecord.map((record: any) => {
      const details = record.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

      const addressString =
        [
          address.add_street || info.per_address || "",
          address.add_barangay || "",
          address.add_city || "",
          address.add_province || "",
        ]
          .filter((part) => part.trim().length > 0)
          .join(", ") || "";

      return {
        pat_id: record.pat_id,
        fname: info.per_fname || "",
        lname: info.per_lname || "",
        mname: info.per_mname || "",
        sex: info.per_sex || "",
        age: calculateAge(info.per_dob).toString(),
        dob: info.per_dob || "",
        householdno: details.households?.[0]?.hh_id || "",
        street: address.add_street || "",
        sitio: address.add_sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: details.pat_type || "",
        address: addressString,
        medicalrec_count: record.medicalrec_count || 0,
      };
    });
  }, [MedicalRecord]);

  const filteredData = React.useMemo(() => {
    return formatMedicalData().filter((record: MedicalRecord) => {
      const searchText = `${record.pat_id} 
        ${record.lname} 
        ${record.fname} 
        ${record.sitio}`.toLowerCase();

      const typeMatches =
        patientTypeFilter === "all" ||
        record.pat_type.toLowerCase() === patientTypeFilter.toLowerCase();

      return searchText.includes(searchQuery.toLowerCase()) && typeMatches;
    });
  }, [searchQuery, formatMedicalData, patientTypeFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = getAllMedicalRecordsColumns();

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Medical Consultation Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
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
              options={[
                { id: "all", name: "All Types" },
                { id: "resident", name: "Resident" },
                { id: "transient", name: "Transient" },
              ]}
              value={patientTypeFilter}
              onChange={(value) => setPatientTypeFilter(value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Link
                to="/medical-consultation-form"
                state={{
                  params: {
                    mode: "fromallrecordtable",
                  },
                }}
              >
                New Record
              </Link>{" "}
            </Button>
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={pageSize}
                onChange={(e) => {
                  const value = +e.target.value;
                  setPageSize(value >= 1 ? value : 1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
             <ExportButton
                        data={paginatedData}
                        filename="overall-child-health-records"
                        columns={exportColumns}
                      />
          </div>

          <div className="bg-white w-full overflow-x-auto">
            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500  items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">loading....</span>
              </div>
            ) : (
              <DataTable columns={columns} data={paginatedData} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing{" "}
              {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
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
      </div>
    </>
  );
}
