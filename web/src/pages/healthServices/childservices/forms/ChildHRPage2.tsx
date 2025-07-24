"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { ChildHealthFormSchema } from "@/form-schema/chr-schema";
import { Button } from "@/components/ui/button/button";
import {
  Baby,
  Calendar,
  ChevronLeft,
  Trash2,
  Plus,
  AlertCircle,
  Check,
  Pencil,
} from "lucide-react";
import { DisabilityComponent } from "@/components/ui/add-search-disability";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import CardLayout from "@/components/ui/card/card-layout";

type Page1FormData = z.infer<typeof ChildHealthFormSchema> & {
  dates?: string[];
};

type Page1Props = {
  onPrevious: () => void;
  onNext: () => void;
  updateFormData: (data: Partial<Page1FormData>) => void;
  formData: Page1FormData;
};

export default function ChildHRPage2({
  onPrevious,
  onNext,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page1FormData>({
    resolver: zodResolver(ChildHealthFormSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      ...formData,
      disabilityTypes: formData.disabilityTypes || [],
      hasEdema: formData.hasEdema || false,
      dates: formData.dates || [],
    },
  });

  const { handleSubmit, reset, watch, setValue, getValues, formState } = form;
  const { errors, isValid, isSubmitting } = formState;
  const hasEdema = watch("hasEdema");

  const [dates, setDates] = useState<string[]>(formData.dates || []);
  const [currentBFDate, setCurrentBFDate] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [edemaSeverity] = useState([
    { id: "mild", name: "Mild" },
    { id: "moderate", name: "Moderate" },
    { id: "severe", name: "Severe" },
  ]);

  useEffect(() => {
    const resetData = {
      ...formData,
      disabilityTypes: formData.disabilityTypes || [],
      hasEdema: formData.hasEdema || false,
      dates: formData.dates || [],
    };
    reset(resetData);
    setDates(formData.dates || []);
  }, [formData, reset]);

  // Sync dates with form whenever dates array changes
  useEffect(() => {
    setValue("dates", dates, { shouldValidate: true });
  }, [dates, setValue]);

  const handleNext = async (data: Page1FormData) => {
    try {
      // Ensure dates are included in the data
      const finalData = {
        ...data,
        dates: dates,
        disabilityTypes: data.disabilityTypes || [],
      };

      // Update form data
      updateFormData(finalData);
      
      // Navigate to next page
      onNext();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Manually trigger form validation and submission
    handleSubmit(handleNext, (errors) => {
      console.error("Form validation errors:", errors);
    })(e);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "-01");
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const handleAddDate = () => {
    if (currentBFDate) {
      const formattedDate = formatDate(currentBFDate);
      let updatedDates;

      if (editingIndex !== null) {
        updatedDates = [...dates];
        updatedDates[editingIndex] = formattedDate;
        setEditingIndex(null);
      } else {
        updatedDates = [...dates, formattedDate];
      }

      setDates(updatedDates);
      setCurrentBFDate("");
    }
  };

  const handleEditDate = (index: number) => {
    const dateToEdit = dates[index];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const parts = dateToEdit.split(" ");
    if (parts.length === 2) {
      const monthIndex = monthNames.indexOf(parts[0]);
      const year = parts[1];
      if (monthIndex !== -1) {
        const monthNum = (monthIndex + 1).toString().padStart(2, "0");
        setCurrentBFDate(`${year}-${monthNum}`);
      }
    }

    setEditingIndex(index);
  };

  const handleDeleteDate = (index: number) => {
    const updatedDates = dates.filter((_, i) => i !== index);
    setDates(updatedDates);
    
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentBFDate("");
    }
  };

  const handlePrevious = () => {
    const currentFormData = getValues();
    updateFormData({
      ...currentFormData,
      dates: dates,
      disabilityTypes: currentFormData.disabilityTypes || [],
    });
    onPrevious();
  };

  return (
    <div className="bg-white rounded-lg shadow md:p-4 lg:p-8">
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-8" noValidate>
          

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Medical Information */}
            <div className="space-y-6">
              {/* Newborn Screening Card */}
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-lg text-gray-800">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Newborn Screening
                  </div>
                }
                description=""
                content={
                  <div className="p-4">
                    <FormDateTimeInput
                      control={form.control}
                      name="dateNewbornScreening"
                      label="Date of Newborn Screening"
                      type="date"
                    />
                    <FormMessage />
                  </div>
                }
              />

              {/* Edema Assessment Card */}
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-lg text-gray-800">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Edema Assessment
                  </div>
                }
                description=""
                content={
                  <div className="space-y-4 p-4">
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
                              className="mt-1"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="hasEdema"
                            className="text-sm font-medium leading-relaxed cursor-pointer"
                          >
                            Does the child have any visible swelling (edema)?
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {hasEdema && (
                      <div className="ml-6 p-3">
                        <FormSelect
                          control={form.control}
                          name="edemaSeverity"
                          label="Severity Level"
                          options={edemaSeverity}
                        />
                      </div>
                    )}
                  </div>
                }
              />
            </div>

            {/* Right Column - Disability Information */}
            <div className="space-y-6">
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-lg text-gray-800">
                    <Check className="h-5 w-5 text-green-600" />
                    Disability Assessment
                  </div>
                }
                description=""
                content={
                  <div className="p-4">
                    <FormLabel className="text-sm font-medium leading-none text-gray-700 mb-4 block">
                      Does the child have any known disabilities?
                    </FormLabel>
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="disabilityTypes"
                        render={({ field }) => (
                          <FormItem>
                            <DisabilityComponent
                              selectedDisabilities={field.value || []}
                              onDisabilitySelectionChange={(selected) => {
                                field.onChange(selected);
                              }}
                              isRequired={false}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          {/* Breastfeeding Section */}
          <div className="space-y-6">
            <CardLayout
              title={
                <div className="flex items-center gap-2 text-lg text-gray-800">
                  <Baby className="h-5 w-5 text-pink-600" />
                  Exclusive Breastfeeding Monitoring
                </div>
              }
              description=""
              content={
                <div className="space-y-6">
                  <div className="w-[200px] mt-5">
                    <FormSelect
                      control={form.control}
                      name="type_of_feeding"
                      label="Type of feeding"
                      options={[
                        { id: "exclusive_bf", name: "Exclusive Breastfeeding" },
                        { id: "mixed_bf", name: "Mixed Breastfeeding" },
                        { id: "formula", name: "Formula Feeding" },
                      ]}
                    />
                  </div>

                  {/* Add/Edit Date Section */}
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {editingIndex !== null
                            ? "Edit Exclusive BF Check"
                            : "Add Exclusive BF Check"}
                        </label>
                        <input
                          type="month"
                          value={currentBFDate}
                          onChange={(e) => setCurrentBFDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <Button
                        type="button"
                        className="w-full sm:w-auto bg-pink-300 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        onClick={handleAddDate}
                        disabled={!currentBFDate}
                      >
                        {editingIndex !== null ? (
                          <>
                            <Pencil className="h-4 w-4" />
                            Update
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add Date
                          </>
                        )}
                      </Button>
                      {editingIndex !== null && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto px-6 py-2 rounded-lg transition-colors duration-200"
                          onClick={() => {
                            setEditingIndex(null);
                            setCurrentBFDate("");
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Dates History */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-white px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Exclusive BF Check History
                      </h3>
                    </div>
                    <div className="p-4">
                      {dates.length === 0 ? (
                        <div className="text-center py-8">
                          <Baby className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">
                            No dates added yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Add your first exclusive BF check date above
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dates.map((date, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                editingIndex === index
                                  ? "bg-blue-50 border-blue-300 shadow-md"
                                  : "bg-white border-gray-200 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {date}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    BF Check #{index + 1}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditDate(index)}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 transition-colors duration-200"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteDate(index)}
                                  className="bg-red-100 hover:bg-red-200 text-red-700 border-red-200 hover:border-red-300 transition-colors duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              }
            />
          </div>

          <div>
            <FormInput
              control={form.control}
              name="tt_status"
              label="TT status of mother"
              type="text"
              placeholder="Enter TT status"
              className="min:w-[200px]"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2 px-6 py-2 hover:bg-gray-50 transition-colors duration-200"
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? "Processing..." : "Continue"}
              <ChevronLeft className="h-4 w-4 rotate-180 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}