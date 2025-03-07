import path from "path";
import AllMedicalConRecords from "@/pages/healthServices/medicalconsultation/medicalconsultationRecords/AllRecords";
import MedicalForm from "@/pages/healthServices/medicalconsultation/medForm";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/medicalconsultationRecords/IndividualRecords";

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
