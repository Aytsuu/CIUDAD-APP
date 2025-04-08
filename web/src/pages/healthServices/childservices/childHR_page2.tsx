import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/card";
import { Calendar, Syringe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChildHealthFormSchema } from "@/form-schema/chr-schema";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import ChildVaccines from "./ChildVaccines";

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
    defaultValues: { vaccines: formData.vaccines || [] },
  });

  const { handleSubmit, control, setValue } = form;
  const [vaccines, setVaccines] = useState(formData.vaccines ?? []);
  const [newVaccine, setNewVaccine] = useState({
    vaccineType: "",
    dose: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    setVaccines(formData.vaccines ?? []);
  }, [formData]);

  const addVac = () => {
    if (newVaccine.vaccineType && newVaccine.dose && newVaccine.date) {
      const vaccineToAdd = {
        id: Date.now(),
        ...newVaccine,
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

  return (
    <div className="w-full max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <Form {...form}>
        <form onSubmit={handleSubmit((data) => 
          {    console.log("pAGE 2:", data);
            onNext3();
          })}
          className="space-y-6">
          <h3 className="font-semibold text-lg">Type of Immunization</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <FormField
              control={control}
              name="vaccines"
              render={() => (
                <FormItem className="w-full sm:w-[200px]">
                  <FormControl>
                    <SelectLayout
                      className="w-full"
                      label="Vaccine Type"
                      placeholder="Select Vaccine"
                      options={[
                        { id: "BCG", name: "BCG" },
                        { id: "Polio", name: "Polio" },
                        { id: "Measles", name: "Measles" },
                      ]}
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
                      className="w-full"
                      label="Dose"
                      placeholder="Select Dose"
                      options={[
                        { id: "1st Dose", name: "1st Dose" },
                        { id: "2nd Dose", name: "2nd Dose" },
                      ]}
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
              disabled={
                !newVaccine.vaccineType || !newVaccine.dose || !newVaccine.date
              }
            >
              Add
            </Button>
          </div>
          <Card className="bg-gray-50">
            <CardHeader className="w-full flex-row flex justify-between items-center gap-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Syringe className="h-5 w-5 text-blue" /> Administered Vaccines
                History
              </CardTitle>

              <DialogLayout
                trigger={
                  <div className="text-blue italic underline px-4 py-2 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                    List of Vaccines To be Administered {">"}
                  </div>
                }
                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                title="Vaccines"
                description="List of all Vaccines to be  administered ."
                mainContent={<ChildVaccines />}
              />
            </CardHeader>
            <CardContent>
              {vaccines.length === 0 ? (
                <p>No vaccines added yet</p>
              ) : (
                vaccines.map((vac) => (
                  <div
                    key={vac.id}
                    className="bg-white rounded-lg p-4 shadow-sm border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex gap-20">
                        <div>
                          <span className="font-semibold">
                            {vac.vaccineType}
                          </span>
                        </div>
                        <div className="text-sm  flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 inline-block" />{" "}
                          {vac.date}
                        </div>
                        <Badge variant="secondary">{vac.dose}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
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
            </CardContent>
          </Card>
          <div className="flex w-full justify-end gap-2">
            <Button
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
