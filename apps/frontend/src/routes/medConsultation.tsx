import path from "path";
import AllMedicalConRecords from "@/pages/MEDICAL_CONSULTATION_SERVICES/MEDICAL_RECORDS/medCon_AllRecords";
import InvMedicalConRecords from "@/pages/MEDICAL_CONSULTATION_SERVICES/MEDICAL_RECORDS/medCon_InvRecords";
import MedicalForm from "@/pages/MEDICAL_CONSULTATION_SERVICES/medForm";

export const medicalConsultation = [
  {
    path: "/medicalForm",
    element: <MedicalForm  />,
  },
  {
    path: "/allMedRecords",
    element: <AllMedicalConRecords />,
  },
  {
    path: "/invMedRecords",
    element: <InvMedicalConRecords />,
  },
];
