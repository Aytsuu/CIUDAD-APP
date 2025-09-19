// MAIN FIX: Update your SoapForm component
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useEffect, useRef } from "react";
import SoapFormFields from "@/components/ui/soap-form";
import { useAuth } from "@/context/AuthContext";
import { usePhysicalExamQueries } from "../medical-con/queries.tsx/fetch";
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
import { useSubmitSoapForm } from "./queries.tsx/soap-submission";
import { soapSchema, SoapFormType } from "@/form-schema/doctor/soapSchema";
import { ExamSection } from "../types";

interface SoapFormProps {
  patientData: any;
  checkupData: any;
  onBack: () => void;
  initialData?: any;
  onFormDataUpdate?: (data: any) => void;
}

export default function SoapForm({ patientData, checkupData, onBack, initialData, onFormDataUpdate }: SoapFormProps) {
  const { user } = useAuth();
  const staff = user?.staff?.staff_id || null;

  const [currentPage, setCurrentPage] = useState(1);
  const { mutate: submitSoapForm, isPending: isSubmitting } = useSubmitSoapForm();

  // FIX: Initialize with proper structure and unique IDs
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>(() => {
    const initializeMedicines = (medicines: any[]) => {
      return medicines.map((med, index) => ({
        ...med,
        _tempId: med._tempId || `medicine_${Date.now()}_${index}`,
        medrec_qty: Number(med.medrec_qty) || 1, // Ensure numeric value
        reason: med.reason || ""
      }));
    };

    if (initialData?.selectedMedicines?.length) return initializeMedicines(initialData.selectedMedicines);
    if (initialData?.medicineRequest?.medicines?.length) return initializeMedicines(initialData.medicineRequest.medicines);
    if (checkupData?.find_details?.prescribed_medicines?.length) return initializeMedicines(checkupData.find_details.prescribed_medicines);
    return [];
  });

  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const isUpdating = useRef(false);

  // Use the medicine stocks with loading state
  const [medicineSearchParams, setMedicineSearchParams] = useState<any>({
    page: 1,
    pageSize: 10,
    search: '',
    is_temp: true,
  });
  const { data: medicineData, isLoading: isMedicineLoading } = fetchMedicinesWithStock(medicineSearchParams);
  const { sectionsQuery, optionsQuery } = usePhysicalExamQueries();
  const isPhysicalExamLoading = sectionsQuery.isLoading || optionsQuery.isLoading;
  const hasPhysicalExamError = sectionsQuery.isError || optionsQuery.isError;
  const medicineStocksOptions = medicineData?.medicines || [];
  const medicinePagination = medicineData?.pagination;

  // Add handlers for search and pagination
  const handleMedicineSearch = (searchTerm: string) => {
    setMedicineSearchParams((prev:any) => ({
      ...prev,
      search: searchTerm,
      page: 1, // Reset to first page when searching
    }));
  };

  const handleMedicinePageChange = (page: number) => {
    setMedicineSearchParams((prev:any )=> ({
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
        pat_id: patientData?.pat_id || "",
        medicines: selectedMedicines // Use the state directly
      },
      physicalExamResults: initialData?.physicalExamResults || [],
      selectedIllnesses: initialData?.selectedIllnesses || [],
      followv: initialData?.followv || undefined
    }
  });

  // FIX: Sync form values when selectedMedicines changes
  useEffect(() => {
    form.setValue("medicineRequest", {
      pat_id: patientData?.pat_id || "",
      medicines: selectedMedicines
    });
  }, [selectedMedicines, form, patientData?.pat_id]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        subj_summary: initialData.subj_summary || "",
        obj_summary: initialData.obj_summary || "",
        assessment_summary: initialData.assessment_summary || "",
        plantreatment_summary: initialData.plantreatment_summary || "",
        medicineRequest: {
          pat_id: patientData?.pat_id || "",
          medicines: selectedMedicines
        },
        physicalExamResults: initialData.physicalExamResults || [],
        selectedIllnesses: initialData.selectedIllnesses || [],
        followv: initialData.followv || undefined
      });
    }
  }, [initialData, form, patientData, selectedMedicines]);

  // Add cleanup effect for form data updates
  useEffect(() => {
    return () => {
      if (onFormDataUpdate) {
        const currentValues = form.getValues();
        onFormDataUpdate({
          ...currentValues,
          selectedMedicines
        });
      }
    };
  }, [form, selectedMedicines, onFormDataUpdate]);

  // FIX: Improved medicine update handler with better change detection
  const handleSelectedMedicinesChange = useCallback(
    (updated: any[]) => {
      if (isUpdating.current) {
        isUpdating.current = false;
        return;
      }

      // Add unique IDs to new medicines and ensure proper structure
      const updatedWithIds = updated.map((med, index) => ({
        ...med,
        _tempId: med._tempId || `medicine_${Date.now()}_${index}`,
        medrec_qty: Number(med.medrec_qty) || 1, // Ensure numeric value
        reason: med.reason || ""
      }));

      // Better change detection - compare the actual content, not just order
      const currentMedicines = selectedMedicines.map(med => ({
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason
      }));
      
      const newMedicines = updatedWithIds.map(med => ({
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason
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
              return `- ${stock?.name || 'Unknown'} ${stock?.dosage || ''} (${med.medrec_qty} ${stock?.unit || 'units'}) ${med.reason || ''}`;
            })
          : [];

      const newSummary = [...summaryWithoutMeds, ...medLines].join("\n");

      isUpdating.current = true;
      form.setValue("plantreatment_summary", newSummary);
      form.setValue("medicineRequest", {
        pat_id: patientData?.pat_id || "",
        medicines: updatedWithIds
      });

      if (onFormDataUpdate) {
        const currentValues = form.getValues();
        onFormDataUpdate({
          ...currentValues,
          selectedMedicines: updatedWithIds
        });
      }
    },
    [form, patientData, medicineStocksOptions, onFormDataUpdate, selectedMedicines]
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
          selectedMedicines
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
          selectedMedicines
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
        options: []
      }));

      optionsQuery.data.forEach((option: any) => {
        const section = sections.find((s) => s.pe_section_id === option.pe_section);
        if (section) {
          section.options.push({
            pe_option_id: option.pe_option_id,
            text: option.text,
            checked: form.getValues("physicalExamResults")?.includes(option.pe_option_id) || false
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
        selectedMedicines
      });
    }
    onBack();
  }, [form, selectedMedicines, onFormDataUpdate, onBack]);

  const onSubmit = async (data: SoapFormType) => {
    // Ensure the latest selectedMedicines are included in submission
    const submissionData = {
      ...data,
      medicineRequest: {
        ...data.medicineRequest,
        medicines: selectedMedicines
      }
    };

    submitSoapForm({
      formData: submissionData,
      patientData,
      checkupData,
      staffId: staff
    });
  };

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
        // Pass the new props for medicine search and pagination
        medicineSearchParams={medicineSearchParams}
        medicinePagination={medicinePagination}
        onMedicineSearch={handleMedicineSearch}
        onMedicinePageChange={handleMedicinePageChange}
      />
    </div>
  );
}