import { useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { Plus, Info, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card/card";
import { DataTable } from "@/components/ui/table/data-table";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createImmunizationColumns } from "./columns";
import { VaccineRecord, ExistingVaccineRecord ,ImmunizationFormData,getCurrentDate} from "@/form-schema/ImmunizationSchema";

interface ImmunizationSectionProps {
  vaccines: VaccineRecord[];
  existingVaccines: ExistingVaccineRecord[];
  setVaccines: (vaccines: VaccineRecord[]) => void;
  setExistingVaccines: (vaccines: ExistingVaccineRecord[]) => void;
  form:  UseFormReturn<ImmunizationFormData>;
  vaccineOptions: {
    formatted: { id: string; name: string; quantity?: number }[];
  };
  vaccineListOptions: {
    formatted: { id: string; name: string }[];
  };
  isLoadingVaccines: boolean;
  isLoadingVaccineList: boolean;
  selectedVaccineId: string;
  setSelectedVaccineId: (id: string) => void;
  selectedVaccineListId: string;
  setSelectedVaccineListId: (id: string) => void;
  addVac: () => void;
  addExistingVac: () => void;
  showVaccineList: boolean;
  setShowVaccineList: (value: boolean) => void;
}

export function ImmunizationSection({
  vaccines,
  existingVaccines,
  setVaccines,
  setExistingVaccines,
  form,
  vaccineOptions,
  vaccineListOptions,
  isLoadingVaccines,
  isLoadingVaccineList,
  selectedVaccineId,
  setSelectedVaccineId,
  selectedVaccineListId,
  setSelectedVaccineListId,
  addVac,
  addExistingVac,
  showVaccineList,
  setShowVaccineList
}: ImmunizationSectionProps) {
  const [newVaccineErrors, setNewVaccineErrors] = useState<{ vaccine?: string; dose?: string; date?: string }>({});
  const [existingVaccineErrors, setExistingVaccineErrors] = useState<{ vaccine?: string; dose?: string; date?: string }>({});

  const handleVaccineSelection = (id: string) => {
    setSelectedVaccineId(id);
    setNewVaccineErrors(prev => ({ ...prev, vaccine: undefined }));
  };

  const handleVaccineListSelection = (id: string) => {
    setSelectedVaccineListId(id);
    setExistingVaccineErrors(prev => ({ ...prev, vaccine: undefined }));
  };

  const handleShowVaccineListChange = (checked: boolean) => {
    setShowVaccineList(checked);
    if (!checked) {
      setExistingVaccines([]);
      setSelectedVaccineListId("");
      setExistingVaccineErrors({});
    }
  };

  const { vaccineColumns, existingVaccineColumns } = createImmunizationColumns({
    deleteVac: (vacStck_id: string) => {
      const updatedVaccines = vaccines.filter(vac => vac.vacStck_id !== vacStck_id);
      setVaccines(updatedVaccines);
      form.setValue("vaccines", updatedVaccines);
      toast.success("Vaccine removed successfully!");
    },
    deleteExistingVac: (vac_id: string) => {
      const updatedExistingVaccines = existingVaccines.filter(vac => vac.vac_id !== vac_id);
      setExistingVaccines(updatedExistingVaccines);
      form.setValue("existingVaccines", updatedExistingVaccines);
      toast.success("Existing vaccine removed successfully!");
    }
  });

  // Set default dates on component mount
  useEffect(() => {
    const currentDate = getCurrentDate();
    
    // Initialize form values if they're empty
    if (!form.getValues('vaccines.0.date')) {
      form.setValue('vaccines.0.date', currentDate);
    }
    
    if (!form.getValues('existingVaccines.0.date')) {
      form.setValue('existingVaccines.0.date', currentDate);
    }
  }, [form]);
  

  return (
    <div className="space-y-6">
      {/* Existing Vaccination Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Previous Vaccinations</CardTitle>
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
                  placeholder={isLoadingVaccineList ? "Loading..." : "Select vaccine"}
                  triggerClassName={`w-full ${existingVaccineErrors.vaccine ? "border-red-500" : ""}`}
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
                {existingVaccineErrors.vaccine && (
                  <p className="text-red-500 text-sm">{existingVaccineErrors.vaccine}</p>
                )}
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
                  className={existingVaccineErrors.dose ? "border-red-500" : ""}
                />
                {existingVaccineErrors.dose && (
                  <p className="text-red-500 text-sm">{existingVaccineErrors.dose}</p>
                )}
              </div>
              <div className="space-y-2">
                <FormDateTimeInput
                  control={form.control}
                  name="existingVaccines.0.date"
                  label="Date Administered"
                  type="date"
                />
                {existingVaccineErrors.date && (
                  <p className="text-red-500 text-sm">{existingVaccineErrors.date}</p>
                )}
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
                placeholder={isLoadingVaccines ? "Loading..." : "Select vaccine"}
                triggerClassName={`w-full ${newVaccineErrors.vaccine ? "border-red-500" : ""}`}
                emptyMessage={
                  isLoadingVaccines ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading vaccines...
                    </div>
                  ) : (
                    "No vaccines available in stock"
                  )
                }
              />
              {newVaccineErrors.vaccine && (
                <p className="text-red-500 text-sm">{newVaccineErrors.vaccine}</p>
              )}
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
                className={newVaccineErrors.dose ? "border-red-500" : ""}
              />
              {newVaccineErrors.dose && (
                <p className="text-red-500 text-sm">{newVaccineErrors.dose}</p>
              )}
            </div>
            <div className="space-y-2">
              <FormDateTimeInput
                control={form.control}
                name="vaccines.0.date"
                label="Date Administered"
                type="date"
                
              />
              {newVaccineErrors.date && (
                <p className="text-red-500 text-sm">{newVaccineErrors.date}</p>
              )}
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={addVac}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Vaccine
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                Start by adding previous vaccinations or new vaccines to be
                administered
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper function to get current date in YYYY-MM-DD format
