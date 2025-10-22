// Main Immunization Component - FIXED
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { HeartPulse, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Form } from "@/components/ui/form/form";
import { toast } from "sonner";
import { VitalSignType, VaccineRecord, ExistingVaccineRecord, ImmunizationFormData } from "@/form-schema/ImmunizationSchema";
import { createImmunizationColumns } from "./columns";
import { calculateNextVisitDate } from "@/helpers/Calculatenextvisit";
import { useAuth } from "@/context/AuthContext";
import { NotesDialog } from "./NotesDialog";
import { VaccinationSection } from "./VaccinationSection";
import { useImmunizationMutations } from "./queries/submitStep2";
import { FollowUpsCard } from "@/components/ui/ch-vac-followup";
import { VaccinationStatusCards } from "@/components/ui/vaccination-status";
import CardLayout from "@/components/ui/card/card-layout";

export interface ImmunizationProps {
  ChildHealthRecord: any;
  historicalVitalSigns?: VitalSignType[];
  historicalNotes?: {
    date: string;
    notes: string;
    followUpVisit?: string;
    follov_description?: string;
    followv_status?: string;
    chnotes_id?: string;
  }[];
  onUpdateVitalSigns?: (updatedVitalSigns: VitalSignType[]) => void;
  onBack?: () => void;
  vaccines?: VaccineRecord[];
  existingVaccines?: ExistingVaccineRecord[];
  setVaccines?: (vaccines: VaccineRecord[]) => void;
  setExistingVaccines?: (vaccines: ExistingVaccineRecord[]) => void;
  showVaccineList: boolean;
  setShowVaccineList: (value: boolean) => void;
  vaccinesData?: {
    default: any[];
    formatted: {
      id: string;
      name: React.ReactNode;
      quantity?: number;
    }[];
  };
  vaccinesListData?: {
    default: any[];
    formattedOptions: { id: string; name: string }[];
  };
  isLoading: boolean;
  vaccineHistory?: any[];
  unvaccinatedVaccines?: any[];
  vaccinations?: any[];
  followUps?: any[];
}

