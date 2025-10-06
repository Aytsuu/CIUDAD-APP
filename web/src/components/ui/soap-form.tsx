import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { AlertCircle } from "lucide-react";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { IllnessComponent } from "@/components/ui/add-search-illness";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { PhysicalExam } from "@/components/ui/physical-exam";
import { Loader2,ChevronLeft } from "lucide-react";
import { ExamSection } from "@/pages/healthServices/doctor/types";

interface SoapFormFieldsProps {
    form: any;
    examSections: ExamSection[];
    setExamSections: (sections: ExamSection[]) => void;
    medicineStocksOptions: any[];
    selectedMedicines: any[];
    onSelectedMedicinesChange: (medicines: any[]) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    onIllnessSelectionChange: (ids: number[]) => void;
    onAssessmentUpdate: (text: string) => void;
    hasInvalidQuantities: boolean;
    hasExceededStock: boolean;
    onBack: () => void;
    isSubmitting: boolean;
    onSubmit: (e?: React.BaseSyntheticEvent) => void;
  }
  
  export default function SoapFormFields({
    form,
    examSections,
    setExamSections,
    medicineStocksOptions,
    selectedMedicines,
    onSelectedMedicinesChange,
    currentPage,
    onPageChange,
    onIllnessSelectionChange,
    onAssessmentUpdate,
    hasInvalidQuantities,
    hasExceededStock,
    onBack,
    isSubmitting,
    onSubmit,
  }: SoapFormFieldsProps) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-6">
          {/* Subjective */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-darkBlue2">Subjective</h2>
            <FormTextArea
              control={form.control}
              name="subj_summary"
              label="Patient-reported symptoms and history"
              placeholder="Describe the patient's chief complaint and history in their own words"
              className="min-h-[120px] w-full"
            />
          </div>

          {/* Physical Exam */}
          <PhysicalExam
            examSections={examSections}
            setExamSections={setExamSections}
          />

          {/* Medicines */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-darkBlue2">
              Plan Treatment (Treatment)
            </h2>
            <MedicineDisplay
              medicines={medicineStocksOptions || []}
              initialSelectedMedicines={selectedMedicines}
              onSelectedMedicinesChange={onSelectedMedicinesChange}
              itemsPerPage={5}
              currentPage={currentPage}
              onPageChange={onPageChange}
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
                        ? "One or more medicines exceed available stock."
                        : "Please ensure all medicine quantities are at least 1."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Objective & Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-darkBlue2">
                Objective Summary
              </h2>
              <FormTextArea
                control={form.control}
                name="obj_summary"
                label="Clinical findings"
                placeholder="Document vital signs, physical exam findings, lab results, etc."
                rows={10}
                className="w-full"
              />
            </div>
            <div>
              <h2 className="text-lg font-medium text-darkBlue2">
                Plan Treatment Summary
              </h2>
              <FormTextArea
                control={form.control}
                name="plantreatment_summary"
                label="Detailed plan"
                placeholder="Specify medications, therapies, follow-up plan, etc."
                rows={10}
                className="w-full"
              />
            </div>
          </div>

          {/* Illness & Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h2 className="text-lg font-medium text-darkBlue2">
                Illness Diagnoses
              </h2>
              <IllnessComponent
                selectedIllnesses={form.watch("selectedIllnesses") || []}
                onIllnessSelectionChange={onIllnessSelectionChange}
                onAssessmentUpdate={onAssessmentUpdate}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h2 className="text-lg font-medium text-darkBlue2">
                Assessment/Diagnoses Summary
              </h2>
              <FormTextArea
                label="Clinical Impressions"
                control={form.control}
                name="assessment_summary"
                placeholder="Enter clinical impressions, diagnosis, etc."
                className="min-h-[180px] text-sm w-full"
                rows={7}
              />
            </div>
          </div>

          {/* Follow-up */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-darkBlue2">Follow-up</h2>
            <div className="w-full md:w-1/2 lg:w-1/3">
              <FormDateTimeInput
                control={form.control}
                name="followv"
                label="Next Follow-up Visit Date"
                type="date"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onBack}>
              <ChevronLeft  />
              Previous
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || hasInvalidQuantities}
              className="w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2  ">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
