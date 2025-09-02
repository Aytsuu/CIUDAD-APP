import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Plus, Info, CheckCircle } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";

interface VaccinationSectionProps {
  showVaccineList: boolean;
  handleShowVaccineListChange: (checked: boolean) => void;
  vaccineListOptions: {
    default: any[];
    formatted: { id: string; name: string }[];
  };
  selectedVaccineListId: string;
  handleExistingVaccineChange: (value: string) => void;
  setSelectedVaccineListId: (value: string) => void;
  existingVaccineErrors: { vaccine?: string; dose?: string; date?: string;};
  form: any; // Replace with proper form type
  existingVaccineTotalDoses: number;
  addExistingVac: () => void;
  vaccinesData?: {
    formatted: any[];
    default: any[];
  };
  formWatch: (field: string) => any;
  handleVaccineChange: (value: string) => void;
  setSelectedVaccineId: (value: string) => void;
  isLoading: boolean;
  newVaccineErrors: {vaccine?: string;
    dose?: string;
    date?: string;
  };
  currentVaccineTotalDoses: number;
  selectedVaccineId: string;
  nextVisitDate: string | null;
  nextVisitDescription: string | null;
  addVac: () => void;
  isVaccineCompleted: boolean;
  existingVaccines: any[];
  existingVaccineColumns: any[];
  vaccines: any[];
  vaccineColumns: any[];
}

export function VaccinationSection({
  vaccineListOptions,
  selectedVaccineListId,
  handleExistingVaccineChange,
  setSelectedVaccineListId,
  existingVaccineErrors,
  form,
  addExistingVac,
  vaccinesData,
  formWatch,
  handleVaccineChange,
  setSelectedVaccineId,
  isLoading,
  newVaccineErrors,
  // currentVaccineTotalDoses,
  selectedVaccineId,
  addVac,
  isVaccineCompleted,
  existingVaccines,
  existingVaccineColumns,
  vaccines,
  vaccineColumns
}: VaccinationSectionProps) {
  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-lg">Previous Vaccinations</CardTitle>
            <CardDescription>Record any vaccines this child has received before</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Vaccine Name</Label>
              <Combobox
                options={vaccineListOptions.formatted}
                value={selectedVaccineListId}
                onChange={(value) => {
                  handleExistingVaccineChange(value ?? "");
                  setSelectedVaccineListId(value ?? "");
                }}
                placeholder="Select vaccine"
                triggerClassName={`w-full ${existingVaccineErrors.vaccine ? "border-red-500" : ""}`}
                emptyMessage="No vaccines found"
              />
              {existingVaccineErrors.vaccine && <p className="text-red-500 text-sm">{existingVaccineErrors.vaccine}</p>}
            </div>
            <div className="space-y-2">
              <FormInput control={form.control} name="existingVaccines.0.dose" label="Dose Number" type="number" min={1} placeholder="enter dose number" />
            </div>
            <div className="space-y-2">
              <FormInput control={form.control} name="existingVaccines.0.totalDoses" label="Total Doses" type="number" min={1} placeholder="enter total dose" />
            </div>
            <div className="space-y-2">
              <FormDateTimeInput control={form.control} name="existingVaccines.0.date" label="Date Administered" type="date" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" onClick={addExistingVac} className=" bg-amber-600 hover:bg-amber-700" disabled={!selectedVaccineListId || isVaccineCompleted}>
              <Plus className="h-4 w-4 mr-2" />
              Add Previous Vaccine
            </Button>
          </div>

          <div>
            {existingVaccines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-amber-500" />
                    Previous Vaccinations ({existingVaccines.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable columns={existingVaccineColumns} data={existingVaccines} />
                </CardContent>
              </Card>
            )}
          </div>

          {existingVaccines.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vaccines recorded yet</h3>
                <p className="text-gray-600 mb-4">Start by adding previous vaccinations or new vaccines to be administered</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            New Vaccination
          </CardTitle>
          <CardDescription>Add vaccines to be administered today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="my-4">
              <Label>Vaccine Name</Label>
              <Combobox
                options={vaccinesData?.formatted ?? []}
                value={formWatch("vaccines.0.vaccineType") || ""}
                onChange={(value) => {
                  handleVaccineChange(value ?? "");
                  setSelectedVaccineId(value ?? "");
                }}
                placeholder={isLoading ? "Loading vaccines..." : "Search and select a vaccine"}
                triggerClassName="font-normal w-full"
                emptyMessage={
                  <div className="flex gap-2 justify-center items-center">
                    <Label className="font-normal text-xs">{isLoading ? "Loading..." : "No available vaccines in stock."}</Label>
                  </div>
                }
              />
              {newVaccineErrors.vaccine && <p className="text-red-500 text-sm">{newVaccineErrors.vaccine}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <FormInput control={form.control} name="vaccines.0.dose" label="Dose Number" type="number" min={1} placeholder="enter dose number" />
              </div>
              <div className="space-y-2">
                <FormInput control={form.control} name="vaccines.0.totalDoses" label="Total Doses" type="number" min={1} max={10} placeholder="enter total dose" />
              </div>
              <div className="space-y-2">
                <FormDateTimeInput control={form.control} name="vaccines.0.date" label="Date Administered" type="date" />
              </div>
              <FormDateTimeInput control={form.control} name="vaccines.0.nextFollowUpDate" label="Next Follow-up Visit Date" type="date" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={addVac} className="bg-blue-600 hover:bg-blue-700" disabled={!selectedVaccineId || isVaccineCompleted}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Vaccine
            </Button>
          </div>

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

          {vaccines.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vaccines recorded yet</h3>
                <p className="text-gray-600 mb-4">Start by adding previous vaccinations or new vaccines to be administered</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
