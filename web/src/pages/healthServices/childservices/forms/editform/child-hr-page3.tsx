"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import {
  Calendar,
  Trash2,
  Loader2,
  Plus,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  VaccinesSchema,
  type VaccineType,
  type VaccineRecord,
  type ExistingVaccineRecord,
} from "@/form-schema/chr-schema/chr-schema";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api2 } from "@/api/api";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormInput } from "@/components/ui/form/form-input";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { Switch } from "@/components/ui/switch";

type Page3Props = {
  onPrevious: () => void;
  onNext: () => void;
  updateFormData: (data: Partial<VaccineType>) => void;
  formData: VaccineType;
  position: string;
  mode: "addnewchildhealthrecord" | "newchildhealthrecord" | "immunization";
};

const fetchVaccinesWithStock = async () => {
  try {
    const response = await api2.get("/inventory/vaccine_stocks/");
    const stocks = response.data;
    if (!stocks || !Array.isArray(stocks)) {
      return { default: [], formatted: [] };
    }
    const availableStocks = stocks.filter((stock: any) => {
      const isExpired =
        stock.inv_details?.expiry_date &&
        new Date(stock.inv_details.expiry_date) < new Date();
      return stock.vacStck_qty_avail > 0 && !isExpired;
    });
    return {
      default: availableStocks,
      formatted: availableStocks.map((stock: any) => ({
        id: `${stock.vacStck_id.toString()},${stock.vac_id},${
          stock.vaccinelist?.vac_name || "Unknown"
        },${stock.inv_details?.expiry_date || ""}`,
        name: `${stock.vaccinelist?.vac_name || "Unknown"} (Exp: ${
          stock.inv_details?.expiry_date
            ? new Date(stock.inv_details.expiry_date).toLocaleDateString()
            : "N/A"
        })`,
        quantity: stock.vacStck_qty_avail,
      })),
    };
  } catch (error) {
    console.error("Error fetching vaccine stocks:", error);
    toast.error("Failed to load vaccine stocks");
    throw error;
  }
};

const fetchVaccineList = async () => {
  try {
    const response = await api2.get("/inventory/vac_list/");
    const vaccines = response.data;
    if (!vaccines || !Array.isArray(vaccines)) {
      return { default: [], formatted: [] };
    }
    return {
      default: vaccines,
      formatted: vaccines.map((vaccine: any) => ({
        id: `${vaccine.vac_id.toString()},${vaccine.vac_name}`,
        name: vaccine.vac_name,
      })),
    };
  } catch (error) {
    console.error("Error fetching vaccine list:", error);
    toast.error("Failed to load vaccine list");
    throw error;
  }
};

