// Update your MedicalConsultationFlow component

import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PendingDisplayMedicalConsultation from "./pending-display";
import SoapForm from "./soap-form";
import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useAuth } from "@/context/AuthContext";

interface Medicine {
  minv_id: string;
  medrec_qty: number;
  reason?: string;
  _tempId?: string;
}

interface FormData {
  subj_summary: string;
  obj_summary: string;
  assessment_summary: string;
  plantreatment_summary: string;
  medicineRequest: {
    pat_id: string;
    medicines: Medicine[];
  };
  physicalExamResults: number[];
  selectedIllnesses: number[];
  followv?: string;
  selectedMedicines: Medicine[];
  
  // Laboratory tests
  is_cbc: boolean;
  is_urinalysis: boolean;
  is_fecalysis: boolean;
  is_sputum_microscopy: boolean;
  is_creatine: boolean;
  is_hba1c: boolean;
  is_chestxray: boolean;
  is_papsmear: boolean;
  is_fbs: boolean;
  is_oralglucose: boolean;
  is_lipidprofile: boolean;
  is_fecal_occult_blood: boolean;
  is_ecg: boolean;
  others: string;
  is_phrecord: boolean;
  phil_id: string;
  staff_id: string;
  patrec_id?: string;
  medrec_id?: string;
  app_id?: string;
}

export default function MedicalConsultationFlow() {
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id || null;
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { patientData, MedicalConsultation } = location.state || {};
  
  // FIX: Convert all IDs to strings
  const [formData, setFormData] = useState<FormData>(
    () => ({
      subj_summary: "",
      obj_summary: "",
      assessment_summary: "",
      plantreatment_summary: "",
      medicineRequest: {
        pat_id: patientData?.pat_id || "",
        medicines: []
      },
      physicalExamResults: [],
      selectedIllnesses: [],
      followv: "",
      selectedMedicines: [],
      is_cbc: false,
      is_urinalysis: false,
      is_fecalysis: false,
      is_sputum_microscopy: false,
      is_creatine: false,
      is_hba1c: false,
      is_chestxray: false,
      is_papsmear: false,
      is_fbs: false,
      is_oralglucose: false,
      is_lipidprofile: false,
      is_fecal_occult_blood: false,
      is_ecg: false,
      others: "",
      is_phrecord: MedicalConsultation?.is_phrecord || false,
      // CRITICAL FIX: Convert all IDs to strings
      phil_id: String(MedicalConsultation?.philhealth_details?.phil_id || ""),
      staff_id: String(staff_id || ""),
      patrec_id: String(MedicalConsultation?.patrec || ""),
      medrec_id: String(MedicalConsultation?.medrec_id || ""),
      app_id: ""
    })
  );

  useEffect(() => {  
    console.log("Current form data:", formData)
  }, [formData])

  // Unified data update handler with string conversion
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      // Convert IDs to strings if they exist in updates
      if (updates.phil_id !== undefined) {
        newData.phil_id = String(updates.phil_id || "");
      }
      if (updates.staff_id !== undefined) {
        newData.staff_id = String(updates.staff_id || "");
      }
      if (updates.patrec_id !== undefined) {
        newData.patrec_id = String(updates.patrec_id || "");
      }
      if (updates.medrec_id !== undefined) {
        newData.medrec_id = String(updates.medrec_id || "");
      }
      if (updates.app_id !== undefined) {
        newData.app_id = String(updates.app_id || "");
      }
      
      // Auto-sync medicines between selectedMedicines and medicineRequest
      if (updates.selectedMedicines) {
        newData.medicineRequest = {
          pat_id: patientData?.pat_id || "",
          medicines: updates.selectedMedicines
        };
      } else if (updates.medicineRequest?.medicines) {
        newData.selectedMedicines = updates.medicineRequest.medicines;
      }
      
      return newData;
    });
  }, [patientData?.pat_id]);

  const nextStep = useCallback((data?: Partial<FormData>) => {
    if (data) {
      updateFormData(data);
    }
    setCurrentStep(2);
  }, [updateFormData]);

  const prevStep = useCallback(() => {
    setCurrentStep(1);
  }, []);

  if (!patientData || !MedicalConsultation) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4">
            No medical consultation data found.
          </p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LayoutWithBack 
      title="Medical Consultation" 
      description="Fill out the medical consultation details"
    >
      <CardLayout
        cardClassName="px-6"
        title=""
        content={
          <>
            {currentStep === 1 && (
              <PendingDisplayMedicalConsultation 
                patientData={patientData} 
                MedicalConsultation={MedicalConsultation} 
                onNext={nextStep} 
              />
            )}
            {currentStep === 2 && (
              <SoapForm 
                patientData={patientData} 
                MedicalConsultation={MedicalConsultation} 
                onBack={prevStep} 
                initialData={formData} 
                onFormDataUpdate={updateFormData} 
              />
            )}
          </>
        }
      />
    </LayoutWithBack>
  );
}