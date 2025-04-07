import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { Calendar, Syringe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VaccineType ,VaccinesSchema} from "@/form-schema/chr-schema";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import ChildVaccines from "./ChildVaccines";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card/card";
import CardLayout from "@/components/ui/card/card-layout";



type Page1Props = {
  onPrevious2: () => void;
  onNext4: () => void;
  updateFormData: (data: Partial<VaccineType>) => void;
  formData: VaccineType;
};

type VaccineRecord = {
  id: number;
  vaccineType: string;
  dose: string;
  date: string;
};

export default function ChildHRPage3({
  onPrevious2,
  onNext4,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<VaccineType>({
    defaultValues: { vaccines: formData.vaccines || [] },
    resolver: zodResolver(VaccinesSchema),
  });

  const { handleSubmit, control, setValue } = form;
  const [vaccines, setVaccines] = useState<VaccineRecord[]>(
    formData.vaccines ?? []
  );
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

  // Define columns for the DataTable
  const vaccineColumns: ColumnDef<VaccineRecord>[] = [
    {
      accessorKey: "vaccineType",
      header: "Vaccine Type",
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => <Badge variant="secondary">{row.original.dose}</Badge>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4 inline-block" />
          {row.original.date}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => deleteVac(row.original.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <>
     

      <div className="w-full bg-white rounded-lg shadow md:p-6 lg:p-8 p-8">
        <Form {...form}>
          <form
            onSubmit={handleSubmit((data) => {
              console.log("Page 2:", data);
              onNext4();
            })}
            className="space-y-6"
          >
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
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4"
                onClick={addVac}
                disabled={
                  !newVaccine.vaccineType ||
                  !newVaccine.dose ||
                  !newVaccine.date
                }
              >
                Add
              </Button>
            </div>

            <CardLayout
              cardTitle=""
              cardContent={
                <>
                  <div className="bg-gray-50 mt-[-20px]">
                    <div className="w-full flex-row flex justify-between items-center gap-4">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Syringe className="h-5 w-5 text-blue " /> Administered
                        Vaccines History
                      </div>

                      <DialogLayout
                        trigger={
                          <div className="text-blue italic underline px-4 py-2 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                            List of Vaccines To be Administered {">"}
                          </div>
                        }
                        className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                        title="Vaccines"
                        description="List of all Vaccines to be administered."
                        mainContent={<ChildVaccines />}
                      />
                    </div>

                    <div className="p-4">
                      {vaccines.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No vaccines added yet</p>
                        </div>
                      ) : (
                        <DataTable columns={vaccineColumns} data={vaccines} />
                      )}
                    </div>
                  </div>
                </>
              }
            />

            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                onClick={onPrevious2}
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
    </>
  );
}
