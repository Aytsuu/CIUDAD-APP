import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useEffect, useRef } from "react";
// import SoapFormFields from "./soap-with-ph";
import { usePhysicalExamQueries } from "../queries.tsx/fetch";
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
import { useSubmitSoapForm } from "../queries.tsx/soap-submission";
import { soapSchema, SoapFormType } from "@/form-schema/doctor/soapSchema";
import { ExamSection } from "../../types";
import SoapFormFields from "@/components/ui/soap-form";

interface SoapFormProps {
  patientData: any;
  MedicalConsultation: any;
  onBack: () => void;
  initialData?: any;
  onFormDataUpdate?: (data: any) => void;
}

export default function SoapForm({ patientData, MedicalConsultation, onBack, initialData, onFormDataUpdate }: SoapFormProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { mutate: submitSoapForm, isPending: isSubmitting } = useSubmitSoapForm();

  // FIX 1: Initialize selectedMedicines with proper structure and unique IDs
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>(() => {
    const initializeMedicines = (medicines: any[]) => {
      return medicines.map((med, index) => ({
        ...med,
        // Ensure each medicine has a unique identifier for React keys
        _tempId: med._tempId || `medicine_${Date.now()}_${index}`,
        medrec_qty: med.medrec_qty || 1, // Ensure quantity is always a number
        reason: med.reason || "",
      }));
    };

    if (initialData?.selectedMedicines?.length) {
      return initializeMedicines(initialData.selectedMedicines);
    }
    if (initialData?.medicineRequest?.medicines?.length) {
      return initializeMedicines(initialData.medicineRequest.medicines);
    }
    if (MedicalConsultation?.find_details?.prescribed_medicines?.length) {
      return initializeMedicines(MedicalConsultation.find_details.prescribed_medicines);
    }
    return [];
  });

  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const isUpdatingFromChild = useRef(false);

  // Medicine search and pagination state
  const [medicineSearchParams, setMedicineSearchParams] = useState<any>({
    page: 1,
    pageSize: 10,
    search: "",
    is_temp: true,
  });

  const { data: medicineData, isLoading: isMedicineLoading } = fetchMedicinesWithStock(medicineSearchParams);
  const { sectionsQuery, optionsQuery } = usePhysicalExamQueries();

  const isPhysicalExamLoading = sectionsQuery.isLoading || optionsQuery.isLoading;
  const hasPhysicalExamError = sectionsQuery.isError || optionsQuery.isError;

  const medicineStocksOptions = medicineData?.medicines || [];
  const medicinePagination = medicineData?.pagination;

  const handleMedicineSearch = (searchTerm: string) => {
    setMedicineSearchParams((prev: any) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleMedicinePageChange = (page: number) => {
    setMedicineSearchParams((prev: any) => ({
      ...prev,
      page,
    }));
  };

  const form = useForm<SoapFormType>({
    resolver: zodResolver(soapSchema),
    defaultValues: {
      subj_summary: initialData?.subj_summary || "",
      obj_summary: initialData?.obj_summary || "",
      assessment_summary: initialData?.assessment_summary || "",
      plantreatment_summary: initialData?.plantreatment_summary || "",
      medicineRequest: {
        pat_id: initialData?.medicineRequest?.pat_id || "",
        medicines: [],
      },
      physicalExamResults: initialData?.physicalExamResults || [],
      selectedIllnesses: initialData?.selectedIllnesses || [],
      followv: initialData?.followv || undefined,
      is_cbc: initialData?.is_cbc || false,
      is_urinalysis: initialData?.is_urinalysis || false,
      is_fecalysis: initialData?.is_fecalysis || false,
      is_sputum_microscopy: initialData?.is_sputum_microscopy || false,
      is_creatine: initialData?.is_creatine || false,
      is_hba1c: initialData?.is_hba1c || false,
      is_chestxray: initialData?.is_chestxray || false,
      is_papsmear: initialData?.is_papsmear || false,
      is_fbs: initialData?.is_fbs || false,
      is_oralglucose: initialData?.is_oralglucose || false,
      is_lipidprofile: initialData?.is_lipidprofile || false,
      is_ecg: initialData?.is_ecg || false,
      is_fecal_occult_blood: initialData?.is_fecal_occult_blood || false,
      others: initialData?.others || "",
      is_phrecord: initialData?.is_phrecord || false,
      phil_id: initialData?.phil_id || MedicalConsultation?.philhealth_details?.phil_id || "",
      staff_id: initialData?.staff_id || "",
      medrec_id: initialData?.medrec_id || MedicalConsultation?.medrec_id || "",
      patrec_id: initialData?.patrec_id || MedicalConsultation?.patrec || "",
      app_id: initialData?.app_id || "",
    },
  });

  // FIX 2: Sync form values when selectedMedicines changes
  useEffect(() => {
    console.log(MedicalConsultation, "====Medixal===");
    form.setValue("medicineRequest", {
      pat_id: patientData?.pat_id || "",
      medicines: selectedMedicines,
    });
  }, [selectedMedicines, form, patientData?.pat_id]);

  useEffect(() => {
    if (initialData) {
      // Reset form with initial data
      form.reset({
        subj_summary: initialData.subj_summary || "",
        obj_summary: initialData.obj_summary || "",
        assessment_summary: initialData.assessment_summary || "",
        plantreatment_summary: initialData.plantreatment_summary || "",
        medicineRequest: {
          pat_id: patientData?.pat_id || "",
          medicines: selectedMedicines,
        },
        physicalExamResults: initialData.physicalExamResults || [],
        selectedIllnesses: initialData.selectedIllnesses || [],
        followv: initialData.followv || undefined,
      });
    }
  }, [initialData, form, patientData?.pat_id, selectedMedicines]);

  // Cleanup effect for form data updates
  useEffect(() => {
    return () => {
      if (onFormDataUpdate) {
        const currentValues = form.getValues();
        onFormDataUpdate({
          ...currentValues,
          selectedMedicines,
        });
      }
    };
  }, [form, selectedMedicines, onFormDataUpdate]);

  // FIX 3: Improved medicine update handler with better change detection
  const handleSelectedMedicinesChange = useCallback(
    (updated: any[]) => {
      if (isUpdatingFromChild.current) {
        isUpdatingFromChild.current = false;
        return;
      }

      // Add unique IDs to new medicines and ensure proper structure
      const updatedWithIds = updated.map((med, index) => ({
        ...med,
        _tempId: med._tempId || `medicine_${Date.now()}_${index}`,
        medrec_qty: Number(med.medrec_qty) || 1, // Ensure numeric value
        reason: med.reason || "",
      }));

      // Better change detection - compare the actual content, not just order
      const currentMedicines = selectedMedicines.map((med) => ({
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason,
      }));

      const newMedicines = updatedWithIds.map((med) => ({
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason,
      }));

      const hasChanges = JSON.stringify(currentMedicines) !== JSON.stringify(newMedicines);

      if (!hasChanges) {
        return;
      }

      console.log("Updating medicines:", updatedWithIds); // Debug log

      setSelectedMedicines(updatedWithIds);

      // Update plan treatment summary
      const summaryWithoutMeds = form
        .getValues("plantreatment_summary")
        .split("\n")
        .filter((line) => !line.startsWith("- ") && line.trim() !== "");

      const medLines =
        updatedWithIds.length > 0
          ? updatedWithIds.map((med) => {
              const stock = medicineStocksOptions?.find((m: any) => m.id === med.minv_id);
              return `- ${stock?.name || "Unknown"} ${stock?.dosage || ""} (${med.medrec_qty} ${stock?.unit || "units"}) ${med.reason || ""}`;
            })
          : [];

      const newSummary = [...summaryWithoutMeds, ...medLines].join("\n");

      // Update form values
      isUpdatingFromChild.current = true;
      form.setValue("plantreatment_summary", newSummary);
      form.setValue("medicineRequest", {
        pat_id: patientData?.pat_id || "",
        medicines: updatedWithIds,
      });

      // Trigger form validation
      form.trigger(["plantreatment_summary", "medicineRequest"]);

      if (onFormDataUpdate) {
        const currentValues = form.getValues();
        onFormDataUpdate({
          ...currentValues,
          selectedMedicines: updatedWithIds,
        });
      }
    },
    [form, patientData?.pat_id, medicineStocksOptions, onFormDataUpdate, selectedMedicines]
  );

  // Removed separate quantity handler - will be handled in main medicine change handler

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleIllnessSelectionChange = useCallback(
    (ids: number[]) => {
      form.setValue("selectedIllnesses", ids);
      form.trigger("selectedIllnesses");

      if (onFormDataUpdate) {
        onFormDataUpdate({
          ...form.getValues(),
          selectedIllnesses: ids,
          selectedMedicines,
        });
      }
    },
    [form, selectedMedicines, onFormDataUpdate]
  );

  const handleAssessmentUpdate = useCallback(
    (text: string) => {
      form.setValue("assessment_summary", text);
      form.trigger("assessment_summary");

      if (onFormDataUpdate) {
        onFormDataUpdate({
          ...form.getValues(),
          assessment_summary: text,
          selectedMedicines,
        });
      }
    },
    [form, selectedMedicines, onFormDataUpdate]
  );

  useEffect(() => {
    if (sectionsQuery.data && optionsQuery.data) {
      const sections: ExamSection[] = sectionsQuery.data.map((section: any) => ({
        pe_section_id: section.pe_section_id,
        title: section.title,
        isOpen: false,
        options: [],
      }));

      optionsQuery.data.forEach((option: any) => {
        const section = sections.find((s) => s.pe_section_id === option.pe_section);
        if (section) {
          section.options.push({
            pe_option_id: option.pe_option_id,
            text: option.text,
            checked: form.getValues("physicalExamResults")?.includes(option.pe_option_id) || false,
          });
        }
      });

      setExamSections(sections);
    }
  }, [sectionsQuery.data, optionsQuery.data, form]);

  const handleBack = useCallback(() => {
    if (onFormDataUpdate) {
      const currentValues = form.getValues();
      onFormDataUpdate({
        ...currentValues,
        selectedMedicines,
      });
    }
    onBack();
  }, [form, selectedMedicines, onFormDataUpdate, onBack]);

  const onSubmit = useCallback(
    (data: any) => {
      // Create clean submission data with only the necessary fields
      const submissionData: any = {
        subj_summary: data.subj_summary,
        obj_summary: data.obj_summary,
        assessment_summary: data.assessment_summary,
        plantreatment_summary: data.plantreatment_summary,
        medicineRequest: { pat_id: patientData?.pat_id || "", medicines: selectedMedicines },
        physicalExamResults: data.physicalExamResults,
        selectedIllnesses: data.selectedIllnesses,
        followv: data.followv,
        is_cbc: data.is_cbc,
        is_urinalysis: data.is_urinalysis,
        is_fecalysis: data.is_fecalysis,
        is_sputum_microscopy: data.is_sputum_microscopy,
        is_creatine: data.is_creatine,
        is_hba1c: data.is_hba1c,
        is_chestxray: data.is_chestxray,
        is_papsmear: data.is_papsmear,
        is_fbs: data.is_fbs,
        is_oralglucose: data.is_oralglucose,
        is_lipidprofile: data.is_lipidprofile,
        is_ecg: data.is_ecg,
        is_fecal_occult_blood: data.is_fecal_occult_blood,
        others: data.others,
        is_phrecord: data.is_phrecord,
        phil_id: data.phil_id || MedicalConsultation?.philhealth_details?.phil_id || "",
        staff_id: data.staff_id || MedicalConsultation?.staff_id || "",
        medrec_id: data.medrec_id || MedicalConsultation?.medrec_id || "",
        patrec_id: data.patrec_id || MedicalConsultation?.patrec || "",
        app_id: data.app_id || MedicalConsultation?.app_id || "",
        pat_id: patientData?.pat_id || "",
      };

      console.log("Clean submission data:", submissionData);

      submitSoapForm({
        formData: submissionData,
        patientData,
        MedicalConsultation,
      });
    },
    [selectedMedicines, patientData, MedicalConsultation, submitSoapForm]
  );

  return (
    <div>
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 2 of 2</div>

      <SoapFormFields
        form={form}
        examSections={examSections}
        setExamSections={setExamSections}
        medicineStocksOptions={medicineStocksOptions || []}
        selectedMedicines={selectedMedicines}
        isMedicineLoading={isMedicineLoading}
        isPhysicalExamLoading={isPhysicalExamLoading}
        hasPhysicalExamError={hasPhysicalExamError}
        onSelectedMedicinesChange={handleSelectedMedicinesChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onIllnessSelectionChange={handleIllnessSelectionChange}
        onAssessmentUpdate={handleAssessmentUpdate}
        onBack={handleBack}
        isSubmitting={isSubmitting}
        onSubmit={form.handleSubmit(onSubmit)}
        medicineSearchParams={medicineSearchParams}
        medicinePagination={medicinePagination}
        onMedicineSearch={handleMedicineSearch}
        onMedicinePageChange={handleMedicinePageChange}
      />
    </div>
  );
}
