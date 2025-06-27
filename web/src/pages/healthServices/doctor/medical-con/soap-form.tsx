import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, AlertCircle, ChevronDown, ChevronRight, Plus, Edit2, Save, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import * as z from "zod";
import { useState, useCallback, useEffect } from "react";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
import { submitMedicineRequest } from "./restful-api/medicineAPI";
import { api2 } from "@/api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getPESections, getPEOptions, updatePEOption, createPEResults ,createPEOption} from "./restful-api/physicalExamAPI";

// Define interfaces for Physical Exam
interface ExamOption {
  pe_option_id: number;
  text: string;
  checked: boolean;
}

interface ExamSection {
  pe_section_id: number;
  title: string;
  options: ExamOption[];
  isOpen: boolean;
}

// Define the medicine request schema
const MedicineRequestSchema = z.object({
  minv_id: z.string().min(1, "Medicine ID is required"),
  medrec_qty: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().optional()
});

const MedicineRequestArraySchema = z.object({
  pat_id: z.string().min(1, "Patient ID is required"),
  medicines: z.array(MedicineRequestSchema).min(1, "At least one medicine is required"),
});

// Define the schema for the SOAP form
const soapSchema = z.object({
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().min(1, "Treatment plan is required"),
  medicineRequest: MedicineRequestArraySchema.optional(),
  physicalExamResults: z.array(z.number()).optional()
});

type SoapFormType = z.infer<typeof soapSchema>;
type MedicineRequestArrayType = z.infer<typeof MedicineRequestArraySchema>;

// Custom localStorage hook
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

