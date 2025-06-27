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
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import * as z from "zod";
import { useState, useCallback, useEffect } from "react";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
import { submitMedicineRequest } from "./restful-api/medicineAPI";
import { api2 } from "@/api/api";
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
  medicineRequest: MedicineRequestArraySchema.optional()
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
    }
  });

  const { medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock();

  const form = useForm<SoapFormType>({
    resolver: zodResolver(soapSchema),
    defaultValues: formData
  });

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

  const onSubmit = async (data: SoapFormType) => {
    try {
      // First submit the SOAP notes to findings endpoint
      const findingResponse = await api2.post("patientrecords/findings/", {
        assessment: data.assessment,
        obj_description: data.objective,
        subj_description: data.subjective,
        treatment: data.plan
      });
  
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

            {/* Objective Section */}
            <div className="space-y-3">
              <h2 className="font-medium text-base text-darkBlue2">Objective</h2>
              <FormTextArea
                control={form.control}
                name="objective"
                label="Clinical findings and measurements"
                placeholder="Document vital signs, physical exam findings, lab results, etc."
                className="min-h-[120px]"
              />
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