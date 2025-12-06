import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useEffect, useRef } from "react";
import { usePhysicalExamQueries } from "../queries.tsx/fetch";
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
import { useSubmitSoapForm } from "../queries.tsx/soap-submission";
import { soapSchema, SoapFormType } from "@/form-schema/doctor/soapSchema";
import { ExamSection } from "../../types";
import SoapFormFields from "@/components/ui/soap-form";
import { showErrorToast } from "@/components/ui/toast";

interface SoapFormProps {
  patientData: any;
  MedicalConsultation: any;
  onBack: () => void;
  initialData?: any;
  onFormDataUpdate?: (data: any) => void;
}

export default function SoapForm({ 
  patientData, 
  MedicalConsultation, 
  onBack, 
  initialData, 
  onFormDataUpdate 
}: SoapFormProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { mutate: submitSoapForm, isPending: isSubmitting } = useSubmitSoapForm();

  const [selectedMedicines, setSelectedMedicines] = useState<any[]>(() => {
    const initializeMedicines = (medicines: any[]) => {
      return medicines.map((med, index) => ({
        ...med,
        _tempId: med._tempId || `medicine_${Date.now()}_${index}`,
        medrec_qty: Number(med.medrec_qty) || 1,
        reason: med.reason || "",
      }));
    };
    if (initialData?.selectedMedicines?.length) return initializeMedicines(initialData.selectedMedicines);
    if (initialData?.medicineRequest?.medicines?.length) return initializeMedicines(initialData.medicineRequest.medicines);
    if (MedicalConsultation?.find_details?.prescribed_medicines?.length) return initializeMedicines(MedicalConsultation.find_details.prescribed_medicines);
    return [];
  });

  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const isUpdating = useRef(false);

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
    mode: "onChange", // Add this to validate on change
    defaultValues: {
      subj_summary: initialData?.subj_summary || "",
      obj_summary: initialData?.obj_summary || "",
      assessment_summary: initialData?.assessment_summary || "",
      plantreatment_summary: initialData?.plantreatment_summary || "",
      medicineRequest: {
        pat_id: patientData?.pat_id || "",
        medicines: selectedMedicines,
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
      // FIX: Convert numbers to strings
      phil_id: String(initialData?.phil_id || MedicalConsultation?.philhealth_details?.phil_id || ""),
      staff_id: String(initialData?.staff_id || ""),
      medrec_id: String(initialData?.medrec_id || MedicalConsultation?.medrec_id || ""),
      patrec_id: String(initialData?.patrec_id || MedicalConsultation?.patrec || ""),
      app_id: String(initialData?.app_id || ""),
    },
  });

  // DEBUG: Log form errors whenever they change
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log("❌ Form Validation Errors:", errors);
      }
    }
  }, [form.formState.errors]);

  // ADD THIS VALIDATION FUNCTION
  const validateRequiredFields = (data: SoapFormType): boolean => {
    const requiredFields = [
      { field: data.subj_summary, name: "Subjective Summary" },
      { field: data.obj_summary, name: "Objective Summary" },
      { field: data.assessment_summary, name: "Assessment Summary" },
      { field: data.plantreatment_summary, name: "Plan/Treatment Summary" },
    ];

    const emptyFields = requiredFields.filter(({ field }) => !field || field.trim() === "");

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(f => f.name).join(", ");
      showErrorToast(`Please fill in the following required fields: ${fieldNames}`);
      return false;
    }

    return true;
  };

  useEffect(() => {
    form.setValue("medicineRequest", {
      pat_id: patientData?.pat_id || "",
      medicines: selectedMedicines,
    });
  }, [selectedMedicines, form, patientData?.pat_id]);

  useEffect(() => {
    if (initialData) {
      const formValues = {
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
        is_cbc: initialData.is_cbc || false,
        is_urinalysis: initialData.is_urinalysis || false,
        is_fecalysis: initialData.is_fecalysis || false,
        is_sputum_microscopy: initialData.is_sputum_microscopy || false,
        is_creatine: initialData.is_creatine || false,
        is_hba1c: initialData.is_hba1c || false,
        is_chestxray: initialData.is_chestxray || false,
        is_papsmear: initialData.is_papsmear || false,
        is_fbs: initialData.is_fbs || false,
        is_oralglucose: initialData.is_oralglucose || false,
        is_lipidprofile: initialData.is_lipidprofile || false,
        is_ecg: initialData.is_ecg || false,
        is_fecal_occult_blood: initialData.is_fecal_occult_blood || false,
        others: initialData.others || "",
        is_phrecord: initialData.is_phrecord || false,
        // FIX: Convert numbers to strings
        phil_id: String(initialData.phil_id || MedicalConsultation?.philhealth_details?.phil_id || ""),
        staff_id: String(initialData.staff_id || ""),
        medrec_id: String(initialData.medrec_id || MedicalConsultation?.medrec_id || ""),
        patrec_id: String(initialData.patrec_id || MedicalConsultation?.patrec || ""),
        app_id: String(initialData.app_id || ""),
      };
      
      form.reset(formValues);
    }
  }, [initialData, form, patientData?.pat_id, selectedMedicines, MedicalConsultation]);

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

  const handleSelectedMedicinesChange = useCallback(
    (updated: any[]) => {
      if (isUpdating.current) {
        isUpdating.current = false;
        return;
      }

      const updatedWithIds = updated.map((med, index) => ({
        ...med,
        _tempId: med._tempId || `medicine_${Date.now()}_${index}`,
        medrec_qty: Number(med.medrec_qty) || 1,
        reason: med.reason || "",
      }));

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

      setSelectedMedicines(updatedWithIds);

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

      isUpdating.current = true;
      form.setValue("plantreatment_summary", newSummary);
      form.setValue("medicineRequest", {
        pat_id: patientData?.pat_id || "",
        medicines: updatedWithIds,
      });

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

  // CRITICAL: Add error handler to see why form is not submitting
  const onError = (errors: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("❌ Form submission failed with errors:", errors);
    }
    
    // Show specific error messages
    const errorMessages = Object.entries(errors).map(([field, error]: [string, any]) => {
      return `${field}: ${error.message || 'Invalid value'}`;
    });
    
    showErrorToast(`Form validation failed:\n${errorMessages.join('\n')}`);
  };

  // UPDATED onSubmit WITH VALIDATION
  const onSubmit = useCallback(
    (data: SoapFormType) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Form validation passed! Submitting data:", data);
      }
      
      // Validate required fields are not empty
      if (!validateRequiredFields(data)) {
        return;
      }

      // Create clean submission data
      const submissionData = {
        subj_summary: data.subj_summary,
        obj_summary: data.obj_summary,
        assessment_summary: data.assessment_summary,
        plantreatment_summary: data.plantreatment_summary,
        medicineRequest: {
          pat_id: patientData?.pat_id || "",
          medicines: selectedMedicines,
        },
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
        // FIX: Ensure strings are passed
        phil_id: String(data.phil_id || ""),
        staff_id: String(data.staff_id || ""),
        medrec_id: String(data.medrec_id || ""),
        patrec_id: String(data.patrec_id || ""),
        app_id: String(data.app_id || ""),
        pat_id: patientData?.pat_id || "",
      };

      if (process.env.NODE_ENV === 'development') {
        console.log("📤 Submitting to API:", submissionData);
      }

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
        onSubmit={form.handleSubmit(onSubmit, onError)} // CRITICAL: Add error handler
        medicineSearchParams={medicineSearchParams}
        medicinePagination={medicinePagination}
        onMedicineSearch={handleMedicineSearch}
        onMedicinePageChange={handleMedicinePageChange}
      />
    </div>
  );
}