export default function SoapForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientData, MedicalConsultation } = location.state || {};
  const [currentPage, setCurrentPage] = useState(1);
  
  // Physical Exam state
  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const [editingOption, setEditingOption] = useState<{ sectionId: number; optionId: number } | null>(null);
  const [editText, setEditText] = useState("");
  const [newOptionText, setNewOptionText] = useState<{ [key: number]: string }>({});
  const [isLoadingPE, setIsLoadingPE] = useState(true);
  
  // Use localStorage for selected medicines
  const [selectedMedicines, setSelectedMedicines] = useLocalStorage<
    { minv_id: string; medrec_qty: number; reason: string }[]
  >("soapFormMedicines", MedicalConsultation?.find_details?.prescribed_medicines || []);

  // Use localStorage for form data
  const [formData, setFormData] = useLocalStorage<SoapFormType>("soapFormData", {
    subjective: MedicalConsultation?.find_details?.notes || "",
    objective: "",
    assessment: MedicalConsultation?.find_details?.diagnosis || "",
    plan: MedicalConsultation?.find_details?.treatment || "",
    medicineRequest: {
      pat_id: patientData?.pat_id || "",
      medicines: MedicalConsultation?.find_details?.prescribed_medicines || []
    },
    physicalExamResults: []
  });

  const { medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock();

  const form = useForm<SoapFormType>({
    resolver: zodResolver(soapSchema),
    defaultValues: formData
  });

  // Load Physical Exam data
  useEffect(() => {
    const fetchPEData = async () => {
      try {
        setIsLoadingPE(true);
        const [sectionsData, optionsData] = await Promise.all([
          getPESections(),
          getPEOptions()
        ]);
        
        const sections: ExamSection[] = sectionsData.map((section: any) => ({
          pe_section_id: section.pe_section_id,
          title: section.title,
          isOpen: false,
          options: []
        }));
        
        optionsData.forEach((option: any) => {
          const section = sections.find(s => s.pe_section_id === option.pe_section);
          if (section) {
            section.options.push({
              pe_option_id: option.pe_option_id,
              text: option.text,
              checked: formData.physicalExamResults?.includes(option.pe_option_id) || false
            });
          }
        });
        
        setExamSections(sections);
      } catch (error) {
        console.error("Error fetching PE data:", error);
        toast.error("Failed to load physical exam data");
      } finally {
        setIsLoadingPE(false);
      }
    };
    
    fetchPEData();
  }, []);

  // Save form data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormData(value as SoapFormType);
    });
    return () => subscription.unsubscribe();
  }, [form, setFormData]);

  // Check for invalid quantities
  const hasInvalidQuantities = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions.find(m => m.id === med.minv_id);
    return med.medrec_qty < 1 || (medicine && med.medrec_qty > medicine.avail);
  });

  // Check for medicines that exceed available stock
  const hasExceededStock = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions.find(m => m.id === med.minv_id);
    return medicine && med.medrec_qty > medicine.avail;
  });

  // Update treatment plan and medicine request
  useEffect(() => {
    if (selectedMedicines.length > 0) {
      const medicineText = selectedMedicines.map(med => {
        const medicine = medicineStocksOptions.find(m => m.id === med.minv_id);
        return `• ${medicine?.name} ${medicine?.dosage} - ${med.medrec_qty} ${medicine?.unit} (Reason: ${med.reason || "Not specified"})`;
      }).join('\n');
      
      const currentPlan = form.getValues('plan') || '';
      const nonMedicinePlan = currentPlan.split('\n')
        .filter(line => !line.startsWith('• ') && line.trim() !== '')
        .join('\n');
      
      const newPlan = [nonMedicinePlan, medicineText].filter(Boolean).join('\n\n');
      
      form.setValue('plan', newPlan);
      form.setValue('medicineRequest', {
        pat_id: patientData?.pat_id || "",
        medicines: selectedMedicines
      });
    } else {
      form.setValue('medicineRequest.medicines', []);
    }
  }, [selectedMedicines, medicineStocksOptions, form, patientData]);

  const handleSelectedMedicinesChange = useCallback(
    (updatedMedicines: { minv_id: string; medrec_qty: number; reason: string }[]) => {
      setSelectedMedicines(updatedMedicines);
    },
    [setSelectedMedicines]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Physical Exam functions
  const toggleSection = (sectionId: number) => {
    setExamSections((sections) =>
      sections.map((section) => (section.pe_section_id === sectionId ? { ...section, isOpen: !section.isOpen } : section)),
    );
  };

  const toggleOption = (sectionId: number, optionId: number) => {
    setExamSections((sections) =>
      sections.map((section) =>
        section.pe_section_id === sectionId
          ? {
              ...section,
              options: section.options.map((option) =>
                option.pe_option_id === optionId ? { ...option, checked: !option.checked } : option,
              ),
            }
          : section,
      ),
    );

    // Update form values
    const currentResults = form.getValues('physicalExamResults') || [];
    if (currentResults.includes(optionId)) {
      form.setValue('physicalExamResults', currentResults.filter(id => id !== optionId));
    } else {
      form.setValue('physicalExamResults', [...currentResults, optionId]);
    }
  };

  const startEditing = (sectionId: number, optionId: number, currentText: string) => {
    setEditingOption({ sectionId, optionId });
    setEditText(currentText);
  };

  const saveEdit = async () => {
    if (!editingOption) return;

    try {
      await updatePEOption(editingOption.optionId, editText);
      
      setExamSections((sections) =>
        sections.map((section) =>
          section.pe_section_id === editingOption.sectionId
            ? {
                ...section,
                options: section.options.map((option) =>
                  option.pe_option_id === editingOption.optionId ? { ...option, text: editText } : option,
                ),
              }
            : section,
        ),
      );
      setEditingOption(null);
      setEditText("");
      toast.success("Option updated successfully");
    } catch (error) {
      console.error("Failed to update option:", error);
      toast.error("Failed to update option");
    }
  };

  const cancelEdit = () => {
    setEditingOption(null);
    setEditText("");
  };

  const addNewOption = async (sectionId: number) => {
    const text = newOptionText[sectionId]?.trim();
    if (!text) return;

    try {
        // Call the API to create the new option
        const response = await createPEOption(sectionId, text);
        
        const newOption: ExamOption = {
            pe_option_id: response.pe_option_id,
            text: response.text,
            checked: false,
        };

        setExamSections((sections) =>
            sections.map((section) =>
                section.pe_section_id === sectionId 
                    ? { ...section, options: [...section.options, newOption] } 
                    : section
            ),
        );

        setNewOptionText((prev) => ({ ...prev, [sectionId]: "" }));
        toast.success("Option created successfully");
    } catch (error) {
        console.error("Failed to create option:", error);
        toast.error("Failed to create option");
    }
};
  const getSelectedCount = () => {
    return examSections.reduce((total, section) => {
      return total + section.options.filter((option) => option.checked).length;
    }, 0);
  };

  const clearAllSelections = () => {
    setExamSections((sections) =>
      sections.map((section) => ({
        ...section,
        options: section.options.map((option) => ({ ...option, checked: false })),
      })),
    );
    form.setValue('physicalExamResults', []);
  };

  const onSubmit = async (data: SoapFormType) => {
    try {
      // First submit the SOAP notes to findings endpoint
      const findingResponse = await api2.post("patientrecords/findings/", {
        obj_description: data.objective,
        subj_description: data.subjective,
        created_at: new Date().toISOString(),
      });

      // Extract the response ID from the API response
      const findingId = findingResponse.data?.find_id;

      if (!findingId) {
        throw new Error("Failed to retrieve the finding ID from the response");
      }
  
      // Then submit the medicine request if medicines were selected
      if (data.medicineRequest?.medicines && data.medicineRequest.medicines.length > 0) {
        const medicineRequestData: MedicineRequestArrayType = {
          pat_id: data.medicineRequest.pat_id,
          medicines: data.medicineRequest.medicines.map(med => ({
            minv_id: med.minv_id,
            medrec_qty: med.medrec_qty,
            reason: med.reason || "No reason provided"
          }))
        };
  
        await submitMedicineRequest(medicineRequestData);
      }
  
      // Submit physical exam results if any
      if (data.physicalExamResults && data.physicalExamResults.length > 0) {
        await createPEResults(data.physicalExamResults,findingId);
      }
  
      // Clear saved data on successful submission
      localStorage.removeItem("soapFormData");
      localStorage.removeItem("soapFormMedicines");
      
      toast.success("Documentation saved successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error saving documentation:", error);
      toast.error("Failed to save documentation");
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            SOAP Documentation
          </h1>
          <p className="text-sm text-muted-foreground">
            {patientData?.personal_info?.per_lastname}, {patientData?.personal_info?.per_firstname}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
            {/* Subjective Section */}
            <div className="space-y-3">
              <h2 className="font-medium text-base text-darkBlue2">Subjective</h2>
              <FormTextArea
                control={form.control}
                name="subjective"
                label="Patient-reported symptoms and history"
                placeholder="Describe the patient's chief complaint and history in their own words"
                className="min-h-[120px]"
              />
            </div>

            {/* Objective Section - Now includes Physical Exam */}
            <div className="space-y-3">
              <h2 className="font-medium text-base text-darkBlue2">Objective</h2>
              <FormTextArea
                control={form.control}
                name="objective"
                label="Clinical findings and measurements"
                placeholder="Document vital signs, physical exam findings, lab results, etc."
                className="min-h-[120px]"
              />

              {/* Physical Exam Component */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Physical Examination
                      <Badge variant="secondary">{getSelectedCount()} items selected</Badge>
                    </CardTitle>
                    <CardDescription>
                      Document physical examination findings by checking applicable options.
                    </CardDescription>
                    {getSelectedCount() > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAllSelections}>
                        Clear All Selections
                      </Button>
                    )}
                  </CardHeader>
                </Card>

                {isLoadingPE ? (
                  <div className="p-4 text-center">Loading physical exam data...</div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {examSections.map((section) => (
                      <Card key={section.pe_section_id}>
                        <Collapsible open={section.isOpen} onOpenChange={() => toggleSection(section.pe_section_id)}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                              <CardTitle className="flex items-center justify-between text-lg">
                                <span>{section.title}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {section.options.filter((opt) => opt.checked).length}/{section.options.length}
                                  </Badge>
                                  {section.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                              </CardTitle>
                            </CardHeader>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                {section.options.map((option) => (
                                  <div key={option.pe_option_id} className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <Checkbox
                                        id={`option-${option.pe_option_id}`}
                                        checked={option.checked}
                                        onCheckedChange={() => toggleOption(section.pe_section_id, option.pe_option_id)}
                                      />
                                      {editingOption?.sectionId === section.pe_section_id && editingOption?.optionId === option.pe_option_id ? (
                                        <div className="flex items-center space-x-2 flex-1">
                                          <Input
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="flex-1"
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") saveEdit()
                                              if (e.key === "Escape") cancelEdit()
                                            }}
                                            autoFocus
                                          />
                                          <Button size="sm" onClick={saveEdit} type="button">
                                            <Save className="h-3 w-3" />
                                          </Button>
                                          <Button size="sm" variant="outline" type="button" onClick={cancelEdit}>
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <Label
                                          htmlFor={`option-${option.pe_option_id}`}
                                          className={`flex-1 cursor-pointer ${option.checked ? "text-primary font-medium" : ""}`}
                                        >
                                          {option.text}
                                        </Label>
                                      )}
                                    </div>

                                    {editingOption?.sectionId !== section.pe_section_id || editingOption?.optionId !== option.pe_option_id ? (
                                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => startEditing(section.pe_section_id, option.pe_option_id, option.text)}
                                          type="button" >
                                          <Edit2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : null}
                                  </div>
                                ))}

                                <Separator />

                                <div className="flex items-center space-x-2">
                                  <Input
                                    placeholder="Add new examination finding..."
                                    value={newOptionText[section.pe_section_id] || ""}
                                    onChange={(e) =>
                                      setNewOptionText((prev) => ({
                                        ...prev,
                                        [section.pe_section_id]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") addNewOption(section.pe_section_id)
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => addNewOption(section.pe_section_id)}
                                    disabled={!newOptionText[section.pe_section_id]?.trim()}
                                    type="button" >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assessment Section */}
            <div className="space-y-3">
              <h2 className="font-medium text-base text-darkBlue2">Assessment</h2>
              <FormTextArea
                control={form.control}
                name="assessment"
                label="Clinical impression/diagnosis"
                placeholder="Provide your assessment and differential diagnosis"
                className="min-h-[120px]"
              />
            </div>

            {/* Plan Section */}
            <div className="space-y-3">
              <h2 className="font-medium text-base text-darkBlue2">Plan (Treatment)</h2>
              
              <MedicineDisplay
                medicines={medicineStocksOptions}
                initialSelectedMedicines={selectedMedicines}
                onSelectedMedicinesChange={handleSelectedMedicinesChange}
                itemsPerPage={5}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />

              {hasInvalidQuantities && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        {hasExceededStock
                          ? "Stock Limit Exceeded"
                          : "Invalid Quantities"}
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        {hasExceededStock
                          ? "One or more medicines exceed available stock. Please adjust quantities."
                          : "Please ensure all medicine quantities are at least 1."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <FormTextArea
                control={form.control}
                name="plan"
                label="Detailed treatment plan"
                placeholder="Specify medications, therapies, follow-up plan, patient education, etc."
                className="min-h-[150px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
                className="px-6"
              >
                Previous
              </Button>
              <Button
                type="submit"
                className="px-6"
                disabled={form.formState.isSubmitting || hasInvalidQuantities}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Documentation"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}