//// filepath: /c:/CIUDAD-APP/web/src/pages/healthServices/childservices/forms/multi-step-form/Step4.tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormData, VitalSignType, NutritionalStatusType } from "@/form-schema/chr-schema/chr-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChildHealthFormSchema, VitalSignSchema } from "@/form-schema/chr-schema/chr-schema";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
import { NutritionalStatusCalculator } from "../../../../../components/ui/nutritional-status-calculator";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { DataTable } from "@/components/ui/table/data-table";
import { Pill, Loader2, AlertTriangle, HeartPulse, ChevronLeft } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { z } from "zod";
import { createHistoricalSupplementStatusColumns } from "./columns";
import { edemaSeverityOptions } from "./options";
import { isToday } from "@/helpers/isToday";
import { useChildLatestVitals } from "../queries/fetchQueries";
import { VitalSignFormCard, VitalSignsCardView } from "./vitalsisgns-card";
import { fetchDoctor, fetchMidwife } from "@/pages/healthServices/reports/firstaid-report/queries/fetch";
import { Combobox } from "@/components/ui/combobox";
import { LastPageProps } from "./types";
import { PendingFollowupsSection } from "./followupPending";
import { useUpdateFollowupStatus } from "../queries/update";
import IndivMedicineRecords from "@/pages/healthServices/medicineservices/tables/IndivMedicineRecord";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog/dialog";

