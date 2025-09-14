"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormData, VitalSignType, NutritionalStatusType } from "@/form-schema/chr-schema/chr-schema";
import { useForm, UseFormHandleSubmit, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChildHealthFormSchema, VitalSignSchema } from "@/form-schema/chr-schema/chr-schema";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
import { NutritionalStatusCalculator } from "../../../../../components/ui/nutritional-status-calculator";
import { calculateCurrentAge } from "@/helpers/ageCalculator";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { DataTable } from "@/components/ui/table/data-table";
import {  Pill, Loader2, AlertTriangle, HeartPulse, ChevronLeft } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { z } from "zod";
import { createHistoricalNutritionalStatusColumns, createHistoricalVitalSignsColumns, createHistoricalMedicineColumns, createHistoricalSupplementStatusColumns } from "./columns";
import { edemaSeverityOptions } from "./options";
import { LastPageProps } from "./types";
import { isToday } from "@/helpers/isToday";

// Reusable Form Component
interface VitalSignFormCardProps {
  title: string;
  control: Control<VitalSignType>;
  handleSubmit: UseFormHandleSubmit<VitalSignType>;
  onSubmit: (data: VitalSignType) => void;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
}

const VitalSignFormCard = ({ title, control, handleSubmit, onSubmit, onCancel, submitButtonText = "Save", cancelButtonText = "Cancel" }: VitalSignFormCardProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit(onSubmit)} className="bg-green-600 px-3 py-1 text-xs hover:bg-green-700">
              {submitButtonText}
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} className="px-3 py-1 text-xs">
              {cancelButtonText}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <FormInput control={control} name="date" label="Date" type="text" placeholder="Date" readOnly />
          <FormInput control={control} name="age" label="Age" type="text" placeholder="Age" readOnly />
          <FormInput control={control} name="ht" label="Height (cm)" type="number" placeholder="Enter height" />
          <FormInput control={control} name="wt" label="Weight (kg)" type="number" placeholder="Enter weight" />
          <FormInput control={control} name="temp" label="Temperature (°C)" type="number" placeholder="Enter temperature" />
        </div>

        <FormField
          control={control}
          name="is_opt"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </FormControl>
              <FormLabel className="text-sm font-medium text-gray-700">Are you going to use this weighing for OPT tracking reports?</FormLabel>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormTextArea control={control} name="remarks" label="Remarks" placeholder="Enter remarks" rows={2} />

          <FormTextArea control={control} name="notes" label="Notes" placeholder="Enter notes" rows={2} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormDateTimeInput control={control} name="followUpVisit" label="Follow-up date" type="date" />

          <FormTextArea control={control} name="follov_description" label="Follow-up reason" placeholder="Enter reason for follow-up" rows={2} />
        </div>
      </div>
    </div>
  );
};

// Card Components for Vital Signs
interface VitalSignsCardViewProps {
  data: VitalSignType[];
  editingRowIndex: number | null;
  editVitalSignFormControl: Control<VitalSignType>;
  editVitalSignFormHandleSubmit: UseFormHandleSubmit<VitalSignType>;
  onUpdateVitalSign: (index: number, values: VitalSignType) => void;
  onStartEdit: (index: number, data: VitalSignType) => void;
  onCancelEdit: () => void;
  editVitalSignFormReset: (data: VitalSignType) => void;
}

