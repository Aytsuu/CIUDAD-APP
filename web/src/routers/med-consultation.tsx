import path from "path";
// import AllMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
// import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/IndividualRecords";
// import AllMedicalForm from "@/pages/healthServices/medicalconsultation/PHmedForm";
// import IndivNonPHMedicalForm from "@/pages/healthServices/medicalconsultation/NewMedConForm";


import AllMedicalConsRecord from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/IndividualRecords";
import DisplayMedicalConsultation from "@/pages/healthServices/medicalconsultation/medicalhistory/DisplayMedCon";
import MedicalConsultationForm from "@/pages/healthServices/medicalconsultation/Forms/MedicalConForm";
export const medicalConsultation = [

 
 
  {
    path: "/allMedRecords",
    element: <AllMedicalConsRecord />,
  },
  {
    path: "/invMedicalRecord",
    element: <InvMedicalConRecords />,
  },

  
  {
    path:"/DisplayMedicalConsultation",
    element: <DisplayMedicalConsultation/>
  },
  {
    path: "/medical-consultation-form",
    element: <MedicalConsultationForm />,
  }

];
