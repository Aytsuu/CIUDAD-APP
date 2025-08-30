// src/pages/childHealthRecordForm/index.tsx
"use client";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import ChildHRPage1 from "./child-hr-page1";
import ChildHRPage2 from "./child-hr-page2";
import ChildHRPage3 from "./child-hr-page3";
import LastPage from "./child-hr-page-last";
import { useAuth } from "@/context/AuthContext";
import {
  FormData,
  VitalSignType,
  VaccineRecord,
  ExistingVaccineRecord,
} from "@/form-schema/chr-schema/chr-schema";
import type { CHSSupplementStat } from "./types";
import { calculateAge, calculateAgeFromDOB } from "@/helpers/ageCalculator";
import { useChildHealthRecordMutation } from "../restful-api/newchrecord";
import { useUpdateChildHealthRecordMutation } from "../restful-api/newchhistory";
import type { Patient } from "@/components/ui/patientSearch";
import { Medicine } from "./types";
import { initialFormData, ImmunizationTracking } from "./types";
import CardLayout from "@/components/ui/card/card-layout";
import { useChildHealthHistory } from "../queries/fetchQueries";
import { isToday } from "@/helpers/isToday";

export default function ChildHealthRecordForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const mode =
    (location.state?.params?.mode as
      | "newchildhealthrecord"
      | "addnewchildhealthrecord"
      | undefined) ||
    (params.mode as
      | "newchildhealthrecord"
      | "addnewchildhealthrecord"
      | undefined);

  const { chrecId, chhistId } = location.state?.params || {};
  const isaddnewchildhealthrecordMode = mode === "addnewchildhealthrecord";
  const isNewchildhealthrecord = mode === "newchildhealthrecord";

  const { user } = useAuth();
  const staffId = user?.staff?.staff_id || null;
  const [immunizationTracking, setImmunizationTracking] = useState<
    ImmunizationTracking[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const newchildhealthrecordMutation = useChildHealthRecordMutation();
  const updatechildhealthrecordmutation = useUpdateChildHealthRecordMutation();
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(isaddnewchildhealthrecordMode);
  const [apiData, setApiData] = useState<any>(null);
  const [historicalBFdates, setHistoricalBFdates] = useState<string[]>([]);
  const [historicalVitalSigns, setHistoricalVitalSigns] = useState<
    VitalSignType[]
  >([]);
  const [historicalNutritionalStatus, setHistoricalNutritionalStatus] =
    useState<any[]>([]);
  const [historicalSupplementStatuses, setHistoricalSupplementStatuses] =
    useState<CHSSupplementStat[]>([]);
  const [latestHistoricalNoteContent, setLatestHistoricalNoteContent] =
    useState<string>("");
  const [
    latestHistoricalFollowUpDescription,
    setLatestHistoricalFollowUpDescription,
  ] = useState<string>("");
  const [latestHistoricalFollowUpDate, setLatestHistoricalFollowUpDate] =
    useState<string>("");
  const [historicalMedicines, setHistoricalMedicines] = useState<Medicine[]>(
    []
  );
  const [patientHistoricalDisabilities, setPatientHistoricalDisabilities] =
    useState<
      {
        id: number;
        pd_id: number;
        status: string;
        disability_details: {
          disability_id: number;
          disability_name: string;
          created_at: string;
        };
      }[]
    >([]);
  const [originalDisabilityRecords, setOriginalDisabilityRecords] = useState<
    { id: number; pd_id: number; status: string }[]
  >([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [newVitalSigns, setNewVitalSigns] = useState<VitalSignType[]>([]);

  const {
    data: childHealthRecord,
    isLoading: isRecordLoading,
    error: recordError,
  } = useChildHealthHistory(chrecId);

  const getLatestNoteForRecord = (notesArray: any[]) => {
    if (!notesArray || notesArray.length === 0) return null;

    const sortedNotes = [...notesArray].sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sortedNotes[0];
  };

  const transformApiDataToFormData = (chhistRecord: any): FormData => {
    if (!chhistRecord) {
      return {} as FormData;
    }

    const chrecDetails = chhistRecord?.chrec_details;
    const patrecDetails = chrecDetails?.patrec_details;
    const patient = patrecDetails?.pat_details;
    const familyHeadInfo = patient?.family_head_info;

    const vaccinesFromApi: VaccineRecord[] =
      chhistRecord.child_health_vaccines?.map((vac: any) => ({
        vacStck_id: vac.vacStck_id?.toString() || "",
        vaccineType:
          vac.vaccine_stock_details?.vaccinelist?.vac_name || "Unknown",
        dose: vac.dose?.toString() || "",
        date: vac.date_administered
          ? new Date(vac.date_administered).toISOString().split("T")[0]
          : "",
        vac_id: vac.vac_id?.toString() || "",
        vac_name: vac.vaccine_stock_details?.vaccinelist?.vac_name || "Unknown",
        expiry_date: vac.vaccine_stock_details?.inv_details?.expiry_date || "",
      })) || [];

    const existingVaccinesFromApi: ExistingVaccineRecord[] =
      chhistRecord.child_health_existing_vaccines?.map((exVac: any) => ({
        vac_id: exVac.vac_id?.toString() || "",
        vaccineType: exVac.vaccine_list_details?.vac_name || "Unknown",
        dose: exVac.dose?.toString() || "",
        date: exVac.date_administered
          ? new Date(exVac.date_administered).toISOString().split("T")[0]
          : "",
        vac_name: exVac.vaccine_list_details?.vac_name || "Unknown",
      })) || [];

    return {
      ...initialFormData,
      chhist_status: chhistRecord.status,
      familyNo: chrecDetails?.family_no || "",
      created_at: chhistRecord?.created_at || "",
      pat_id: patrecDetails?.pat_id || "",
      rp_id: patrecDetails?.rp_id?.rp_id || "",
      trans_id: patrecDetails?.trans_id || "",
      ufcNo: chrecDetails?.ufc_no || "N/A",
      childFname: patient?.personal_info?.per_fname || "",
      childLname: patient?.personal_info?.per_lname || "",
      childMname: patient?.personal_info?.per_mname || "",
      childSex: patient?.personal_info?.per_sex || "",
      childDob: patient?.personal_info?.per_dob || "",
      birth_order: chrecDetails?.birth_order || 1,
      placeOfDeliveryType: chrecDetails?.place_of_delivery_type || "Home",
      placeOfDeliveryLocation: chrecDetails?.pod_location || "",
      childAge: patient?.personal_info?.per_dob
        ? calculateAgeFromDOB(patient.personal_info.per_dob).ageString
        : "",
      residenceType: patrecDetails?.pat_type || "Resident",
      motherFname:
        familyHeadInfo?.family_heads?.mother?.personal_info?.per_fname || "",
      motherLname:
        familyHeadInfo?.family_heads?.mother?.personal_info?.per_lname || "",
      motherMname:
        familyHeadInfo?.family_heads?.mother?.personal_info?.per_mname || "",
      motherAge: familyHeadInfo?.family_heads?.mother?.personal_info?.per_dob
        ? calculateAge(
            familyHeadInfo.family_heads.mother.personal_info.per_dob
          ).toString()
        : "",
      motherdob:
        familyHeadInfo?.family_heads?.mother?.personal_info?.per_dob || "",
      motherOccupation: chrecDetails?.mother_occupation || "",
      fatherFname:
        familyHeadInfo?.family_heads?.father?.personal_info?.per_fname || "",
      fatherLname:
        familyHeadInfo?.family_heads?.father?.personal_info?.per_lname || "",
      fatherMname:
        familyHeadInfo?.family_heads?.father?.personal_info?.per_mname || "",
      fatherAge: familyHeadInfo?.family_heads?.father?.personal_info?.per_dob
        ? calculateAge(
            familyHeadInfo.family_heads.father.personal_info.per_dob
          ).toString()
        : "",
      fatherdob:
        familyHeadInfo?.family_heads?.father?.personal_info?.per_dob || "",
      fatherOccupation: chrecDetails?.father_occupation || "",
      address: patient?.address?.full_address || "",
      landmarks: chrecDetails?.landmarks || "",
      dateNewbornScreening: chrecDetails.newborn_screening || "",
      disabilityTypes: chhistRecord.disability_types || [],
      edemaSeverity: chhistRecord.edemaSeverity || "None",
      BFdates: chhistRecord.BFdates || [],
      vitalSigns: chhistRecord.vitalSigns || [],
      medicines: chhistRecord.medicines || [],
      anemic: chhistRecord.anemic || initialFormData.anemic,
      birthwt: chhistRecord.birthwt || initialFormData.birthwt,
      status: chhistRecord.status || "recorded",
      type_of_feeding: chrecDetails?.type_of_feeding || "",
      tt_status: chhistRecord.tt_status || "",
      nutritionalStatus:
        chhistRecord.nutritionalStatus || initialFormData.nutritionalStatus,
      vaccines: vaccinesFromApi,
      existingVaccines: existingVaccinesFromApi,
    };
  };

  useEffect(() => {
    const fetchRecordData = async () => {
      if (!isaddnewchildhealthrecordMode || !chrecId || !chhistId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const chrecRecord =
          childHealthRecord && childHealthRecord.length > 0
            ? childHealthRecord[0]
            : null;
        if (!chrecRecord) {
          throw new Error("Parent child health record (chrec) not found.");
        }

        console.log("API Response - supplements_statuses:", 
          chrecRecord.child_health_histories?.flatMap(
            (h: any) => h.supplements_statuses
          ));

        const allHistoricalVitalSigns: VitalSignType[] = [];
        const allHistoricalMedicines: Medicine[] = [];
        const allHistoricalNutritionalStatuses: any[] = [];
        const allHistoricalBFdates: string[] = [];
        const allHistoricalSupplementStatuses: CHSSupplementStat[] = [];
        const allImmunizationTracking: ImmunizationTracking[] = [];
        const allPatientHistoricalDisabilities: {
          id: number;
          pd_id: number;
          status: string;
          disability_details: {
            disability_id: number;
            disability_name: string;
            created_at: string;
          };
        }[] = [];

        chrecRecord.child_health_histories?.forEach((history: any) => {
          const latestNote = getLatestNoteForRecord(
            history.child_health_notes || []
          );

          // Process vital signs
          const vitalSignsFromHistory: VitalSignType[] =
            history.child_health_vital_signs?.map((vital: any) => ({
              date: vital.created_at
                ? new Date(vital.created_at).toISOString().split("T")[0]
                : "",
              temp: vital.temp ? Number.parseFloat(vital.temp) : undefined,
              wt: vital.bm_details?.weight
                ? Number.parseFloat(vital.bm_details.weight)
                : undefined,
              ht: vital.bm_details?.height
                ? Number.parseFloat(vital.bm_details.height)
                : undefined,
              age: vital.bm_details?.age || "",
              notes: latestNote?.chn_notes || "",
              follov_description:
                latestNote?.followv_details?.followv_description || "",
              followUpVisit: latestNote?.followv_details?.followv_date || "",
              chvital_id: vital.chvital_id?.toString() || undefined,
              bm_id: vital.bm_details?.bm_id?.toString() || undefined,
              chnotes_id: latestNote?.chnotes_id?.toString() || undefined,
              followv_id:
                latestNote?.followv_details?.followv_id?.toString() ||
                undefined,
              followv_status:
                latestNote?.followv_details?.followv_status || "pending",
            })) || [];
          allHistoricalVitalSigns.push(...vitalSignsFromHistory);

          // Process medicines
          const medicinesFromHistory: Medicine[] =
            history.child_health_supplements?.map((supp: any) => ({
              minv_id: supp.medrec_details?.minv_id?.toString() || "",
              medrec_qty: supp.medrec_details?.medrec_qty || 0,
              reason: supp.medrec_details?.reason || "",
              name:
                supp.medrec_details?.minv_details?.med_detail?.med_name || "",
              dosage: supp.medrec_details?.minv_details?.minv_dsg || undefined,
              dosageUnit:
                supp.medrec_details?.minv_details?.minv_dsg_unit || "",
              form: supp.medrec_details?.minv_details?.minv_form || "",
            })) || [];
          allHistoricalMedicines.push(...medicinesFromHistory);

          if (history.immunization_tracking) {
            const extractedImmunization: ImmunizationTracking[] =
              history.immunization_tracking.map((track: any) => ({
                imt_id: track.imt_id?.toString() || "",
                vachist_id: track.vachist_details?.vachist_id?.toString() || "",
                vaccine_name:
                  track.vachist_details?.vaccine_stock?.vaccinelist?.vac_name ||
                  track.vachist_details?.vac_details?.vac_name ||
                  "Unknown",
                dose_number:
                  track.vachist_details?.vachist_doseNo?.toString() || "",
                date_administered:
                  track.vachist_details?.date_administered ||
                  track.vachist_details?.created_at?.split("T")[0] ||
                  "",
                status: track.vachist_details?.vachist_status || "completed",
                hasExistingVaccination: track.hasExistingVaccination || false,
                follow_up_date:
                  track.vachist_details?.follow_up_visit?.followv_date || "",
                follow_up_status:
                  track.vachist_details?.follow_up_visit?.followv_status ||
                  "pending",
                age_at_vaccination: track.vachist_details?.vachist_age || "",
                batch_number:
                  track.vachist_details?.vaccine_stock?.batch_number || "",
                expiry_date:
                  track.vachist_details?.vaccine_stock?.inv_details
                    ?.expiry_date || "",
              }));
            allImmunizationTracking.push(...extractedImmunization);
          }

          // Process nutritional status
          const nutritionalStatusFromHistory = history.nutrition_statuses?.[0]
            ? {
                nutstat_id:
                  history.nutrition_statuses[0].nutstat_id?.toString() ||
                  undefined,
                wfa: history.nutrition_statuses[0].wfa || "",
                lhfa: history.nutrition_statuses[0].lhfa || "",
                wfh: history.nutrition_statuses[0].wfl || "",
                muac: history.nutrition_statuses[0].muac
                  ? Number.parseFloat(history.nutrition_statuses[0].muac)
                  : undefined,
                muac_status: history.nutrition_statuses[0].muac_status || "",
                date: history.nutrition_statuses[0].created_at,
                edemaSeverity:
                  history.nutrition_statuses[0].edemaSeverity || "None",
              }
            : null;
          if (nutritionalStatusFromHistory) {
            allHistoricalNutritionalStatuses.push(nutritionalStatusFromHistory);
          }

          // Process BF dates
          const BFdatesFromHistory =
            history.exclusive_bf_checks?.map((check: any) => check.ebf_date) ||
            [];
          allHistoricalBFdates.push(...BFdatesFromHistory);

          // Process supplement statuses
          const supplementStatusesFromHistory: CHSSupplementStat[] =
            history.supplements_statuses?.map((status: any) => ({
              chssupplementstat_id: status.chssupplementstat_id || 0,
              birthwt: status.birthwt || null,
              status_type: status.status_type || "",
              date_seen: status.date_seen || null,
              date_given_iron: status.date_given_iron || null,
              created_at: status.created_at || "",
              updated_at: status.updated_at || "",
              chsupplement: status.chsupplement || null,
              date_completed: status.date_completed || null,
            })) || [];
          allHistoricalSupplementStatuses.push(
            ...supplementStatusesFromHistory
          );

          // Process disabilities
          const disabilitiesFromHistory =
            history.disabilities?.map((d: any) => ({
              id: d.disability_details?.disability_id || "",
              pd_id: Number(d.pd_id) || "",
              status: d.status || "active",
              disability_details: d.disability_details,
            })) || [];
          allPatientHistoricalDisabilities.push(...disabilitiesFromHistory);
        });

        setImmunizationTracking(allImmunizationTracking);
        setHistoricalVitalSigns(allHistoricalVitalSigns);
        setHistoricalMedicines(allHistoricalMedicines);
        setHistoricalNutritionalStatus(allHistoricalNutritionalStatuses);
        setHistoricalBFdates(allHistoricalBFdates);
        setHistoricalSupplementStatuses(allHistoricalSupplementStatuses);
        setPatientHistoricalDisabilities(allPatientHistoricalDisabilities);

        const selectedChhistRecord = chrecRecord.child_health_histories?.find(
          (history: any) => history.chhist_id === Number.parseInt(chhistId)
        );
        if (!selectedChhistRecord) {
          throw new Error(
            `Child health history with ID ${chhistId} not found within chrec ${chrecId}.`
          );
        }

        setApiData(selectedChhistRecord);

        const disabilitiesForSelectedRecord =
          selectedChhistRecord.disabilities?.map((d: any) => ({
            id: d.disability_details?.disability_id || "",
            pd_id: Number(d.pd_id) || "",
            status: d.status || "active",
          })) || [];
        setOriginalDisabilityRecords(disabilitiesForSelectedRecord);

        const latestNote = getLatestNoteForRecord(
          selectedChhistRecord.child_health_notes || []
        );
        setLatestHistoricalNoteContent(latestNote?.chn_notes || "");
        setLatestHistoricalFollowUpDescription(
          latestNote?.followv_details?.followv_description || ""
        );
        setLatestHistoricalFollowUpDate(
          latestNote?.followv_details?.followv_date || ""
        );

        const recordData = transformApiDataToFormData(selectedChhistRecord);
        setFormData(recordData);

        const todaysVitalSign = allHistoricalVitalSigns.find((vital) =>
          isToday(vital.date)
        );
        if (todaysVitalSign) {
          setNewVitalSigns([todaysVitalSign]);
        } else if (recordData.vitalSigns && recordData.vitalSigns.length > 0) {
          setNewVitalSigns(recordData.vitalSigns);
        }

        if (recordData.pat_id) {
          setSelectedPatient({ pat_id: recordData.pat_id } as Patient);
          const patientFullName = `${recordData.childFname || ""} ${
            recordData.childLname || ""
          }`.trim();
          const fullPatientIdString = `${recordData.pat_id}${
            patientFullName ? `,${patientFullName}` : ""
          }`;
          setSelectedPatientId(fullPatientIdString);
        }
      } catch (error) {
        console.error("Error fetching record data:", error);
        setError(
          `Failed to load record data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordData();
  }, [
    chrecId,
    chhistId,
    mode,
    isaddnewchildhealthrecordMode,
    childHealthRecord,
  ]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...data } : (data as FormData)));
  };

  const handleUpdateHistoricalSupplementStatus = (
    updatedStatuses: CHSSupplementStat[]
  ) => {
    const updatedStatusMap = new Map(
      updatedStatuses.map((status) => [status.chssupplementstat_id, status])
    );

    const mergedStatuses = historicalSupplementStatuses.map((status) => {
      const updatedStatus = updatedStatusMap.get(status.chssupplementstat_id);
      return updatedStatus ? updatedStatus : status;
    });

    setHistoricalSupplementStatuses(mergedStatuses);
  };

  const handleSubmit = async (submittedData: FormData) => {
    console.log("Form data:", submittedData);
    console.log("Original record from main:", apiData);
    console.log("Supplement statuses to submit:", historicalSupplementStatuses);
    
    setIsSubmitting(true);
    setError(null);
    try {
      const dataToSubmit = {
        ...submittedData,
        vitalSigns: newVitalSigns,
        historicalSupplementStatuses: historicalSupplementStatuses,
      };

      if (isNewchildhealthrecord) {
        await newchildhealthrecordMutation.mutateAsync({
          submittedData: dataToSubmit,
          staff: staffId || null,
        });
      } else {
        await updatechildhealthrecordmutation.mutateAsync({
          submittedData: dataToSubmit,
          staff: staffId || null,
          todaysHistoricalRecord: historicalVitalSigns.find((vital) =>
            isToday(vital.date)
          ),
          originalRecord: apiData,
          originalDisabilityRecords: originalDisabilityRecords,
        });
      }

      setFormData(initialFormData);
      setCurrentPage(1);
      setSelectedPatient(null);
      setSelectedPatientId("");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        `Failed to submit form: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isRecordLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-gray-500">Loading record data...</div>
      </div>
    );
  }

  if (error || recordError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error || recordError?.message}</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (isaddnewchildhealthrecordMode && !formData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="text-red-500">No record data available to edit</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <>
      <div className=" flex flex-col gap-4 sm:flex-row">
        <Button
          className="self-start p-2 text-black"
          variant={"outline"}
          onClick={() => {
            setFormData(initialFormData);
            setCurrentPage(1);
            navigate(-1);
            setSelectedPatient(null);
            setSelectedPatientId("");
          }}
        >
          <ChevronLeft />
        </Button>
        <div className="mb-4 flex-col items-center">
          <h1 className="text-xl font-semibold text-darkBlue2 sm:text-2xl">
            Child Health Record
          </h1>
          <p className="text-xs text-darkGray sm:text-sm">
            Manage and view child's health record for {formData.childFname}{" "}
            {formData.childLname}
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <CardLayout
        cardClassName="px-4"
        contentClassName="space-y-6"
        title={""}
        content={
          <div>
            {currentPage === 1 && (
              <ChildHRPage1
                onNext={() => setCurrentPage(2)}
                updateFormData={updateFormData}
                formData={formData}
                mode={mode || "newchildhealthrecord"}
                selectedPatient={selectedPatient}
                setSelectedPatient={setSelectedPatient}
                selectedPatientId={selectedPatientId}
                setSelectedPatientId={setSelectedPatientId}
              />
            )}
            {currentPage === 2 && (
              <ChildHRPage2
                onPrevious={() => setCurrentPage(1)}
                onNext={() => setCurrentPage(3)}
                updateFormData={updateFormData}
                formData={formData}
                historicalBFdates={historicalBFdates}
                patientHistoricalDisabilities={patientHistoricalDisabilities}
                mode={mode || "newchildhealthrecord"}
              />
            )}
            {currentPage === 3 && (
              <ChildHRPage3
                onPrevious={() => setCurrentPage(2)}
                onNext={() => setCurrentPage(4)}
                immunizationTracking={immunizationTracking}
              />
            )}
            {currentPage === 4 && (
              <LastPage
                onPrevious={() => setCurrentPage(3)}
                onSubmit={handleSubmit}
                updateFormData={updateFormData}
                formData={formData}
                historicalVitalSigns={historicalVitalSigns}
                historicalNutritionalStatus={historicalNutritionalStatus}
                historicalSupplementStatuses={historicalSupplementStatuses}
                onUpdateHistoricalSupplementStatus={
                  handleUpdateHistoricalSupplementStatus
                }
                latestHistoricalNoteContent={latestHistoricalNoteContent}
                latestHistoricalFollowUpDescription={
                  latestHistoricalFollowUpDescription
                }
                latestHistoricalFollowUpDate={latestHistoricalFollowUpDate}
                historicalMedicines={historicalMedicines}
                mode={mode || "newchildhealthrecord"}
                isSubmitting={isSubmitting}
                newVitalSigns={newVitalSigns}
                setNewVitalSigns={setNewVitalSigns}
              />
            )}
          </div>
        }
      />
    </>
  );
}