const VitalSignsCardView = ({ data, editingRowIndex, editVitalSignFormControl, editVitalSignFormHandleSubmit, onUpdateVitalSign, onStartEdit, onCancelEdit, editVitalSignFormReset }: VitalSignsCardViewProps) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const isEditing = editingRowIndex === index;

        return (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {isEditing ? (
              <EditCard data={item} index={index} control={editVitalSignFormControl} handleSubmit={editVitalSignFormHandleSubmit} onUpdate={onUpdateVitalSign} onCancel={onCancelEdit} />
            ) : (
              <ViewCard
                data={item}
                index={index}
                onEdit={() => {
                  onStartEdit(index, item);
                  editVitalSignFormReset({
                    date: item.date,
                    age: item.age,
                    wt: item.wt,
                    ht: item.ht,
                    temp: item.temp,
                    remarks: item.remarks || "",
                    follov_description: item.follov_description || "",
                    followUpVisit: item.followUpVisit || "",
                    notes: item.notes || "",
                    followv_status: item.followv_status || "",
                    followv_id: item.followv_id || "",
                    chvital_id: item.chvital_id || "",
                    is_opt: item.is_opt || false
                  });
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// View Mode Card
const ViewCard = ({ data, index, onEdit }: { data: VitalSignType; index: number; onEdit: () => void }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-gray-900">Vital Signs - {data.date}</h4>
      <Button size="sm" onClick={onEdit} className="px-3 py-1 text-xs">
        Edit
      </Button>
    </div>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="space-y-1">
        <div className="text-gray-600">Age</div>
        <div className="font-medium">{data.age || "N/A"}</div>
      </div>
      <div className="space-y-1">
        <div className="text-gray-600">Temperature</div>
        <div className="font-medium">{data.temp ? `${data.temp} °C` : "-"}</div>
      </div>
      <div className="space-y-1">
        <div className="text-gray-600">Height</div>
        <div className="font-medium">{data.ht ? `${data.ht} cm` : "-"}</div>
      </div>
      <div className="space-y-1">
        <div className="text-gray-600">Weight</div>
        <div className="font-medium">{data.wt ? `${data.wt} kg` : "-"}</div>
      </div>
    </div>

    {data.remarks && (
      <div className="border-t pt-3">
        <div className="text-sm text-gray-600">Remarks</div>
        <p className="text-sm whitespace-pre-wrap">{data.remarks}</p>
      </div>
    )}

    {data.notes && (
      <div className="border-t pt-3">
        <div className="text-sm text-gray-600">Notes</div>
        <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
      </div>
    )}

    {data.followUpVisit && (
      <div className="border-t pt-3">
        <div className="text-sm text-gray-600">Follow-up</div>
        <div className="text-sm">
          {data.follov_description && <p>Reason: {data.follov_description}</p>}
          <p>
            Scheduled: {data.followUpVisit} ({data.followv_status || "N/A"})
          </p>
        </div>
      </div>
    )}
  </div>
);

// Edit Mode Card
const EditCard = ({ data, index, control, handleSubmit, onUpdate, onCancel }: { data: VitalSignType; index: number; control: Control<VitalSignType>; handleSubmit: UseFormHandleSubmit<VitalSignType>; onUpdate: (index: number, values: VitalSignType) => void; onCancel: () => void }) => (
  <VitalSignFormCard title={`Editing - ${data.date}`} control={control} handleSubmit={handleSubmit} onSubmit={(formData) => onUpdate(index, formData)} onCancel={onCancel} submitButtonText="Save" cancelButtonText="Cancel" />
);

export default function LastPage({
  onPrevious,
  onSubmit,
  updateFormData,
  formData,
  historicalVitalSigns = [],
  historicalNutritionalStatus = [],
  historicalSupplementStatuses: historicalSupplementStatusesProp = [],
  onUpdateHistoricalSupplementStatus,
  historicalMedicines = [],
  isSubmitting,
  newVitalSigns,
  setNewVitalSigns
}: LastPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<VitalSignType | null>(null);
  const [editingAnemiaIndex, setEditingAnemiaIndex] = useState<number | null>(null);
  const [editingBirthWeightIndex, setEditingBirthWeightIndex] = useState<number | null>(null);
  const { data: medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock();

  const [showVitalSignsForm, setShowVitalSignsForm] = useState(() => {
    const todaysHistoricalRecord = historicalVitalSigns.find((vital) => isToday(vital.date));
    return !todaysHistoricalRecord && newVitalSigns.length === 0;
  });

  const currentAge = useMemo(() => calculateCurrentAge(formData.childDob), [formData.childDob]);

  const getLatestVitalSigns = (vitalSigns: VitalSignType[] | undefined) => {
    if (!vitalSigns || vitalSigns.length === 0) return null;
    const sorted = [...vitalSigns].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
    return sorted[0];
  };

  const todaysHistoricalRecord = useMemo(() => {
    return historicalVitalSigns.find((vital) => isToday(vital.date));
  }, [historicalVitalSigns]);

  const combinedVitalSignsForTable = useMemo(() => {
    return newVitalSigns.map((vital, index) => ({
      ...vital,
      originalIndex: index
    }));
  }, [newVitalSigns]);

  const canSubmit = useMemo(() => {
    return newVitalSigns && newVitalSigns.length > 0;
  }, [newVitalSigns]);

  const shouldShowGeneralHealthSections = useMemo(() => {
    return !todaysHistoricalRecord;
  }, [todaysHistoricalRecord]);

  const latestOverallVitalSign = useMemo(() => {
    if (newVitalSigns.length > 0) {
      return newVitalSigns[0];
    }
    return getLatestVitalSigns(historicalVitalSigns);
  }, [newVitalSigns, historicalVitalSigns]);

  // NEW: Check if we have both age and height to show nutritional status
  const shouldShowNutritionalStatusCalculator = useMemo(() => {
    const hasAgeAndHeight = currentAge && latestOverallVitalSign?.ht;
    return hasAgeAndHeight && ((newVitalSigns.length > 0 && !todaysHistoricalRecord) || (latestOverallVitalSign && !isToday(latestOverallVitalSign.date)));
  }, [currentAge, latestOverallVitalSign, newVitalSigns.length, todaysHistoricalRecord]);

  const form = useForm<FormData>({
    resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      ...formData,
      vitalSigns: newVitalSigns,
      anemic: formData.anemic || {
        seen: "",
        given_iron: "",
        is_anemic: false,
        date_completed: ""
      },
      birthwt: formData.birthwt || {
        seen: "",
        given_iron: "",
        date_completed: ""
      },
      medicines: formData.medicines || [],
      status: formData.status || "recorded",
      nutritionalStatus: formData.nutritionalStatus || {},
      edemaSeverity: formData.edemaSeverity || "None"
    }
  });

  const vitalSignForm = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: latestOverallVitalSign?.wt || undefined,
      ht: latestOverallVitalSign?.ht || undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      followv_status: "pending",
      notes: "",
      is_opt: false,
      remarks: ""
    }
  });

  useEffect(() => {
    console.log("VitalSignForm defaultValues updated due to currentAge or latestOverallVitalSign change");
    console.log(vitalSignForm)
  }, [currentAge, vitalSignForm]);

  const editVitalSignForm = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: "",
      age: "",
      wt: undefined,
      ht: undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: ""
    }
  });

  const supplementStatusEditForm = useForm<{
    date_completed: string | null;
  }>({
    resolver: zodResolver(
      z.object({
        date_completed: z.string().nullable().optional()
      })
    ),
    defaultValues: {
      date_completed: null
    }
  });

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors }
  } = form;
  const { control: editVitalSignFormControl, handleSubmit: editVitalSignFormHandleSubmit } = editVitalSignForm;

  const selectedMedicines = watch("medicines");
  const currentStatus = watch("status");
  const nutritionalStatus = watch("nutritionalStatus");
  const anemicData = watch("anemic");
  const birthwtData = watch("birthwt");
  const edemaSeverity = watch("edemaSeverity");

  const hasSevereMalnutrition = useMemo(() => {
    if (!nutritionalStatus) return false;
    const { wfa, lhfa, wfh, muac_status } = nutritionalStatus;
    return wfa === "SUW" || lhfa === "SST" || wfh === "SW" || muac_status === "SAM";
  }, [nutritionalStatus]);

  const shouldShowSevereMalnutritionWarning = useMemo(() => {
    return hasSevereMalnutrition && !todaysHistoricalRecord;
  }, [hasSevereMalnutrition, todaysHistoricalRecord]);

  useEffect(() => {
    updateFormData({
      anemic: anemicData,
      birthwt: birthwtData,
      medicines: selectedMedicines,
      status: currentStatus,
      nutritionalStatus: nutritionalStatus,
      edemaSeverity: edemaSeverity
    });
  }, [anemicData, birthwtData, selectedMedicines, currentStatus, nutritionalStatus, edemaSeverity, updateFormData]);

  useEffect(() => {
    setValue("vitalSigns", newVitalSigns);
    updateFormData({ vitalSigns: newVitalSigns });
  }, [newVitalSigns, setValue, updateFormData]);

  useEffect(() => {
    vitalSignForm.reset({
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: latestOverallVitalSign?.wt || undefined,
      ht: latestOverallVitalSign?.ht || undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: ""
    });
  }, [currentAge, latestOverallVitalSign, vitalSignForm]);

  useEffect(() => {
    setValue(
      "historicalSupplementStatuses",
      historicalSupplementStatusesProp.map((status) => ({
        date_completed: status.date_completed ?? undefined
      }))
    );
  }, [historicalSupplementStatusesProp, setValue]);

  // NEW: Update nutritional status when age or height changes
  useEffect(() => {
    if (currentAge && latestOverallVitalSign?.ht) {
      // Trigger nutritional status recalculation
      setValue("nutritionalStatus", { ...nutritionalStatus });
      updateFormData({ nutritionalStatus: { ...nutritionalStatus } });
    }
  }, [currentAge, latestOverallVitalSign?.ht]);

  const handleMedicineSelectionChange = (
    selectedMedicines: {
      minv_id: string;
      medrec_qty: number;
      reason: string;
    }[]
  ) => {
    // Keep all medicines, but ensure quantities are valid numbers (default to 0 if invalid)
    const updatedMedicines = selectedMedicines.map((med) => ({
      ...med,
      medrec_qty: med.medrec_qty && med.medrec_qty >= 1 ? med.medrec_qty : 0
    }));

    setValue("medicines", updatedMedicines);
    updateFormData({
      medicines: updatedMedicines
    });
  };

  const handleUpdateVitalSign = (index: number, values: VitalSignType) => {
    const updatedVitalSigns = [...newVitalSigns];
    updatedVitalSigns[index] = values;
    setNewVitalSigns(updatedVitalSigns);
    setEditingRowIndex(null);
    setEditingData(null);
  };

  const handleAddVitalSign = (values: VitalSignType) => {
    if (newVitalSigns.length > 0) {
      handleUpdateVitalSign(0, values);
    } else {
      setNewVitalSigns([values]);
    }
    setShowVitalSignsForm(false);
    vitalSignForm.reset({
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: values.wt,
      ht: values.ht,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: ""
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
        date_completed: newDateCompleted
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
        date_completed: newDateCompleted
      };
      onUpdateHistoricalSupplementStatus(updatedStatuses);
    }
    setEditingBirthWeightIndex(null);
  };

  const handleFormSubmit = handleSubmit(
    (data) => {
      console.log("Submitting form data:", data);
      if (!canSubmit) {
        console.error("Cannot submit: No vital signs added");
        return;
      }
      onSubmit(data);
    },
    (errors) => {
      console.error("Form validation failed:", errors);
    }
  );

  const historicalNutritionalStatusColumns = useMemo(() => createHistoricalNutritionalStatusColumns(), []);
  const historicalVitalSignsColumns = useMemo(() => createHistoricalVitalSignsColumns(), []);
  const historicalMedicineColumns = useMemo(() => createHistoricalMedicineColumns(), []);
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

          {!canSubmit && !showVitalSignsForm && (
            <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-800">⚠️ Required Information Missing</h4>
              <p className="mt-1 text-sm text-yellow-700">Please add at least one vital sign record before submitting the form.</p>
            </div>
          )}

          {showVitalSignsForm && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Add New Vital Signs</h3>
              <VitalSignFormCard title="New Vital Signs" control={vitalSignForm.control} handleSubmit={vitalSignForm.handleSubmit} onSubmit={handleAddVitalSign} onCancel={() => setShowVitalSignsForm(false)} submitButtonText="Add Vital Signs" cancelButtonText="Cancel" />
            </div>
          )}

          {!showVitalSignsForm && newVitalSigns.length === 0 && (
            <div className="flex justify-end">
              <Button type="button" onClick={() => setShowVitalSignsForm(true)}>
                Add New Vital Signs
              </Button>
            </div>
          )}

          {newVitalSigns.length > 0 && (
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
                  onStartEdit={(index, data) => {
                    setEditingRowIndex(index);
                    setEditingData(data);
                  }}
                  onCancelEdit={() => {
                    setEditingRowIndex(null);
                    setEditingData(null);
                  }}
                  editVitalSignFormReset={editVitalSignForm.reset}
                />
              </Form>
            </div>
          )}

          {shouldShowGeneralHealthSections && (
            <div className="mb-10 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Anemic and Birth Weight Status</h3>
              </div>
              <div className="space-y-6 p-6">
                <div className="rounded-lg border border-gray-100  p-5">
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

                {latestOverallVitalSign &&
                  latestOverallVitalSign.wt !== undefined &&
                  Number(latestOverallVitalSign.wt) < 2.5 && ( // Only show if wt < 2.5
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
          )}

          {shouldShowNutritionalStatusCalculator && (
            <div className="mb-10 rounded-lg border  p-4">
              <h3 className="mb-4 text-lg font-bold">Nutritional Status</h3>
              <NutritionalStatusCalculator
                weight={newVitalSigns.length > 0 ? newVitalSigns[0].wt : latestOverallVitalSign?.wt}
                height={newVitalSigns.length > 0 ? newVitalSigns[0].ht : latestOverallVitalSign?.ht}
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
              <div className="">
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
                    <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 last:mx-auto"></div>
                    <p className="text-sm text-gray-600">Loading medicines...</p>
                  </div>
                </div>
              ) : (
                <MedicineDisplay medicines={medicineStocksOptions || []} initialSelectedMedicines={selectedMedicines || []} onSelectedMedicinesChange={handleMedicineSelectionChange} currentPage={currentPage} onPageChange={setCurrentPage} />
              )}
            </div>
          </div>

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
            {currentStatus && (
              <div className={`mt-4 rounded border p-3 ${currentStatus === "check-up" ? "border-green-200 bg-green-50 text-green-600" : currentStatus === "immunization" ? "border-blue-200 bg-blue-50 text-blue-600" : "border-purple-200 bg-purple-50 text-purple-600"}`}>
                <strong>Status:</strong> {currentStatus === "check-up" ? "Record prepared for Check-up" : currentStatus === "immunization" ? "Record prepared for Immunization" : "Record only - No further action required"}
              </div>
            )}
            {!currentStatus && <div className="mt-4 text-sm italic text-gray-500">Please select the purpose for this health record.</div>}
          </div>

          <div className="flex w-full justify-end gap-2">
            <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center gap-2 px-6 py-2 hover:bg-zinc-100 transition-colors duration-200 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button type="submit" className="flex items-center gap-2 px-6" disabled={!canSubmit || isSubmitting}>
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
