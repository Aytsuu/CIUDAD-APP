import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartPulse, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent } from "@/components/ui/card/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/table/data-table";
import { Form } from "@/components/ui/form/form";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { ImmunizationSection } from "./ImmunizationSection";
import { toast } from "sonner";
import { api2 } from "@/api/api";
import {
  VitalSignType,
  VaccineRecord,
  ExistingVaccineRecord,
  ImmunizationFormData,
  getCurrentDate,
  OptionalImmunizationFormSchema,
} from "@/form-schema/ImmunizationSchema";
import { createImmunizationColumns } from "./columns";
import {
  createFollowUpVisit,
  createChildHealthNotes,
} from "../forms/restful-api/createAPI";
import { ChildHealthHistoryRecord } from "../../childservices/viewrecords/types";
import { useAuth } from "@/context/AuthContext";
import { updateCHHistory } from "../forms/restful-api/updateAPI";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

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
}: ImmunizationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false);
  const [isLoadingVaccineList, setIsLoadingVaccineList] = useState(false);
  const { user } = useAuth();
  const staffId = user?.staff?.staff_id || null;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Update local state when props change
  useEffect(() => {
    setVaccines(propVaccines);
  }, [propVaccines]);

  useEffect(() => {
    setExistingVaccines(propExistingVaccines);
  }, [propExistingVaccines]);

  const form = useForm<ImmunizationFormData>({
    resolver: zodResolver(OptionalImmunizationFormSchema),
    defaultValues: {
      date: getCurrentDate(),
      age: "",
      wt: "",
      ht: "",
      temp: "",
      follov_description: "",
      followUpVisit: "",
      followv_status: "pending",
      notes: "",
      existingVaccines: propExistingVaccines,
      vaccines: propVaccines,
    },
  });

  useEffect(() => {
    const fetchVaccinesWithStock = async () => {
      setIsLoadingVaccines(true);
      try {
        const response = await api2.get("/inventory/vaccine_stocks/");
        const stocks = response.data;
        const availableStocks = stocks.filter((stock: any) => {
          const isExpired =
            stock.inv_details?.expiry_date &&
            new Date(stock.inv_details.expiry_date) < new Date();
          return stock.vacStck_qty_avail > 0 && !isExpired;
        });
        setVaccineOptions({
          default: availableStocks,
          formatted: availableStocks.map((stock: any) => ({
            id: `${stock.vacStck_id},${stock.vac_id},${
              stock.vaccinelist?.vac_name || "Unknown"
            },${stock.inv_details?.expiry_date || ""}`,
            name: `${stock.vaccinelist?.vac_name || "Unknown"} (Exp: ${
              stock.inv_details?.expiry_date
                ? new Date(stock.inv_details.expiry_date).toLocaleDateString()
                : "N/A"
            })`,
            quantity: stock.vacStck_qty_avail,
          })),
        });
      } catch (error) {
        console.error("Error fetching vaccine stocks:", error);
        toast.error("Failed to load vaccine stocks");
      } finally {
        setIsLoadingVaccines(false);
      }
    };

    const fetchVaccineList = async () => {
      setIsLoadingVaccineList(true);
      try {
        const response = await api2.get("/inventory/vac_list/");
        const vaccines = response.data;
        setVaccineListOptions({
          default: vaccines,
          formatted: vaccines.map((vaccine: any) => ({
            id: `${vaccine.vac_id},${vaccine.vac_name}`,
            name: vaccine.vac_name,
          })),
        });
      } catch (error) {
        console.error("Error fetching vaccine list:", error);
        toast.error("Failed to load vaccine list");
      } finally {
        setIsLoadingVaccineList(false);
      }
    };

    fetchVaccinesWithStock();
    fetchVaccineList();
  }, []);

  useEffect(() => {
    if (historicalVitalSigns.length > 0) {
      const todaysRecord = historicalVitalSigns.find(
        (vital) => vital.date === getCurrentDate()
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
          date: getCurrentDate(),
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
    setIsLoading(false);
  }, [historicalVitalSigns, form, existingVaccines, vaccines]);

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
      setIsLoading(true);

      const notesData = {
        ...data,
        chrec: ChildHealthRecord.chrec,
      };

      console.log("Notes data to save:", notesData);

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
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ImmunizationFormData) => {
    console.log("Data to save:", data);
    if (!form.formState.isValid) {
      console.log("Form errors:", form.formState.errors);
      return;
    }

    // Check if any data has been added
    const hasVaccines = vaccines.length > 0;
    const hasExistingVaccines = existingVaccines.length > 0;
    const hasNotes = data.notes && data.notes.trim() !== "";
    const hasFollowUp = data.followUpVisit && data.followUpVisit.trim() !== "";
    const hasFollowUpReason =
      data.follov_description && data.follov_description.trim() !== "";

    if (
      !hasVaccines &&
      !hasExistingVaccines &&
      !hasNotes &&
      !hasFollowUp &&
      !hasFollowUpReason
    ) {
      toast.info("No changes have been made");
      return;
    }

    try {
      setIsSaving(true);

      const saveData = {
        ...data,
        chrec: ChildHealthRecord.chrec,
        vaccines: hasVaccines ? vaccines : undefined,
        existingVaccines: hasExistingVaccines ? existingVaccines : undefined,
      };

      // Remove undefined fields
      const cleanData = Object.fromEntries(
        Object.entries(saveData).filter(([_, v]) => v !== undefined)
      );
      console.log("Data to save:", cleanData);

      console.log("Child Health Record:", ChildHealthRecord);
      const chrec_id=ChildHealthRecord.chrec
      console.log("Child Health Record ID:", chrec_id);
      const patrec_id =
        ChildHealthRecord.chrec_details.patrec_details.patrec_id.toString();
      console.log("Patient Record ID:", patrec_id);
      const chist_id = ChildHealthRecord.chhist_id;

      // Only create follow-up if there's follow-up data
      let followv_id = null;
      if (hasNotes || hasFollowUp || hasFollowUpReason) {
        if (hasFollowUp || hasFollowUpReason) {
          const newFollowUp = await createFollowUpVisit({
            followv_date: data.followUpVisit ?? null,
            created_at: new Date().toISOString(),
            followv_description:
              data.follov_description || "Follow Up for Child Health",
            patrec: patrec_id,
            followv_status: "pending",
            updated_at: new Date().toISOString(),
          });
          followv_id = newFollowUp.followv_id;
        }

        // Only create notes if there are notes
        await createChildHealthNotes({
          chn_notes: data.notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          followv: followv_id,
          chhist: chist_id,
          staff: staffId,
        });
      }
      await updateCHHistory(Number(chist_id));
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] }); 
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords", chrec_id] });
      // Update with your query key
      toast.success("Immunization data saved successfully!");
      navigate(-1);
      if (editingRowIndex !== null) {
        handleUpdateVitalSign(editingRowIndex, data);
      }
    } catch (error) {
      console.error("Error saving immunization data:", error);
      toast.error("Failed to save immunization data");
    } finally {
      setIsSaving(false);
    }
  };

  const addVac = () => {
    if (!selectedVaccineId) {
      toast.error("Please select a vaccine first");
      return;
    }

    const formValues = form.getValues();
    const [vacStck_id, vac_id, vac_name, expiry_date] =
      selectedVaccineId.split(",");

    const vaccineToAdd: VaccineRecord = {
      vacStck_id: vacStck_id.trim(),
      vaccineType: vac_name.trim(),
      dose: formValues.vaccines?.[0]?.dose || "1",
      date: getCurrentDate(), // Always use today's date
      vac_id: vac_id.trim(),
      vac_name: vac_name.trim(),
      expiry_date: expiry_date.trim(),
    };

    const newVaccines = [...vaccines, vaccineToAdd];
    setVaccines(newVaccines);
    if (propSetVaccines) propSetVaccines(newVaccines);
    form.setValue("vaccines", newVaccines);
    setSelectedVaccineId("");
    toast.success("Vaccine added successfully!");
  };

  const addExistingVac = () => {
    const formValues = form.getValues();
    const [vac_id, vac_name] = selectedVaccineListId.split(",");

    const vaccineToAdd: ExistingVaccineRecord = {
      vac_id: vac_id.trim(),
      vac_name: vac_name.trim(),
      vaccineType: vac_name.trim(),
      dose: formValues.existingVaccines?.[0]?.dose || "",
      date: getCurrentDate(), // Always use today's date
    };

    const newExistingVaccines = [...existingVaccines, vaccineToAdd];
    setExistingVaccines(newExistingVaccines);
    if (propSetExistingVaccines) propSetExistingVaccines(newExistingVaccines);
    form.setValue("existingVaccines", newExistingVaccines);

    setSelectedVaccineListId("");
    form.setValue("existingVaccines.0", {
      dose: "",
      date: getCurrentDate(),
    });

    toast.success("Existing vaccine added successfully!");
  };

  const deleteVac = (vacStck_id: string) => {
    const updatedVaccines = vaccines.filter(
      (vac) => vac.vacStck_id !== vacStck_id
    );
    setVaccines(updatedVaccines);
    if (propSetVaccines) propSetVaccines(updatedVaccines);
    form.setValue("vaccines", updatedVaccines);
    toast.success("Vaccine removed successfully!");
  };

  const deleteExistingVac = (vac_id: string) => {
    const updatedExistingVaccines = existingVaccines.filter(
      (vac) => vac.vac_id !== vac_id
    );
    setExistingVaccines(updatedExistingVaccines);
    if (propSetExistingVaccines)
      propSetExistingVaccines(updatedExistingVaccines);
    form.setValue("existingVaccines", updatedExistingVaccines);
    toast.success("Existing vaccine removed successfully!");
  };

  const { vitalSignsColumns } = createImmunizationColumns({
    editingRowIndex,
    isLoading,
    historicalNotes,
    handleStartEdit,
    deleteVac,
    deleteExistingVac,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full p-6">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  return (
    <>
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

          <ImmunizationSection
            vaccines={vaccines}
            existingVaccines={existingVaccines}
            setVaccines={setVaccines}
            setExistingVaccines={setExistingVaccines}
            form={form}
            vaccineOptions={vaccineOptions}
            vaccineListOptions={vaccineListOptions}
            isLoadingVaccines={isLoadingVaccines}
            isLoadingVaccineList={isLoadingVaccineList}
            selectedVaccineId={selectedVaccineId}
            setSelectedVaccineId={setSelectedVaccineId}
            selectedVaccineListId={selectedVaccineListId}
            setSelectedVaccineListId={setSelectedVaccineListId}
            addVac={addVac}
            addExistingVac={addExistingVac}
            showVaccineList={showVaccineList}
            setShowVaccineList={setShowVaccineList}
          />

          {/* Error display */}
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="text-red-500 text-sm mb-4 p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium mb-2">Form Errors:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(form.formState.errors).map(([key, error]) => (
                  <li key={key}>
                    {key}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isNotesDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormTextArea
                      control={form.control}
                      label="Clinical Notes"
                      name="notes"
                      placeholder="Enter clinical notes..."
                      className="w-full min-h-[200px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormTextArea
                      label="Follow-up Reason"
                      control={form.control}
                      name="follov_description"
                      placeholder="Enter follow-up reason..."
                      className="w-full min-h-[100px]"
                    />
                    <FormDateTimeInput
                      control={form.control}
                      name="followUpVisit"
                      label="Follow-up date"
                      type="date"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const formValues = form.getValues();
                      handleSaveNotes({
                        ...formValues,
                      });
                      setIsNotesDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onBack}>
              <ChevronLeft />
              Previous
            </Button>
            <Button
              type="submit"
              className="w-[120px] px-2"
              disabled={isSaving}
            >
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
