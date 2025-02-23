"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChildHealthFormSchema } from "@/form-schema/chr-schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Baby, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { FilterAccordion } from "@/components/ui/checkBox-with-search-add";

type Page1FormData = z.infer<typeof ChildHealthFormSchema> & {
  dates?: string[];
};

type Page1Props = {
  onPrevious2: () => void;
  onNext4: () => void;
  updateFormData: (data: Partial<Page1FormData>) => void;
  formData: Page1FormData;
};

export default function ChildHRPage3({
  onPrevious2,
  onNext4,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page1FormData>({
    defaultValues: {
      ...formData,
      hasDisability: formData.hasDisability || false,
      hasEdema: formData.hasEdema || false,
      disabilityTypes: formData.disabilityTypes || [],
    },
  });

  const { handleSubmit, reset, watch, setValue } = form;
  const hasDisability = watch("hasDisability");
  const hasEdema = watch("hasEdema");

  const [dates, setDates] = useState<string[]>(formData.dates || []);
  const [currentDate, setCurrentDate] = useState<string>("");

  const [disabilityTypes, setDisabilityTypes] = useState([
    { id: "diabetes", name: "Diabetes" },
    { id: "heartache", name: "Heart Ache" },
    { id: "fever", name: "Fever" },
  ]);

  const [edemaSeverity] = useState([
    { id: "mild", name: "Mild" },
    { id: "moderate", name: "Moderate" },
    { id: "severe", name: "Severe" },
  ]);

  const [selectedDisabilities, setSelectedDisabilities] = useState<
    { id: string; name: string }[]
  >(formData.disabilityTypes || []);

  // Sync selectedDisabilities with formData.disabilityTypes
  useEffect(() => {
    setSelectedDisabilities(formData.disabilityTypes || []);
  }, [formData.disabilityTypes]);

  // Reset form and states when formData changes
  useEffect(() => {
    reset({
      ...formData,
      hasDisability: formData.hasDisability || false,
      hasEdema: formData.hasEdema || false,
      disabilityTypes: formData.disabilityTypes || [],
    });
    setDates(formData.dates || []);
  }, [formData, reset]);

  const onSubmitForm = (data: Page1FormData) => {
    updateFormData({ ...data, disabilityTypes: selectedDisabilities });
    console.log("page 3", data);
    onNext4();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const handleAddDate = () => {
    if (currentDate) {
      const formattedDate = formatDate(currentDate);
      const updatedDates = [...dates, formattedDate];
      setDates(updatedDates);
      setValue("dates", updatedDates);
      setCurrentDate("");
    }
  };

  const handleDeleteDate = (index: number) => {
    const updatedDates = dates.filter((_, i) => i !== index);
    setDates(updatedDates);
    setValue("dates", updatedDates);
  };

  const handleSelectDisability = (id: string, checked: boolean) => {
    const disability = disabilityTypes.find((type) => type.id === id);
    if (disability) {
      if (checked) {
        setSelectedDisabilities((prev) => [...prev, disability]);
      } else {
        setSelectedDisabilities((prev) => prev.filter((d) => d.id !== id));
      }
    }
  };

  const handleResetDisabilities = () => {
    setSelectedDisabilities([]);
  };

  const handleAddDisability = (label: string) => {
    const newDisability = {
      id: String(disabilityTypes.length + 1), // Generate a unique ID
      name: label,
    };
    setDisabilityTypes((prev) => [...prev, newDisability]); // Add to disabilityTypes
    setSelectedDisabilities((prev) => [...prev, newDisability]); // Add to selectedDisabilities
    setValue("disabilityTypes", [...selectedDisabilities, newDisability]); // Update form state
  };

  const handlePrevious = () => {
    const currentFormData = form.getValues();
    updateFormData({ ...currentFormData, disabilityTypes: selectedDisabilities });
    onPrevious2();
  };

  return (
    <div className="w-full max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-6 p-4 md:p-6 lg:p-8"
        >
          {/* Disability Section */}
          <div>
            <FormField
              control={form.control}
              name="hasDisability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="hasDisability"
                      checked={!!field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                      }}
                    />
                  </FormControl>
                  <FormLabel htmlFor="hasDisability" className="leading-none">
                    Does the child have any known disabilities?
                  </FormLabel>
                </FormItem>
              )}
            />

            {hasDisability && (
              <div className="mt-4 space-y-4">
                <FormLabel>Select Disability</FormLabel>
                <FormField
                  control={form.control}
                  name="disabilityTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FilterAccordion
                          title="Disabilities"
                          options={field.value.map((type) => ({
                            id: type.id,
                            label: type.name,
                            checked: selectedDisabilities.some(
                              (d) => d.id === type.id
                            ),
                          }))}
                          selectedCount={selectedDisabilities.length}
                          onReset={handleResetDisabilities}
                          onChange={handleSelectDisability}
                          onAddOption={handleAddDisability} // Pass the function to handle adding new disabilities
                          showAddField={true} // Show the add field
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Edema Section */}
          <div>
            <FormField
              control={form.control}
              name="hasEdema"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="hasEdema"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                      }}
                    />
                  </FormControl>
                  <FormLabel htmlFor="hasEdema" className="leading-none">
                    Does the child have any visible swelling (edema)?
                  </FormLabel>
                </FormItem>
              )}
            />

            {hasEdema && (
              <FormField
                control={form.control}
                name="edemaSeverity"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-[200px] pl-10">
                    <FormLabel className="mb-2 sm:mb-0">
                      Select Severity
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        className="w-full"
                        label="Select an option"
                        placeholder="Select"
                        options={edemaSeverity}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Exclusive BF Check Section */}
          <div className="flex flex-col justify-between sm:flex-row gap-8">
            <div className="flex flex-col space-y-2 pt-5">
              <FormLabel className="font-semibold text-gray-700">
                Add Exclusive BF Check:
              </FormLabel>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <FormField
                  control={form.control}
                  name="BFdates"
                  render={({}) => (
                    <FormItem className="w-full sm:w-[220px]">
                      <FormControl>
                        <div className="flex items-center">
                          <Input
                            type="month"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4"
                  onClick={handleAddDate}
                  disabled={!currentDate}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Exclusive BF Check History Section */}
            <Card className="w-full bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Baby className="h-6 w-6 text-blue" />
                  Exclusive BF Check History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col pl-2">
                  {dates.length === 0 ? (
                    <p>No dates added yet</p>
                  ) : (
                    dates.map((date, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-700">{date}</span>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleDeleteDate(index)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Buttons */}
          <div className="flex w-full justify-end">
            <div className="flex gap-2">
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
          </div>
        </form>
      </Form>
    </div>
  );
}
