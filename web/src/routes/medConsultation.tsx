import path from "path";
<<<<<<< HEAD
import AllMedicalConRecords from "@/pages/record/health/medicalconsultation/AllRecords";
import InvMedicalConRecords from "@/pages/record/health/medicalconsultation/IndividualRecords";
import MedicalForm from "@/pages/healthServices/medicalconsultation/medForm";

export const medicalConsultation = [
  {
    path: "/medicalForm",
    element: <MedicalForm  />,
  },
  {
=======
import AllMedicalConRecords from "@/pages/healthServices/medicalconsultation/medicalconsultationRecords/AllRecords";
import NonPHMedicalForm from "@/pages/healthServices/medicalconsultation/NoPHmedForm";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/medicalconsultationRecords/IndividualRecords";
import PHMedicalForm from "@/pages/healthServices/medicalconsultation/PHmedForm";
export const medicalConsultation = [
 
  {
    path: "/nonPHmedicalForm",
    element: <NonPHMedicalForm  />,
  },
  {
    path: "/PHmedicalForm",
    element: <PHMedicalForm  />,
  },


  {
>>>>>>> master
    path: "/allMedRecords",
    element: <AllMedicalConRecords />,
  },
  {
    path: "/invMedRecords",
    element: <InvMedicalConRecords />,
  },
];