export default function Immunization({
  ChildHealthRecord,
  historicalVitalSigns = [],
  historicalNotes = [],
  onUpdateVitalSigns,
  onBack = () => {},
  vaccines: propVaccines = [],
  existingVaccines: propExistingVaccines = [],
  setVaccines: propSetVaccines,
  setExistingVaccines: propSetExistingVaccines,
  showVaccineList,
  setShowVaccineList,
  vaccinesData = { default: [], formatted: [] },
  vaccinesListData = { default: [], formattedOptions: [] },
  isLoading = false,
  vaccineHistory = [],
  unvaccinatedVaccines = [],
  vaccinations = [],
  followUps = []
}: ImmunizationProps) {
  const [latestVitalSigns, setLatestVitalSigns] = useState<VitalSignType | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [currentEditingData, setCurrentEditingData] = useState<any>(null);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>(propVaccines);
  const [existingVaccines, setExistingVaccines] = useState<ExistingVaccineRecord[]>(propExistingVaccines);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>("");
  const [selectedVaccineListId, setSelectedVaccineListId] = useState<string>("");
  const [vaccineListOptions, setVaccineListOptions] = useState<{ default: any[]; formatted: { id: string; name: string }[] }>({ default: [], formatted: [] });
  const [nextVisitDate, setNextVisitDate] = useState<string | null>(null);
  const [nextVisitDescription, setNextVisitDescription] = useState<string | null>(null);
  const [isVaccineComplted, setisVaccineComplted] = useState(false);
  const [currentVaccineTotalDoses, setCurrentVaccineTotalDoses] = useState<number>(1);
  const [existingVaccineTotalDoses, setExistingVaccineTotalDoses] = useState<number>(1);
  const [newVaccineErrors] = useState<{ vaccine?: string; dose?: string; date?: string }>({});
  const [existingVaccineErrors, setExistingVaccineErrors] = useState<{ vaccine?: string; dose?: string; date?: string }>({});
  const pat_id = ChildHealthRecord?.record?.chrec_details?.patrec_details?.pat_id.toString() || "";
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id || null;
  const [basicVaccineList, setBasicVaccineList] = useState<any[]>([]);
  const { mutate: saveImmunization, isPending: isSaving } = useImmunizationMutations();
  
  console.log("eadadd", ChildHealthRecord);

  // Get the single vital signs record
  const vitalSigns = ChildHealthRecord?.record?.child_health_vital_signs?.[0];
  const vital_id = vitalSigns?.vital || null;
  console.log("vital_id", vital_id);

  useEffect(() => {
    if (vaccinesListData) {
      setBasicVaccineList(vaccinesListData.default);
      setVaccineListOptions({
        default: vaccinesListData.default,
        formatted: vaccinesListData.formattedOptions
      });
    }
  }, [vaccinesListData]);

  useEffect(() => {
    setVaccines(propVaccines);
  }, [propVaccines]);

  useEffect(() => {
    setExistingVaccines(propExistingVaccines);
  }, [propExistingVaccines]);

  const form = useForm<ImmunizationFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      age: "",
      wt: "",
      ht: "",
      temp: "",
      follov_description: "",
      followUpVisit: "",
      followv_status: "pending",
      notes: "",
      existingVaccines: propExistingVaccines.map((v) => ({
        vac_id: v.vac_id,
        vac_name: v.vac_name,
        vaccineType: v.vaccineType,
        dose: v.dose,
        date: v.date,
        hasExistingVaccination: true,
        totalDoses: v.totalDoses || "",
        vacrec: v.vacrec || ""
      })),
      vaccines: propVaccines.map((v) => ({
        vacStck_id: v.vacStck_id,
        vaccineType: v.vaccineType,
        dose: v.dose,
        date: v.date,
        vac_id: v.vac_id,
        vac_name: v.vac_name,
        expiry_date: v.expiry_date,
        totalDoses: v.totalDoses || "",
        nextFollowUpDate: v.nextFollowUpDate || "",
        vacrec: v.vacrec || "",
        existingFollowvId: v.existingFollowvId
      }))
    }
  });



  useEffect(() => {
    if (historicalVitalSigns.length > 0) {
      const todaysRecord = historicalVitalSigns.find((vital) => vital.date === new Date().toISOString().split("T")[0]);
      if (todaysRecord) {
        setLatestVitalSigns(todaysRecord);
        form.reset({
          ...todaysRecord, // This includes notes, follov_description, etc.
          existingVaccines: existingVaccines,
          vaccines: vaccines
        });
      } else {
        const sortedVitalSigns = [...historicalVitalSigns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestRecord = sortedVitalSigns[0];
        setLatestVitalSigns(latestRecord);
        form.reset({
          date: new Date().toISOString().split("T")[0],
          age: latestRecord?.age || "",
          wt: latestRecord?.wt || "",
          ht: latestRecord?.ht || "",
          temp: latestRecord?.temp || "",
          notes: latestRecord?.notes || "", // Include notes
          follov_description: latestRecord?.follov_description || "", // Include follow-up reason
          followUpVisit: latestRecord?.followUpVisit || "", // Include follow-up date
          followv_status: latestRecord?.followv_status || "pending", // Include status
          existingVaccines: existingVaccines,
          vaccines: vaccines
        });
      }
    }
  }, [historicalVitalSigns, form, existingVaccines, vaccines]);

  

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").split("/").reverse().join("-");
    form.setValue("vaccines.0.date", formattedDate);
    form.setValue("existingVaccines.0.date", formattedDate);
  }, [form]);

  // All your existing vaccine change handlers remain the same...
  const handleVaccineChange = (value: string) => {
    // ... existing implementation stays the same
    form.setValue("vaccines.0.vaccineType", value);
    setisVaccineComplted(false);
    setSelectedVaccineId(value);
    setNextVisitDate(null);
    setNextVisitDescription(null);
    form.setValue("vaccines.0.nextFollowUpDate", "");
    form.setValue("vaccines.0.totalDoses", "");
    
    if (!value) return;

    console.log("Selected vaccine value:", value);
    
    let vacStck_id: any, vac_id: any, vac_name: any;
    if (!value.includes(",")) {
      vac_id = value;
      const selectedVaccine = vaccinesData?.default?.find((v: any) => v.vac_id?.toString() === vac_id || v.vacStck_id?.toString() === vac_id);
      if (selectedVaccine) {
        vac_name = selectedVaccine.vac_name;
        vacStck_id = selectedVaccine.vacStck_id?.toString() || vac_id;
      }
    } else {
      [vacStck_id, vac_id, vac_name] = value.split(",");
    }

    const numericVacId = parseInt(vac_id, 10);
    let selectedVaccine = null;
    
    if (vaccinesData?.default) {
      selectedVaccine = vaccinesData.default.find((v: any) => v.vac_id === numericVacId || v.vacStck_id === parseInt(vacStck_id, 10));
    }

    if (!selectedVaccine && vaccinesListData?.default) {
      selectedVaccine = vaccinesListData.default.find((v: any) => v.vac_id === numericVacId);
    }

    if (!selectedVaccine) {
      console.error("Selected vaccine not found. Available vaccines:", vaccinesData?.default);
      return;
    }

    const vaccineInfo = selectedVaccine.vaccinelist || selectedVaccine;
    const vaccineHistoryForThis = vaccineHistory.filter((record) => {
      const recordVacId = record.vacrec_details?.vacrec_vaccine || record.vaccine_stock?.vaccinelist?.vac_id || record.vac_details?.vac_id;
      return recordVacId === numericVacId;
    });

    let highestDose = 0;
    let existingVacrecId = "";
    let existingFollowvId = "";
    let existingTotalDoses = vaccineInfo.no_of_doses || 1;

    vaccineHistoryForThis.forEach((record) => {
      const doseNo = record.vachist_doseNo ? parseInt(record.vachist_doseNo) : 0;
      if (doseNo > highestDose) {
        highestDose = doseNo;
        existingVacrecId = record.vacrec?.toString() || "";
        existingFollowvId = record.followv?.toString() || "";
        if (record.vacrec_details?.vacrec_totaldose) {
          existingTotalDoses = record.vacrec_details.vacrec_totaldose;
        }
      }
    });

    form.setValue("vaccines.0.existingFollowvId", existingFollowvId);
    form.setValue("vaccines.0.vacrec", existingVacrecId);
    form.setValue("vaccines.0.totalDoses", existingTotalDoses.toString());

    const nextDose = highestDose + 1;
    form.setValue("vaccines.0.dose", nextDose.toString());

    if (vaccineInfo.no_of_doses) {
      form.setValue("vaccines.0.totalDoses", vaccineInfo.no_of_doses.toString());
      setCurrentVaccineTotalDoses(existingTotalDoses);
    }

    const isCompleted = nextDose > (vaccineInfo.no_of_doses || 1);
    const disableSubmit = (isCompleted && vaccineInfo.vac_type_choices === "primary") || (vaccineInfo.vac_type_choices === "conditional" && isCompleted);
    setisVaccineComplted(disableSubmit);
    
    if (disableSubmit) {
      toast.warning(`${vac_name || vaccineInfo.vac_name} vaccine is already completed`);
      return;
    }

    if (vaccineInfo.vac_type_choices === "routine" && vaccineInfo.routine_frequency) {
      const { interval, time_unit } = vaccineInfo.routine_frequency;
      const nextDate = calculateNextVisitDate(interval, time_unit, new Date().toISOString());
      setNextVisitDate(nextDate.toISOString().split("T")[0]);
      setNextVisitDescription(`Vaccination for ${vaccineInfo.vac_name}`);
      form.setValue("vaccines.0.nextFollowUpDate", nextDate.toISOString().split("T")[0]);
    } else if (nextDose < (vaccineInfo.no_of_doses || 1)) {
      const nextDoseNumber = nextDose + 1;
      const doseInterval = vaccineInfo.intervals?.find((interval: any) => interval.dose_number === nextDoseNumber);
      
      if (doseInterval) {
        const nextDate = calculateNextVisitDate(doseInterval.interval, doseInterval.time_unit, new Date().toISOString());
        setNextVisitDate(nextDate.toISOString().split("T")[0]);
        setNextVisitDescription(`Dose ${nextDoseNumber} of ${vaccineInfo.vac_name}`);
        form.setValue("vaccines.0.nextFollowUpDate", nextDate.toISOString().split("T")[0]);
      }
    }
  };

  const handleExistingVaccineChange = (value: string) => {
    // ... existing implementation stays the same
    setisVaccineComplted(false);
    setSelectedVaccineListId(value);
    form.setValue(`existingVaccines.0.vaccineType`, value);
    
    if (!value) return;

    const [vac_id, vac_name] = value.split(",");
    const numericVacId = parseInt(vac_id, 10);
    const selectedVaccine = basicVaccineList.find((v: any) => v.vac_id === numericVacId);

    if (!selectedVaccine) {
      console.error("Selected vaccine not found");
      return;
    }

    const vaccineHistoryForThis = vaccineHistory.filter((record) => {
      const recordVacId = record.vacrec_details?.vacrec_vaccine || record.vaccine_stock?.vaccinelist?.vac_id || record.vac_details?.vac_id;
      return recordVacId === numericVacId;
    });

    let highestDose = 0;
    let existingVacrecId = "";
    let existingTotalDoses = selectedVaccine.no_of_doses;

    vaccineHistoryForThis.forEach((record) => {
      const doseNo = record.vachist_doseNo ? parseInt(record.vachist_doseNo) : 0;
      if (doseNo > highestDose) {
        highestDose = doseNo;
        existingVacrecId = record.vacrec?.toString() || "";
        if (record.vacrec_details?.vacrec_totaldose) {
          existingTotalDoses = record.vacrec_details.vacrec_totaldose;
        }
      }
    });

    const nextDose = highestDose + 1;
    form.setValue("existingVaccines.0.vacrec", existingVacrecId);
    form.setValue("existingVaccines.0.totalDoses", existingTotalDoses.toString());
    form.setValue(`existingVaccines.0.dose`, nextDose.toString());

    if (selectedVaccine.no_of_doses) {
      form.setValue(`existingVaccines.0.totalDoses`, selectedVaccine.no_of_doses.toString());
      setExistingVaccineTotalDoses(selectedVaccine.no_of_doses);
    }

    const isCompleted = nextDose > selectedVaccine.no_of_doses;
    const disableSubmit = (isCompleted && selectedVaccine.vac_type_choices !== "routine") || (selectedVaccine.vac_type_choices === "conditional" && isCompleted);
    setisVaccineComplted(disableSubmit);
    
    if (disableSubmit) {
      toast.warning(`${vac_name} vaccine is already completed`);
    }
  };

  // Other handlers remain the same...
  const addVac = () => {
    if (!selectedVaccineId) {
      toast.error("Please select a vaccine first");
      return;
    }
    
    const formValues = form.getValues();
    const [vacStck_id, vac_id, vac_name, expiry_date] = selectedVaccineId.split(",");
    
    const vaccineToAdd: VaccineRecord = {
      vacStck_id: vacStck_id.trim(),
      vaccineType: vac_name.trim(),
      dose: formValues.vaccines?.[0]?.dose || "1",
      date: formValues.vaccines?.[0]?.date || new Date().toISOString().split("T")[0],
      vac_id: vac_id.trim(),
      vac_name: vac_name.trim(),
      expiry_date: expiry_date.trim(),
      totalDoses: formValues.vaccines?.[0]?.totalDoses || currentVaccineTotalDoses.toString(),
      nextFollowUpDate: formValues.vaccines?.[0]?.nextFollowUpDate || nextVisitDate || "",
      vacrec: formValues.vaccines?.[0]?.vacrec || "",
      existingFollowvId: formValues.vaccines?.[0]?.existingFollowvId || ""
    };

    const newVaccines = [...vaccines, vaccineToAdd];
    setVaccines(newVaccines);
    if (propSetVaccines) propSetVaccines(newVaccines);
    form.setValue("vaccines", newVaccines);
    form.setValue("vaccines.0.vaccineType", "");
    form.setValue("vaccines.0.dose", "1");
    form.setValue("vaccines.0.date", new Date().toISOString().split("T")[0]);
    form.setValue("vaccines.0.totalDoses", "");
    form.setValue("vaccines.0.nextFollowUpDate", "");
    setSelectedVaccineId("");
  };

  const addExistingVac = async () => {
    if (!selectedVaccineListId) {
      toast.error("Please select a vaccine first");
      return;
    }
    
    const isValid = await form.trigger(["vaccines.0.vaccineType", "vaccines.0.dose", "vaccines.0.date"]);
    if (!isValid) {
      toast.error("Please fill in the fields");
      return;
    }
    
    const formValues = form.getValues();
    const [vac_id, vac_name] = selectedVaccineListId.split(",");
    
    const vaccineToAdd: ExistingVaccineRecord = {
      vac_id: vac_id.trim(),
      vac_name: vac_name.trim(),
      vaccineType: vac_name.trim(),
      dose: formValues.existingVaccines?.[0]?.dose || "1",
      date: formValues.existingVaccines?.[0]?.date || "",
      hasExistingVaccination: true,
      vacrec: formValues.existingVaccines?.[0]?.vacrec || "",
      totalDoses: existingVaccineTotalDoses.toString()
    };

    const newExistingVaccines = [...existingVaccines, vaccineToAdd];
    setExistingVaccines(newExistingVaccines);
    if (propSetExistingVaccines) propSetExistingVaccines(newExistingVaccines);
    form.setValue("existingVaccines", newExistingVaccines);
    setSelectedVaccineListId("");
    form.setValue("existingVaccines.0", {
      dose: "",
      date: "",
      vac_id: "",
      vac_name: "",
      vaccineType: "",
      hasExistingVaccination: false,
      vacrec: "",
      totalDoses: ""
    });
  };

  const deleteVac = (index: number) => {
    const updatedVaccines = [...vaccines];
    updatedVaccines.splice(index, 1);
    setVaccines(updatedVaccines);
    if (propSetVaccines) propSetVaccines(updatedVaccines);
    form.setValue("vaccines", updatedVaccines);
    toast.success("Vaccine removed successfully!");
  };

  const deleteExistingVac = (index: number) => {
    const updatedExistingVaccines = [...existingVaccines];
    updatedExistingVaccines.splice(index, 1);
    setExistingVaccines(updatedExistingVaccines);
    if (propSetExistingVaccines) propSetExistingVaccines(updatedExistingVaccines);
    form.setValue("existingVaccines", updatedExistingVaccines);
    toast.success("Existing vaccine removed successfully!");
  };

  const handleUpdateVitalSign = (values: VitalSignType) => {
    const updatedVitalSigns = [...historicalVitalSigns];
    const existingIndex = updatedVitalSigns.findIndex((v) => v.date === values.date);
    
    if (existingIndex >= 0) {
      updatedVitalSigns[existingIndex] = values;
    } else {
      updatedVitalSigns.push(values);
    }
    
    setLatestVitalSigns(values);
    setEditingRowIndex(null);
    
    if (onUpdateVitalSigns) {
      onUpdateVitalSigns(updatedVitalSigns);
    }
  };

  const handleStartEdit = (index: number, vitalSignsData: any) => {
    setEditingRowIndex(index);
    
    // Get the CURRENT form values
    const currentFormValues = form.getValues();
    
    // Prepare editing data - prioritize CURRENT form values over historical data
    const editingData = {
      ...vitalSignsData, // Keep vital signs data
      notes: currentFormValues.notes || vitalSignsData.notes || "",
      follov_description: currentFormValues.follov_description || vitalSignsData.follov_description || "",
      followUpVisit: currentFormValues.followUpVisit || vitalSignsData.followUpVisit || "",
      followv_status: currentFormValues.followv_status || vitalSignsData.followv_status || "pending",
      date: vitalSignsData.date // Always use the row's date
    };
    
    setCurrentEditingData(editingData);
    setIsNotesDialogOpen(true);
    
    console.log("Editing data (with current form values):", editingData);
    console.log("Current form values:", currentFormValues);
  };

