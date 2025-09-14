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
      name: React.ReactNode; // Changed from string to ReactNode
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
  const [vaccines, setVaccines] = useState<VaccineRecord[]>(propVaccines);
  const [existingVaccines, setExistingVaccines] = useState<ExistingVaccineRecord[]>(propExistingVaccines);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>("");
  const [selectedVaccineListId, setSelectedVaccineListId] = useState<string>("");
  // const [vaccineOptions, setVaccineOptions] = useState<{ default: any[]; formatted: { id: string; name: string; quantity?: number }[] }>({ default: [], formatted: [] });
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

  useEffect(() => {
    if (vaccinesListData) {
      setBasicVaccineList(vaccinesListData.default);
      setVaccineListOptions({
        default: vaccinesListData.default,
        formatted: vaccinesListData.formattedOptions
      });
    }
  }, [vaccinesListData]);

  // useEffect(() => {
  //   if (vaccinesData) {
  //     setVaccineOptions({
  //       default: vaccinesData.default,
  //       formatted: vaccinesData.formatted.map((vaccine) => ({
  //         ...vaccine,
  //         name: typeof vaccine.name === "string" ? vaccine.name : String(vaccine.name)
  //       }))
  //     });
  //   }
  // }, [vaccinesData]);

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
          ...todaysRecord,
          existingVaccines: existingVaccines,
          vaccines: vaccines
        });
      } else {
        const sortedVitalSigns = [...historicalVitalSigns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLatestVitalSigns(sortedVitalSigns[0]);
        form.reset({
          date: new Date().toISOString().split("T")[0],
          age: sortedVitalSigns[0]?.age || "",
          wt: sortedVitalSigns[0]?.wt || "",
          ht: sortedVitalSigns[0]?.ht || "",
          temp: sortedVitalSigns[0]?.temp || "",
          follov_description: sortedVitalSigns[0]?.follov_description || "",
          followUpVisit: sortedVitalSigns[0]?.followUpVisit || "",
          notes: sortedVitalSigns[0]?.notes || "",
          existingVaccines: existingVaccines,
          vaccines: vaccines
        });
      }
    }
  }, [historicalVitalSigns, form, existingVaccines, vaccines]);

  useEffect(() => {
    form.setValue("vaccines.0.date", new Date().toISOString().split("T")[0]);
    form.setValue("existingVaccines.0.date", new Date().toISOString().split("T")[0]);
  }, [form]);



  const handleVaccineChange = (value: string) => {
    form.setValue("vaccines.0.vaccineType", value);
    setisVaccineComplted(false);
    setSelectedVaccineId(value);
    setNextVisitDate(null);
    setNextVisitDescription(null);
    form.setValue("vaccines.0.nextFollowUpDate", "");
    form.setValue("vaccines.0.totalDoses", "");
  
    if (!value) return;
  
    // Debug: Log the value to see what format it's in
    console.log("Selected vaccine value:", value);
  
    // Parse the value - adjust this based on your actual value format
    let vacStck_id: any, vac_id: any, vac_name: any, expiry_date: any;
    
    // If value is just the vac_id (single value)
    if (!value.includes(",")) {
      vac_id = value;
      // Find the vaccine from the list
      const selectedVaccine = vaccinesData?.default?.find((v: any) => 
        v.vac_id?.toString() === vac_id || v.vacStck_id?.toString() === vac_id
      );
      
      if (selectedVaccine) {
        vac_name = selectedVaccine.vac_name;
        vacStck_id = selectedVaccine.vacStck_id?.toString() || vac_id;
        expiry_date = selectedVaccine.expiry_date || "";
      }
    } else {
      // If value is in comma-separated format
      [vacStck_id, vac_id, vac_name, expiry_date] = value.split(",");
    }
  
    const numericVacId = parseInt(vac_id, 10);
    
    // Find the selected vaccine from your data
    let selectedVaccine = null;
    
    // First try to find in vaccinesData (vaccine stock)
    if (vaccinesData?.default) {
      selectedVaccine = vaccinesData.default.find((v: any) => 
        v.vac_id === numericVacId || v.vacStck_id === parseInt(vacStck_id, 10)
      );
    }
    
    // If not found in stock, try to find in vaccine list data
    if (!selectedVaccine && vaccinesListData?.default) {
      selectedVaccine = vaccinesListData.default.find((v: any) => 
        v.vac_id === numericVacId
      );
    }
  
    if (!selectedVaccine) {
      console.error("Selected vaccine not found. Available vaccines:", vaccinesData?.default);
      console.error("Vaccine list data:", vaccinesListData?.default);
      console.error("Looking for vac_id:", numericVacId);
      return;
    }
  
    console.log("Found selected vaccine:", selectedVaccine);
  
    // Get vaccine properties - adjust based on your actual data structure
    const vaccineInfo = selectedVaccine.vaccinelist || selectedVaccine;
    
    // Calculate vaccine history for this vaccine
    const vaccineHistoryForThis = vaccineHistory.filter((record) => {
      const recordVacId = record.vacrec_details?.vacrec_vaccine || 
                         record.vaccine_stock?.vaccinelist?.vac_id || 
                         record.vac_details?.vac_id;
      return recordVacId === numericVacId;
    });
  
    let highestDose = 0;
    let existingVacrecId = "";
    let existingFollowvId = "";
    let existingTotalDoses = vaccineInfo.no_of_doses || 1; // Default to vaccine's total doses
  
    // Find the highest dose already given
    vaccineHistoryForThis.forEach((record) => {
      const doseNo = record.vachist_doseNo ? parseInt(record.vachist_doseNo) : 0;
      if (doseNo > highestDose) {
        highestDose = doseNo;
        existingVacrecId = record.vacrec?.toString() || "";
        existingFollowvId = record.followv?.toString() || "";
        
        // Get total doses from vaccination record if available
        if (record.vacrec_details?.vacrec_totaldose) {
          existingTotalDoses = record.vacrec_details.vacrec_totaldose;
        }
      }
    });
  
    // Set form values
    form.setValue("vaccines.0.existingFollowvId", existingFollowvId);
    form.setValue("vaccines.0.vacrec", existingVacrecId);
    form.setValue("vaccines.0.totalDoses", existingTotalDoses.toString());
  
    const nextDose = highestDose + 1;
    console.log("Next dose number:", nextDose);
    console.log("Total doses for vaccine:", existingTotalDoses);
  
    form.setValue("vaccines.0.dose", nextDose.toString());
  
    // Set total doses
    if (vaccineInfo.no_of_doses) {
      form.setValue("vaccines.0.totalDoses", vaccineInfo.no_of_doses.toString());
      setCurrentVaccineTotalDoses(existingTotalDoses);
    }
  
    // Check if vaccine is completed
    const isCompleted = nextDose > (vaccineInfo.no_of_doses || 1);
    const disableSubmit = (isCompleted && vaccineInfo.vac_type_choices === "primary") || 
                         (vaccineInfo.vac_type_choices === "conditional" && isCompleted);
    
    setisVaccineComplted(disableSubmit);
  
    if (disableSubmit) {
      toast.warning(`${vac_name || vaccineInfo.vac_name} vaccine is already completed`);
      return; // Exit early if completed
    }
  
    // Calculate next visit date based on vaccine type
    console.log("Vaccine type:", vaccineInfo.vac_type_choices);
    
    if (vaccineInfo.vac_type_choices === "routine" && vaccineInfo.routine_frequency) {
      const { interval, time_unit } = vaccineInfo.routine_frequency;
      console.log("Calculating routine follow-up:", interval, time_unit);
      
      const nextDate = calculateNextVisitDate(interval, time_unit, new Date().toISOString());
      setNextVisitDate(nextDate.toISOString().split("T")[0]);
      setNextVisitDescription(`Vaccination for ${vaccineInfo.vac_name}`);
      form.setValue("vaccines.0.nextFollowUpDate", nextDate.toISOString().split("T")[0]);
      
    } else if (nextDose < (vaccineInfo.no_of_doses || 1)) {
      // Only set follow-up for non-routine vaccines if not the last dose
      console.log("Looking for dose interval for next dose after current dose:", nextDose);
      console.log("Available intervals:", vaccineInfo.intervals);
      
      // Look for the interval that defines when the NEXT dose should be given
      // The dose_number in intervals represents the dose that will be given next
      const nextDoseNumber = nextDose + 1;
      const doseInterval = vaccineInfo.intervals?.find((interval: any) => 
        interval.dose_number === nextDoseNumber
      );
      
      if (doseInterval) {
        console.log("Found interval for next dose:", doseInterval);
        const nextDate = calculateNextVisitDate(
          doseInterval.interval, 
          doseInterval.time_unit, 
          new Date().toISOString()
        );
        setNextVisitDate(nextDate.toISOString().split("T")[0]);
        setNextVisitDescription(`Dose ${nextDoseNumber} of ${vaccineInfo.vac_name}`);
        form.setValue("vaccines.0.nextFollowUpDate", nextDate.toISOString().split("T")[0]);
      } else {
        console.log("No interval found for next dose:", nextDoseNumber);
      }
    } else {
      console.log("Last dose - no follow-up needed");
    }
  };

  
  const handleExistingVaccineChange = (value: string) => {
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
    let existingTotalDoses = selectedVaccine.no_of_doses; // Default to vaccine list's total doses

    vaccineHistoryForThis.forEach((record) => {
      const doseNo = record.vachist_doseNo ? parseInt(record.vachist_doseNo) : 0;
      if (doseNo > highestDose) {
        highestDose = doseNo;
        existingVacrecId = record.vacrec?.toString() || "";

        // Get total doses from vaccination record if available
        if (record.vacrec_details?.vacrec_totaldose) {
          existingTotalDoses = record.vacrec_details.vacrec_totaldose;
        }
      }
    });

    const nextDose = highestDose + 1;
    console.log("Vaccination Rdfdfdfecord", existingVacrecId);
    form.setValue("existingVaccines.0.vacrec", existingVacrecId);
    form.setValue("existingVaccines.0.totalDoses", existingTotalDoses.toString());

    form.setValue(`existingVaccines.0.dose`, nextDose.toString());
    // setCurrentDoseNumber(nextDose);

    if (selectedVaccine.no_of_doses) {
      form.setValue(`existingVaccines.0.totalDoses`, selectedVaccine.no_of_doses.toString());
      setExistingVaccineTotalDoses(selectedVaccine.no_of_doses);
    }

    const isCompleted = nextDose > selectedVaccine.no_of_doses;

    const disableSubmit = (isCompleted && selectedVaccine.vac_type_choices !== "routine") || (selectedVaccine.vac_type_choices === "conditional" && isCompleted);
    setisVaccineComplted(disableSubmit);
    if (disableSubmit) {
      toast.warning(`${vac_name} vaccine is already completed )`);
    }
  };

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

    console.log("Adding vaccine:", vaccineToAdd);
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

    console.log("Adding existing vaccine:", vaccineToAdd);

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
    updatedVaccines.splice(index, 1); // Remove the vaccine at the specific index
    setVaccines(updatedVaccines);
    if (propSetVaccines) propSetVaccines(updatedVaccines);
    form.setValue("vaccines", updatedVaccines);
    toast.success("Vaccine removed successfully!");
  };

  const deleteExistingVac = (index: number) => {
    const updatedExistingVaccines = [...existingVaccines];
    updatedExistingVaccines.splice(index, 1); // Remove the vaccine at the specific index
    setExistingVaccines(updatedExistingVaccines);
    if (propSetExistingVaccines) propSetExistingVaccines(updatedExistingVaccines);
    form.setValue("existingVaccines", updatedExistingVaccines);
    toast.success("Existing vaccine removed successfully!");
  };
  const handleUpdateVitalSign = (index: number, values: VitalSignType) => {
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
  const handleStartEdit = (index: number, data: any) => {
    setEditingRowIndex(index);
    form.reset({
      ...data,
      notes: data.notes || "",
      follov_description: data.follov_description || "",
      followUpVisit: data.followUpVisit || "",
      followv_status: data.followv_status || "pending"
    });
    setIsNotesDialogOpen(true); // Make sure this is called
    console.log("isNotesDialogOpen should be true now");
  };

  const handleSaveNotes = (data: VitalSignType) => {
    if (editingRowIndex !== null) {
      handleUpdateVitalSign(editingRowIndex, {
        date: data.date,
        age: data.age,
        ht: data.ht,
        wt: data.wt,
        temp: data.temp,
        notes: data.notes,
        follov_description: data.follov_description,
        followUpVisit: data.followUpVisit,
        followv_status: data.followv_status
      });
    }
    setIsNotesDialogOpen(false);
    setEditingRowIndex(null);
    toast.success("Notes saved successfully!");
  };
  const { vitalSignsColumns, vaccineColumns, existingVaccineColumns } = createImmunizationColumns({
    editingRowIndex,
    isLoading,
    historicalNotes,
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
            }}
            form={form}
            isLoading={isLoading}
            onSave={handleSaveNotes}
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
