import path from "path";
// import AllMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
// import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/IndividualRecords";
// import AllMedicalForm from "@/pages/healthServices/medicalconsultation/PHmedForm";
// import IndivNonPHMedicalForm from "@/pages/healthServices/medicalconsultation/NewMedConForm";


import AllMedicalForm from "@/pages/healthServices/medicalconsultation/Forms/AllNewForm";
import AllMedicalConsRecord from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/IndividualRecords";
import IndivMedicalForm from "@/pages/healthServices/medicalconsultation/Forms/IndivMedConForm";
import DisplayMedicalConsultation from "@/pages/healthServices/medicalconsultation/medicalhistory/DisplayMedCon";

export const medicalConsultation = [
 
 
  {
    path: "/AllMedicalForm",
    element: <AllMedicalForm  />,
  },

  {
    path: "/allMedRecords",
    element: <AllMedicalConsRecord />,
  },
  {
    path: "/invMedicalRecord",
    element: <InvMedicalConRecords />,
  },

  {
    path: "/IndivMedicalForm",
    element: <IndivMedicalForm />,
  },
  {
    path:"/DisplayMedicalConsultation",
    element: <DisplayMedicalConsultation/>
  }


];
