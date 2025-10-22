"use client";

import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import TableLoading from "../../table-loading";

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
  console.log("historyData", historyData);

  useEffect(() => {
    if (!chrecId) {
      console.error("ChildHealthRecord or chrec_id is missing from location state.");
    }
  }, [chrecId, navigate]);

  // Transform child data from nested API structure - ONLY for ChildHealthRecordCard
  const transformChildData = useMemo(() => {
    console.log("🔄 TRANSFORMING CHILD DATA FOR CARD DISPLAY");

    // Extract the first child health history to get patient details
    const firstHistory = historyData?.[0];
    if (!firstHistory) {
      console.log("❌ No child health histories found - using original childData");
      return childData; // Fallback to original childData
    }

    const chrecDetails = firstHistory.chrec_details;
    const patrecDetails = chrecDetails?.patrec_details;
    const patDetails = patrecDetails?.pat_details;

    if (!patDetails) {
      console.log("❌ No patient details found - using original childData");
      return childData; // Fallback to original childData
    }

    const personalInfo = patDetails.personal_info || {};
    const address = patDetails.address || {};
    const familyHeadInfo = patDetails.family_head_info?.family_heads || {};

    const motherInfo = familyHeadInfo.mother?.personal_info || {};
    const fatherInfo = familyHeadInfo.father?.personal_info || {};

    console.log("👨‍👩‍👧‍👦 EXTRACTED PATIENT DATA:", {
      personalInfo,
      address,
      motherInfo,
      fatherInfo,
    });

    const transformedData = {
      // Patient basic info
      pat_id: chrecDetails?.patient || patDetails.pat_id || patId,
      fname: personalInfo?.per_fname || childData?.fname || "",
      lname: personalInfo?.per_lname || childData?.lname || "",
      mname: personalInfo?.per_mname || childData?.mname || "",
      sex: personalInfo?.per_sex || childData?.sex || "",
      dob: personalInfo?.per_dob || childData?.dob || "",
      age: personalInfo?.per_dob ? calculateAgeFromDOB(personalInfo.per_dob).years.toString() : childData?.age || "",

      // Mother info
      mother_fname: motherInfo?.per_fname || childData?.mother_fname || "",
      mother_lname: motherInfo?.per_lname || childData?.mother_lname || "",
      mother_mname: motherInfo?.per_mname || childData?.mother_mname || "",
      mother_occupation: chrecDetails?.mother_occupation || motherInfo?.per_occupation || childData?.mother_occupation || "",
      mother_age: motherInfo?.per_dob ? calculateAgeFromDOB(motherInfo.per_dob).years.toString() : childData?.mother_age || "",

      // Father info
      father_fname: fatherInfo?.per_fname || childData?.father_fname || "",
      father_lname: fatherInfo?.per_lname || childData?.father_lname || "",
      father_mname: fatherInfo?.per_mname || childData?.father_mname || "",
      father_age: fatherInfo?.per_dob ? calculateAgeFromDOB(fatherInfo.per_dob).years.toString() : childData?.father_age || "",
      father_occupation: chrecDetails?.father_occupation || fatherInfo?.per_occupation || childData?.father_occupation || "",

      // Address info
      address: address?.full_address || childData?.address || "",
      street: address?.add_street || childData?.street || "",
      barangay: address?.add_barangay || childData?.barangay || "",
      city: address?.add_city || childData?.city || "",
      province: address?.add_province || childData?.province || "",
      landmarks: chrecDetails?.landmarks || address?.add_landmarks || childData?.landmarks || "",

      // Child health specific info
      type_of_feeding: chrecDetails?.type_of_feeding || childData?.type_of_feeding || "",
      delivery_type: chrecDetails?.place_of_delivery_type || childData?.delivery_type || "",
      pod_location: chrecDetails?.pod_location || childData?.pod_location || "",
      tt_status: familyHeadInfo?.tt_status || firstHistory?.tt_status || childData?.tt_status || "",
      birth_order: chrecDetails?.birth_order?.toString() || childData?.birth_order?.toString() || "",

      // Additional fields
      chrec_id: childData?.chrec_id || chrecId,
    };

    console.log("✅ TRANSFORMED CHILD DATA:", transformedData);
    return transformedData;
  }, [historyData, childData, patId, chrecId]);

  // Process the history data using a helper function - KEEP ORIGINAL LOGIC
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
      const findingsText = item.findings
        ? `${item.findings.subj_summary || ""} ${item.findings.obj_summary || ""} ${item.findings.assessment_summary || ""} ${item.findings.plantreatment_summary || ""}`
        : "";
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

  // Use transformChildData for navigation
  const navigateToUpdateLatest = () => {
    if (latestRecord && transformChildData) {
      navigate("/services/childhealthrecords/form", {
        state: {
          params: {
            chhistId: latestRecord.chhist_id,
            patId: transformChildData.pat_id,
            originalRecord: latestRecord,
            patientData: transformChildData,
            chrecId: chrecId,
            mode: "addnewchildhealthrecord",
          },
        },
      });
    }
  };

  // Use transformChildData for columns
  const columns = useMemo(() => getChildHealthColumns(transformChildData, nutritionalStatusData), [transformChildData, nutritionalStatusData]);

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
        <ChildHealthRecordCard child={transformChildData} isLoading={childHistoryLoading} />
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
              <div className="flex flex-col sm:flex-row items-center justify-between w-full ">
                {latestRecord && !isLatestRecordFromToday && (
                  <div className="ml-auto mt-4 sm:mt-0 flex flex-col items-end gap-2">
                    {isLatestRecordImmunizationOrCheckup ? (
                      <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-md">
                        <span className="text-sm font-medium">
                          {latestRecord.status === "immunization" ? "This child is currently receiving an immunization." : "This child is currently undergoing a health check-up."}
                        </span>
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
        <div className="bg-white w-full overflow-x-auto">{isLoading ? <TableLoading /> : <DataTable columns={columns} data={currentData} />}</div>
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
