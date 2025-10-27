"use client";

import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronLeft, Heart } from "lucide-react";
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
import { ProtectedComponent } from "@/ProtectedComponent";
import { processHistoryData } from "./formattedData";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import TableLoading from "../../table-loading";

export default function InvChildHealthRecords() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ChildHealthRecord } = location.state || {};
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Safe access to ChildHealthRecord properties for initial API calls
  const patId = ChildHealthRecord?.pat_id || "";
  const dob = ChildHealthRecord?.dob || "";
  const chrecId = ChildHealthRecord?.chrec_id || "";

  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } = useUnvaccinatedVaccines(patId, dob);
  const { data: followUps = [], isLoading: followupLoading } = useFollowupChildHealthandVaccines(patId);
  const {
    data: historyData = { results: [], count: 0 },
    isLoading: childHistoryLoading,
    isError,
    error,
  } = useChildHealthHistory(chrecId, { page_size: pageSize, page: currentPage });
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } = usePatientVaccinationDetails(patId);
  const { data: nutritionalStatusData = [], isLoading: isGrowthLoading, isError: isgrowthError } = useNutriotionalStatus(patId);

  const isLoading = followupLoading || isUnvaccinatedLoading || isCompleteVaccineLoading || childHistoryLoading;

  useEffect(() => {
    if (!chrecId) {
      console.error("ChildHealthRecord or chrec_id is missing from location state.");
    }
  }, [chrecId, navigate]);

  // Extract child info from the first history in paginated results
  const derivedChildData = useMemo(() => {
    if (!historyData || !historyData.results || historyData.results.length === 0) return null;
    const firstHistory = historyData.results[0];
    if (!firstHistory || !firstHistory.chrec_details) return null;

    const chrecDetails = firstHistory.chrec_details;
    const patrecDetails = chrecDetails.patrec_details;
    const patDetails = patrecDetails?.pat_details;

    const personalInfo = patDetails?.personal_info || {};
    const address = patDetails?.address || {};
    const familyHeadInfo = patDetails?.family_head_info || {};

    // Mother
    const motherInfo = familyHeadInfo?.family_heads?.mother?.personal_info ||
      familyHeadInfo?.mother?.personal_info ||
      familyHeadInfo?.mother ||
      patDetails?.mother_info?.personal_info ||
      patDetails?.mother_info ||
      {};
    const motherAddress = familyHeadInfo?.family_heads?.mother?.address ||
      familyHeadInfo?.mother?.address ||
      familyHeadInfo?.mother?.motherAddress ||
      patDetails?.mother_info?.address ||
      {};

    // Father
    const fatherInfo = familyHeadInfo?.family_heads?.father?.personal_info ||
      familyHeadInfo?.father?.personal_info ||
      familyHeadInfo?.father ||
      patDetails?.father_info?.personal_info ||
      patDetails?.father_info ||
      {};
      
    const fatherAddress = familyHeadInfo?.family_heads?.father?.address ||
      familyHeadInfo?.father?.address ||
      familyHeadInfo?.father?.fatherAddress ||
      patDetails?.father_info?.address ||
      {};

    const additionalInfo = patDetails?.additional_info || patrecDetails?.additional_info || chrecDetails?.additional_info || {};

    const resolvedDob = personalInfo?.per_dob || ChildHealthRecord?.dob || "";
    const resolvedAge = resolvedDob ? calculateAgeFromDOB(resolvedDob).years.toString() : "";

    return {
      chrec_id: chrecDetails?.chrec_id || chrecId || "",
      pat_id: chrecDetails?.patient || patDetails?.pat_id || ChildHealthRecord?.pat_id || patId || "",
      fname: personalInfo?.per_fname || ChildHealthRecord?.fname || "",
      lname: personalInfo?.per_lname || ChildHealthRecord?.lname || "",
      mname: personalInfo?.per_mname || ChildHealthRecord?.mname || "",
      sex: personalInfo?.per_sex || ChildHealthRecord?.sex || "",
      dob: resolvedDob,
      age: resolvedAge,
      mother_fname: motherInfo?.per_fname || "",
      mother_lname: motherInfo?.per_lname || "",
      mother_mname: motherInfo?.per_mname || "",
      mother_occupation: chrecDetails?.mother_occupation || motherInfo?.per_occupation || "",
      mother_dob: motherInfo?.per_dob || familyHeadInfo?.mother?.per_dob || patDetails?.mother_dob || "",
      mother_rp_id: familyHeadInfo?.mother?.rp_id || motherInfo?.rp_id || patDetails?.mother_rp_id || familyHeadInfo?.rp_id || "",
      mother_pat_id: additionalInfo?.mother_latest_pregnancy?.mother_pat_id || motherInfo?.pat_id || familyHeadInfo?.mother?.pat_id || patDetails?.mother_pat_id || chrecDetails?.mother_pat_id || "",
      motherAddress: {
        full_address:
          motherAddress?.full_address ||
          familyHeadInfo?.mother?.full_address ||
          patDetails?.mother_address?.full_address ||
          `${motherAddress?.add_street || ""} ${motherAddress?.add_barangay || ""} ${motherAddress?.add_city || ""} ${motherAddress?.add_province || ""}`.trim() ||
          "",
        add_street: motherAddress?.add_street || familyHeadInfo?.mother?.add_street || "",
        add_barangay: motherAddress?.add_barangay || familyHeadInfo?.mother?.add_barangay || "",
        add_city: motherAddress?.add_city || familyHeadInfo?.mother?.add_city || "",
        add_province: motherAddress?.add_province || familyHeadInfo?.mother?.add_province || "",
        add_sitio: motherAddress?.add_sitio || familyHeadInfo?.mother?.add_sitio || "",
      },
      address: address?.full_address || "",
      landmarks: chrecDetails?.landmarks || "",
      father_fname: fatherInfo?.per_fname || "",
      father_lname: fatherInfo?.per_lname || "",
      father_mname: fatherInfo?.per_mname || "",
      father_occupation: chrecDetails?.father_occupation || fatherInfo?.per_occupation || "",
      father_dob: fatherInfo?.per_dob || familyHeadInfo?.father?.per_dob || patDetails?.father_dob || "",
      father_rp_id: familyHeadInfo?.father?.rp_id || fatherInfo?.rp_id || patDetails?.father_rp_id || "",
      father_pat_id: fatherInfo?.pat_id || familyHeadInfo?.father?.pat_id || patDetails?.father_pat_id || "",
      fatherAddress: {
        full_address:
          fatherAddress?.full_address ||
          familyHeadInfo?.father?.full_address ||
          patDetails?.father_address?.full_address ||
          `${fatherAddress?.add_street || ""} ${fatherAddress?.add_barangay || ""} ${fatherAddress?.add_city || ""} ${fatherAddress?.add_province || ""}`.trim() ||
          "",
        add_street: fatherAddress?.add_street || familyHeadInfo?.father?.add_street || "",
        add_barangay: fatherAddress?.add_barangay || familyHeadInfo?.father?.add_barangay || "",
        add_city: fatherAddress?.add_city || familyHeadInfo?.father?.add_city || "",
        add_province: fatherAddress?.add_province || familyHeadInfo?.father?.add_province || "",
        add_sitio: fatherAddress?.add_sitio || familyHeadInfo?.father?.add_sitio || "",
      },
      type_of_feeding: chrecDetails?.type_of_feeding || "",
      delivery_type: chrecDetails?.place_of_delivery_type || "",
      pod_location: chrecDetails?.pod_location || "",
      tt_status: firstHistory?.tt_status || "",
      birth_order: chrecDetails?.birth_order != null ? String(chrecDetails.birth_order) : "",
      pregnancy_id: chrecDetails?.pregnancy,
      chrec_id: chrecDetails?.chrec_id || chrecId || "",
    };
  }, [historyData, ChildHealthRecord, patId, chrecId]);

  // Use paginated array directly for table
  const processedHistoryData = useMemo(() => {
    const raw = Array.isArray(historyData.results) ? historyData.results : [];
    return processHistoryData(raw, dob);
  }, [historyData, dob]);

  const latestRecord = useMemo(() => {
    if (!processedHistoryData || processedHistoryData.length === 0) return null;
    return processedHistoryData[0];
  }, [processedHistoryData]);

  const isLatestRecordImmunizationOrCheckup = useMemo(() => {
    if (!latestRecord) return false;
    return latestRecord.status === "immunization" || latestRecord.status === "check-up";
  }, [latestRecord]);

  const totalPages = Math.ceil((historyData.count || 0) / pageSize);

  const navigateToUpdateLatest = () => {
    if (latestRecord && derivedChildData) {
      navigate("/services/childhealthrecords/form", {
        state: {
          params: {
            chhistId: latestRecord.chhist_id,
            patId: derivedChildData.pat_id,
            originalRecord: latestRecord,
            patientData: derivedChildData,
            chrecId: derivedChildData.chrec_id ,
            mode: "addnewchildhealthrecord",
          },
        },
      });
    }
  };

  const columns = useMemo(() => getChildHealthColumns(derivedChildData, nutritionalStatusData), [derivedChildData, nutritionalStatusData]);

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

  if (!derivedChildData && !childHistoryLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">Unable to load child health record data from API</div>
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
        <ChildHealthRecordCard child={derivedChildData} isLoading={childHistoryLoading} />
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
      <div className="flex justify-end mt-8">
        <ProtectedComponent exclude={["DOCTOR"]}>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full ">
            {latestRecord && (
              <div className="ml-auto mt-4 sm:mt-0 flex flex-col items-end gap-2">
                {isLatestRecordImmunizationOrCheckup ? (
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-md">
                    <span className="text-sm font-medium">
                      {latestRecord.status === "immunization" ? "This child is currently receiving an immunization." : "This child is currently undergoing a health check-up."}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={navigateToUpdateLatest}>New Follow Up</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ProtectedComponent>
      </div>

      <div className="h-full w-full rounded-md mt-4">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" value={pageSize} onChange={(e) => setPageSize(Math.max(1, Number.parseInt(e.target.value) || 10))} min="1" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2">
              {derivedChildData?.pregnancy_id && (
                <Link
                  to="/services/maternalindividualrecords"
                  state={{
                    params: {
                      patientData: {
                        pat_id: derivedChildData?.mother_pat_id || "",
                        pat_type: "Resident",
                        address: derivedChildData?.motherAddress,
                        personal_info: {
                          per_fname: derivedChildData?.mother_fname || "",
                          per_lname: derivedChildData?.mother_lname || "",
                          per_mname: derivedChildData?.mother_mname || "",
                          per_sex: "FEMALE",
                          per_dob: derivedChildData?.mother_dob || "",
                        },
                        pregnancy_id: derivedChildData?.pregnancy_id || "",
                        rp_id: derivedChildData?.mother_rp_id || "",
                        mode: "child",
                      },
                    },
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 hover:text-accent-foreground h-10 px-4 py-2"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  View Mother's Maternal
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? <TableLoading /> : <DataTable columns={columns} data={processedHistoryData} />}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {processedHistoryData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}- {Math.min(currentPage * pageSize, historyData.count || 0)} of {historyData.count || 0} records
          </p>
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}