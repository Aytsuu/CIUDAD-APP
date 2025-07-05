"use client"

import { Form } from "@/components/ui/form/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button/button"
import { AlertCircle } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import * as z from "zod"
import { useState, useCallback, useEffect } from "react"
import { MedicineDisplay } from "@/components/ui/medicine-display"
import { PhysicalExam } from "../../../../components/ui/physical-exam"
import { useLocalStorage } from "@/helpers/useLocalStorage"
import { MedicineRequestArraySchema } from "@/form-schema/medicineRequest"
import { getPESections, getPEOptions, createPEResults, deletePEResults } from "./restful-api/physicalExamAPI"
import { createMedicineRequest, deleteMedicineRequest } from "./restful-api/medicineAPI"
import {
  updateMedicalConsultation,
  createMedicalHistory,
  deleteMedicalHistory,
  createFollowUpVisit,
} from "./restful-api/medicalhistory"
import { createFindings, deleteFindings } from "./restful-api/findings"
import { deleteFollowUpVisit } from "@/pages/healthServices/vaccination/restful-api/post"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { IllnessComponent } from "@/components/ui/add-search-illness"
import { TreatmentReceipt } from "@/components/ui/treatment-receipt"
import SoapFormSkeleton from "@/pages/healthServices/skeleton/soap-form-skeleton"
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI"

const soapSchema = z.object({
  subj_summary: z.string().min(1, "Subjective summary is required"),
  followv: z.string().optional(),
  obj_summary: z.string().optional(),
  assessment_summary: z.string().optional(),
  plantreatment_summary: z.string().min(1, "Treatment plan is required"),
  medicineRequest: MedicineRequestArraySchema.optional(),
  physicalExamResults: z.array(z.number()).optional(),
  selectedIllnesses: z.array(z.number()).optional(),
})

type SoapFormType = z.infer<typeof soapSchema>

interface ExamOption {
  pe_option_id: number
  text: string
  checked: boolean
}

interface ExamSection {
  pe_section_id: number
  title: string
  options: ExamOption[]
  isOpen: boolean
}

