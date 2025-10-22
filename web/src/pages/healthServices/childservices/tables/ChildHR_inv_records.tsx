//// filepath: /c:/CIUDAD-APP/web/src/pages/healthServices/childservices/tables/ChildHR_inv_records.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ChildHealthRecordCard } from "@/components/ui/childInfocard";
import { useChildHealthHistory, useNutriotionalStatus } from "../forms/queries/fetchQueries";
import { getChildHealthColumns } from "./columns/indiv_col";
import { useUnvaccinatedVaccines } from "../../vaccination/queries/fetch";
import { useFollowupChildHealthandVaccines } from "../../vaccination/queries/fetch";
import { VaccinationStatusCardsSkeleton } from "../../skeleton/vaccinationstatus-skeleton";
import { VaccinationStatusCards } from "@/components/ui/vaccination-status";
import { FollowUpsCard } from "@/components/ui/ch-vac-followup";
import { usePatientVaccinationDetails } from "../../vaccination/queries/fetch";
import { GrowthChart } from "./growth-chart";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";
import { processHistoryData } from "./formattedData";

export default function InvChildHealthRecords() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ChildHealthRecord } = location.state || {};
  const [childData] = useState(ChildHealthRecord);
  const [searchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Safe access to ChildHealthRecord properties
  const patId = childData?.pat_id || "";
  const dob = childData?.dob || "";
  const chrecId = childData?.chrec_id || "";

  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } = useUnvaccinatedVaccines(patId, dob);
  const { data: followUps = [], isLoading: followupLoading } = useFollowupChildHealthandVaccines(patId);
  const { data: historyData = [], isLoading: childHistoryLoading, isError, error } = useChildHealthHistory(chrecId);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } = usePatientVaccinationDetails(patId);
  const { data: nutritionalStatusData = [], isLoading: isGrowthLoading, isError: isgrowthError } = useNutriotionalStatus(patId);

  const isLoading = followupLoading || isUnvaccinatedLoading || isCompleteVaccineLoading || childHistoryLoading;

  console.log("chhh", chrecId);
  console.log("childData", childData);
  useEffect(() => {
    if (!chrecId) {
      console.error("ChildHealthRecord or chrec_id is missing from location state.");
    }
  }, [chrecId, navigate]);

  // Process the history data using a helper function
  const processedHistoryData = useMemo(() => {
    return processHistoryData(historyData, dob);
  }, [historyData, dob]);

  const latestRecord = useMemo(() => {
    if (!processedHistoryData || processedHistoryData.length === 0) return null;
    return processedHistoryData[0];
  }, [processedHistoryData]);

  const isLatestRecordImmunizationOrCheckup = useMemo(() => {
    if (!latestRecord) return false;
    return latestRecord.status === "immunization" || latestRecord.status === "check-up";
  }, [latestRecord]);

  const filteredData = useMemo(() => {
    return processedHistoryData.filter((item: any) => {
      const findingsText = item.findings ? `${item.findings.subj_summary || ""} ${item.findings.obj_summary || ""} ${item.findings.assessment_summary || ""} ${item.findings.plantreatment_summary || ""}` : "";
      return (
        item.age.toString().includes(searchQuery) ||
        item.wt.toString().includes(searchQuery) ||
        item.ht.toString().includes(searchQuery) ||
        item.bmi.toString().includes(searchQuery) ||
        item.vaccineStat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.latestNote || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.followUpDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.updatedAt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        findingsText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, processedHistoryData]);

  const isLatestRecordFromToday = useMemo(() => {
    if (!latestRecord || !latestRecord.rawCreatedAt) return false;
    const latestRecordDate = new Date(latestRecord.rawCreatedAt).toDateString();
    const currentDate = new Date().toDateString();
    return latestRecordDate === currentDate;
  }, [latestRecord]);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, filteredData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const navigateToUpdateLatest = () => {
    if (latestRecord && childData) {
      navigate("/services/childhealthrecords/form", {
        state: {
          params: {
            chhistId: latestRecord.chhist_id,
            patId: childData?.pat_id,
            originalRecord: latestRecord,
            patientData: childData,
            chrecId: chrecId,
            mode: "addnewchildhealthrecord"
          }
        }
      });
    }
  };

  const columns = useMemo(() => getChildHealthColumns(childData, nutritionalStatusData), [childData, nutritionalStatusData]);

  if (isError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">Error loading data: {error instanceof Error ? error.message : "Unknown error"}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  if (!childData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">Child health record data is missing</div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-snow">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Child Health History Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view child's health history</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />
      <div className="mb-5">
        <ChildHealthRecordCard child={childData} />
      </div>
      {isLoading ? (
        <VaccinationStatusCardsSkeleton />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mb-4">
          <div className="w-full">
            <VaccinationStatusCards unvaccinatedVaccines={unvaccinatedVaccines} vaccinations={vaccinations} />
          </div>
          <div className="w-full">
            <FollowUpsCard childHealthFollowups={followUps} />
          </div>
        </div>
      )}
      <GrowthChart data={nutritionalStatusData} isLoading={isGrowthLoading} error={isgrowthError} />
      <div className="h-full w-full rounded-md mt-4">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" value={pageSize} onChange={(e) => setPageSize(Math.max(1, Number.parseInt(e.target.value) || 10))} min="1" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div className="flex gap-2">
            <ProtectedComponentButton exclude={["DOCTOR"]}>
              <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4">
                {latestRecord && !isLatestRecordFromToday && (
                  <div className="ml-auto mt-4 sm:mt-0 flex flex-col items-end gap-2">
                    {isLatestRecordImmunizationOrCheckup ? (
                      <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-md">
                        <span className="text-sm font-medium">{latestRecord.status === "immunization" ? "This child is currently receiving an immunization." : "This child is currently undergoing a health check-up."}</span>
                      </div>
                    ) : (
                      <Button onClick={navigateToUpdateLatest}>New record</Button>
                    )}
                  </div>
                )}
              </div>
            </ProtectedComponentButton>
          </div>
        </div>
        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <div className="w-full h-[100px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">loading....</span>
            </div>
          ) : (
            <DataTable columns={columns} data={currentData} />
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}- {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
          </p>
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
