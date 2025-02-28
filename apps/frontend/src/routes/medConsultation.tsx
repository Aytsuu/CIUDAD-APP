import path from "path";
import AllMedicalConRecords from "@/pages/record/health/medicalconsultation/AllRecords";
import InvMedicalConRecords from "@/pages/record/health/medicalconsultation/IndividualRecords";
import MedicalForm from "@/pages/healthServices/medicalconsultation/medForm";

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
