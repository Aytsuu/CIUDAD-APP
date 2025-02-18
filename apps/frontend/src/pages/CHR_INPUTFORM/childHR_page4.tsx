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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ChildHealthFormSchema from "@/form-schema/chr-schema";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Baby } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
      ironDates: formData.ironDates || [], // Default to empty array if not provided
      vitaminRecords: formData.vitaminRecords || [], // Default to empty array if not provided
    },
  });

  const { handleSubmit, reset, setValue, control, watch } = form;

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const onSubmitForm = (data: Page1FormData) => {
    console.log("Submitted Form Data:", data);
    updateFormData(data);
    onNext5();
  };

  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedVitamin, setSelectedVitamin] = useState<string | null>(null);

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
    if (currentDate) {
      const formattedDate = formatDate(currentDate);
      const updatedIronDates = [
        ...form.getValues("ironDates"),
        { givenDate: formattedDate, completedDate: "" },
      ];
      setValue("ironDates", updatedIronDates);
      setCurrentDate("");
    }
  };

  const handleAddVitaminDate = () => {
    if (selectedVitamin && currentDate) {
      const formattedDate = formatDate(currentDate);
      const updatedVitaminRecords = [
        ...form.getValues("vitaminRecords"),
        { vitaminType: selectedVitamin, date: formattedDate },
      ];
      setValue("vitaminRecords", updatedVitaminRecords);
      setSelectedVitamin(null);
      setCurrentDate("");
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

  const isAddButtonDisabled =
    !selectedVitamin || !currentDate || !Date.parse(currentDate);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Iron Given Section */}
          <div className="flex flex-col space-y-2">
            <FormLabel className="font-semibold text-gray-700">
              Date Iron Given:
            </FormLabel>
            <div className="flex gap-4">
              <FormField
                control={control}
                name="ironDates"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="date"
                        value={currentDate}
                        onChange={(e) => {
                          setCurrentDate(e.target.value);
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
                className="bg-green-500 text-white"
                onClick={handleAddIronDate}
                disabled={!currentDate}
              >
                Add
              </Button>
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
              <div className="flex flex-col pl-2">
                {watch("ironDates").length === 0 ? (
                  <div className="p-2 text-gray-500">No records found.</div>
                ) : (
                  watch("ironDates").map((iron, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border bg-gray-100 rounded-md"
                    >
                      <span>
                        Given: {iron.givenDate} | Completed:{" "}
                        {iron.completedDate || "Pending"}
                      </span>

                      {/* Input for Completed Date */}
                      <div className="flex items-center gap-2">
                        <FormField
                          control={control}
                          name={`ironDates.${index}.completedDate`}
                          render={({ field }) => (
                            <FormItem>
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
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vitamin A Given Section */}
          <div className="flex flex-col space-y-2">
            <FormLabel className="font-semibold text-gray-700">
              Vitamin A Given:
            </FormLabel>
            <div className="flex gap-4">
              <FormField
                control={control}
                name="vitaminRecords"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <SelectLayout
                        label="Vitamin Type"
                        placeholder="Select Vitamin"
                        className="w-full"
                        options={[
                          { id: "vitamin_1000IU", name: "Vitamin 1000IU" },
                          { id: "vitamin_2000IU", name: "Vitamin 2000IU" },
                        ]}
                        value={selectedVitamin ?? ""}
                        onChange={(value: string) => {
                          setSelectedVitamin(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="vitaminRecords"
                render={() => (
                  <FormItem>
                    <FormLabel></FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={currentDate}
                        onChange={(e) => {
                          setCurrentDate(e.target.value);
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
                className="bg-green-500 text-white"
                onClick={handleAddVitaminDate}
                disabled={isAddButtonDisabled}
              >
                Add
              </Button>
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
              <div className="flex flex-col pl-2">
                {watch("vitaminRecords").length === 0 ? (
                  <div className="p-2 text-gray-500">No records found.</div>
                ) : (
                  watch("vitaminRecords").map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border bg-gray-100 rounded-md"
                    >
                      <span>
                        {record.vitaminType} - {record.date}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDeleteVitaminDate(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious3}
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