// Replace your handleSaveNotes function with this:
const handleSaveNotes = (data: VitalSignType) => {
  // Update the form values immediately with the new notes data
  form.setValue("notes", data.notes || "");
  form.setValue("follov_description", data.follov_description || "");
  form.setValue("followUpVisit", data.followUpVisit || "");
  form.setValue("followv_status", data.followv_status || "pending");

  if (editingRowIndex !== null) {
    // Create the updated vital sign data with the NEW notes from the form
    const updatedVitalSign = {
      date: data.date,
      age: data.age,
      ht: data.ht,
      wt: data.wt,
      temp: data.temp,
      notes: data.notes, // This should be the NEW notes you just entered
      follov_description: data.follov_description, // NEW follow-up reason
      followUpVisit: data.followUpVisit, // NEW follow-up date
      followv_status: data.followv_status // NEW status
    };
    
    handleUpdateVitalSign(updatedVitalSign);
    
    // Also update the latestVitalSigns to reflect the changes
    setLatestVitalSigns(prev => prev ? { ...prev, ...updatedVitalSign } : updatedVitalSign);
  }
  
  setIsNotesDialogOpen(false);
  setEditingRowIndex(null);
  setCurrentEditingData(null);
  toast.success("Notes saved successfully!");

  // Debug: Check what values are now in the form
  console.log("Form values after saving notes:", form.getValues());
};
  const { vitalSignsColumns, vaccineColumns, existingVaccineColumns } = createImmunizationColumns({
    editingRowIndex,
    isLoading,
    historicalNotes, // Pass historicalNotes to the columns
    handleStartEdit,
    deleteVac,
    deleteExistingVac
  });

  const handleShowVaccineListChange = (checked: boolean) => {
    setShowVaccineList(checked);
    if (!checked) {
      setExistingVaccines([]);
      setSelectedVaccineListId("");
      setExistingVaccineErrors({});
    }
  };


  

  const onSubmit = async (data: ImmunizationFormData) => {
    saveImmunization({
      data,
      vaccines,
      existingVaccines,
      ChildHealthRecord,
      vital_id,
      staff_id,
      pat_id
    });
  };

  return (
    <>
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 2 of 2</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full">
              <VaccinationStatusCards unvaccinatedVaccines={unvaccinatedVaccines} vaccinations={vaccinations} />
            </div>
            <div className="w-full">
              <FollowUpsCard followupVaccines={followUps} />
            </div>
          </div>
          
          <CardLayout
            title={
              <>
                <div className="flex items-center gap-3 mb-4">
                  <HeartPulse className="h-6 w-6 text-red-500" />
                  <h2 className="text-lg font-semibold">Latest Vital Signs</h2>
                </div>
              </>
            }
            cardClassName="mt-4"
            content={<>{latestVitalSigns ? <DataTable columns={vitalSignsColumns} data={[latestVitalSigns]} /> : <div className="text-center py-4 text-gray-500">No vital signs recorded yet</div>}</>}
          />
          
          <VaccinationSection
            showVaccineList={showVaccineList}
            handleShowVaccineListChange={handleShowVaccineListChange}
            vaccineListOptions={vaccineListOptions}
            selectedVaccineListId={selectedVaccineListId}
            handleExistingVaccineChange={handleExistingVaccineChange}
            setSelectedVaccineListId={setSelectedVaccineListId}
            existingVaccineErrors={existingVaccineErrors}
            form={form}
            existingVaccineTotalDoses={existingVaccineTotalDoses}
            addExistingVac={addExistingVac}
            vaccinesData={vaccinesData}
            formWatch={form.watch}
            handleVaccineChange={handleVaccineChange}
            setSelectedVaccineId={setSelectedVaccineId}
            isLoading={isLoading}
            newVaccineErrors={newVaccineErrors}
            currentVaccineTotalDoses={currentVaccineTotalDoses}
            selectedVaccineId={selectedVaccineId}
            nextVisitDate={nextVisitDate}
            nextVisitDescription={nextVisitDescription}
            addVac={addVac}
            isVaccineCompleted={isVaccineComplted}
            existingVaccines={existingVaccines}
            existingVaccineColumns={existingVaccineColumns}
            vaccines={vaccines}
            vaccineColumns={vaccineColumns}
          />
<NotesDialog
  isOpen={isNotesDialogOpen}
  onClose={() => {
    setIsNotesDialogOpen(false);
    setEditingRowIndex(null);
    setCurrentEditingData(null);
  }}
  form={form}
  isLoading={isLoading}
  onSave={handleSaveNotes}
  editingData={currentEditingData}
  historicalNotes={historicalNotes} // Add this line to pass historical notes
/>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onBack}>
              <ChevronLeft />
              Previous
            </Button>
            <Button type="submit" className="w-[120px] px-2" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
