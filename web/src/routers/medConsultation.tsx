import path from "path";
import AllMedicalConRecords from "@/pages/healthServices/medicalconsultation/medicalconsultationRecords/AllRecords";
import NonPHMedicalForm from "@/pages/healthServices/medicalconsultation/NoPHmedForm";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/medicalconsultationRecords/IndividualRecords";
import PHMedicalForm from "@/pages/healthServices/medicalconsultation/PHmedForm";
import MedConView from "@/pages/healthServices/medicalconsultation/DisplayMedCon";

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
    path: "/allMedRecords",
    element: <AllMedicalConRecords />,
  },
  {
    path: "/invMedicalRecord",
    element: <InvMedicalConRecords />,
  },

  {
    path: "/viewMedConRecord",
    element: <MedConView />,
  }


];
