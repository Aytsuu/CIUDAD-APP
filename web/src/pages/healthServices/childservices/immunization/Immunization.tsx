import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HeartPulse,
  ChevronLeft,
  Plus,
  Info,
  CheckCircle,
  Loader2,
  Trash2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/table/data-table";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { calculateAgeFromDOB } from "@/helpers/mmddwksAgeCalculator";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { ImmunizationSection } from "./ImmunizationSection";
import { toast } from "sonner";
import { api2 } from "@/api/api";
import { z } from "zod";
import {
  VitalSignType,
  VaccineRecord,
  ImmunizationFormSchema,
  ExistingVaccineRecord,
  ImmunizationFormData,
  getCurrentDate,
} from "./ImmunizationSchema";
import { createImmunizationColumns } from "./columns";

// Updated schema with all fields optional
const OptionalImmunizationFormSchema = ImmunizationFormSchema.extend({
  wt: z.string().optional(),
  ht: z.string().optional(),
  temp: z.string().optional(),
  follov_description: z.string().optional(),
  followUpVisit: z.string().optional(),
  followv_status: z.string().optional(),
  notes: z.string().optional(),
  existingVaccines: z
    .array(
      z.object({
        dose: z.string().optional(),
        date: z.string().optional(),
      })
    )
    .optional(),
  vaccines: z
    .array(
      z.object({
        dose: z.string().optional(),
        date: z.string().optional(),
      })
    )
    .optional(),
});

interface ImmunizationProps {
  ChildHealthRecord: {
    chrec: string;
    chhist_id: string;
    childDob?: string;
  };
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
}

export default function Immunization({
  ChildHealthRecord,
  historicalVitalSigns = [],
  historicalNotes = [],
  onUpdateVitalSigns,
  onBack = () => {},
}: ImmunizationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [latestVitalSigns, setLatestVitalSigns] =
    useState<VitalSignType | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [existingVaccines, setExistingVaccines] = useState<
    ExistingVaccineRecord[]
  >([]);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>("");
  const [selectedVaccineListId, setSelectedVaccineListId] =
    useState<string>("");
  const [showVaccineList, setShowVaccineList] = useState<boolean>(false);

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
      existingVaccines: [],
      vaccines: [],
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
    alert("Submitting immunization data...");
    console.log("Data to save:", data);
    if (!form.formState.isValid) {
      console.log("Form errors:", form.formState.errors);
      return;
    }

    try {
      setIsSaving(true);

      const saveData = {
        ...data,
        chrec: ChildHealthRecord.chrec,
        vaccines: vaccines.length > 0 ? vaccines : undefined,
        existingVaccines:
          existingVaccines.length > 0 ? existingVaccines : undefined,
      };

      // Remove undefined fields
      const cleanData = Object.fromEntries(
        Object.entries(saveData).filter(([_, v]) => v !== undefined)
      );

      console.log("Data to save:", cleanData);

      // Simulate API call (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Immunization data saved successfully!");

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
      dose: formValues.vaccines?.[0]?.dose || "1", // Default to dose 1 if empty
      date: formValues.vaccines?.[0]?.date || getCurrentDate(),
      vac_id: vac_id.trim(),
      vac_name: vac_name.trim(),
      expiry_date: expiry_date.trim(),
    };

    setVaccines((prev) => [...prev, vaccineToAdd]);
    form.setValue("vaccines", [...vaccines, vaccineToAdd]);
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
      date: formValues.existingVaccines?.[0]?.date || getCurrentDate(),
    };

    const updatedExistingVaccines = [...existingVaccines, vaccineToAdd];
    setExistingVaccines(updatedExistingVaccines);
    form.setValue("existingVaccines", updatedExistingVaccines);

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
    form.setValue("vaccines", updatedVaccines);
    toast.success("Vaccine removed successfully!");
  };

  const deleteExistingVac = (vac_id: string) => {
    const updatedExistingVaccines = existingVaccines.filter(
      (vac) => vac.vac_id !== vac_id
    );
    setExistingVaccines(updatedExistingVaccines);
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
            <Button type="submit" className="w-[100px]">
              save{" "}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
