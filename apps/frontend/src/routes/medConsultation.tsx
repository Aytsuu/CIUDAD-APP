import path from "path";
import AllMedicalConRecords from "@/pages/record/medicalconsultation_records/AllRecords";
import InvMedicalConRecords from "@/pages/record/medicalconsultation_records/IndividualRecords";
import MedicalForm from "@/pages/healthServices/medicalconsultation_services/medForm";

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
