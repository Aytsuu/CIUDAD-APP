// use client";
import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { FileInput, ChevronLeft, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { useLoading } from "@/context/LoadingContext";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import { GrowthChart } from "./growth-chart";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";

export default function InvChildHealthRecords() {
  const { showLoading, hideLoading } = useLoading();
  const location = useLocation();
  const navigate = useNavigate();
  const { ChildHealthRecord } = location.state || {};
  const [childData] = useState(ChildHealthRecord);
  const [searchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Add safe access to ChildHealthRecord properties
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

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);

  // In your processedHistoryData useMemo
  const processedHistoryData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    const mainRecord = historyData[0];
    if (!mainRecord || !mainRecord.child_health_histories) {
      return [];
    }
    const sortedHistories = [...mainRecord.child_health_histories].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sortedHistories.map((record:any, index: number) => {
      let bmi = "N/A";
      let findingsData = {
        subj_summary: "",
        obj_summary: "",
        assessment_summary: "",
        plantreatment_summary: ""
      };

      // Extract findings from vital signs if available
      if (record.child_health_vital_signs?.length > 0) {
        const vital = record.child_health_vital_signs[0];

        // Calculate BMI
        if (vital.bm_details?.height && vital.bm_details?.weight) {
          const heightInM = vital.bm_details.height / 100;
          const bmiValue = (vital.bm_details.weight / (heightInM * heightInM)).toFixed(1);
          bmi = bmiValue;
        }

        // Extract findings data
        if (vital.find_details) {
          findingsData = {
            subj_summary: vital.find_details.subj_summary || "",
            obj_summary: vital.find_details.obj_summary || "",
            assessment_summary: vital.find_details.assessment_summary || "",
            plantreatment_summary: vital.find_details.plantreatment_summary || ""
          };
        }
      }

      let latestNoteContent: string | null = null;
      let followUpDescription = "";
      let followUpDate = "";
      let followUpStatus = "";

      if (record.child_health_notes && record.child_health_notes.length > 0) {
        const sortedNotes = [...record.child_health_notes].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        latestNoteContent = sortedNotes[0].chn_notes || null;

        if (sortedNotes[0].followv_details) {
          followUpDescription = sortedNotes[0].followv_details.followv_description || "";
          followUpDate = sortedNotes[0].followv_details.followv_date || "";
          followUpStatus = sortedNotes[0].followv_details.followv_status || "";
        }
      }

      return {
        chrec_id: mainRecord.chrec,
        patrec: mainRecord.patrec_id,
        status: record.status || "N/A",
        chhist_id: record.chhist_id,
        id: index + 1,
        temp: record.child_health_vital_signs?.[0]?.temp || 0,
        age: dob ? calculateAgeFromDOB(dob, record.created_at).ageString : "N/A", // Safe access
        wt: record.child_health_vital_signs?.[0]?.bm_details?.weight || 0,
        ht: record.child_health_vital_signs?.[0]?.bm_details?.height || 0,
        bmi,
        latestNote: latestNoteContent,
        followUpDescription,
        followUpDate,
        followUpStatus,
        vaccineStat: record.tt_status || "N/A",
        updatedAt: new Date(record.created_at).toLocaleDateString(),
        rawCreatedAt: record.created_at,
        // Add findings data
        findings: findingsData,
        hasFindings: !!findingsData.subj_summary || !!findingsData.obj_summary || !!findingsData.assessment_summary || !!findingsData.plantreatment_summary
      };
    });
  }, [historyData, dob]); // Use dob instead of childData.dob

  const latestRecord = useMemo(() => {
    if (processedHistoryData.length === 0) return null;
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
            chrecId: chrecId, // Use the safe variable
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

  // Add early return if childData is missing
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileInput className="mr-2" size={16} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
          </p>
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
