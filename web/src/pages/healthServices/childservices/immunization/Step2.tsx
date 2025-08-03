import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { HeartPulse, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card/card";
import { DataTable } from "@/components/ui/table/data-table";
import { Form } from "@/components/ui/form/form";

import { toast } from "sonner";
import {
  VitalSignType,
  VaccineRecord,
  ExistingVaccineRecord,
  ImmunizationFormData,
} from "@/form-schema/ImmunizationSchema";
import { createImmunizationColumns } from "./columns";


import { ChildHealthHistoryRecord } from "../../childservices/viewrecords/types";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { calculateNextVisitDate } from "@/helpers/Calculatenextvisit";
import { useAuth } from "@/context/AuthContext";
import { NotesDialog } from "./NotesDialog";
import { VaccinationSection } from "./VaccinationSection";


import { useImmunizationMutations } from "./queries/submitStep2";


export interface ImmunizationProps {
  ChildHealthRecord: ChildHealthHistoryRecord;
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
      quantity?: number 
    }[];
  };
  vaccinesListData?: {
    default: any[];
    formattedOptions: { id: string; name: string }[];
  };
  isLoading: boolean;
  vaccineHistory?: any[]; // Add this line

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
  vaccineHistory = [], // Add this to destructured props



}: ImmunizationProps) {
  const [latestVitalSigns, setLatestVitalSigns] =
    useState<VitalSignType | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>(propVaccines);
  const [existingVaccines, setExistingVaccines] =
    useState<ExistingVaccineRecord[]>(propExistingVaccines);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>("");
  const [selectedVaccineListId, setSelectedVaccineListId] =
    useState<string>("");
  const [vaccineOptions, setVaccineOptions] = useState<{
    default: any[];
    formatted: { id: string; name: string; quantity?: number }[];
  }>({ default: [], formatted: [] });
  const [vaccineListOptions, setVaccineListOptions] = useState<{
    default: any[];
    formatted: { id: string; name: string }[];
  }>({ default: [], formatted: [] });
  const [nextVisitDate, setNextVisitDate] = useState<string | null>(null);
  const [nextVisitDescription, setNextVisitDescription] = useState<
    string | null
  >(null);
  const [selectedVaccineType, setSelectedVaccineType] = useState<string | null>(
    null
  );
  const [isVaccineComplted, setisVaccineComplted] = useState(false);
  const [currentVaccineTotalDoses, setCurrentVaccineTotalDoses] =
    useState<number>(1);
  const [existingVaccineTotalDoses, setExistingVaccineTotalDoses] =
    useState<number>(1);
  const [currentDoseNumber, setCurrentDoseNumber] = useState<number>(1);
  const [newVaccineErrors, setNewVaccineErrors] = useState<{
    vaccine?: string;
    dose?: string;
    date?: string;
  }>({});
  const [existingVaccineErrors, setExistingVaccineErrors] = useState<{
    vaccine?: string;
    dose?: string;
    date?: string;
  }>({});
  const pat_id =
    ChildHealthRecord?.chrec_details?.patrec_details?.pat_id.toString() || "";
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id || null;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [basicVaccineList, setBasicVaccineList] = useState<any[]>([]);

 
  


  useEffect(() => {
    if (vaccinesListData) {
      setBasicVaccineList(vaccinesListData.default);
      setVaccineListOptions({
        default: vaccinesListData.default,
        formatted: vaccinesListData.formattedOptions,
      });
    }
  }, [vaccinesListData]);



  useEffect(() => {
    if (vaccinesData) {
      setVaccineOptions({
        default: vaccinesData.default,
        formatted: vaccinesData.formatted.map((vaccine) => ({
          ...vaccine,
          name:
            typeof vaccine.name === "string"
              ? vaccine.name
              : String(vaccine.name),
        })),
      });
    }
  }, [vaccinesData]);




  

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
        vacrec: v.vacrec || "",
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
        existingFollowvId: v.existingFollowvId,
      })),
    },
  });

  useEffect(() => {
    if (historicalVitalSigns.length > 0) {
      const todaysRecord = historicalVitalSigns.find(
        (vital) => vital.date === new Date().toISOString().split("T")[0]
      );

      if (todaysRecord) {
        setLatestVitalSigns(todaysRecord);
        form.reset({
          ...todaysRecord,
          existingVaccines: existingVaccines,
          vaccines: vaccines,
        });
      } else {
        const sortedVitalSigns = [...historicalVitalSigns].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setLatestVitalSigns(sortedVitalSigns[0]);
        form.reset({
          date:  new Date().toISOString().split("T")[0],
          age: sortedVitalSigns[0]?.age || "",
          wt: sortedVitalSigns[0]?.wt || "",
          ht: sortedVitalSigns[0]?.ht || "",
          temp: sortedVitalSigns[0]?.temp || "",
          follov_description: sortedVitalSigns[0]?.follov_description || "",
          followUpVisit: sortedVitalSigns[0]?.followUpVisit || "",
          notes: sortedVitalSigns[0]?.notes || "",
          existingVaccines: existingVaccines,
          vaccines: vaccines,
        });
      }
    }
  }, [historicalVitalSigns, form, existingVaccines, vaccines]);



  useEffect(() => {
    form.setValue("vaccines.0.date", new Date().toISOString().split("T")[0]);
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

    const [vacStck_id, vac_id, vac_name, expiry_date] = value.split(",");
    const numericVacId = parseInt(vac_id, 10);

    const selectedVaccine = vaccinesData?.default?.find(
      (v: any) => v.vacStck_id === parseInt(vacStck_id, 10)
    );

    if (!selectedVaccine) {
      console.error("Selected vaccine not found");
      return;
    }

    const { vaccinelist } = selectedVaccine;

    const vaccineHistoryForThis = vaccineHistory.filter((record) => {
      const recordVacId =
        record.vacrec_details?.vacrec_vaccine ||
        record.vaccine_stock?.vaccinelist?.vac_id || record.vac_details?.vac_id;
      return recordVacId === numericVacId;
    });

    let highestDose = 0;
    let existingVacrecId = "";
    let existingFollowvId = "";
    let existingTotalDoses = vaccinelist.no_of_doses; // Default to vaccine list's total doses

    vaccineHistoryForThis.forEach((record) => {
      const doseNo = record.vachist_doseNo
        ? parseInt(record.vachist_doseNo)
        : 0;
      if (doseNo > highestDose) {
        highestDose = doseNo;
        existingVacrecId = record.vacrec?.toString() || "";
        existingFollowvId = record.followv?.toString() || "";

          // Get total doses from vaccination record if available
      if (record.vacrec_details?.vacrec_totaldose) {
        existingTotalDoses = record.vacrec_details?.vacrec_totaldose;
      }
      }
    });

    form.setValue("vaccines.0.existingFollowvId", existingFollowvId);
    form.setValue("vaccines.0.vacrec", existingVacrecId);
    form.setValue("vaccines.0.totalDoses", existingTotalDoses.toString());


    const nextDose = highestDose + 1;
    console.log("Vaccination Record", existingVacrecId);

    form.setValue("vaccines.0.dose", nextDose.toString());
    setCurrentDoseNumber(nextDose);

    if (vaccinelist.no_of_doses) {
      form.setValue(
        "vaccines.0.totalDoses",
        vaccinelist.no_of_doses.toString()
      );
      setCurrentVaccineTotalDoses(existingTotalDoses);
    }

    const isCompleted = nextDose > vaccinelist.no_of_doses;






    const disableSubmit = isCompleted && vaccinelist.vac_type_choices === "primary" || (vaccinelist.vac_type_choices === "conditional" && isCompleted);
    setisVaccineComplted(disableSubmit);
    if (disableSubmit) {
      toast.warning(
        `${vac_name} vaccine is already completed`
      );
    }

    setSelectedVaccineType(vaccinelist.vac_type_choices);

    // Modified follow-up date calculation logic
    if (vaccinelist.vac_type_choices === "routine") {
      const { interval, time_unit } = vaccinelist.routine_frequency;
      const nextDate = calculateNextVisitDate(
        interval,
        time_unit,
        new Date().toISOString()
      );
      setNextVisitDate(nextDate.toISOString().split("T")[0]);
      setNextVisitDescription(`Vaccination for ${vaccinelist.vac_name}`);
      form.setValue(
        "vaccines.0.nextFollowUpDate",
        nextDate.toISOString().split("T")[0]
      );
    } else if (nextDose < vaccinelist.no_of_doses) {
      // Only set follow-up for non-routine vaccines if not the last dose
      const doseInterval = vaccinelist.intervals?.find(
        (interval: any) => interval.dose_number === nextDose
      );
      if (doseInterval) {
        const nextDate = calculateNextVisitDate(
          doseInterval.interval,
          doseInterval.time_unit,
          new Date().toISOString()
        );
        setNextVisitDate(nextDate.toISOString().split("T")[0]);
        setNextVisitDescription(`Dose ${nextDose + 1} of ${vaccinelist.vac_name}`);
        form.setValue(
          "vaccines.0.nextFollowUpDate",
          nextDate.toISOString().split("T")[0]
        );
      }
    }
  };

  const handleExistingVaccineChange = (value: string) => {
    setisVaccineComplted(false);

    setSelectedVaccineListId(value);
    form.setValue(`existingVaccines.0.vaccineType`, value);

    if (!value) return;

    const [vac_id, vac_name] = value.split(",");
    const numericVacId = parseInt(vac_id, 10);

    const selectedVaccine = basicVaccineList.find(
      (v: any) => v.vac_id === numericVacId
    );

    if (!selectedVaccine) {
      console.error("Selected vaccine not found");
      return;
    }

    const vaccineHistoryForThis = vaccineHistory.filter((record) => {
      const recordVacId =
        record.vacrec_details?.vacrec_vaccine ||
        record.vaccine_stock?.vaccinelist?.vac_id || record.vac_details?.vac_id;
      return recordVacId === numericVacId;
    });

    let highestDose = 0;
    let existingVacrecId = "";
    let existingTotalDoses = selectedVaccine.no_of_doses; // Default to vaccine list's total doses

    vaccineHistoryForThis.forEach((record) => {
      const doseNo = record.vachist_doseNo
        ? parseInt(record.vachist_doseNo)
        : 0;
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
    setCurrentDoseNumber(nextDose);

    if (selectedVaccine.no_of_doses) {
      form.setValue(
        `existingVaccines.0.totalDoses`,
        selectedVaccine.no_of_doses.toString()
      );
      setExistingVaccineTotalDoses(selectedVaccine.no_of_doses);
    }

    const isCompleted = nextDose > selectedVaccine.no_of_doses;

  

    const disableSubmit = isCompleted && selectedVaccine.vac_type_choices !== "routine" || (selectedVaccine.vac_type_choices === "conditional" && isCompleted);;
    setisVaccineComplted(disableSubmit);
    if (disableSubmit) {
      toast.warning(
        `${vac_name} vaccine is already completed )`
      );
    }

    setSelectedVaccineType(selectedVaccine.vac_type_choices);
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
      date: formValues.vaccines?.[0]?.date ||  new Date().toISOString().split("T")[0],
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
    form.setValue("vaccines.0.date",  new Date().toISOString().split("T")[0]);
    form.setValue("vaccines.0.totalDoses", "");
    form.setValue("vaccines.0.nextFollowUpDate", "");
  
    setSelectedVaccineId("");
  };

  const addExistingVac = async() => {
    if (!selectedVaccineListId) {
      toast.error("Please select a vaccine first");
      return;
    }

    const isValid =await form.trigger(["vaccines.0.vaccineType", "vaccines.0.dose", "vaccines.0.date"]);

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
      totalDoses: existingVaccineTotalDoses.toString(),
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
      totalDoses: "",
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
    const existingIndex = updatedVitalSigns.findIndex(
      (v) => v.date === values.date
    );

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
    form.reset(data);
    setIsNotesDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setIsNotesDialogOpen(false);
  };

  const handleSaveNotes = async (data: VitalSignType) => {
    try {
      const notesData = {
        ...data,
        chrec: ChildHealthRecord.chrec,
      };

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
          followv_status: data.followv_status,
        });
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

  const { vitalSignsColumns, vaccineColumns, existingVaccineColumns } =
    createImmunizationColumns({
      editingRowIndex,
      isLoading,
      historicalNotes,
      handleStartEdit,
      deleteVac,
      deleteExistingVac,
    });

    

    

  const handleShowVaccineListChange = (checked: boolean) => {
    setShowVaccineList(checked);
    if (!checked) {
      setExistingVaccines([]);
      setSelectedVaccineListId("");
      setExistingVaccineErrors({});
    }
  };


  const { mutate: saveImmunization, isPending: isSaving } = useImmunizationMutations();

  const onSubmit = async (data: ImmunizationFormData) => {
  
    saveImmunization({
      data,
      vaccines,
      existingVaccines,
      ChildHealthRecord,
      staff_id,
      pat_id,
    });
  };
 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <HeartPulse className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-semibold">Latest Vital Signs</h2>
            </div>

            {latestVitalSigns ? (
              <DataTable
                columns={vitalSignsColumns}
                data={[latestVitalSigns]}
              />
            ) : (
              <div className="text-center py-4 text-gray-500">
                No vital signs recorded yet
              </div>
            )}
          </CardContent>
        </Card>

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
          onClose={handleCancelEdit}
          form={form}
          isLoading={isLoading}
          onSave={(formValues) => handleSaveNotes({ ...formValues })}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onBack}>
            <ChevronLeft />
            Previous
          </Button>
          <Button type="submit" className="w-[120px] px-2" disabled={isSaving } >
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
  );
}