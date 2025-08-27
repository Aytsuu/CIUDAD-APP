"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useEffect } from "react";
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
  onFormDataUpdate?: (
    data: Partial<SoapFormType & { selectedMedicines: any[] }>
  ) => void;
}

export default function SoapForm({
  patientData,
  checkupData,
  onBack,
  initialData,
  onFormDataUpdate,
}: SoapFormProps) {
  const { user } = useAuth();
  const staff = user?.staff?.staff_id || null;


  const [currentPage, setCurrentPage] = useState(1);
  const { mutate: submitSoapForm, isPending: isSubmitting } =
    useSubmitSoapForm();

  const [selectedMedicines, setSelectedMedicines] = useState<any[]>(() => {
    if (initialData?.selectedMedicines?.length)
      return initialData.selectedMedicines;
    if (initialData?.medicineRequest?.medicines?.length)
      return initialData.medicineRequest.medicines;
    if (checkupData?.find_details?.prescribed_medicines?.length)
      return checkupData.find_details.prescribed_medicines;
    return [];
  });

  const [examSections, setExamSections] = useState<ExamSection[]>([]);

  const { data: medicineStocksOptions } = fetchMedicinesWithStock();

  const form = useForm<SoapFormType>({
    resolver: zodResolver(soapSchema),
    defaultValues: {
      subj_summary: initialData?.subj_summary || "",
      obj_summary: initialData?.obj_summary || "",
      assessment_summary: initialData?.assessment_summary || "",
      plantreatment_summary: initialData?.plantreatment_summary || "",
      medicineRequest: initialData?.medicineRequest || {
        pat_id: patientData?.pat_id || "",
        medicines: [],
      },
      physicalExamResults: initialData?.physicalExamResults || [],
      selectedIllnesses: initialData?.selectedIllnesses || [],
      followv: initialData?.followv || undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        subj_summary: initialData.subj_summary || "",
        obj_summary: initialData.obj_summary || "",
        assessment_summary: initialData.assessment_summary || "",
        plantreatment_summary: initialData.plantreatment_summary || "",
        medicineRequest: initialData.medicineRequest || {
          pat_id: patientData?.pat_id || "",
          medicines: [],
        },
        physicalExamResults: initialData.physicalExamResults || [],
        selectedIllnesses: initialData.selectedIllnesses || [],
        followv: initialData.followv || undefined,
      });

      const meds =
        initialData.selectedMedicines ||
        initialData.medicineRequest?.medicines ||
        [];
      if (meds.length) setSelectedMedicines(meds);
    }
  }, [initialData, form, patientData]);

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

  const hasInvalidQuantities = selectedMedicines.some((med) => {
    const stock = medicineStocksOptions?.find((m: any) => m.id === med.minv_id);
    return med.medrec_qty < 1 || (stock && med.medrec_qty > stock.avail);
  });

  const hasExceededStock = selectedMedicines.some((med) => {
    const stock = medicineStocksOptions?.find((m: any) => m.id === med.minv_id);
    return stock && med.medrec_qty > stock.avail;
  });

  const handleSelectedMedicinesChange = useCallback(
    (updated: any[]) => {
      setSelectedMedicines(updated);

      const summaryWithoutMeds = form
        .getValues("plantreatment_summary")
        .split("\n")
        .filter((line) => !line.startsWith("- ") && line.trim() !== "");

      const medLines =
        updated.length > 0
          ? updated.map((med) => {
              const stock = medicineStocksOptions?.find(
                (m: any) => m.id === med.minv_id
              );
              return `- ${stock?.name} ${stock?.dosage} (${med.medrec_qty} ${stock?.unit}) ${med.reason}`;
            })
          : [];

      const newSummary = [...summaryWithoutMeds, ...medLines].join("\n");

      form.setValue("plantreatment_summary", newSummary);
      form.setValue("medicineRequest", {
        pat_id: patientData?.pat_id || "",
        medicines: updated,
      });

      if (onFormDataUpdate) {
        onFormDataUpdate({
          ...form.getValues(),
          selectedMedicines: updated,
        });
      }
    },
    [form, patientData, medicineStocksOptions, onFormDataUpdate]
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

  const { sectionsQuery, optionsQuery } = usePhysicalExamQueries();

  useEffect(() => {
    if (sectionsQuery.data && optionsQuery.data) {
      const sections: ExamSection[] = sectionsQuery.data.map(
        (section: any) => ({
          pe_section_id: section.pe_section_id,
          title: section.title,
          isOpen: false,
          options: [],
        })
      );

      optionsQuery.data.forEach((option: any) => {
        const section = sections.find(
          (s) => s.pe_section_id === option.pe_section
        );
        if (section) {
          section.options.push({
            pe_option_id: option.pe_option_id,
            text: option.text,
            checked:
              form
                .getValues("physicalExamResults")
                ?.includes(option.pe_option_id) || false,
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

  const onSubmit = async (data: SoapFormType) => {
    submitSoapForm({
      formData: data,
      patientData,
      checkupData,
      staffId: staff,
    });
  };

  return (
    <div>
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">
        Page 2 of 2
      </div>

      <SoapFormFields
        form={form}
        examSections={examSections}
        setExamSections={setExamSections}
        medicineStocksOptions={medicineStocksOptions || []}
        selectedMedicines={selectedMedicines}
        onSelectedMedicinesChange={handleSelectedMedicinesChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onIllnessSelectionChange={handleIllnessSelectionChange}
        onAssessmentUpdate={handleAssessmentUpdate}
        onBack={handleBack}
        isSubmitting={isSubmitting}
        onSubmit={form.handleSubmit(onSubmit)}
      />
    </div>
  );
}
