import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ChildHealthFormSchema, { VaccineSchema } from "@/form-schema/chr-schema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type Page2FormData = z.infer<typeof ChildHealthFormSchema>;

type Page1Props = {
  onPrevious1: () => void;
  onNext3: () => void;
  updateFormData: (data: Partial<Page2FormData>) => void;
  formData: Page2FormData; // New prop to pass previous data
};

export default function ChildHRPage2({
  onPrevious1,
  onNext3,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page2FormData>({
    // resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      vaccines: formData.vaccines || [],
    },
  });

  const { handleSubmit, control, setValue } = form;
  const [vaccines, setVaccines] = useState<z.infer<typeof VaccineSchema>[]>(
    formData.vaccines || []
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

      // Save the vaccine in the parent component through updateFormData
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
    // Sync the form's vaccines field with the parent formData
    setVaccines(formData.vaccines || []);
  }, [formData]);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-lg">Type of Immunization</h3>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
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
                      className="w-full" // Add this line!
                      options={[
                        { id: "BGC", name: "BGC" },
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
                      label="Dose"
                      className="w-full" // Add this line!
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
          {/* List of Vaccines */}
          <div className="mt-4">
            {vaccines.length === 0 ? (
              <p>No vaccines added yet</p> // A fallback message to confirm whether vaccines array is empty
            ) : (
              vaccines.map((vac) => (
                <div
                  key={vac.id}
                  className="flex gap-2 items-center border p-2 rounded-md shadow-md mt-2"
                >
                  <span className="flex-1 font-medium">{vac.vaccineType}</span>
                  <span className="flex-1">{vac.dose}</span>
                  <span className="flex-1">{vac.date}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => deleteVac(vac.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-10">
            <div className="w-full">
              <h1 className="text-lg font-semibold mb-4">
                {" "}
                Administered Vaccine
              </h1>

              <div className="flex flex-col gap-2">
                <div className="relative w-full ">
                  <div className="px-4 sm:px-10 py-2 bg-white shadow-md rounded-r-lg min-h-[3rem] flex gap-5 justify-between items-center">
                    <span className="font-medium">BGC</span>
                    <span className="font-medium">1-12-2023</span>

                    <span className="text-black text-sm">1st Dose</span>
                  </div>
                </div>
                <div className="relative w-full ">
                  <div className="px-4 sm:px-10 py-2 bg-white shadow-md rounded-r-lg min-h-[3rem] flex gap-5 justify-between items-center">
                    <span className="font-medium">BGC</span>
                    <span className="text-black text-sm">1st Dose</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <h1 className="text-lg font-semibold mb-4">
                {" "}
                Type Of Vaccine To be Administered
              </h1>

              <div className="flex flex-col gap-2">
                <div className="relative w-full ">
                  <div className="px-4 sm:px-10 py-2 bg-white shadow-md rounded-r-lg min-h-[3rem] flex gap-5 justify-between items-center">
                    <span className="font-medium">BGC</span>
                    <span className="text-black text-sm">1 Dose/s</span>
                  </div>
                </div>
                <div className="relative w-full ">
                  <div className="px-4 sm:px-10 py-2 bg-white shadow-md rounded-r-lg min-h-[3rem] flex gap-5 justify-between items-center">
                    <span className="font-medium">BGC</span>
                    <span className="text-black text-sm">1 Dose/s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-end gap-2">
            <Button type="button"  variant="outline" onClick={onPrevious1}
              className="w-[100px]"
          >
              Previous
            </Button>
            <Button type="submit"   className="w-[100px]">Next</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
