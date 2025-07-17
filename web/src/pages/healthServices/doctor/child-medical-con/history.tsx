import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PendingDisplaycheckupData from "./pending-display";
import SoapForm from "./soap-form";
import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import {ChevronLeft} from "lucide-react";

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

export default function ChildMedicalConsultation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { patientData, checkupData } = location.state || {};

  console.log("Checkup Data:", checkupData);
  // Initialize form data with proper default values
  const [formData, setFormData] = useState<FormData>(() => {
    const initialMedicines =
      checkupData?.find_details?.prescribed_medicines || [];

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
          reason: med.reason || "",
        })),
      },
      physicalExamResults: [],
      selectedIllnesses: [],
      followv: "",
      selectedMedicines: initialMedicines.map((med: Medicine) => ({
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason || "",
      })),
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
            selectedMedicines:
              data.selectedMedicines ||
              data.medicineRequest?.medicines ||
              prev.selectedMedicines ||
              [],
          };

          if (data.selectedMedicines) {
            updatedData.medicineRequest = {
              pat_id: patientData?.pat_id || "",
              medicines: data.selectedMedicines,
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
          ...updatedData,
        };

        if (updatedData.selectedMedicines) {
          newData.selectedMedicines = updatedData.selectedMedicines;
          newData.medicineRequest = {
            pat_id: patientData?.pat_id || "",
            medicines: updatedData.selectedMedicines,
          };
        } else if (updatedData.medicineRequest?.medicines) {
          newData.selectedMedicines = updatedData.medicineRequest.medicines.map(
            (med) => ({
              minv_id: med.minv_id,
              medrec_qty: med.medrec_qty,
              reason: med.reason || "",
            })
          );
        }

        return newData;
      });
    },
    [patientData?.pat_id]
  );

  if (!patientData || !checkupData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4">
            No medical consultation data found.
          </p>
          <Button onClick={() => navigate(-1)} className="ml-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
   <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-darkGray p-2 bg-white hover:bg-gray-100 rounded-md border border-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div>
          <h1 className="font-semibold text-lg sm:text-xl md:text-2xl text-darkBlue2">
            Medical Consultation Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View consultation details and patient information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-4 sm:mb-6" />

      <CardLayout
      cardClassName="px-6"
        title=""
        content={
          <>
            {/* Step Content */}
            {currentStep === 1 && (
              <PendingDisplaycheckupData
                patientData={patientData}
                checkupData={checkupData}
                onNext={nextStep}
              />
            )}

            {currentStep === 2 && (
              <SoapForm
                patientData={patientData}
                checkupData={checkupData}
                onBack={prevStep}
                initialData={formData}
                onFormDataUpdate={handleFormDataUpdate}
              />
            )}
          </>
        }
      />
    </>
  );
}
