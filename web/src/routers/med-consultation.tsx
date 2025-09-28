

import AllMedicalConsRecord from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/IndividualRecords";
import DisplayMedicalConsultation from "@/pages/healthServices/medicalconsultation/medicalhistory/DisplayMedCon";
import MedicalConsultationForm from "@/pages/healthServices/medicalconsultation/Forms/MedicalConForm";

export const medicalConsultation = [
  {
    path: "/services/medical-consultation",
    element: <AllMedicalConsRecord />,
  },
  {
    path: "/services/medical-consultation/records",
    element: <InvMedicalConRecords />,
  },

  
  {
    path:"/services/medical-consultation/records/history",
    element: <DisplayMedicalConsultation/>
  },
  {
    path: "/services/medical-consultation/form",
    element: <MedicalConsultationForm />,
  }

];