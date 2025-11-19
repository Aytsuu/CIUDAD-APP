"use client";

import { useEffect, useState } from "react";
import { useFormContext, type UseFormReturn } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";

// all components
import { type z } from "zod";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { AgeCalculation } from "@/helpers/ageCalculator";

// health components
import { IllnessCombobox } from "../../maternal-components/illness-combobox";
import { PatientSearch } from "@/components/ui/patientSearch";
import type { Patient } from "@/pages/record/health/patientsRecord/patient-types";

// icons import
import { MdOutlineSick } from "react-icons/md";
import { FaRegHospital } from "react-icons/fa";

// schema import
import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema";

// fetch queries
import {
  usePrenatalPatientMedHistory,
  usePrenatalPatientObsHistory,
  usePrenatalPatientPrevHospitalization,
  usePrenatalPatientBodyMeasurement,
  useLatestPatientPrenatalRecord,
  usePatientTTStatus,
  useIllnessList,
} from "../../queries/maternalFetchQueries";
// import { fetchVaccinesWithStock } from "@/pages/healthServices/vaccination/queries/fetch" // temporarily paused for some reasons

// create queries
import { useAddIllnessData } from "../../queries/maternalAddQueries";
import { showErrorToast } from "@/components/ui/toast";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Trash } from "lucide-react";

interface AogResult {
  weeks: number;
  days: number;
}

// capitalization tailored for adding illness
const capitalize = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

type previousIllness = {
  prevIllness: string;
  prevIllnessYr?: number;
  ill_id?: number;
  created_at?: string;
};

type previousHospitalization = {
  prevHospitalization: string;
  prevHospitalizationYr?: number;
};

