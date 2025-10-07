
import ChildMedicalConsultation from "@/pages/healthServices/doctor/child-medical-con/Main";
import MedicalConsultationFlow from "@/pages/healthServices/doctor/medical-con/multi-step-form/Main";
export const doctorRouting = [

{
  path:"/referred-patients/adult",
  element:<MedicalConsultationFlow/>
},
{
  path: "/referred-patients/child",
  element: <ChildMedicalConsultation />,
},

];
