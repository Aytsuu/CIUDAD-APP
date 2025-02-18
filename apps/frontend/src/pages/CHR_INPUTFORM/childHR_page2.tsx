import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ChildHealthFormSchema from "@/form-schema/chr-schema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Syringe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Page2FormData = z.infer<typeof ChildHealthFormSchema>;

type Page1Props = {
  onPrevious1: () => void;
  onNext3: () => void;
  updateFormData: (data: Partial<Page2FormData>) => void;
  formData: Page2FormData;
};

export default function ChildHRPage2({
  onPrevious1,
  onNext3,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page2FormData>({
    defaultValues: {
      vaccines: formData.vaccines || [],
    },
  });

  const { handleSubmit, control, setValue } = form;
  const [vaccines, setVaccines] = useState<z.infer<typeof ChildHealthFormSchema>["vaccines"]>(
    formData.vaccines ?? []
  );
  const [newVaccine, setNewVaccine] = useState({
    vaccineType: "",
    dose: "",
    date: new Date().toISOString().split("T")[0],
  });

  const onSubmitForm = (data: Page2FormData) => {
    console.log("Form Data Submitted:", data);
    updateFormData({ vaccines: vaccines });
    console.log("Navigating to Page 3");
    onNext3();
  };

  const addVac = () => {
    if (newVaccine.vaccineType && newVaccine.dose && newVaccine.date) {
      const vaccineToAdd = {
        id: Date.now(),
        vaccineType: newVaccine.vaccineType,
        dose: newVaccine.dose,
        date: newVaccine.date,
      };

      const updatedVaccines = [...vaccines, vaccineToAdd];
      setVaccines(updatedVaccines);
      setValue("vaccines", updatedVaccines);

      updateFormData({ vaccines: updatedVaccines });

      setNewVaccine({
        vaccineType: "",
        dose: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  };

  const deleteVac = (id: number) => {
    const updatedVaccines = vaccines.filter((vac) => vac.id !== id);
    setVaccines(updatedVaccines);
    setValue("vaccines", updatedVaccines);

    updateFormData({ vaccines: updatedVaccines });
  };

  useEffect(() => {
    setVaccines(formData.vaccines ?? []);
  }, [formData]);

  const plannedVaccines = [
    {
      name: "BCG",
      totalDoses: "1 Dose/s",
    },
    {
      name: "Hepatitis B",
      totalDoses: "2 Dose/s",
    },
  ];

  const vaccineOptions = [
    { id: "BCG", name: "BCG" },
    { id: "Polio", name: "Polio" },
    { id: "Measles", name: "Measles" },
  ];

  const vaccineDoseOptions = [
    { id: "1st Dose", name: "1st Dose" },
    { id: "2nd Dose", name: "2nd Dose" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-6 p-4 md:p-6 lg:p-8"
        >
          <h3 className="font-semibold text-lg">Type of Immunization</h3>

          {/* Vaccine Selection */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <FormField
              control={control}
              name="vaccines"
              render={() => (
                <FormItem className="w-full sm:w-[200px]">
                  <FormControl>
                    <SelectLayout
                      label="Vaccine Type"
                      placeholder="Select Vaccine"
                      className="w-full"
                      options={vaccineOptions}
                      value={newVaccine.vaccineType}
                      onChange={(e) =>
                        setNewVaccine((prev) => ({ ...prev, vaccineType: e }))
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="vaccines"
              render={() => (
                <FormItem className="w-full sm:w-[200px]">
                  <FormControl>
                    <SelectLayout
                      label="Dose"
                      className="w-full"
                      placeholder="Select Dose"
                      options={vaccineDoseOptions}
                      value={newVaccine.dose}
                      onChange={(e) =>
                        setNewVaccine((prev) => ({ ...prev, dose: e }))
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="vaccines"
              render={() => (
                <FormItem className="w-full sm:w-[200px]">
                  <FormControl>
                    <Input
                      type="date"
                      value={newVaccine.date}
                      onChange={(e) =>
                        setNewVaccine((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="button"
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4"
              onClick={addVac}
              disabled={!newVaccine.vaccineType || !newVaccine.dose || !newVaccine.date}
            >
              Add
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-4">
            {/* Administered Vaccines History Section */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Syringe className="h-5 w-5 text-blue" />
                  Administered Vaccines History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {vaccines.length === 0 ? (
                    <p>No vaccines added yet</p>
                  ) : (
                    vaccines.map((vac) => (
                      <div
                        key={vac.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-900">
                              {vac.vaccineType}
                            </span>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Calendar className="h-4 w-4" />
                              {vac.date}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{vac.dose}</Badge>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => deleteVac(vac.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Planned Vaccines Section */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-red-500" />
                  Planned Vaccines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {plannedVaccines.map((vaccine, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">
                          {vaccine.name}
                        </span>
                        <Badge variant="outline">{vaccine.totalDoses}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious1}
              className="w-[100px]"
            >
              Previous
            </Button>
            <Button type="submit" className="w-[100px]">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}