export default function PrenatalFormFirstPg({
  form,
  onSubmit,
  isFromIndividualRecord = false,
  preselectedPatient = null,
  activePregnancyId = null,
}: {
  form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>;
  onSubmit: () => void;
  isFromIndividualRecord?: boolean;
  preselectedPatient?: Patient | null;
  activePregnancyId?: string | null;
}) {
  const { control, trigger, setValue, getValues, watch } = useFormContext<z.infer<typeof PrenatalFormSchema>>();
  const [prevIllnessData, setPrevIllnessData] = useState<previousIllness[]>([]);
  const [prevHospitalizationData, setPrevHospitalizationData] = useState<previousHospitalization[]>([]);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatIdDisplay, setSelectedPatIdDisplay] = useState<string>("");
  const [selectedIllnessId, setSelectedIllnessId] = useState<string>("");

  // patient data fetching
  const { data: illnessesData, refetch: illnessesRefetch } = useIllnessList(); // illness list
  const { data: medHistoryData, isLoading, error } = usePrenatalPatientMedHistory(selectedPatientId); //medical history
  const { data: prevHospData, isLoading: prevHospLoading, error: prevHospError } = usePrenatalPatientPrevHospitalization(selectedPatientId); //previous hospitalization
  const { data: obsHistoryData, isLoading: obsLoading } = usePrenatalPatientObsHistory(selectedPatientId); //obstetric history
  const { data: bodyMeasurementData, isLoading: bmLoading } = usePrenatalPatientBodyMeasurement(selectedPatientId); //body measurement
  const { data: ttStatusData, isLoading: ttStatusLoading } = usePatientTTStatus(selectedPatientId); //tt status
  const { data: latestPrenatalData, isLoading: latestPrenatalLoading } = useLatestPatientPrenatalRecord(isFromIndividualRecord ? selectedPatientId : "" ); //latest prenatal record

  // add mutation hook
  const addIllnessMutation = useAddIllnessData();

  // lg babies watchers
  const hasLgBabies = watch("obstetricHistory.historyOfLBabiesStr");
  const lgBabiesCount = watch("obstetricHistory.historyOfLBabies");

  // next button handler with validation
  const handleNext = async () => {
    const isValid = await trigger([
      "pat_id", // Ensure patient ID is validated
      "motherPersonalInfo.familyNo",
      "motherPersonalInfo.motherLName",
      "motherPersonalInfo.motherFName",
      "motherPersonalInfo.motherDOB",
      "motherPersonalInfo.motherAge",
      "motherPersonalInfo.address.street",
      "motherPersonalInfo.address.sitio",
      "motherPersonalInfo.address.barangay",
      "motherPersonalInfo.address.city",
      "motherPersonalInfo.address.province",
      "motherPersonalInfo.motherWt",
      "motherPersonalInfo.motherHt",
      "motherPersonalInfo.motherBMI",
      "motherPersonalInfo.motherBMICategory",
      "obstetricHistory.noOfChBornAlive",
      "obstetricHistory.noOfLivingCh",
      "obstetricHistory.noOfAbortion",
      "obstetricHistory.noOfStillBirths",
      "obstetricHistory.historyOfLBabies",
      "obstetricHistory.historyOfDiabetes",
    ]);
    console.log("Page 1 validation result:", isValid);

    if (isValid) {
      console.log("Form is valid, proceeding to next page");
      onSubmit();
    } else {
      console.log("Form validation failed. Errors:", form.formState.errors);
      // Scroll to the first error if validation fails
      const firstErrorElement = document.querySelector('[data-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  // populate with the preselected patient if available
  useEffect(() => {
    if (isFromIndividualRecord && preselectedPatient) {
      setSelectedPatientId(preselectedPatient.pat_id);

      const displayFormat = `${preselectedPatient.pat_id}, ${
        preselectedPatient?.personal_info?.per_lname
      }, ${preselectedPatient?.personal_info?.per_fname} ${
        preselectedPatient?.personal_info?.per_mname || ""
      }`.trim();
      setSelectedPatIdDisplay(displayFormat);

      handlePatientSelection(preselectedPatient, preselectedPatient.pat_id);
    }
  }, [isFromIndividualRecord, preselectedPatient, activePregnancyId]);

  // use to populate form with latest prenatal data if available
  useEffect(() => {
    const latestPF = latestPrenatalData?.latest_prenatal_form;

    if (
      isFromIndividualRecord &&
      latestPrenatalData &&
      !latestPrenatalLoading
    ) {
      form.setValue("pregnancy_id", latestPrenatalData.pregnancy_id || "");

      if (latestPF?.spouse_details?.spouse_info) {
        const residentSpouse = latestPF?.spouse_details?.spouse_info;
        form.setValue("motherPersonalInfo.husbandLName", residentSpouse?.per_lname || "");
        form.setValue("motherPersonalInfo.husbandFName", residentSpouse?.per_fname || "");
        form.setValue("motherPersonalInfo.husbandMName", residentSpouse?.per_mname || "");
        form.setValue("motherPersonalInfo.husbandDob", residentSpouse?.per_dob || "");
        form.setValue("motherPersonalInfo.occupation", residentSpouse?.spouse_occupation?.toUpperCase() || latestPF?.pf_occupation?.toUpperCase() || "");
      } else {
        form.setValue("motherPersonalInfo.husbandLName", latestPF.spouse_details.spouse_lname || "");
        form.setValue("motherPersonalInfo.husbandFName", latestPF.spouse_details.spouse_fname || "");
        form.setValue("motherPersonalInfo.husbandMName", latestPF.spouse_details.spouse_mname || "");
        form.setValue("motherPersonalInfo.husbandDob", latestPF.spouse_details.spouse_dob || "");
        form.setValue("motherPersonalInfo.occupation", latestPF.spouse_details.spouse_occupation || latestPF.pf_occupation || "");
      }

      if (latestPF && activePregnancyId) {
        form.setValue("medicalHistory.previousComplications", latestPF.previous_complications || "");
        form.setValue("presentPregnancy.pf_edc", latestPF.pf_edc || "");
        form.setValue("followUpSchedule.aogWeeks", latestPF.prenatal_care_entries[0]?.pfpc_aog_wks || "");
        form.setValue("followUpSchedule.aogDays", latestPF.prenatal_care_entries[0]?.pfpc_aog_days || "");

        if (latestPF.body_measurement_details) {
          const bodyMeasurement = latestPF.body_measurement_details;
          form.setValue("motherPersonalInfo.motherWt", bodyMeasurement.weight || "");
          form.setValue("motherPersonalInfo.motherHt", bodyMeasurement.height || "");
        }

        if (latestPF.previous_pregnancy) {
          const prevPregnancy = latestPF.previous_pregnancy;
          form.setValue("previousPregnancy.dateOfDelivery", prevPregnancy.date_of_delivery || "");
          form.setValue("previousPregnancy.outcome", prevPregnancy.outcome || "");
          form.setValue("previousPregnancy.typeOfDelivery", prevPregnancy.type_of_delivery || "");
          form.setValue("previousPregnancy.babysWt", prevPregnancy.babys_wt || "");
          form.setValue("previousPregnancy.gender", prevPregnancy.gender || "");
          form.setValue("previousPregnancy.ballardScore", prevPregnancy.ballard_score || "");
          form.setValue("previousPregnancy.apgarScore", prevPregnancy.apgar_score || "");
        }

        // checklist
        if (latestPF.checklist_data) {
          const checklist = latestPF.checklist_data;
          form.setValue("assessmentChecklist.increasedBP", checklist.increased_bp);
          form.setValue("assessmentChecklist.epigastricPain", checklist.epigastric_pain);
          form.setValue("assessmentChecklist.nausea", checklist.nausea);
          form.setValue("assessmentChecklist.blurringOfVision", checklist.blurring_of_vision);
          form.setValue("assessmentChecklist.edema", checklist.edema);
          form.setValue("assessmentChecklist.severeHeadache", checklist.severe_headache);
          form.setValue("assessmentChecklist.abnormalVaginalDischarges", checklist.abnormal_vaginal_discharges);
          form.setValue("assessmentChecklist.vaginalBleeding", checklist.vaginal_bleeding);
          form.setValue("assessmentChecklist.chillsFever", checklist.chills_fever);
          form.setValue("assessmentChecklist.diffInBreathing", checklist.diff_in_breathing);
          form.setValue("assessmentChecklist.varicosities", checklist.varicosities);
          form.setValue("assessmentChecklist.abdominalPain", checklist.abdominal_pain);
        }

        // risk codes
        if (latestPF.obstetric_risk_codes) {
          const riskCodes = latestPF.obstetric_risk_codes;
          form.setValue("riskCodes.hasOneOrMoreOfTheFF.prevCaesarian", riskCodes.pforc_prev_c_section);
          form.setValue("riskCodes.hasOneOrMoreOfTheFF.miscarriages", riskCodes.pforc_3_consecutive_miscarriages);
          form.setValue("riskCodes.hasOneOrMoreOfTheFF.postpartumHemorrhage", riskCodes.pforc_postpartum_hemorrhage);
        }

        // birth plan
        if (latestPF.birth_plan_details) {
          const birthPlan = latestPF.birth_plan_details;
          form.setValue(
            "pregnancyPlan.planPlaceOfDel",
            birthPlan.place_of_delivery_plan
          );
          form.setValue(
            "pregnancyPlan.planNewbornScreening",
            birthPlan.newborn_screening_plan
          );
        }

        if (latestPF?.laboratory_results) {
          form.setValue(
            "labResults.labResultsData",
            latestPF.laboratory_results
          );
        }
      }
    }
  }, [
    latestPrenatalData,
    latestPrenatalLoading,
    isFromIndividualRecord,
    activePregnancyId,
    form,
  ]);

  // Automatically calculate AOG when LMP changes
  useEffect(() => {
    const lmpValue = form.getValues("presentPregnancy.pf_lmp");
    if (lmpValue) {
      const lmpDate = new Date(lmpValue);
      if (!isNaN(lmpDate.getTime())) {
        const { weeks, days } = calculateAog(lmpDate);
        setValue("followUpSchedule.aogWeeks", weeks);
        setValue("followUpSchedule.aogDays", days);
      } else {
        setValue("followUpSchedule.aogWeeks", undefined);
        setValue("followUpSchedule.aogDays", undefined);
      }
    } else {
      setValue("followUpSchedule.aogWeeks", undefined);
      setValue("followUpSchedule.aogDays", undefined);
    }
  }, [form.watch("presentPregnancy.pf_lmp"), setValue]);

  function calculateAog(lmp: Date, currentDate: Date = new Date()): AogResult {
    const diffMs = currentDate.getTime() - lmp.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    return { weeks, days };
  }

  const handlePatientSelection = (
    patient: Patient | null,
    patientId: string
  ) => {
    setSelectedPatIdDisplay(patientId);

    if (!patient) {
      setSelectedPatientId("");

      setValue("pat_id", "");
      setValue("motherPersonalInfo.familyNo", "N/A");

      form.reset({
        pat_id: "",
        motherPersonalInfo: {
          familyNo: "",
          motherLName: "",
          motherFName: "",
          motherMName: "",
          motherAge: "",
          motherDOB: "",
          husbandLName: "",
          husbandFName: "",
          husbandMName: "",
          husbandDob: "",
          occupation: "",
          address: {
            street: "",
            sitio: "",
            barangay: "",
            city: "",
            province: "",
          },
          motherWt: undefined,
          motherHt: undefined,
          motherBMI: undefined,
          motherBMICategory: undefined,
        },
        obstetricHistory: {
          noOfChBornAlive: 0,
          noOfLivingCh: 0,
          noOfAbortion: 0,
          noOfStillBirths: 0,
          historyOfLBabies: 0,
          historyOfLBabiesStr: undefined,
          historyOfDiabetes: undefined,
        },
        medicalHistory: {
          prevIllness: "",
          prevIllnessYr: undefined,
          prevIllnessData: [],
          prevHospitalization: "",
          prevHospitalizationYr: undefined,
          prevHospitalizationData: [],
        },
        previousPregnancy: {
          dateOfDelivery: "",
          outcome: "",
          typeOfDelivery: "",
          babysWt: undefined,
          gender: "",
          ballardScore: undefined,
          apgarScore: undefined,
        },
        prenatalVaccineInfo: {
          vaccineType: "",
          ttStatus: "",
          ttDateGiven: "",
          isTDAPAdministered: false,
        },
        presentPregnancy: {
          gravida: undefined,
          para: undefined,
          fullterm: undefined,
          preterm: undefined,
          pf_lmp: "",
          pf_edc: "",
        },
        labResults: {
          lab_type: undefined,
          resultDate: "",
          toBeFollowed: false,
          documentPath: "",
          labRemarks: "",
          labResultsData: [],
        },
        followUpSchedule: {
          followUpDate: "",
          aogWeeks: undefined,
          aogDays: undefined,
        },
        ancVisits: {
          firstTri: "",
          secondTri: "",
          thirdTriOne: "",
          thirdTriTwo: "",
        },
        assessmentChecklist: {
          increasedBP: undefined,
          epigastricPain: undefined,
          nausea: undefined,
          blurringOfVision: undefined,
          edema: undefined,
          severeHeadache: undefined,
          abnormalVaginalDischarges: undefined,
          vaginalBleeding: undefined,
          chillsFever: undefined,
          diffInBreathing: undefined,
          varicosities: undefined,
          abdominalPain: undefined,
        },
        pregnancyPlan: {
          planPlaceOfDel: undefined,
          planNewbornScreening: undefined,
        },
        riskCodes: {
          hasOneOrMoreOfTheFF: {
            prevCaesarian: undefined,
            miscarriages: undefined,
            postpartumHemorrhage: undefined,
          },
          hasOneOrMoreOneConditions: {
            tuberculosis: undefined,
            heartDisease: undefined,
            diabetes: undefined,
            bronchialAsthma: undefined,
            goiter: undefined,
          },
        },
        assessedBy: { name: "", id: "" },
        prenatalCare: [],
      });

      return;
    }

    if (patient && patient.personal_info) {
      setSelectedPatientId(patient.pat_id.toString());

      const patientRole = patient.family?.fc_role;
      const personalInfo = patient?.personal_info;
      const address = patient.address;
      const father =
        patient.family_head_info?.family_heads?.father?.personal_info;
      const spouse = patient.spouse_info?.spouse_info;

      setValue("pat_id", patient.pat_id.toString());
      setValue("motherPersonalInfo.familyNo", patient.family?.fam_id || "");
      setValue("motherPersonalInfo.motherLName", personalInfo?.per_lname || "");
      setValue("motherPersonalInfo.motherFName", personalInfo?.per_fname || "");
      setValue("motherPersonalInfo.motherMName", personalInfo?.per_mname || "");
      setValue(
        "motherPersonalInfo.motherAge",
        AgeCalculation(personalInfo?.per_dob || "").toLocaleString()
      );
      setValue("motherPersonalInfo.motherDOB", personalInfo?.per_dob || "");

      if (address) {
        setValue(
          "motherPersonalInfo.address.street",
          address.add_street || "None"
        );
        setValue(
          "motherPersonalInfo.address.sitio",
          address.add_sitio || "None"
        );
        setValue(
          "motherPersonalInfo.address.barangay",
          address.add_barangay || "None"
        );
        setValue("motherPersonalInfo.address.city", address.add_city || "None");
        setValue(
          "motherPersonalInfo.address.province",
          address.add_province || "None"
        );
      } else {
        setValue("motherPersonalInfo.address.street", "Unknown");
        setValue("motherPersonalInfo.address.sitio", "Unknown");
        setValue("motherPersonalInfo.address.barangay", "Unknown");
        setValue("motherPersonalInfo.address.city", "Unknown");
        setValue("motherPersonalInfo.address.province", "Unknown");
      }

      if (patientRole === "Mother") {
        if (father) {
          setValue("motherPersonalInfo.husbandLName", father.per_lname || "");
          setValue("motherPersonalInfo.husbandFName", father.per_fname || "");
          setValue("motherPersonalInfo.husbandMName", father.per_mname || "");
          setValue("motherPersonalInfo.husbandDob", father.per_dob || "");
        } else if (spouse) {
          setValue(
            "motherPersonalInfo.husbandLName",
            spouse.spouse_lname || ""
          );
          setValue(
            "motherPersonalInfo.husbandFName",
            spouse.spouse_fname || ""
          );
          setValue(
            "motherPersonalInfo.husbandMName",
            spouse.spouse_mname || ""
          );
          setValue("motherPersonalInfo.husbandDob", spouse.spouse_dob || "");
          setValue(
            "motherPersonalInfo.occupation",
            spouse.spouse_occupation || ""
          );
        } else {
          setValue("motherPersonalInfo.husbandLName", "");
          setValue("motherPersonalInfo.husbandFName", "");
          setValue("motherPersonalInfo.husbandMName", "");
          setValue("motherPersonalInfo.husbandDob", "");
        }
      } else {
        if (spouse) {
          setValue(
            "motherPersonalInfo.husbandLName",
            spouse.spouse_lname || ""
          );
          setValue(
            "motherPersonalInfo.husbandFName",
            spouse.spouse_fname || ""
          );
          setValue(
            "motherPersonalInfo.husbandMName",
            spouse.spouse_mname || ""
          );
          setValue("motherPersonalInfo.husbandDob", spouse.spouse_dob || "");
          setValue(
            "motherPersonalInfo.occupation",
            spouse.spouse_occupation || ""
          );
        } else {
          setValue("motherPersonalInfo.husbandLName", "");
          setValue("motherPersonalInfo.husbandFName", "");
          setValue("motherPersonalInfo.husbandMName", "");
          setValue("motherPersonalInfo.husbandDob", "");
          setValue("motherPersonalInfo.occupation", "");
        }
      }
    }
  };

  const handleAddNewIllness = async (newIllness: string) => {
    try {
      const IllnessData = {
        illname: capitalize(newIllness),
      };

      await addIllnessMutation.mutateAsync(IllnessData);

      await illnessesRefetch();

      setValue("medicalHistory.prevIllness", newIllness);
      setSelectedIllnessId("");
    } catch (error) {
      showErrorToast("Failed to add illness");
    }
  };

  useEffect(() => {
    const restoreSelection = () => {
      const formPatId = form.getValues("pat_id");

      if (formPatId && !selectedPatientId) {
        setSelectedPatientId(formPatId);

        const motherFName = form.getValues("motherPersonalInfo.motherFName");
        const motherLName = form.getValues("motherPersonalInfo.motherLName");
        const motherMName = form.getValues("motherPersonalInfo.motherMName");

        if (motherFName && motherLName) {
          const displayFormat = `${formPatId}, ${motherLName}, ${motherFName} ${
            motherMName || ""
          }`.trim();
          setSelectedPatIdDisplay(displayFormat);
          // console.log(selectedPatIdDisplay)
        } else {
          setSelectedPatIdDisplay(formPatId);
        }
      }
    };

    restoreSelection();
  }, [form, selectedPatientId]);

  // body measurement fetching
  useEffect(() => {
    const currBodyMeasurement = bodyMeasurementData?.body_measurement;

    if (currBodyMeasurement && !bmLoading) {
      setValue(
        "motherPersonalInfo.motherWt",
        currBodyMeasurement.weight || undefined
      );
      setValue(
        "motherPersonalInfo.motherHt",
        currBodyMeasurement.height || undefined
      );
    }
  }, [bodyMeasurementData, bmLoading, setValue]);

  const BMweight = bodyMeasurementData?.body_measurement.weight;
  const BMheight = bodyMeasurementData?.body_measurement.height;

  // ph date and ph time //
  const created_at = bodyMeasurementData?.body_measurement?.created_at;
  const date = new Date(created_at);

  const phDate = date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  // obstetric history fetching
  useEffect(() => {
    const currObs = obsHistoryData?.obstetrical_history;

    if (obsHistoryData && !obsLoading) {
      setValue("obstetricHistory.noOfChBornAlive", currObs?.obs_ch_born_alive || 0);
      setValue("obstetricHistory.noOfLivingCh", currObs?.obs_living_ch || 0);
      setValue("obstetricHistory.noOfAbortion", currObs?.obs_abortion || 0);
      setValue("obstetricHistory.noOfStillBirths", currObs?.obs_still_birth || 0);
      setValue("obstetricHistory.historyOfLBabiesStr", currObs?.obs_lg_babies_str || false);
      setValue("obstetricHistory.historyOfLBabies", currObs?.obs_lg_babies || 0);
      setValue("presentPregnancy.gravida", currObs?.obs_gravida || 0);
      setValue("presentPregnancy.para", currObs?.obs_para || 0);
      setValue("presentPregnancy.fullterm", currObs?.obs_fullterm || 0);
      setValue("presentPregnancy.preterm", currObs?.obs_preterm || 0);
      setValue("presentPregnancy.pf_lmp", currObs?.obs_lmp || "");
    } else {
      setValue("obstetricHistory.noOfChBornAlive", undefined);
      setValue("obstetricHistory.noOfLivingCh", undefined);
      setValue("obstetricHistory.noOfAbortion", undefined);
      setValue("obstetricHistory.noOfStillBirths", undefined);
      setValue("obstetricHistory.historyOfLBabies", undefined);
      setValue("obstetricHistory.historyOfLBabiesStr", false);
      setValue("presentPregnancy.gravida", undefined);
      setValue("presentPregnancy.para", undefined);
      setValue("presentPregnancy.fullterm", undefined);
      setValue("presentPregnancy.preterm", undefined);
    }
  }, [obsHistoryData, obsLoading, setValue]);

  // illness fetching
  const getIllnessOptions = () => {
    if (!illnessesData?.illnesses) return [];

    return illnessesData.illnesses.map((illness: any) => ({
      id: illness.ill_id?.toString() || "",
      name: illness.illname || "None",
    }));
  };

  // medical history fetching
  useEffect(() => {
    const existingFormData = form.getValues("medicalHistory.prevIllnessData") || [];
    
    if (existingFormData.length > 0 && prevIllnessData.length === 0) {
      setPrevIllnessData(
        existingFormData.map((item: any) => ({
          ...item,
          ill_id: item.ill_id === null ? undefined : item.ill_id,
        }))
      );
      return;
    }

    if (medHistoryData && !isLoading && !error && existingFormData.length === 0) {
      const historyList = medHistoryData?.medical_history || medHistoryData || [];

      if (historyList?.length > 0) {
        const mappedData = historyList.map((history: any) => ({
          prevIllness: history.illness_name || history.ill?.illname || "N/A",
          prevIllnessYr: history.ill_date ? history.ill_date : undefined,
          ill_id: history.ill || null,
        }));

        // update only if the data has changed
        if (JSON.stringify(mappedData) !== JSON.stringify(prevIllnessData)) {
          setPrevIllnessData(mappedData);
          setValue("medicalHistory.prevIllnessData", mappedData);
        }
      }
    }
  }, [medHistoryData, isLoading, error, setValue, form]);

  const getPrevIllnessTableData = () => {
    return prevIllnessData
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .map((item) => ({
        prevIllness: item.prevIllness || "None",
        prevIllnessYr: item.prevIllnessYr,
      }));
  };

  // check if diabetes is in previous illness to automate Diabetes radio button
  useEffect(() => {
    const hasDiabetes = prevIllnessData.some(
      (illness) => illness.prevIllness.toLowerCase() === "diabetes"
    );
    setValue("obstetricHistory.historyOfDiabetes", hasDiabetes ? true : false);
    setValue(
      "riskCodes.hasOneOrMoreOneConditions.diabetes",
      hasDiabetes ? true : false
    );
  });

  // check if bronchial asthma is in previous illness to automate Bronchial Asthma radio button
  useEffect(() => {
    const hasBronchialAsthma = prevIllnessData.some(
      (illness) => illness.prevIllness.toLowerCase() === "bronchial asthma"
    );
    setValue(
      "riskCodes.hasOneOrMoreOneConditions.bronchialAsthma",
      hasBronchialAsthma ? true : false
    );
  });

  // check if goiter is in previous illness to automate Goiter radio button
  useEffect(() => {
    const hasGoiter = prevIllnessData.some(
      (illness) => illness.prevIllness.toLowerCase() === "goiter"
    );
    setValue(
      "riskCodes.hasOneOrMoreOneConditions.goiter",
      hasGoiter ? true : false
    );
  });

  // check if tuberculosis is in previous illness to automate Tuberculosis radio button
  useEffect(() => {
    const hasTuberculosis = prevIllnessData.some(
      (illness) => illness.prevIllness.toLowerCase() === "tuberculosis"
    );
    setValue(
      "riskCodes.hasOneOrMoreOneConditions.tuberculosis",
      hasTuberculosis ? true : false
    );
  });

  // check if any heart disease is in previous illness to automate Heart Disease radio button
  useEffect(() => {
    const heartDiseaseVariants = [
      "heart disease",
      "coronary artery disease",
      "cad",
      "stroke",
      "cerebrovascular disease",
      "heart failure",
      "arrhythmias",
      "arrhythmia",
      "heart valve disease",
      "hypertensive heart disease",
      "peripheral artery disease",
      "pad",
      "cardiomyopathies",
      "cardiomyopathy",
      "rheumatic heart disease",
      "rhd",
      "transthyretin amyloid cardiomyopathy",
      "attr-cm",
      "kawasaki disease",
      "chagas disease",
      "arrhythmogenic right ventricular dysplasia",
      "arvd"
    ];
    
    const hasHeartDisease = prevIllnessData.some((illness) =>
      heartDiseaseVariants.some((variant) =>
        illness.prevIllness.toLowerCase().includes(variant)
      )
    );
    
    setValue(
      "riskCodes.hasOneOrMoreOneConditions.heartDisease",
      hasHeartDisease ? true : false
    );
  });

  // previous hospitalization data fetching
  useEffect(() => {
    const existingFormData =
      form.getValues("medicalHistory.prevHospitalizationData") || [];
    if (existingFormData.length > 0 && prevHospitalizationData.length === 0) {
      setPrevHospitalizationData(existingFormData);
      return;
    }

    if (prevHospData && !prevHospLoading && !prevHospError && existingFormData.length === 0) {
      const prevHospList = prevHospData?.previous_hospitalization || prevHospData || [];

      if (prevHospList?.length > 0) {
        const mappedData = prevHospList.map((phHistory: any) => ({
          prevHospitalization: phHistory.prev_hospitalization || "None",
          prevHospitalizationYr: phHistory.prev_hospitalization_year
            ? phHistory.prev_hospitalization_year
            : undefined,
        }));

        if (
          JSON.stringify(mappedData) !==
            JSON.stringify(prevHospitalizationData) &&
          JSON.stringify(mappedData) !== JSON.stringify(existingFormData)
        ) {
          setPrevHospitalizationData(mappedData);
          setValue("medicalHistory.prevHospitalizationData", mappedData);
        }
      } else {
        setPrevHospitalizationData([]);
      }
    }
  }, [prevHospData, prevHospLoading, prevHospError, setValue, form]);

  const getPrevHospitalizationTableData = () => {
    return prevHospitalizationData.map((item) => ({
      prevHospitalization: item.prevHospitalization || "None",
      prevHospitalizationYr: item.prevHospitalizationYr,
    }));
  };

  // tt status data fetching
  useEffect(() => {
    const ttStatus = ttStatusData?.tt_status;
    if (ttStatus && !ttStatusLoading && ttStatus?.length > 0) {
      const ttRecords = ttStatus?.map((tt: any) => ({
        ttStatus: tt.tts_status,
        ttDateGiven: tt.tts_date_given,
        isTDAPAdministered: tt.tts_tdap === true ? true : false,
        // vaccineType: tt.vaccine_type,
      }));
      setValue("prenatalVaccineInfo.ttRecordsHistory", ttRecords);
    } else {
      setValue("prenatalVaccineInfo.ttRecordsHistory", []);
    }
  }, [ttStatusData, form]);

  // illness column definition
  const illnessColumn: ColumnDef<previousIllness>[] = [
    {
      accessorKey: "prevIllness",
      header: "Previous Illness",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.prevIllness}</div>
        </div>
      ),
    },
    {
      accessorKey: "prevIllnessYr",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">
            {row.original.prevIllnessYr || "Not known"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const isDialogOpen = openRowId === row.original.prevIllness;

        return (
          <div className="flex justify-center">
            <DialogLayout
              isOpen={isDialogOpen}
              onOpenChange={(open) =>
                setOpenRowId(open ? row.original.prevIllness : null)
              }
              trigger={
                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                  <Trash className="w-4 h-4" />
                </div>
              }
              className=""
              title="Delete Record"
              description={`Are you sure you want to delete "${row.original.prevIllness}" record?`}
              mainContent={
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => setOpenRowId(null)}
                    variant={"outline"}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      const newData = prevIllnessData.filter(
                        (item) =>
                          item.prevIllness !== row.original.prevIllness ||
                          item.prevIllnessYr !== row.original.prevIllnessYr
                      );
                      setPrevIllnessData(newData);
                      setValue("medicalHistory.prevIllnessData", newData);
                      setValue("medicalHistory.prevIllness", "");
                      setOpenRowId(null);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              }
            />
          </div>
        );
      },
    },
  ];

  const hospitalizationColumn: ColumnDef<previousHospitalization>[] = [
    {
      accessorKey: "prevHospitalization",
      header: "Previous Hospitalization",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full break-words">
            {row.original.prevHospitalization}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "prevHospitalizationYr",
      header: "Year",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">
            {row.original.prevHospitalizationYr || "Not known"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const isDialogOpen = openRowId === row.original.prevHospitalization;

        return (
          <div className="flex justify-center gap-2">
            <DialogLayout
              isOpen={isDialogOpen}
              onOpenChange={(open) =>
                setOpenRowId(open ? row.original.prevHospitalization : null)
              }
              trigger={
                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                  {" "}
                  <Trash size={16} />
                </div>
              }
              className=""
              title="Delete Record"
              description={`Are you sure you want to delete this previous hospitalization record?`}
              mainContent={
                <div className="flex gap-2 justify-end">
                  <Button variant={"outline"}>Cancel</Button>
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      const newData = prevHospitalizationData.filter(
                        (item) =>
                          item.prevHospitalization !==
                            row.original.prevHospitalization ||
                          item.prevHospitalizationYr !==
                            row.original.prevHospitalizationYr
                      );
                      setPrevHospitalizationData(newData);
                      setValue(
                        "medicalHistory.prevHospitalizationData",
                        newData
                      );
                      setOpenRowId(null);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              }
            />
          </div>
        );
      },
    },
  ];

  // functionality to handle adding of previous illness
  const addPrevIllness = () => {
    const illness = getValues("medicalHistory.prevIllness");
    let year = getValues("medicalHistory.prevIllnessYr");

    if (!illness.trim()) {
      showErrorToast("Please enter an illness.");
      return;
    }

    // If year is not provided, use current year
    if (!year) {
      year = new Date().getFullYear();
    }

    // Check for duplicates
    const isDuplicateIllness = prevIllnessData.some(
      (existingIllness) =>
        existingIllness.prevIllness.toLowerCase().trim() ===
          illness.toLowerCase().trim() && existingIllness.prevIllnessYr === year
    );

    if (isDuplicateIllness) {
      showErrorToast("This illness record already exists.");
      return;
    }

    const selectedillnessData = illnessesData?.illnesses?.find(
      (ill: any) => ill.illname === illness
    );

    const newIllness: previousIllness = {
      prevIllness: illness,
      prevIllnessYr: year,
      ill_id: selectedillnessData?.ill_id || null,
    };

    const updatedData = [...prevIllnessData, newIllness];
    setPrevIllnessData(updatedData);

    setValue("medicalHistory.prevIllnessData", updatedData);

    // clear form fields
    setValue("medicalHistory.prevIllness", "");
    setValue("medicalHistory.prevIllnessYr", undefined);
    setSelectedIllnessId("");
  };

  // functionality to handle adding of previous hopsitalization to table
  const addPrevHospitalization = () => {
    const hospitalization = getValues("medicalHistory.prevHospitalization");
    let hospitalizationYr = getValues("medicalHistory.prevHospitalizationYr");

    if (!hospitalization?.trim()) {
      showErrorToast("Please enter a hospitalization record.");
      return;
    }

    if (!hospitalizationYr) {
      hospitalizationYr = new Date().getFullYear();
    }

    // Check for duplicates
    const isDuplicateHospitalization = prevHospitalizationData.some(
      (existingHosp) =>
        existingHosp.prevHospitalization.toLowerCase().trim() ===
          hospitalization.toLowerCase().trim() &&
        existingHosp.prevHospitalizationYr === hospitalizationYr
    );

    if (isDuplicateHospitalization) {
      showErrorToast("This hospitalization record already exists.");
      return;
    }

    const newData = [
      ...prevHospitalizationData,
      {
        prevHospitalization: hospitalization,
        prevHospitalizationYr: hospitalizationYr,
      },
    ];
    setPrevHospitalizationData(newData);
    setValue("medicalHistory.prevHospitalizationData", newData);
    setValue("medicalHistory.prevHospitalization", "");
    setValue("medicalHistory.prevHospitalizationYr", undefined);
  };

  // BMI calculation
  const weight = watch("motherPersonalInfo.motherWt");
  const height = watch("motherPersonalInfo.motherHt");

  useEffect(() => {
    if (weight && height && height > 0) {
      const bmi = (weight / (height / 100) ** 2).toFixed(2);
      setValue("motherPersonalInfo.motherBMI", Number.parseFloat(bmi));
    } else {
      setValue("motherPersonalInfo.motherBMI", 0);
    }
  }, [weight, height, setValue]);

  // calculate BMI category based on the BMI value
  const bmi = watch("motherPersonalInfo.motherBMI");
  useEffect(() => {
    let bmiCategory = "";

    if (typeof bmi === "number" && !isNaN(bmi)) {
      if (bmi < 18.5) {
        bmiCategory = "Underweight";
      } else if (bmi >= 18.5 && bmi < 24.9) {
        bmiCategory = "Normal weight";
      } else if (bmi >= 25 && bmi < 29.9) {
        bmiCategory = "Overweight";
      } else if (bmi >= 30) {
        bmiCategory = "Obesity";
      }
    }

    setValue("motherPersonalInfo.motherBMICategory", bmiCategory);
  }, [bmi, setValue]);

  

  return (
    <>
      <LayoutWithBack
        title="Prenatal Record"
        description="Fill out the prenatal record with the mother's personal information."
      >
        {!isFromIndividualRecord && (
          <div>
            <PatientSearch
              value={selectedPatIdDisplay}
              onChange={setSelectedPatientId}
              onPatientSelect={handlePatientSelection}
            />
          </div>
        )}

        <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto mt-2">
          <Label className="text-black text-opacity-50 italic mb-10">
            Page 1 of 4
          </Label>
          <div className="pb-4">
            <h2 className="text-3xl font-bold text-center">
              MATERNAL HEALTH RECORD
            </h2>
          </div>
          <Form {...form}>
            <form>
              <div className="flex">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.familyNo"
                  label="Family No."
                  placeholder="Enter Family No."
                />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-4">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherLName"
                  label="Last Name"
                  placeholder="Enter Last Name"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherFName"
                  label="First Name"
                  placeholder="Enter First Name"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherMName"
                  label="Middle Name"
                  placeholder="Enter Middle Name"
                />
                <FormDateTimeInput
                  control={control}
                  name="motherPersonalInfo.motherDOB"
                  label="Date of Birth"
                  type="date"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherAge"
                  label="Age"
                  placeholder="Enter Age"
                  type="number"
                />
              </div>

              {/* dob, husband's name, occupation */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.husbandLName"
                  label="Husband's Last Name"
                  placeholder="Enter Last Name"
                  upper={true}
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.husbandFName"
                  label="Husband's First Name"
                  placeholder="Enter First Name"
                  upper={true}
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.husbandMName"
                  label="Husband's Middle Name"
                  placeholder="Enter Middle Name"
                  upper={true}
                />
                <FormDateTimeInput
                  control={control}
                  name="motherPersonalInfo.husbandDob"
                  label="Husband's Date of Birth"
                  type="date"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.occupation"
                  label="Occupation"
                  placeholder="Enter Occupation"
                  upper={true}
                />
              </div>

              {/* address */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.street"
                  label="Street"
                  placeholder="Enter Street"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.sitio"
                  label="Sitio"
                  placeholder="Enter Sitio"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.barangay"
                  label="Barangay"
                  placeholder="Enter Barangay"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.city"
                  label="City"
                  placeholder="Enter City"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.address.province"
                  label="Province"
                  placeholder="Enter Province"
                />
              </div>

              {/* body measurement */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherWt"
                  label="Weight"
                  placeholder="Wt in kg"
                  type="number"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherHt"
                  label="Height"
                  placeholder="Ht in cm"
                  type="number"
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherBMI"
                  label="BMI"
                  placeholder="BMI"
                  type="number"
                  readOnly
                />
                <FormInput
                  control={control}
                  name="motherPersonalInfo.motherBMICategory"
                  label="BMI Category"
                  placeholder="BMI Category"
                  readOnly
                />
              </div>

              <div className="flex mt-5">
                {bodyMeasurementData?.body_measurement.weight !== null &&
                selectedPatientId &&
                !bmLoading &&
                BMweight !== undefined &&
                BMheight !== undefined ? (
                  <span className="text-sm italic text-yellow-600">
                    Note: Last measurements were recorded on {phDate}
                  </span>
                ) : (
                  <span className="text-sm italic text-gray-500">
                    Note: No previous measurements found.
                  </span>
                )}
              </div>

              {/* obstetric history */}
              <div className="border rounded-lg p-4 shadow-md mt-10">
                <h3 className="text-md font-semibold mt-2">
                  OBSTETRIC HISTORY
                </h3>
                <div className="flex flex-col mt-2 px-4">
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <FormInput
                      control={control}
                      name="obstetricHistory.noOfChBornAlive"
                      label="No. of Children Born Alive"
                      placeholder="Enter number of children born alive"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="obstetricHistory.noOfLivingCh"
                      label="No. of Living Children"
                      placeholder="Enter number of living children"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="obstetricHistory.noOfAbortion"
                      label="No. of Abortion"
                      placeholder="Enter number of abortion/s"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="obstetricHistory.noOfStillBirths"
                      label="No. of Still Births"
                      placeholder="Enter number of still births"
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 ">
                    <div className="grid grid-rows-2 gap-3">
                      <p className="text-sm font-semibold text-black/70 mt-5">
                        History of Large Babies
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="obstetricHistory.historyOfLBabiesStr"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) => {
                                    field.onChange(value === "yes");
                                  }}
                                  value={field.value ? "yes" : "no"}
                                  className="flex flex-row justify-center rounded-md border p-[5px]"
                                >
                                  <FormItem className="mr-4">
                                    <FormControl>
                                      <RadioGroupItem value="yes" />
                                    </FormControl>
                                    <FormLabel className="ml-2">YES</FormLabel>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem value="no" />
                                    </FormControl>
                                    <FormLabel className="ml-2">NO</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormInput
                          control={control}
                          name="obstetricHistory.historyOfLBabies"
                          label=""
                          placeholder={
                            hasLgBabies === true && (!lgBabiesCount || lgBabiesCount <= 0)
                              ? "Count of Large Babies is required"
                              : "Enter count of large babies"
                          }
                          type="number"
                          className={
                            hasLgBabies === true && (!lgBabiesCount || lgBabiesCount <= 0)
                              ? "border-red-500 placeholder:text-red-500"
                              : ""
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-5">
                      <FormField
                        control={form.control}
                        name="obstetricHistory.historyOfDiabetes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black/70">
                              Diabetes
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => {
                                  field.onChange(value === "yes");
                                }}
                                value={field.value ? "yes" : "no"}
                                className="flex flex-row justify-center rounded-md border p-[5px]"
                              >
                                <FormItem className="mr-4">
                                  <FormControl>
                                    <RadioGroupItem value="yes" />
                                  </FormControl>
                                  <FormLabel className="ml-2">YES</FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem value="no" />
                                  </FormControl>
                                  <FormLabel className="ml-2">NO</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* medical history */}
              <div className="border rounded-lg p-4 shadow-md mt-10">
                <h3 className="text-md font-semibold mt-2">MEDICAL HISTORY</h3>
                <div className="p-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols- gap-6">
                    <div className="space-y-4 border rounded-md p-4">
                      <div className="flex flex-row items-center gap-2">
                        <Label>Previous Pregnancy Complication:</Label>
                      </div>
                      <div>
                        <FormTextArea
                          control={control}
                          name="medicalHistory.previousComplications"
                          label=""
                          placeholder="Enter previous complications"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border rounded-md p-4 items-center">
                      <div className="flex flex-row items-center gap-2">
                        <MdOutlineSick size={25} />
                        <Label>Previous Illness</Label>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <IllnessCombobox
                            options={getIllnessOptions()}
                            value={selectedIllnessId}
                            onChange={(value) => {
                              setSelectedIllnessId(value);

                              const selectedIllnessData =
                                illnessesData?.illnesses?.find(
                                  (illness: any) =>
                                    illness.ill_id?.toString() === value
                                );

                              const illnessName =
                                selectedIllnessData?.illname || value || "";
                              setValue(
                                "medicalHistory.prevIllness",
                                illnessName
                              );
                            }}
                            placeholder="Select or add previous illness"
                            emptyMessage="No illnesses found"
                            allowAddNew={true}
                            onAddNew={handleAddNewIllness}
                            triggerClassName="w-full"
                          />
                        </div>
                        <div className="flex-1">
                          <FormDateTimeInput
                            control={control}
                            name="medicalHistory.prevIllnessYr"
                            label=""
                            type="month"
                          />
                        </div>
                        <Button
                          onClick={addPrevIllness}
                          type="button"
                          variant="default"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex bg-white w-full overflow-x-auto mt-4 h-[15rem] border rounded-lg overflow-y-auto">
                        <DataTable
                          columns={illnessColumn}
                          data={getPrevIllnessTableData()}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border rounded-md p-4">
                      <div className="flex flex-row items-center gap-2">
                        <FaRegHospital size={25} />
                        <Label>Previous Hospitalization</Label>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <FormTextArea
                            control={control}
                            name="medicalHistory.prevHospitalization"
                            label=""
                            placeholder="Enter previous hospitalization"
                          />
                        </div>
                        <div className="flex-1 mt-2">
                          <FormInput
                            control={control}
                            name="medicalHistory.prevHospitalizationYr"
                            label=""
                            placeholder="Enter year"
                            type="number"
                          />
                        </div>
                        <Button
                          onClick={addPrevHospitalization}
                          type="button"
                          variant="default"
                          className="mt-2"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex bg-white w-full overflow-x-auto mt-4 h-[15rem] border rounded-lg overflow-y-auto">
                        <DataTable
                          columns={hospitalizationColumn}
                          data={getPrevHospitalizationTableData()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-12 flex justify-end">
                <Button
                  className="mt-4 mr-4 w-[120px]"
                  type="button"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </LayoutWithBack>
    </>
  );
}