export default function SoapForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { patientData, MedicalConsultation } = location.state || {}
  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showReceipt, setShowReceipt] = useState(false)
  const [selectedMedicines, setSelectedMedicines] = useLocalStorage<
    { minv_id: string; medrec_qty: number; reason: string }[]
  >("soapFormMedicines", MedicalConsultation?.find_details?.prescribed_medicines || [])
  const [examSections, setExamSections] = useState<ExamSection[]>([])
  const [isPeLoading, setIsPeLoading] = useState(true)
  const { medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock()

  const form = useForm<SoapFormType>({
    resolver: zodResolver(soapSchema),
    defaultValues: {
      subj_summary: "",
      obj_summary: "",
      assessment_summary: "",
      plantreatment_summary: "",
      medicineRequest: {
        pat_id: "",
        medicines: [],
      },
      physicalExamResults: [],
      selectedIllnesses: [],
      followv: undefined,
    },
  })

  // Update validation logic to work without direct access to medicine data
  const hasInvalidQuantities = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions?.find((m:any) => m.id === med.minv_id)
    return med.medrec_qty < 1 || (medicine && med.medrec_qty > medicine.avail)
  })

  const hasExceededStock = selectedMedicines.some((med) => {
    const medicine = medicineStocksOptions?.find((m:any) => m.id === med.minv_id)
    return medicine && med.medrec_qty > medicine.avail
  })

  const handleSelectedMedicinesChange = useCallback(
    (
      updatedMedicines: {
        minv_id: string
        medrec_qty: number
        reason: string
      }[],
    ) => {
      setSelectedMedicines(updatedMedicines)
      const currentplantreatment_summary = form.getValues("plantreatment_summary") || ""
      const nonMedicineplantreatment_summaryLines = currentplantreatment_summary
        .split("\n")
        .filter((line) => !line.startsWith("- ") && line.trim() !== "")

      // Since we don't have direct access to medicine data here anymore,
      // we'll create a simpler summary format
      const medicineLines =
        updatedMedicines.length > 0
          ? updatedMedicines.map((med) => {
              const medicine = medicineStocksOptions?.find((m:any) => m.id === med.minv_id)
              return `- ${medicine?.name} ${medicine?.dosage} (${med.medrec_qty} ${medicine?.unit}) ${med.reason}`
            })
          : []

      const newplantreatment_summary = [...nonMedicineplantreatment_summaryLines, ...medicineLines].join("\n")

      form.setValue("plantreatment_summary", newplantreatment_summary)
      form.setValue("medicineRequest", {
        pat_id: patientData?.pat_id || "",
        medicines: updatedMedicines,
      })
    },
    [form, patientData, setSelectedMedicines, medicineStocksOptions],
  )

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // FIXED: Proper illness selection handling
  const handleIllnessSelectionChange = useCallback(
    (selectedIllnesses: number[]) => {
      console.log("SOAP Form - Illness selection changed:", selectedIllnesses)
      form.setValue("selectedIllnesses", selectedIllnesses)
      // Trigger validation to ensure the form knows about the change
      form.trigger("selectedIllnesses")
    },
    [form],
  )

  // FIXED: Proper assessment update handling
  const handleAssessmentUpdate = useCallback(
    (assessment: string) => {
      console.log("SOAP Form - Assessment update:", assessment)
      form.setValue("assessment_summary", assessment)
      form.trigger("assessment_summary")
    },
    [form],
  )

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsPeLoading(true)
        const [sectionsData, optionsData] = await Promise.all([getPESections(), getPEOptions()])
        const sections: ExamSection[] = sectionsData.map((section: any) => ({
          pe_section_id: section.pe_section_id,
          title: section.title,
          isOpen: false,
          options: [],
        }))

        optionsData.forEach((option: any) => {
          const section = sections.find((s) => s.pe_section_id === option.pe_section)
          if (section) {
            section.options.push({
              pe_option_id: option.pe_option_id,
              text: option.text,
              checked: form.getValues("physicalExamResults")?.includes(option.pe_option_id) || false,
            })
          }
        })

        setExamSections(sections)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast.error("Failed to load initial data")
      } finally {
        setIsPeLoading(false)
      }
    }

    fetchInitialData()
  }, [form])

  const onSubmit = async (data: SoapFormType) => {
    let findingId
    let medHistoryCreated = false
    let perCreated = false
    let medRequestId: number | null = null
    let followv: string | null = null

    console.log("Form submission data:", data)

    try {
      const findingResponse = await createFindings({
        assessment_summary: data.assessment_summary || "",
        plantreatment_summary: data.plantreatment_summary || "",
        subj_summary: data.subj_summary || "",
        obj_summary: data.obj_summary || "",
      })

      findingId = findingResponse.find_id

      if (data.medicineRequest?.medicines && data.medicineRequest.medicines.length > 0) {
        const medRequestResponse = await createMedicineRequest({
          pat_id: data.medicineRequest.pat_id,
          medicines: data.medicineRequest.medicines.map((med) => ({
            minv_id: med.minv_id,
            medrec_qty: med.medrec_qty,
            reason: med.reason || "No reason provided",
          })),
        })
        medRequestId = medRequestResponse.medreq_id
      }

      if (data.physicalExamResults && data.physicalExamResults.length > 0) {
        await createPEResults(data.physicalExamResults, findingId)
        perCreated = true
      }

      // Only create follow-up visit if date is provided
      if (data.followv) {
        const followv_response = await createFollowUpVisit(MedicalConsultation.patrec ?? "", data.followv ?? "")
        followv = followv_response?.followv_id
      }

      await updateMedicalConsultation(
        MedicalConsultation.medrec_id,
        "completed",
        findingId,
        medRequestId ?? undefined,
        followv ?? undefined,
      )

      if (data.selectedIllnesses && data.selectedIllnesses.length > 0) {
        const medicalHistoryData = data.selectedIllnesses.map((illnessId) => ({
          patrec: MedicalConsultation?.patrec,
          ill: illnessId,
          medrec: MedicalConsultation.medrec_id,
          created_at: new Date().toISOString(),
        }))

        await createMedicalHistory(medicalHistoryData)
        medHistoryCreated = true
      }

      localStorage.removeItem("soapFormData")
      localStorage.removeItem("soapFormMedicines")
      toast.success("Documentation saved successfully")
      setShowReceipt(true)
    } catch (error) {
      console.error("Error saving documentation:", error)
      try {
        if (medHistoryCreated && MedicalConsultation?.medrec_id) {
          await deleteMedicalHistory(MedicalConsultation.medrec_id)
        }
        if (findingId) {
          await updateMedicalConsultation(MedicalConsultation.medrec_id, "pending")
        }
        if (medRequestId) {
          await deleteMedicineRequest(medRequestId)
        }
        if (perCreated && findingId) {
          await deletePEResults(findingId)
        }
        if (findingId) {
          await deleteFindings(findingId)
        }
        if (followv) {
          await deleteFollowUpVisit(followv)
        }
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError)
        toast.error("Failed to fully rollback changes. Please contact support.")
      }

      toast.error("Failed to save documentation")
    }
  }

  // Only show loading for PE data since medicine loading is handled internally
  if (isPeLoading || isMedicinesLoading) {
    return <SoapFormSkeleton />
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
              {/* Subjective Section */}
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

              {/* Physical Exam Section */}
              <div className="space-y-3">
                <PhysicalExam examSections={examSections} setExamSections={setExamSections} />
              </div>

              {/* Medicine Section */}
              <div className="space-y-3">
                <h2 className="text-lg font-medium text-darkBlue2">Plan Treatment (Treatment)</h2>
                <div className="overflow-x-auto">
                  <MedicineDisplay
                    medicines={medicineStocksOptions}
                    initialSelectedMedicines={selectedMedicines}
                    onSelectedMedicinesChange={handleSelectedMedicinesChange}
                    itemsPerPage={5}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </div>
                {hasInvalidQuantities && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          {hasExceededStock ? "Stock Limit Exceeded" : "Invalid Quantities"}
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
              </div>

              {/* Objective and Plan Treatment Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div>
                  <h2 className="text-lg font-medium text-darkBlue2">Objective Summary</h2>
                  <FormTextArea
                    control={form.control}
                    name="obj_summary"
                    label="Clinical findings and measurements"
                    placeholder="Document vital signs, physical exam findings, lab results, etc."
                    rows={10}
                    className="w-full"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-darkBlue2">Plan Treatment Summary</h2>
                  <FormTextArea
                    control={form.control}
                    name="plantreatment_summary"
                    label="Detailed treatment plan"
                    placeholder="Specify medications, therapies, follow-up plantreatment_summary, patient education, etc."
                    rows={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Illness Diagnosis and Assessment Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Illness Diagnosis Section - FIXED */}
                <div
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-darkBlue2">Illness Diagnoses</h2>
                    <div className="text-xs text-gray-500">{form.watch("selectedIllnesses")?.length || 0} selected</div>
                  </div>
                  <IllnessComponent
                    selectedIllnesses={form.watch("selectedIllnesses") || []}
                    onIllnessSelectionChange={handleIllnessSelectionChange}
                    onAssessmentUpdate={handleAssessmentUpdate}
                  />
                </div>

                {/* Assessment Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h2 className="text-lg font-medium text-darkBlue2">Assessment/Diagnoses Summary</h2>
                  <div className="space-y-2">
                    <FormTextArea
                      control={form.control}
                      name="assessment_summary"
                      label=""
                      placeholder="Enter clinical impressions, diagnosis, and any additional notes..."
                      className="min-h-[180px] text-sm w-full"
                      rows={7}
                    />
                  </div>
                </div>
              </div>

              {/* Follow-up Section */}
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

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-6">
                  Previous
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto px-6"
                  disabled={form.formState.isSubmitting || hasInvalidQuantities}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save Documentation"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Treatment Receipt Dialog */}
      <TreatmentReceipt
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false)
          navigate("/pending-medical-con")
        }}
        patientName={`${patientData?.personal_info?.per_lname}, ${patientData?.personal_info?.per_fname} ${
          patientData?.personal_info?.per_mname || ""
        }`}
        patientId={patientData?.pat_id}
        date={new Date().toLocaleDateString()}
        treatmentPlan={form.getValues("plantreatment_summary")}
        doctorName="Dr. Your Name" // Replace with actual doctor name
      />
    </div>
  )
}
