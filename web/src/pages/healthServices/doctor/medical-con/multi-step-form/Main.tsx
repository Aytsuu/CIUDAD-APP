import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PendingDisplayMedicalConsultation from "./pending-display";
import SoapForm from "./soap-form";
import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

interface Medicine {
  minv_id: string;
  medrec_qty: number;
  reason?: string;
}

interface MedicineRequest {
  pat_id: string;
  medicines: Medicine[];
}

interface FormData {
  subj_summary?: string;
  obj_summary?: string;
  assessment_summary?: string;
  plantreatment_summary?: string;
  medicineRequest?: MedicineRequest;
  physicalExamResults?: number[];
  selectedIllnesses?: number[];
  followv?: string;
  selectedMedicines?: Medicine[];
}

export default function MedicalConsultationFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { patientData, MedicalConsultation } = location.state || {};

  // Initialize form data with proper default values
  const [formData, setFormData] = useState<FormData>(() => {
    const initialMedicines = MedicalConsultation?.find_details?.prescribed_medicines || [];

    return {
      subj_summary: "",
      obj_summary: "",
      assessment_summary: "",
      plantreatment_summary: "",
      medicineRequest: {
        pat_id: patientData?.pat_id || "",
        medicines: initialMedicines.map((med: Medicine) => ({
          minv_id: med.minv_id,
          medrec_qty: med.medrec_qty,
          reason: med.reason || ""
        }))
      },
      physicalExamResults: [],
      selectedIllnesses: [],
      followv: "",

      selectedMedicines: initialMedicines.map((med: Medicine) => ({
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason || ""
      }))
    };
  });

  // Handle moving to next step with data preservation
  const nextStep = useCallback(
    (data?: Partial<FormData>) => {
      if (data) {
        setFormData((prev) => {
          const updatedData = {
            ...prev,
            ...data,
            selectedMedicines: data.selectedMedicines || data.medicineRequest?.medicines || prev.selectedMedicines || []
          };

          if (data.selectedMedicines) {
            updatedData.medicineRequest = {
              pat_id: patientData?.pat_id || "",
              medicines: data.selectedMedicines
            };
          }

          console.log("Saving form data to parent:", updatedData);
          return updatedData;
        });
      }
      setCurrentStep(2);
    },
    [patientData?.pat_id]
  );

  // Handle moving to previous step
  const prevStep = useCallback(() => {
    setCurrentStep(1);
  }, []);

  // Handle form data updates from SoapForm
  const handleFormDataUpdate = useCallback(
    (updatedData: Partial<FormData>) => {
      setFormData((prev) => {
        const newData = {
          ...prev,
          ...updatedData
        };

        if (updatedData.selectedMedicines) {
          newData.selectedMedicines = updatedData.selectedMedicines;
          newData.medicineRequest = {
            pat_id: patientData?.pat_id || "",
            medicines: updatedData.selectedMedicines
          };
        } else if (updatedData.medicineRequest?.medicines) {
          newData.selectedMedicines = updatedData.medicineRequest.medicines.map((med) => ({
            minv_id: med.minv_id,
            medrec_qty: med.medrec_qty,
            reason: med.reason || ""
          }));
        }

        return newData;
      });
    },
    [patientData?.pat_id]
  );

  if (!patientData || !MedicalConsultation) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4">No medical consultation data found.</p>
          <Button onClick={() => navigate(-1)} className="ml-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LayoutWithBack title="Medical Consultation" description="Fill out the medical consultation details">
      <>
        <div className="flex justify-end mb-4">
          <Link to="/invMedicalRecord" state={{ params: { patientData, mode: "doctor" } }}>
            <Button className="flex gap-2 items-center text-white">
              <History className="w-4 h-4" /> View History
            </Button>
          </Link>
        </div>

        <CardLayout
          cardClassName="px-6"
          title=""
          content={
            <>
              {/* Step Content */}
              {currentStep === 1 && <PendingDisplayMedicalConsultation patientData={patientData} MedicalConsultation={MedicalConsultation} onNext={nextStep} />}

              {currentStep === 2 && <SoapForm patientData={patientData} MedicalConsultation={MedicalConsultation} onBack={prevStep} initialData={formData} onFormDataUpdate={handleFormDataUpdate} />}
            </>
          }
        />
      </>
    </LayoutWithBack>
  );
}
