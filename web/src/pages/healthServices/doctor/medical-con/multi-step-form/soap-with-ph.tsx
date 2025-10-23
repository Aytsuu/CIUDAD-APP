import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { AlertCircle } from "lucide-react";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { IllnessComponent } from "@/components/ui/add-search-illness";
import { MedicineDisplay } from "@/components/ui/medicine-display";
import { PhysicalExam } from "@/components/ui/physical-exam";
import { Loader2, ChevronLeft } from "lucide-react";
import { ExamSection } from "@/pages/healthServices/doctor/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form/form";

interface SoapFormFieldsProps {
  form: any;
  examSections: ExamSection[];
  setExamSections: (sections: ExamSection[]) => void;
  medicineStocksOptions: any[];
  isMedicineLoading: boolean;
  isPhysicalExamLoading: boolean;
  hasPhysicalExamError: boolean;
  selectedMedicines: any[];
  onSelectedMedicinesChange: (medicines: any[]) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  onIllnessSelectionChange: (ids: number[]) => void;
  onAssessmentUpdate: (text: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  medicineSearchParams: any;
  medicinePagination: any;
  onMedicineSearch: (searchTerm: string) => void;
  onMedicinePageChange: (page: number) => void;
  medicalConsultation: any;
}

export default function SoapFormFields({
  form,
  examSections,
  setExamSections,
  medicineStocksOptions,
  isMedicineLoading,
  isPhysicalExamLoading,
  hasPhysicalExamError,
  selectedMedicines,
  onSelectedMedicinesChange,
  onIllnessSelectionChange,
  onAssessmentUpdate,
  onBack,
  isSubmitting,
  onSubmit,
  medicineSearchParams,
  medicinePagination,
  onMedicineSearch,
  onMedicinePageChange,
  medicalConsultation
}: SoapFormFieldsProps) {
  const labTests = {
    asRequired: [
      { name: "is_cbc", label: "CBC w/ platelet count" },
      { name: "is_urinalysis", label: "Urinalysis" },
      { name: "is_fecalysis", label: "Fecalysis" },
      { name: "is_sputum_microscopy", label: "Sputum Microscopy" },
      { name: "is_creatine", label: "Creatinine" },
      { name: "is_hba1c", label: "HbA1C" }
    ],
    mandatory: [
      { name: "is_chestxray", label: "Chest X-Ray", age: "≥10" },
      { name: "is_papsmear", label: "Pap smear", age: "≥20" },
      { name: "is_fbs", label: "FBS", age: "≥40" },
      { name: "is_oralglucose", label: "Oral Glucose Tolerance Test", age: "≥40" },
      { name: "is_lipidprofile", label: "Lipid profile (Total Cholesterol, HDL and LDL Cholesterol, Triglycerides)", age: "≥40" },
      { name: "is_fecal_occult_blood", label: "Fecal Occult Blood", age: "≥50" },
      { name: "is_ecg", label: "ECG", age: "≥60" }
    ]
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Subjective */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-darkBlue2">Subjective</h2>
            <FormTextArea control={form.control} name="subj_summary" label="Patient-reported symptoms and history" placeholder="Describe the patient's chief complaint and history in their own words" className="min-h-[120px] w-full" />
          </div>

          {/* Physical Exam with Skeleton Loading */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-darkBlue2">Physical Exam</h2>
            {isPhysicalExamLoading ? (
              <div className="space-y-4 bg-white rounded-lg p-4 border">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3 bg-gray-200" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 bg-gray-200" />
                        <Skeleton className="h-4 w-3/4 bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : hasPhysicalExamError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Failed to load physical exam options</p>
                  <p className="text-red-600 text-sm">Please try refreshing the page</p>
                </div>
              </div>
            ) : (
              <PhysicalExam examSections={examSections} setExamSections={setExamSections} />
            )}
          </div>

          {/* Medicines */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-darkBlue2">Plan Treatment (Treatment)</h2>
            <MedicineDisplay
              medicines={medicineStocksOptions}
              initialSelectedMedicines={selectedMedicines}
              onSelectedMedicinesChange={onSelectedMedicinesChange}
              itemsPerPage={medicineSearchParams.pageSize}
              currentPage={medicineSearchParams.page}
              onPageChange={onMedicinePageChange}
              onSearch={onMedicineSearch}
              searchQuery={medicineSearchParams.search}
              totalPages={medicinePagination?.totalPages}
              totalItems={medicinePagination?.totalItems}
              isLoading={isMedicineLoading}
            />
          </div>

          {/* Objective & Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-darkBlue2">Objective Summary</h2>
              <FormTextArea control={form.control} name="obj_summary" label="Clinical findings" placeholder="Document vital signs, physical exam findings, lab results, etc." rows={10} className="w-full" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-darkBlue2">Plan Treatment Summary</h2>
              <FormTextArea control={form.control} name="plantreatment_summary" label="Detailed plan" placeholder="Specify medications, therapies, follow-up plan, etc." rows={10} className="w-full" />
            </div>
          </div>

          {/* Illness & Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h2 className="text-lg font-medium text-darkBlue2">Illness Diagnoses</h2>
              <IllnessComponent selectedIllnesses={form.watch("selectedIllnesses") || []} onIllnessSelectionChange={onIllnessSelectionChange} onAssessmentUpdate={onAssessmentUpdate} />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h2 className="text-lg font-medium text-darkBlue2">Assessment/Diagnoses Summary</h2>
              <FormTextArea label="Clinical Impressions" control={form.control} name="assessment_summary" placeholder="Enter clinical impressions, diagnosis, etc." className="min-h-[180px] text-sm w-full" rows={7} />
            </div>
          </div>

          {medicalConsultation.is_phrecord && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-darkBlue2">Laboratory Request/s</h2>
              <div className="bg-white rounded-lg border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* As Required - All ages */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-md text-gray-700 pb-2 border-b">As required - All ages</h3>
                    <div className="space-y-3">
                      {labTests.asRequired.map((test) => (
                        <FormField
                          key={test.name}
                          control={form.control}
                          name={test.name}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-gray-400 border rounded-sm" />
                              </FormControl>
                              <FormLabel className="text-md font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{test.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mandatory */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-md text-gray-700 pb-2 border-b">Mandatory</h3>
                    <div className="space-y-3">
                      {labTests.mandatory.map((test) => (
                        <FormField
                          key={test.name}
                          control={form.control}
                          name={test.name}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-gray-400 border rounded-sm peer focus:ring-2 focus:ring-offset-2 focus:ring-primary-600" />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-md font-normal">
                                  {test.age && <span className="text-gray-600 mr-2">{test.age}</span>}
                                  {test.label}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Others field */}
                <div className="mt-6 pt-6 border-t">
                  <FormTextArea control={form.control} name="others" label="Others" placeholder="Specify any other laboratory tests or requests..." className="min-h-[80px] w-full" rows={3} />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onBack}>
              <ChevronLeft />
              Previous
            </Button>
            <Button type="submit" disabled={isSubmitting || isPhysicalExamLoading} className="w-[100px]">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
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