export default function LastPage({
  onPrevious,
  onSubmit,
  updateFormData,
  formData,
  historicalVitalSigns = [],
  historicalSupplementStatuses: historicalSupplementStatusesProp = [],
  onUpdateHistoricalSupplementStatus,
  isSubmitting,
  newVitalSigns,
  setNewVitalSigns,
  passed_status,
  chrecId,
}: LastPageProps) {
  // Local state for editing form
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingAnemiaIndex, setEditingAnemiaIndex] = useState<number | null>(null);
  const [editingBirthWeightIndex, setEditingBirthWeightIndex] = useState<number | null>(null);
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null);
  const [medicineSearchParams, setMedicineSearchParams] = useState<any>({ page: 1, pageSize: 10, search: "", is_temp: true });
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [allowNotesEdit, setAllowNotesEdit] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [pendingFollowupUpdates, setPendingFollowupUpdates] = useState<Record<number, string>>({});
  const updateFollowupMutation = useUpdateFollowupStatus();

  // Fixed logic: allow notes edit when passed_status is NOT immunization
  useEffect(() => {
    setAllowNotesEdit(passed_status !== "immunization");
  }, [passed_status]);

  const { data: medicineData, isLoading: isMedicinesLoading } = fetchMedicinesWithStock(medicineSearchParams);
  const { data: latestVitalsData } = useChildLatestVitals(formData.pat_id || "");
  const { data: doctorOptions, isLoading: isDoctorLoading } = fetchDoctor();
  const { data: midwifeOptions, isLoading: isMidwifeLoading } = fetchMidwife();
  const [showVitalSignsForm, setShowVitalSignsForm] = useState(() => {
    const hasTodaysHistoricalRecord = historicalVitalSigns.some((vital) => isToday(vital.date));
    const hasTodaysNewRecord = newVitalSigns.some((vital) => isToday(vital.date));
    return !hasTodaysHistoricalRecord && !hasTodaysNewRecord;
  });

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

  const currentAge = useMemo(() => {
    let referenceDate;
    if (newVitalSigns.length > 0) {
      referenceDate = newVitalSigns[0].date;
    } else if (historicalVitalSigns.length > 0) {
      const sortedHistorical = [...historicalVitalSigns].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
      referenceDate = sortedHistorical[0].date;
    } else {
      referenceDate = new Date().toISOString().split("T")[0];
    }
    return calculateAgeFromDOB(formData.childDob, referenceDate).ageString;
  }, [formData.childDob, newVitalSigns, historicalVitalSigns]);

  const form = useForm<FormData>({
    resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      ...formData,
      vitalSigns: newVitalSigns,
      anemic: formData.anemic || {
        seen: "",
        given_iron: "",
        is_anemic: false,
        date_completed: "",
      },
      birthwt: formData.birthwt || {
        seen: "",
        given_iron: "",
        date_completed: "",
      },
      medicines: formData.medicines || [],
      status: formData.status || "recorded",
      nutritionalStatus: formData.nutritionalStatus || {},
      edemaSeverity: formData.edemaSeverity || "None",
      passed_status: passed_status,
    },
  });

  const vitalSignForm = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: latestVitalsData?.weight || undefined,
      ht: latestVitalsData?.height || undefined,
      temp: latestVitalsData?.vital_temp,
      follov_description: "",
      followUpVisit: "",
      followv_status: "pending",
      notes: "",
      is_opt: false,
      remarks: "",
    },
  });

  const editVitalSignForm = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: "",
      age: "",
      wt: latestVitalsData?.weight || undefined,
      ht: latestVitalsData?.height || undefined,
      temp: latestVitalsData?.vital_temp,
      follov_description: "",
      followUpVisit: "",
      notes: "",
      is_opt: false,
      remarks: "",
    },
  });

  useEffect(() => {
    if (latestVitalsData) {
      vitalSignForm.setValue("wt", latestVitalsData.weight || undefined);
      vitalSignForm.setValue("ht", latestVitalsData.height || undefined);
      vitalSignForm.setValue("temp", latestVitalsData.vital_temp);
    }
  }, [latestVitalsData]);

  const supplementStatusEditForm = useForm<{
    date_completed: string | null;
  }>({
    resolver: zodResolver(
      z.object({
        date_completed: z.string().nullable().optional(),
      })
    ),
    defaultValues: {
      date_completed: null,
    },
  });

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;
  const { control: editVitalSignFormControl, handleSubmit: editVitalSignFormHandleSubmit } = editVitalSignForm;

  const selectedMedicines = watch("medicines");
  const currentStatus = watch("status");
  const nutritionalStatus = watch("nutritionalStatus");
  const anemicData = watch("anemic");
  const birthwtData = watch("birthwt");
  const edemaSeverity = watch("edemaSeverity");

  const getLatestVitalSigns = (vitalSigns: VitalSignType[] | undefined) => {
    if (!vitalSigns || vitalSigns.length === 0) return null;
    const sorted = [...vitalSigns].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
    return sorted[0];
  };

  const hasTodaysVitalSigns = useMemo(() => {
    const hasTodaysHistorical = historicalVitalSigns.some((vital) => isToday(vital.date));
    const hasTodaysNew = newVitalSigns.some((vital) => isToday(vital.date));
    return hasTodaysHistorical || hasTodaysNew;
  }, [historicalVitalSigns, newVitalSigns]);

  const combinedVitalSignsForTable = useMemo(() => {
    return newVitalSigns.map((vital, index) => ({
      ...vital,
      originalIndex: index,
      age: vital.age || currentAge,
    }));
  }, [newVitalSigns, currentAge]);

  const latestOverallVitalSign = useMemo(() => {
    if (newVitalSigns.length > 0) {
      return newVitalSigns[0];
    }
    return getLatestVitalSigns(historicalVitalSigns);
  }, [newVitalSigns, historicalVitalSigns]);

  const shouldShowNutritionalStatusCalculator = useMemo(() => {
    const hasRequiredData = currentAge && latestOverallVitalSign?.wt !== undefined && latestOverallVitalSign?.ht !== undefined;
    return hasRequiredData;
  }, [currentAge, latestOverallVitalSign?.wt, latestOverallVitalSign?.ht]);

  const hasSevereMalnutrition = useMemo(() => {
    if (!nutritionalStatus) return false;
    const { wfa, lhfa, wfh, muac_status } = nutritionalStatus;
    return wfa === "SUW" || lhfa === "SST" || wfh === "SW" || muac_status === "SAM";
  }, [nutritionalStatus]);

  const shouldShowSevereMalnutritionWarning = useMemo(() => {
    return hasSevereMalnutrition;
  }, [hasSevereMalnutrition]);

  const canSubmit = useMemo(() => {
    return newVitalSigns && newVitalSigns.length > 0 && hasFormChanges;
  }, [newVitalSigns, hasFormChanges]);

  useEffect(() => {
    if (!initialFormData) {
      const initial = {
        ...formData,
        vitalSigns: newVitalSigns,
        anemic: formData.anemic || {
          seen: "",
          given_iron: "",
          is_anemic: false,
          date_completed: "",
        },
        birthwt: formData.birthwt || {
          seen: "",
          given_iron: "",
          date_completed: "",
        },
        medicines: formData.medicines || [],
        status: formData.status || "recorded",
        nutritionalStatus: formData.nutritionalStatus || {},
        edemaSeverity: formData.edemaSeverity || "None",
      };
      setInitialFormData(initial);
    }
  }, [formData, newVitalSigns, initialFormData]);

  useEffect(() => {
    if (!initialFormData) return;
    const currentFormData = {
      ...formData,
      vitalSigns: newVitalSigns,
      anemic: anemicData,
      birthwt: birthwtData,
      medicines: selectedMedicines,
      status: currentStatus,
      nutritionalStatus: nutritionalStatus,
      edemaSeverity: edemaSeverity,
    };
    const hasChanges = JSON.stringify(currentFormData) !== JSON.stringify(initialFormData);
    setHasFormChanges(hasChanges);
  }, [formData, newVitalSigns, anemicData, birthwtData, selectedMedicines, currentStatus, nutritionalStatus, edemaSeverity, initialFormData]);

  useEffect(() => {
    if (newVitalSigns.length > 0) {
      const updatedVitalSigns = newVitalSigns.map((vital) => ({
        ...vital,
        age: vital.age || currentAge,
      }));
      const hasChanges = JSON.stringify(updatedVitalSigns) !== JSON.stringify(newVitalSigns);
      if (hasChanges) {
        setNewVitalSigns(updatedVitalSigns);
      }
      setValue("vitalSigns", updatedVitalSigns);
      updateFormData({ vitalSigns: updatedVitalSigns });
    }
  }, [newVitalSigns, currentAge, setValue, updateFormData, setNewVitalSigns]);

  useEffect(() => {
    const hasTodaysHistoricalRecord = historicalVitalSigns.some((vital) => isToday(vital.date));
    const hasTodaysNewRecord = newVitalSigns.some((vital) => isToday(vital.date));
    setShowVitalSignsForm(!hasTodaysHistoricalRecord && !hasTodaysNewRecord);
  }, [historicalVitalSigns, newVitalSigns]);

  useEffect(() => {
    if (currentStatus === "immunization") {
      setValue("status", "immunization");
    }
    updateFormData({
      anemic: anemicData,
      birthwt: birthwtData,
      medicines: selectedMedicines,
      status: currentStatus,
      nutritionalStatus: nutritionalStatus,
      edemaSeverity: edemaSeverity,
    });
    vitalSignForm.setValue("age", currentAge);
    setValue(
      "historicalSupplementStatuses",
      historicalSupplementStatusesProp.map((status) => ({
        date_completed: status.date_completed ?? undefined,
      }))
    );
    if (currentAge && latestOverallVitalSign?.ht) {
      setValue("nutritionalStatus", { ...nutritionalStatus });
      updateFormData({ nutritionalStatus: { ...nutritionalStatus } });
    }
  }, [
    currentStatus,
    currentAge,
    latestOverallVitalSign,
    historicalSupplementStatusesProp,
    setValue,
    updateFormData,
    vitalSignForm,
    anemicData,
    birthwtData,
    selectedMedicines,
    nutritionalStatus,
    edemaSeverity,
  ]);

  const handleMedicineSelectionChange = (
    selectedMedicines: {
      minv_id: string;
      medrec_qty: number;
      reason: string;
    }[]
  ) => {
    const updatedMedicines = selectedMedicines.map((med) => ({
      ...med,
      medrec_qty: med.medrec_qty && med.medrec_qty >= 1 ? med.medrec_qty : 0,
    }));
    setValue("medicines", updatedMedicines);
    updateFormData({ medicines: updatedMedicines });
  };

  const handleUpdateVitalSign = (index: number, values: VitalSignType) => {
    const updatedVitalSigns = [...newVitalSigns];
    updatedVitalSigns[index] = {
      ...values,
      age: values.age || currentAge,
    };
    setNewVitalSigns(updatedVitalSigns);
    setEditingRowIndex(null);
  };

  const handleAddVitalSign = (values: VitalSignType) => {
    const vitalSignWithAge = {
      ...values,
      age: values.age || currentAge,
    };
    if (newVitalSigns.length > 0) {
      handleUpdateVitalSign(0, vitalSignWithAge);
    } else {
      setNewVitalSigns([vitalSignWithAge]);
    }
    setShowVitalSignsForm(false);
    vitalSignForm.reset({
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: vitalSignWithAge.wt,
      ht: vitalSignWithAge.ht,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      followv_status: "pending",
      notes: "",
      is_opt: false,
      remarks: "",
    });
  };

  const handleNutritionalStatusChange = (status: NutritionalStatusType) => {
    setValue("nutritionalStatus", status);
    updateFormData({ nutritionalStatus: status });
  };

  const handleSaveAnemiaDate = (index: number, newDateCompleted: string | null) => {
    const updatedStatuses = [...historicalSupplementStatusesProp];
    if (index >= 0 && index < updatedStatuses.length) {
      updatedStatuses[index] = {
        ...updatedStatuses[index],
        date_completed: newDateCompleted,
      };
      onUpdateHistoricalSupplementStatus(updatedStatuses);
    }
    setEditingAnemiaIndex(null);
  };

  const handleSaveBirthWeightDate = (index: number, newDateCompleted: string | null) => {
    const updatedStatuses = [...historicalSupplementStatusesProp];
    if (index >= 0 && index < updatedStatuses.length) {
      updatedStatuses[index] = {
        ...updatedStatuses[index],
        date_completed: newDateCompleted,
      };
      onUpdateHistoricalSupplementStatus(updatedStatuses);
    }
    setEditingBirthWeightIndex(null);
  };

  // NEW: Define a function to submit all pending followup updates
  const submitFollowupUpdates = async () => {
    const updates = Object.entries(pendingFollowupUpdates);
    if (updates.length === 0) return;
    const updatePromises = updates.map(async ([followvId, status]) => {
      return updateFollowupMutation.mutateAsync({
        followv_id: followvId.toString(),
        status,
      });
    });
    await Promise.all(updatePromises);
  };

  // UPDATE: Make handleFormSubmit async and update followups on submit
  const handleFormSubmit = handleSubmit(
    async (data) => {
      console.log("Submitting form data:", data);
      if (!canSubmit) {
        console.error("Cannot submit: No vital signs added or no changes detected");
        return;
      }
      try {
        await submitFollowupUpdates();
      } catch (error: any) {
        console.error("Error updating followups:", error.message);
      }
      onSubmit(data);
    },
    (errors) => {
      console.error("Form validation failed:", errors);
    }
  );

  const historicalSupplementStatusColumns = useMemo(
    () =>
      createHistoricalSupplementStatusColumns(
        editingAnemiaIndex,
        editingBirthWeightIndex,
        supplementStatusEditForm.control,
        supplementStatusEditForm.handleSubmit,
        handleSaveAnemiaDate,
        handleSaveBirthWeightDate,
        (index, currentDate) => {
          setEditingAnemiaIndex(index);
          supplementStatusEditForm.reset({ date_completed: currentDate });
        },
        (index, currentDate) => {
          setEditingBirthWeightIndex(index);
          supplementStatusEditForm.reset({ date_completed: currentDate });
        },
        () => setEditingAnemiaIndex(null),
        () => setEditingBirthWeightIndex(null),
        supplementStatusEditForm.reset
      ),
    [editingAnemiaIndex, editingBirthWeightIndex, supplementStatusEditForm.control, supplementStatusEditForm.handleSubmit, supplementStatusEditForm.reset]
  );

  const medicineHistory = {
    patientData: {
      pat_id: formData.pat_id,
      mode: "view_history",
    },
  };
  console.log("shit", medicineHistory);

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="rounded border border-red-200 bg-red-50 p-4">
              <h4 className="font-medium text-red-800">Form Validation Errors:</h4>
              <pre className="mt-2 text-sm text-red-700">{JSON.stringify(errors, null, 2)}</pre>
            </div>
          )}
          <PendingFollowupsSection
            chrecId={chrecId || ""}
            pendingStatuses={pendingFollowupUpdates}
            onFollowupChange={(followvId: number, newStatus: string) => setPendingFollowupUpdates((prev) => ({ ...prev, [followvId]: newStatus }))}
          />
          {/* Always show today's vital signs if they exist */}
          {hasTodaysVitalSigns && (
            <div className="pt-4">
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Today's Entry</h3>
              </div>
              <Form {...editVitalSignForm}>
                <VitalSignsCardView
                  data={combinedVitalSignsForTable || []}
                  editingRowIndex={editingRowIndex}
                  editVitalSignFormControl={editVitalSignFormControl}
                  editVitalSignFormHandleSubmit={editVitalSignFormHandleSubmit}
                  onUpdateVitalSign={handleUpdateVitalSign}
                  onStartEdit={(index: number) => {
                    setEditingRowIndex(index);
                  }}
                  onCancelEdit={() => {
                    setEditingRowIndex(null);
                  }}
                  editVitalSignFormReset={editVitalSignForm.reset}
                  allowNotesEdit={allowNotesEdit}
                />
              </Form>
            </div>
          )}
          {/* Only show the form if no vital signs exist for today */}
          {showVitalSignsForm && !hasTodaysVitalSigns && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Add New Vital Signs</h3>
              <Form {...vitalSignForm}>
                <VitalSignFormCard
                  title="New Vital Signs"
                  control={vitalSignForm.control}
                  handleSubmit={vitalSignForm.handleSubmit}
                  onSubmit={handleAddVitalSign}
                  onCancel={() => setShowVitalSignsForm(false)}
                  submitButtonText="Add Vital Signs"
                  cancelButtonText="Cancel"
                  isReadOnly={false}
                  allowNotesEdit={allowNotesEdit}
                />
              </Form>
            </div>
          )}
          <div className="mb-10 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Anemic and Birth Weight Status</h3>
            </div>
            <div className="space-y-6 p-6">
              <div className="rounded-lg border border-gray-100 p-5">
                <div className="mb-4 flex items-center">
                  <h4 className="flex items-center gap-2 text-base font-medium text-gray-700">
                    <HeartPulse className="h-5 w-5 text-red-600" />
                    Anemia Screening
                  </h4>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={control}
                    name="anemic.is_anemic"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </FormControl>
                        <FormLabel className="text-sm font-medium text-gray-700">Is the child anemic?</FormLabel>
                      </FormItem>
                    )}
                  />
                  {watch("anemic.is_anemic") && (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormDateTimeInput control={control} name="anemic.seen" label="Date Anemia Detected" type="date" />
                      <FormDateTimeInput control={control} name="anemic.given_iron" label="Date Iron Given" type="date" />
                    </div>
                  )}
                </div>
              </div>

              {latestOverallVitalSign && latestOverallVitalSign.wt !== undefined && Number(latestOverallVitalSign.wt) < 2.5 && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                  <div className="mb-4 flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                    <h4 className="text-base font-medium text-gray-700">Birth Weight Follow-up</h4>
                    <span className="ml-2 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">Low Birth Weight: {latestOverallVitalSign.wt} kg</span>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormDateTimeInput control={control} name="birthwt.seen" label="Date Seen" type="date" />
                    <FormDateTimeInput control={control} name="birthwt.given_iron" label="Date Iron Given" type="date" />
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* FIXED: Nutritional Status Calculator */}
          {shouldShowNutritionalStatusCalculator && (
            <div className="mb-10 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-bold">Nutritional Status</h3>
              <NutritionalStatusCalculator
                weight={latestOverallVitalSign?.wt}
                height={latestOverallVitalSign?.ht}
                age={currentAge}
                muac={watch("nutritionalStatus")?.muac}
                onStatusChange={handleNutritionalStatusChange}
                initialStatus={watch("nutritionalStatus")}
                gender={formData.childSex === "Male" || formData.childSex === "Female" ? formData.childSex : undefined}
              />

              {shouldShowSevereMalnutritionWarning && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="mb-2 font-medium text-red-800">Nutritional Status Assessment</h4>
                      {hasSevereMalnutrition ? (
                        <>
                          <p className="text-sm text-red-700">Severe malnutrition detected. Please assess for edema and provide appropriate intervention.</p>
                          <div className="mt-3 ml-3 p-3">
                            <FormSelect control={control} name="edemaSeverity" label="Edema Severity Level" options={edemaSeverityOptions} />
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-green-700">No severe malnutrition detected.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {historicalSupplementStatusesProp && historicalSupplementStatusesProp.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <div className="px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-sky-700">
                  <Pill className="h-4 w-4 text-sky-600" />
                  Historical Supplement Statuses (Anemia & Low Birth Weight)
                </h3>
              </div>
              <div>
                <DataTable columns={historicalSupplementStatusColumns} data={historicalSupplementStatusesProp} />
              </div>
            </div>
          )}
          <div className="mb-10 rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-bold">Medicine Prescription</h3>
            <div className="grid grid-cols-1 gap-6">
              {isMedicinesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-600">Loading medicines...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div>
                      <Dialog open={openHistoryDialog} onOpenChange={setOpenHistoryDialog}>
                        <DialogTrigger asChild>
                          <div className="flex justify-end">
                            <span className="text-sm italic text-blue-800 font-bold underline  cursor-pointer">View History</span>
                          </div>
                        </DialogTrigger>
                        <DialogContent
                          className="w-full max-w-full sm:max-w-3xl px-8"
                          style={{
                            width: "100%",
                            maxWidth: "100vw",
                            height: "80vh",
                            maxHeight: "90vh",
                            minHeight: "350px",
                            padding: 0,
                            overflow: "hidden",
                          }}
                        >
                          <div className="w-full h-full overflow-auto">
                            <IndivMedicineRecords patientDataProps={medicineHistory} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>{" "}
                  </div>

                  <MedicineDisplay
                    medicines={medicineStocksOptions || []}
                    initialSelectedMedicines={selectedMedicines || []}
                    onSelectedMedicinesChange={handleMedicineSelectionChange}
                    itemsPerPage={medicineSearchParams.pageSize}
                    currentPage={medicineSearchParams.page}
                    onPageChange={handleMedicinePageChange}
                    onSearch={handleMedicineSearch}
                    searchQuery={medicineSearchParams.search}
                    totalPages={medicinePagination?.totalPages}
                    totalItems={medicinePagination?.totalItems}
                    isLoading={isMedicinesLoading}
                  />
                </>
              )}
            </div>
          </div>
          {passed_status !== "immunization" ? (
            <div className="mb-10 rounded-lg border bg-purple-50 p-4">
              <h3 className="mb-4 text-lg font-bold">Record Purpose & Status</h3>
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-gray-700">Select the purpose of this record:</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="check-up" id="check-up" />
                          <Label htmlFor="check-up" className="cursor-pointer">
                            Check-up
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="immunization" id="immunization" />
                          <Label htmlFor="immunization" className="cursor-pointer">
                            Immunization
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="recorded" id="recorded" />
                          <Label htmlFor="recorded" className="cursor-pointer">
                            Record only
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {currentStatus === "check-up" && (
                <div className="mt-6">
                  <Label className="block mb-2">Forward To Doctor</Label>
                  <div className="relative">
                    <Combobox
                      options={doctorOptions?.formatted || []}
                      value={selectedStaffId}
                      onChange={(value) => {
                        setSelectedStaffId(value ?? "");
                        const staffId = value?.split("-")[0] || "";
                        setValue("selectedStaffId", staffId);
                      }}
                      placeholder={isDoctorLoading ? "Loading staff..." : "Select staff member"}
                      emptyMessage="No available staff members"
                      triggerClassName="w-full"
                    />
                  </div>
                </div>
              )}

              {currentStatus === "immunization" && passed_status !== "immunization" && (
                <div className="mt-6">
                  <Label className="block mb-2">Forward To</Label>
                  <div className="relative">
                    <Combobox
                      options={midwifeOptions?.formatted || []}
                      value={selectedStaffId}
                      onChange={(value) => {
                        setSelectedStaffId(value ?? "");
                        const staffId = value?.split("-")[0] || "";
                        setValue("selectedStaffId", staffId);
                      }}
                      placeholder={isMidwifeLoading ? "Loading staff..." : "Select staff member"}
                      emptyMessage="No available staff members"
                      triggerClassName="w-full"
                    />
                  </div>
                </div>
              )}
              {!currentStatus && <div className="mt-4 text-sm italic text-gray-500">Please select the purpose for this health record.</div>}
            </div>
          ) : (
            <div className="mb-10 rounded-lg border bg-blue-50 p-4">
              <h3 className="mb-2 text-lg font-bold text-blue-800">Record Status</h3>
              <div className="rounded border border-blue-200 bg-blue-100 p-3 text-blue-700">
                <strong>Status:</strong> Immunization - Record prepared for Immunization
              </div>
            </div>
          )}
          <div className="flex w-full justify-end gap-2">
            <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center gap-2 px-6 py-2 hover:bg-zinc-100 transition-colors duration-200 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button type="submit" className="flex items-center gap-2 px-6" disabled={!canSubmit}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}