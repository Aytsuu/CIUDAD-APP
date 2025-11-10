// Main Immunization Component - WITH LOCALSTORAGE
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
import { useLocalStorage } from "@/helpers/useLocalStorage";
// Your existing useLocalStorage hook remains the same


// Storage keys
const STORAGE_KEYS = {
  VACCINES: "immunization_vaccines",
  EXISTING_VACCINES: "immunization_existing_vaccines",
  VITAL_SIGNS: "immunization_vital_signs",
  FORM_DATA: "immunization_form_data",
  NOTES: "immunization_notes",
  FOLLOW_UP: "immunization_follow_up",
};

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
  followUps = [],
}: any) {
  // Use localStorage for persistent state
  const [vaccines, setVaccines] = useLocalStorage<VaccineRecord[]>(STORAGE_KEYS.VACCINES, propVaccines);
  const [existingVaccines, setExistingVaccines] = useLocalStorage<ExistingVaccineRecord[]>(STORAGE_KEYS.EXISTING_VACCINES, propExistingVaccines);
  const [savedNotes, setSavedNotes] = useLocalStorage<string>(STORAGE_KEYS.NOTES, "");
  const [savedFollowUpData, setSavedFollowUpData] = useLocalStorage<{ follov_description: string; followUpVisit: string; followv_status: string }>(
    STORAGE_KEYS.FOLLOW_UP,
    { follov_description: "", followUpVisit: "", followv_status: "pending" }
  );

  const [latestVitalSigns, setLatestVitalSigns] = useState<VitalSignType | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [currentEditingData, setCurrentEditingData] = useState<any>(null);
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

  // NEW: State to track if vaccine already exists
  const [, setVaccineAlreadyExists] = useState<boolean>(false);
  const [, setExistingVaccineAlreadyExists] = useState<boolean>(false);

  console.log("eadadd", ChildHealthRecord);

  // Get the single vital signs record
  const vitalSigns = ChildHealthRecord?.record?.child_health_vital_signs?.[0];
  const vital_id = vitalSigns?.vital || null;
  console.log("vital_id", vital_id);

  // Clear localStorage when component unmounts or when record changes
  useEffect(() => {
    return () => {
      // Optional: Clear storage when component unmounts if needed
      // localStorage.removeItem(STORAGE_KEYS.VACCINES);
      // localStorage.removeItem(STORAGE_KEYS.EXISTING_VACCINES);
      // localStorage.removeItem(STORAGE_KEYS.NOTES);
      // localStorage.removeItem(STORAGE_KEYS.FOLLOW_UP);
    };
  }, []);

  // Sync with props when they change
  useEffect(() => {
    if (propVaccines.length > 0) {
      setVaccines(propVaccines);
    }
  }, [propVaccines, setVaccines]);

  useEffect(() => {
    if (propExistingVaccines.length > 0) {
      setExistingVaccines(propExistingVaccines);
    }
  }, [propExistingVaccines, setExistingVaccines]);

  useEffect(() => {
    if (vaccinesListData) {
      setBasicVaccineList(vaccinesListData.default);
      setVaccineListOptions({
        default: vaccinesListData.default,
        formatted: vaccinesListData.formattedOptions,
      });
    }
  }, [vaccinesListData]);

  // Helper function to get today's date in DD-MM-YYYY format
  const getTodayDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  };

  const form = useForm<ImmunizationFormData>({
    defaultValues: {
      date: getTodayDate(),
      age: "",
      wt: "",
      ht: "",
      temp: "",
      follov_description: savedFollowUpData.follov_description || "",
      followUpVisit: savedFollowUpData.followUpVisit || "",
      followv_status: savedFollowUpData.followv_status || "pending",
      notes: savedNotes || "",
      existingVaccines: existingVaccines.map((v) => ({
        vac_id: v.vac_id,
        vac_name: v.vac_name,
        vaccineType: v.vaccineType,
        dose: v.dose,
        date: v.date || getTodayDate(),
        hasExistingVaccination: true,
        totalDoses: v.totalDoses || "",
        vacrec: v.vacrec || "",
      })),
      vaccines: vaccines.map((v) => ({
        vacStck_id: v.vacStck_id,
        vaccineType: v.vaccineType,
        dose: v.dose,
        date: v.date || getTodayDate(),
        vac_id: v.vac_id,
        vac_name: v.vac_name,
        expiry_date: v.expiry_date,
        totalDoses: v.totalDoses || "",
        nextFollowUpDate: v.nextFollowUpDate || "",
        vacrec: v.vacrec || "",
        existingFollowvId: v.existingFollowvId,
      })),
    },
  });

  useEffect(() => {
    if (historicalVitalSigns.length > 0) {
      const todaysDate = getTodayDate();
      const todaysRecord = historicalVitalSigns.find((vital:any) => vital.date === todaysDate);

      if (todaysRecord) {
        setLatestVitalSigns(todaysRecord);
        form.reset({
          ...todaysRecord,
          // Prioritize localStorage values over historical data
          notes: savedNotes || todaysRecord.notes || "",
          follov_description: savedFollowUpData.follov_description || todaysRecord.follov_description || "",
          followUpVisit: savedFollowUpData.followUpVisit || todaysRecord.followUpVisit || "",
          followv_status: savedFollowUpData.followv_status || todaysRecord.followv_status || "pending",
          existingVaccines: existingVaccines,
          vaccines: vaccines,
        });
      } else {
        const sortedVitalSigns = [...historicalVitalSigns].sort((a, b) => {
          // Convert DD-MM-YYYY to Date object for sorting
          const dateA = new Date(a.date.split('-').reverse().join('-'));
          const dateB = new Date(b.date.split('-').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });
        const latestRecord = sortedVitalSigns[0];
        setLatestVitalSigns(latestRecord);
        form.reset({
          date: todaysDate,
          age: latestRecord?.age || "",
          wt: latestRecord?.wt || "",
          ht: latestRecord?.ht || "",
          temp: latestRecord?.temp || "",
          // Prioritize localStorage values over historical data
          notes: savedNotes || latestRecord?.notes || "",
          follov_description: savedFollowUpData.follov_description || latestRecord?.follov_description || "",
          followUpVisit: savedFollowUpData.followUpVisit || latestRecord?.followUpVisit || "",
          followv_status: savedFollowUpData.followv_status || latestRecord?.followv_status || "pending",
          existingVaccines: existingVaccines,
          vaccines: vaccines,
        });
      }
    }

    // Debugging log to verify the data being processed
    console.log("Processed historicalVitalSigns:", historicalVitalSigns);
    console.log("Preserved localStorage notes:", savedNotes);
    console.log("Preserved localStorage follow-up:", savedFollowUpData);
  }, [historicalVitalSigns, form, existingVaccines, vaccines, savedNotes, savedFollowUpData]);

  useEffect(() => {
    // Set today's date in DD-MM-YYYY format
    const formattedDate = getTodayDate();
    form.setValue("vaccines.0.date", formattedDate);
    form.setValue("existingVaccines.0.date", formattedDate);
  }, [form]);

  // Modified handlers to work with localStorage state
  const handleVaccineChange = (value: string) => {
    // Clear previous form values when selecting a new vaccine
    form.setValue("vaccines.0.vaccineType", value);
    form.setValue("vaccines.0.totalDoses", "");
    form.setValue("vaccines.0.nextFollowUpDate", "");
    
    setisVaccineComplted(false);
    setSelectedVaccineId(value);
    setNextVisitDate(null);
    setNextVisitDescription(null);

    // NEW: Reset already exists state
    setVaccineAlreadyExists(false);

    if (!value) {
      // If value is empty, clear all related form fields
      form.setValue("vaccines.0.vaccineType", "");
      form.setValue("vaccines.0.dose", "1");
      form.setValue("vaccines.0.totalDoses", "");
      form.setValue("vaccines.0.nextFollowUpDate", "");
      return;
    }

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
    
    // NEW: Check if this vaccine already exists in our current vaccines
    const existingVaccine = vaccines.find(v => v.vac_id === vac_id.trim());
    
    if (existingVaccine) {
      // If vaccine exists, disable the add button and show message
      setVaccineAlreadyExists(true);
      toast.warning(`${vac_name} already exists in today's vaccinations`);
      return;
    } else {
      setVaccineAlreadyExists(false);
    }

    // Calculate next dose from vaccine history
    const vaccineHistoryForThis = vaccineHistory.filter((record:any) => {
      const recordVacId = record.vacrec_details?.vacrec_vaccine || record.vaccine_stock?.vaccinelist?.vac_id || record.vac_details?.vac_id;
      return recordVacId === numericVacId;
    });

    let highestDose = 0;
    let existingVacrecId = "";
    let existingFollowvId = "";
    let existingTotalDoses = vaccineInfo.no_of_doses || 1;

    vaccineHistoryForThis.forEach((record:any) => {
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
    // Clear previous form values when selecting a new vaccine
    form.setValue("existingVaccines.0.vaccineType", value);
    form.setValue("existingVaccines.0.totalDoses", "");
    
    setisVaccineComplted(false);
    setSelectedVaccineListId(value);

    // NEW: Reset already exists state
    setExistingVaccineAlreadyExists(false);

    if (!value) {
      // If value is empty, clear all related form fields
      form.setValue("existingVaccines.0.vaccineType", "");
      form.setValue("existingVaccines.0.dose", "1");
      form.setValue("existingVaccines.0.totalDoses", "");
      form.setValue("existingVaccines.0.vacrec", "");
      return;
    }

    const [vac_id, vac_name] = value.split(",");
    const numericVacId = parseInt(vac_id, 10);
    const selectedVaccine = basicVaccineList.find((v: any) => v.vac_id === numericVacId);

    if (!selectedVaccine) {
      console.error("Selected vaccine not found");
      return;
    }

    // NEW: Check if this vaccine already exists in our current existing vaccines
    const existingVaccine = existingVaccines.find(v => v.vac_id === vac_id.trim());
    
    if (existingVaccine) {
      // If vaccine exists, disable the add button and show message
      setExistingVaccineAlreadyExists(true);
      toast.warning(`${vac_name} already exists in previous vaccinations`);
      return;
    } else {
      setExistingVaccineAlreadyExists(false);
    }

    const vaccineHistoryForThis = vaccineHistory.filter((record:any) => {
      const recordVacId = record.vacrec_details?.vacrec_vaccine || record.vaccine_stock?.vaccinelist?.vac_id || record.vac_details?.vac_id;
      return recordVacId === numericVacId;
    });

    let highestDose = 0;
    let existingVacrecId = "";
    let existingTotalDoses = selectedVaccine.no_of_doses;

    vaccineHistoryForThis.forEach((record:any) => {
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

  // FIXED: Modified addVac to prevent duplicates and show already exists message
  const addVac = () => {
    if (!selectedVaccineId) {
      toast.error("Please select a vaccine first");
      return;
    }

    // NEW: Double check if vaccine already exists
    const [vacStck_id, vac_id, vac_name, expiry_date] = selectedVaccineId.split(",");
    const existingVaccine = vaccines.find(v => v.vac_id === vac_id.trim());
    
    if (existingVaccine) {
      toast.error(`${vac_name} already exists in today's vaccinations`);
      return;
    }

    const formValues = form.getValues();

    // Get today's date in DD-MM-YYYY format for the new vaccine
    const formattedDate = getTodayDate();

    const vaccineToAdd: VaccineRecord = {
      vacStck_id: vacStck_id.trim(),
      vaccineType: vac_name.trim(),
      dose: formValues.vaccines?.[0]?.dose || "1",
      date: formattedDate,
      vac_id: vac_id.trim(),
      vac_name: vac_name.trim(),
      expiry_date: expiry_date.trim(),
      totalDoses: formValues.vaccines?.[0]?.totalDoses || currentVaccineTotalDoses.toString(),
      nextFollowUpDate: formValues.vaccines?.[0]?.nextFollowUpDate || nextVisitDate || "",
      vacrec: formValues.vaccines?.[0]?.vacrec || "",
      existingFollowvId: formValues.vaccines?.[0]?.existingFollowvId || "",
    };

    const newVaccines = [...vaccines, vaccineToAdd];
    setVaccines(newVaccines); // This saves to localStorage
    if (propSetVaccines) propSetVaccines(newVaccines);
    
    // Update form with new vaccines array (for the table)
    form.setValue("vaccines", newVaccines);
    
    // RESET ONLY THE FORM INPUT FIELDS (not the table data)
    form.setValue("vaccines.0.vaccineType", "");
    form.setValue("vaccines.0.dose", "1");
    form.setValue("vaccines.0.totalDoses", "");
    form.setValue("vaccines.0.nextFollowUpDate", "");
    
    // Keep the date field populated with today's date
    form.setValue("vaccines.0.date", formattedDate);
    
    // Clear selection state
    setSelectedVaccineId("");
    setNextVisitDate(null);
    setNextVisitDescription(null);
    setVaccineAlreadyExists(false);
    
    toast.success(`Added ${vac_name} - Dose ${vaccineToAdd.dose}`);
  };

  // FIXED: Modified addExistingVac to prevent duplicates and show already exists message
  const addExistingVac = async () => {
    if (!selectedVaccineListId) {
      toast.error("Please select a vaccine first");
      return;
    }

    // NEW: Double check if vaccine already exists
    const [vac_id, vac_name] = selectedVaccineListId.split(",");
    const existingVaccine = existingVaccines.find(v => v.vac_id === vac_id.trim());
    
    if (existingVaccine) {
      toast.error(`${vac_name} already exists in previous vaccinations`);
      return;
    }

    const isValid = await form.trigger(["existingVaccines.0.vaccineType", "existingVaccines.0.dose", "existingVaccines.0.date"]);
    if (!isValid) {
      toast.error("Please fill in the fields");
      return;
    }

    const formValues = form.getValues();

    // Get today's date in DD-MM-YYYY format
    const formattedDate = getTodayDate();

    const vaccineToAdd: ExistingVaccineRecord = {
      vac_id: vac_id.trim(),
      vac_name: vac_name.trim(),
      vaccineType: vac_name.trim(),
      dose: formValues.existingVaccines?.[0]?.dose || "1",
      date: formattedDate,
      hasExistingVaccination: true,
      vacrec: formValues.existingVaccines?.[0]?.vacrec || "",
      totalDoses: existingVaccineTotalDoses.toString(),
    };

    const newExistingVaccines = [...existingVaccines, vaccineToAdd];
    setExistingVaccines(newExistingVaccines); // This saves to localStorage
    if (propSetExistingVaccines) propSetExistingVaccines(newExistingVaccines);
    
    // Update form with new existing vaccines array (for the table)
    form.setValue("existingVaccines", newExistingVaccines);
    
    // RESET ONLY THE FORM INPUT FIELDS (not the table data)
    form.setValue("existingVaccines.0.dose", "");
    form.setValue("existingVaccines.0.totalDoses", "");
    form.setValue("existingVaccines.0.vacrec", "");
    
    // Keep the date field populated
    form.setValue("existingVaccines.0.date", formattedDate);
    
    // Clear selection and reset other fields
    setSelectedVaccineListId("");
    form.setValue("existingVaccines.0.vaccineType", "");
    form.setValue("existingVaccines.0.vac_id", "");
    form.setValue("existingVaccines.0.vac_name", "");
    setExistingVaccineAlreadyExists(false);
    
    toast.success(`Added existing vaccine: ${vac_name} - Dose ${vaccineToAdd.dose}`);
  };

  // Updated delete functions
  const deleteVac = (index: number) => {
    const updatedVaccines = [...vaccines];
    const deletedVaccine = updatedVaccines[index];
    updatedVaccines.splice(index, 1);
    setVaccines(updatedVaccines); // This will automatically save to localStorage
    if (propSetVaccines) propSetVaccines(updatedVaccines);
    form.setValue("vaccines", updatedVaccines);
    
    // NEW: Reset already exists state when vaccine is deleted
    setVaccineAlreadyExists(false);
    
    toast.success(`Removed ${deletedVaccine.vac_name} - Dose ${deletedVaccine.dose}`);
  };

  const deleteExistingVac = (index: number) => {
    const updatedExistingVaccines = [...existingVaccines];
    const deletedVaccine = updatedExistingVaccines[index];
    updatedExistingVaccines.splice(index, 1);
    setExistingVaccines(updatedExistingVaccines); // This will automatically save to localStorage
    if (propSetExistingVaccines) propSetExistingVaccines(updatedExistingVaccines);
    form.setValue("existingVaccines", updatedExistingVaccines);
    
    // NEW: Reset already exists state when vaccine is deleted
    setExistingVaccineAlreadyExists(false);
    
    toast.success(`Removed existing vaccine: ${deletedVaccine.vac_name} - Dose ${deletedVaccine.dose}`);
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
      date: vitalSignsData.date, // Always use the row's date
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

    // Save to localStorage
    setSavedNotes(data.notes || "");
    setSavedFollowUpData({
      follov_description: data.follov_description || "",
      followUpVisit: data.followUpVisit || "",
      followv_status: data.followv_status || "pending",
    });

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
        followv_status: data.followv_status, // NEW status
      };

      handleUpdateVitalSign(updatedVitalSign);

      // Also update the latestVitalSigns to reflect the changes
      setLatestVitalSigns((prev) => (prev ? { ...prev, ...updatedVitalSign } : updatedVitalSign));
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
    deleteExistingVac,
  });

  // FIXED: Update handleShowVaccineListChange to clear form fields but keep localStorage
  const handleShowVaccineListChange = (checked: boolean) => {
    setShowVaccineList(checked);
    if (!checked) {
      // Only clear the form input fields, not the localStorage data
      setSelectedVaccineListId("");
      setExistingVaccineErrors({});
      setExistingVaccineAlreadyExists(false);
      
      // Reset the form fields for existing vaccines
      form.setValue("existingVaccines.0.vaccineType", "");
      form.setValue("existingVaccines.0.dose", "");
      form.setValue("existingVaccines.0.totalDoses", "");
      form.setValue("existingVaccines.0.vacrec", "");
      
      // But DON'T clear the existingVaccines array that's stored in localStorage
      // This preserves the table data while clearing the form inputs
    }
  };

  // Clear localStorage on successful submit
  const onSubmit = async (data: ImmunizationFormData) => {
    saveImmunization({
      data,
      vaccines,
      existingVaccines,
      ChildHealthRecord,
      vital_id,
      staff_id,
      pat_id,
    });

    // Clear localStorage after successful submission
    localStorage.removeItem(STORAGE_KEYS.VACCINES);
    localStorage.removeItem(STORAGE_KEYS.EXISTING_VACCINES);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UP);

    // Reset local state
    setVaccines([]);
    setExistingVaccines([]);
    setSavedNotes("");
    setSavedFollowUpData({ follov_description: "", followUpVisit: "", followv_status: "pending" });
    setVaccineAlreadyExists(false);
    setExistingVaccineAlreadyExists(false);
  };

  const chhistId = ChildHealthRecord.record?.chhist_id;
  // const chrecId = ChildHealthRecord.record?.chrec;
  const [, setCurrentIndex] = useState(0);

  // Set initial index when fullHistoryData changes
  useEffect(() => {
    if (followUps.length > 0 && chhistId) {
      const initialIndex = followUps.findIndex((record:any) => record.chhist_id === chhistId);
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [followUps, chhistId]);

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
            content={<>{latestVitalSigns ? <DataTable columns={vitalSignsColumns} data={[{
              ...latestVitalSigns,
              notes: form.getValues("notes") || latestVitalSigns.notes || "",
              follov_description: form.getValues("follov_description") || latestVitalSigns.follov_description || "",
              followUpVisit: form.getValues("followUpVisit") || latestVitalSigns.followUpVisit || "",
              followv_status: form.getValues("followv_status") || latestVitalSigns.followv_status || "pending",
            }]} /> : <div className="text-center py-4 text-gray-500">No vital signs recorded yet</div>}</>}
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
            // NEW: Pass the already exists states to VaccinationSection
            // vaccineAlreadyExists={vaccineAlreadyExists}
            // existingVaccineAlreadyExists={existingVaccineAlreadyExists}
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