export default function ChildHRPage3({
  onPrevious,
  onNext,
  updateFormData,
  formData,
  position,
  mode,
}: Page3Props) {
  const form = useForm<VaccineType>({
    defaultValues: {
      vaccines: [],
      hasExistingVaccination: formData.hasExistingVaccination || false,
      existingVaccines: [],
    },
    resolver: zodResolver(VaccinesSchema),
  });

  const [vaccines, setVaccines] = useState<VaccineRecord[]>(
    formData.vaccines ?? []
  );
  const [existingVaccines, setExistingVaccines] = useState<
    ExistingVaccineRecord[]
  >(formData.existingVaccines ?? []);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>("");
  const [selectedVaccineListId, setSelectedVaccineListId] =
    useState<string>("");
  const [showVaccineList, setShowVaccineList] = useState<boolean>(
    formData.hasExistingVaccination || false
  );
  const [vaccineOptions, setVaccineOptions] = useState<{
    default: any[];
    formatted: { id: string; name: string; quantity?: number }[];
  }>({ default: [], formatted: [] });
  const [vaccineListOptions, setVaccineListOptions] = useState<{
    default: any[];
    formatted: { id: string; name: string }[];
  }>({ default: [], formatted: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVaccineList, setIsLoadingVaccineList] = useState(false);

  // Validation states
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

  const loadVaccines = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchVaccinesWithStock();
      setVaccineOptions(data);
    } catch (error) {
      toast.error("Failed to load vaccines");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadVaccineList = useCallback(async () => {
    setIsLoadingVaccineList(true);
    try {
      const data = await fetchVaccineList();
      setVaccineListOptions(data);
    } catch (error) {
      toast.error("Failed to load vaccine list");
    } finally {
      setIsLoadingVaccineList(false);
    }
  }, []);

  useEffect(() => {
    loadVaccines();
    loadVaccineList();
  }, [loadVaccines, loadVaccineList]);

  useEffect(() => {
    setVaccines(formData.vaccines ?? []);
    setExistingVaccines(formData.existingVaccines ?? []);
    setShowVaccineList(formData.hasExistingVaccination || false);
    form.setValue(
      "hasExistingVaccination",
      formData.hasExistingVaccination || false
    );
  }, [formData, form]);

  const validateNewVaccine = () => {
    const errors: typeof newVaccineErrors = {};
    const currentValues = form.getValues();

    if (!selectedVaccineId) {
      errors.vaccine = "Please select a vaccine";
    }
    if (!currentValues.vaccines?.[0]?.dose) {
      errors.dose = "Please enter dose number";
    }
    if (!currentValues.vaccines?.[0]?.date) {
      errors.date = "Please select date";
    }

    setNewVaccineErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateExistingVaccine = () => {
    const errors: typeof existingVaccineErrors = {};
    const currentValues = form.getValues();

    if (!selectedVaccineListId) {
      errors.vaccine = "Please select a vaccine";
    }
    if (!currentValues.existingVaccines?.[0]?.dose) {
      errors.dose = "Please enter dose number";
    }
    if (!currentValues.existingVaccines?.[0]?.date) {
      errors.date = "Please select date";
    }

    setExistingVaccineErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVaccineSelection = useCallback(
    (id: string) => {
      setSelectedVaccineId(id);
      setNewVaccineErrors((prev) => ({ ...prev, vaccine: undefined }));

      if (id) {
        const trimmedId = id.split(",")[0].trim();
        form.setValue("vaccines.0.vacStck_id", trimmedId);
        form.setValue("vaccines.0.dose", "1");
        form.setValue(
          "vaccines.0.date",
          new Date().toISOString().split("T")[0]
        );
      } else {
        form.setValue("vaccines.0.vacStck_id", "");
        form.setValue("vaccines.0.dose", "");
        form.setValue("vaccines.0.date", "");
      }
    },
    [form]
  );

  const handleVaccineListSelection = useCallback(
    (id: string) => {
      setSelectedVaccineListId(id);
      setExistingVaccineErrors((prev) => ({ ...prev, vaccine: undefined }));

      if (id) {
        const trimmedId = id.split(",")[0].trim();
        form.setValue("existingVaccines.0.vac_id", trimmedId);
        form.setValue("existingVaccines.0.dose", "1");
        form.setValue(
          "existingVaccines.0.date",
          new Date().toISOString().split("T")[0]
        );
      } else {
        form.setValue("existingVaccines.0.vac_id", "");
        form.setValue("existingVaccines.0.dose", "");
        form.setValue("existingVaccines.0.date", "");
      }
    },
    [form]
  );

  const handleShowVaccineListChange = (checked: boolean) => {
    setShowVaccineList(checked);
    form.setValue("hasExistingVaccination", checked);
    if (!checked) {
      setExistingVaccines([]);
      form.setValue("existingVaccines", []);
      setSelectedVaccineListId("");
      setExistingVaccineErrors({});
    }
  };

  const addVac = () => {
    if (!validateNewVaccine()) return;

    const currentValues = form.getValues();
    const [vacStck_id, vac_id, vac_name, expiry_date] =
      selectedVaccineId.split(",");
    const vaccineToAdd = {
      vacStck_id: vacStck_id.trim(),
      vaccineType: vac_name.trim(),
      dose: currentValues.vaccines![0].dose,
      date: currentValues.vaccines![0].date,
      vac_id: vac_id.trim(),
      vac_name: vac_name.trim(),
      expiry_date: expiry_date.trim(),
    };

    const updatedVaccines = [...vaccines, vaccineToAdd];
    setVaccines(updatedVaccines);
    updateFormData({
      vaccines: updatedVaccines,
      hasExistingVaccination: showVaccineList,
      existingVaccines: existingVaccines,
    });

    // Reset form
    setSelectedVaccineId("");
    form.setValue("vaccines.0.vacStck_id", "");
    form.setValue("vaccines.0.dose", "");
    form.setValue("vaccines.0.date", "");
    setNewVaccineErrors({});

    toast.success("Vaccine added successfully!");
  };

  const addExistingVac = () => {
    if (!validateExistingVaccine()) return;

    const currentValues = form.getValues();
    const [vac_id, vac_name] = selectedVaccineListId.split(",");
    const vaccineToAdd = {
      vac_id: vac_id.trim(),
      vaccineType: vac_name.trim(),
      dose: currentValues.existingVaccines![0].dose,
      date: currentValues.existingVaccines![0].date,
      vac_name: vac_name.trim(),
    };

    const updatedExistingVaccines = [...existingVaccines, vaccineToAdd];
    setExistingVaccines(updatedExistingVaccines);
    updateFormData({
      vaccines,
      hasExistingVaccination: true,
      existingVaccines: updatedExistingVaccines,
    });

    // Reset form
    setSelectedVaccineListId("");
    form.setValue("existingVaccines.0.vac_id", "");
    form.setValue("existingVaccines.0.dose", "");
    form.setValue("existingVaccines.0.date", "");
    setExistingVaccineErrors({});

    toast.success("Existing vaccine added successfully!");
  };

  const deleteVac = (vacStck_id: string) => {
    const updatedVaccines = vaccines.filter(
      (vac) => vac.vacStck_id !== vacStck_id
    );
    setVaccines(updatedVaccines);
    updateFormData({
      vaccines: updatedVaccines,
      hasExistingVaccination: showVaccineList,
      existingVaccines: existingVaccines,
    });
    toast.success("Vaccine removed successfully!");
  };

  const deleteExistingVac = (vac_id: string) => {
    const updatedExistingVaccines = existingVaccines.filter(
      (vac) => vac.vac_id !== vac_id
    );
    setExistingVaccines(updatedExistingVaccines);
    updateFormData({
      vaccines,
      hasExistingVaccination: updatedExistingVaccines.length > 0,
      existingVaccines: updatedExistingVaccines,
    });
    toast.success("Existing vaccine removed successfully!");
  };

  const vaccineColumns: ColumnDef<VaccineRecord>[] = [
    {
      accessorKey: "vaccineType",
      header: "Vaccine Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="font-medium">{row.original.vaccineType}</span>
        </div>
      ),
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Dose {row.original.dose}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Date Administered",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.original.date
              ? new Date(row.original.date).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() =>
            row.original.vacStck_id && deleteVac(row.original.vacStck_id)
          }
          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const existingVaccineColumns: ColumnDef<ExistingVaccineRecord>[] = [
    {
      accessorKey: "vaccineType",
      header: "Vaccine Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-500" />
          <span className="font-medium">{row.original.vaccineType}</span>
        </div>
      ),
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Dose {row.original.dose}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Date Administered",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.original.date
              ? new Date(row.original.date).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            row.original.vac_id && deleteExistingVac(row.original.vac_id)
          }
          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleNext = (data: VaccineType) => {
    updateFormData({
      vaccines: vaccines,
      hasExistingVaccination: showVaccineList,
      existingVaccines: existingVaccines,
    });
    onNext();
  };

  return (
    <div className="bg-white p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNext)} className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Immunization Records
            </h1>
          </div>
          {position === "Midwife" ? (
            <div className="">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Existing Vaccination Toggle */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Previous Vaccinations
                        </CardTitle>
                        <CardDescription>
                          Record any vaccines this child has received before
                        </CardDescription>
                      </div>
                      <Switch
                        checked={showVaccineList}
                        onCheckedChange={handleShowVaccineListChange}
                      />
                    </div>
                  </CardHeader>

                  {showVaccineList && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Vaccine Name</Label>
                          <Combobox
                            options={vaccineListOptions.formatted}
                            value={selectedVaccineListId}
                            onChange={handleVaccineListSelection}
                            placeholder={
                              isLoadingVaccineList
                                ? "Loading..."
                                : "Select vaccine"
                            }
                            triggerClassName={`w-full ${
                              existingVaccineErrors.vaccine
                                ? "border-red-500"
                                : ""
                            }`}
                            emptyMessage={
                              isLoadingVaccineList ? (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading vaccines...
                                </div>
                              ) : (
                                "No vaccines found"
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <FormInput
                            control={form.control}
                            name="existingVaccines.0.dose"
                            label="Dose Number"
                            type="number"
                            min={1}
                            max={10}
                            placeholder="1"
                            className={
                              existingVaccineErrors.dose ? "border-red-500" : ""
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <FormDateTimeInput
                            control={form.control}
                            name="existingVaccines.0.date"
                            label="Date Administered"
                            type="date"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            onClick={addExistingVac}
                            className="w-full bg-amber-600 hover:bg-amber-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Previous Vaccine
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* New Vaccination Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="h-5 w-5 text-blue-600" />
                      New Vaccination
                    </CardTitle>
                    <CardDescription>
                      Add vaccines to be administered today
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Vaccine Name</Label>
                        <Combobox
                          options={vaccineOptions.formatted}
                          value={selectedVaccineId}
                          onChange={handleVaccineSelection}
                          placeholder={
                            isLoading ? "Loading..." : "Select vaccine"
                          }
                          triggerClassName={`w-full ${
                            newVaccineErrors.vaccine ? "border-red-500" : ""
                          }`}
                          emptyMessage={
                            isLoading ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading vaccines...
                              </div>
                            ) : (
                              "No vaccines available in stock"
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <FormInput
                          control={form.control}
                          name="vaccines.0.dose"
                          label="Dose Number"
                          type="number"
                          min={1}
                          max={10}
                          placeholder="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <FormDateTimeInput
                          control={form.control}
                          name="vaccines.0.date"
                          label="Date Administered"
                          type="date"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={addVac}
                          className="w-full bg-blue hover:bg-sky-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Vaccine
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vaccine Tables */}
              <div className="space-y-6">
                {/* Existing Vaccines Table */}
                {existingVaccines.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-amber-500" />
                        Previous Vaccinations ({existingVaccines.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={existingVaccineColumns}
                        data={existingVaccines}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* New Vaccines Table */}
                {vaccines.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        New Vaccinations ({vaccines.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable columns={vaccineColumns} data={vaccines} />
                    </CardContent>
                  </Card>
                )}

                {/* Empty State */}
                {vaccines.length === 0 && existingVaccines.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No vaccines recorded yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start by adding previous vaccinations or new vaccines to
                        be administered
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Vaccination records can only be addnewchildhealthrecorded by midwives
                </h3>
                <p className="text-gray-600 mb-4">
                  Please contact a midwife to update vaccination records
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-end items-center pt-6 gap-2 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={onPrevious}
              className="px-8"
            >
              Previous
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
