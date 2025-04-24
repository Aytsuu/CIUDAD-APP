import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Supplement,SupplementType } from "@/form-schema/chr-schema";
import { Button } from "@/components/ui/button/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Baby } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,

} from "@/components/ui/alert-dialog/alert-dialog";
import { ChevronLeft, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table";
import { zodResolver } from "@hookform/resolvers/zod";


type Page1FormData = z.infer<typeof ChildHealthFormSchema>;

type Page1Props = {
  onPrevious3: () => void;
  onNext5: () => void;
  updateFormData: (data: Partial<Page1FormData>) => void;
  formData: Page1FormData;
};

export default function ChildHRPage4({
  onPrevious3,
  onNext5,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page1FormData>({
    defaultValues: {
      ...formData,
      ironDates: formData.ironDates || [],
      vitaminRecords: formData.vitaminRecords || [],
    },
  });

  const { handleSubmit, reset, setValue, control, watch } = form;

  useEffect(() => {
    reset({
      ...formData,
      ironDates: formData.ironDates || [],
      vitaminRecords: formData.vitaminRecords || [],
    });
  }, [reset, formData]);

  const handlePrevious = () => {
    updateFormData(form.getValues());
    onPrevious3();
  };

  const onSubmitForm = (data: Page1FormData) => {
    console.log("Submitted Form Data:", data);
    updateFormData(data);
    onNext5();
  };

  const [currentIronDate, setCurrentIronDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentVitaminDate, setCurrentVitaminDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedIronType, setSelectedIronType] = useState<string | null>(null);
  const [selectedVitaminType, setSelectedVitaminType] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddIronDate = () => {
    if (form.getValues("ironDates").length >= 1) {
      setDialogMessage("You can only add iron once.");
      setDialogOpen(true);
      return;
    }
    if (currentIronDate && selectedIronType) {
      const formattedDate = formatDate(currentIronDate);
      const updatedIronDates = [
        ...form.getValues("ironDates"),
        { ironType: selectedIronType, givenDate: formattedDate, completedDate: "" },
      ];
      setValue("ironDates", updatedIronDates);
      setCurrentIronDate(new Date().toISOString().split("T")[0]);
      setSelectedIronType(null);
    }
  };

  const handleAddVitaminDate = () => {
    if (form.getValues("vitaminRecords").length >= 1) {
      setDialogMessage("You can only add one vitamin record.");
      setDialogOpen(true);
      return;
    }
    if (selectedVitaminType && currentVitaminDate) {
      const formattedDate = formatDate(currentVitaminDate);
      const updatedVitaminRecords = [
        ...form.getValues("vitaminRecords"),
        { vitaminType: selectedVitaminType, date: formattedDate },
      ];
      setValue("vitaminRecords", updatedVitaminRecords);
      setSelectedVitaminType(null);
      setCurrentVitaminDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleDeleteIronDate = (index: number) => {
    const updatedIronDates = form
      .getValues("ironDates")
      .filter((_, i) => i !== index);
    setValue("ironDates", updatedIronDates);
  };

  const handleDeleteVitaminDate = (index: number) => {
    const updatedVitaminRecords = form
      .getValues("vitaminRecords")
      .filter((_, i) => i !== index);
    setValue("vitaminRecords", updatedVitaminRecords);
  };

  const handleUpdateCompletedDate = (index: number, completedDate: string) => {
    const updatedIronDates = [...form.getValues("ironDates")];
    updatedIronDates[index].completedDate = completedDate;
    setValue("ironDates", updatedIronDates);
  };

  const isIronAddButtonDisabled = !selectedIronType || !currentIronDate || !Date.parse(currentIronDate);
  const isVitaminAddButtonDisabled = !selectedVitaminType || !currentVitaminDate || !Date.parse(currentVitaminDate);

  return (
    <div className=" bg-white rounded-lg shadow  md:p-4 lg:p-8">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Iron Given Section */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-10">
            <div className="flex flex-col space-y-4 w-full lg:w-auto">
              <FormLabel className="font-semibold text-gray-700">
                Date Iron Given:
              </FormLabel>
              <div className="flex flex-col gap-2 sm:gap-3">
                <FormField
                  control={control}
                  name="ironDates"
                  render={() => (
                    <FormItem className="w-full">
                      <FormControl>
                        <SelectLayout
                          label="Iron Type"
                          placeholder="Select Iron Type"
                          className="w-full"
                          options={[
                            { id: "iron_1", name: "Iron 1" },
                            { id: "iron_2", name: "Iron 2" },
                          ]}
                          value={selectedIronType ?? ""}
                          onChange={(value: string) => {
                            setSelectedIronType(value);
                            setCurrentIronDate(new Date().toISOString().split("T")[0]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-5">
                  <FormField
                    control={control}
                    name="ironDates"
                    render={() => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="date"
                            value={currentIronDate}
                            onChange={(e) => {
                              setCurrentIronDate(e.target.value);
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="bg-green-500 text-white w-full sm:w-auto"
                    onClick={handleAddIronDate}
                    disabled={isIronAddButtonDisabled}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Iron Given History Section */}
            <Card className="w-full bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Baby className="h-6 w-6 text-blue" />
                  Iron Given History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 pl-2">
                  {watch("ironDates").length === 0 ? (
                    <div className="p-2 text-gray-500">No records found.</div>
                  ) : (
                    watch("ironDates").map((iron, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 border bg-gray-100 rounded-md gap-2"
                      >
                        <span className="text-sm sm:text-base">
                          Type: {iron.ironType} | Given: {iron.givenDate} | Completed:{" "}
                          {iron.completedDate || "Pending"}
                        </span>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                          <FormField
                            control={control}
                            name={`ironDates.${index}.completedDate`}
                            render={({ field }) => (
                              <FormItem className="w-full sm:w-auto">
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      handleUpdateCompletedDate(index, e.target.value);
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleDeleteIronDate(index)}
                            className="w-full sm:w-auto"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vitamin Given Section */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-10">
            <div className="flex flex-col space-y-4 w-full lg:w-auto">
              <FormLabel className="font-semibold text-gray-700">
                Vitamin A Given:
              </FormLabel>
              <div className="flex flex-col gap-2 sm:gap-3">
                <FormField
                  control={control}
                  name="vitaminRecords"
                  render={() => (
                    <FormItem className="w-full">
                      <FormControl>
                        <SelectLayout
                          label="Vitamin Type"
                          placeholder="Select Vitamin"
                          className="w-full"
                          options={[
                            { id: "vitamin_1000IU", name: "Vitamin 1000IU" },
                            { id: "vitamin_2000IU", name: "Vitamin 2000IU" },
                          ]}
                          value={selectedVitaminType ?? ""}
                          onChange={(value: string) => {
                            setSelectedVitaminType(value);
                            setCurrentVitaminDate(new Date().toISOString().split("T")[0]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-5">
                  <FormField
                    control={control}
                    name="vitaminRecords"
                    render={() => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="date"
                            value={currentVitaminDate}
                            onChange={(e) => {
                              setCurrentVitaminDate(e.target.value);
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="bg-green-500 text-white w-full sm:w-auto"
                    onClick={handleAddVitaminDate}
                    disabled={isVitaminAddButtonDisabled}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Vitamin Given History Section */}
            <Card className="w-full bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Baby className="h-6 w-6 text-blue" />
                  Vitamin Given History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 pl-2">
                  {watch("vitaminRecords").length === 0 ? (
                    <div className="p-2 text-gray-500">No records found.</div>
                  ) : (
                    watch("vitaminRecords").map((record, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 border bg-gray-100 rounded-md gap-2"
                      >
                        <span className="text-sm sm:text-base break-words">
                          {record.vitaminType} - {record.date}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleDeleteVitaminDate(index)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Buttons */}
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
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

      {/* Alert Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}