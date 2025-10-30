
import ChildMedicalConsultation from "@/pages/healthServices/doctor/child-medical-con/Main";
import MedicalConsultationFlow from "@/pages/healthServices/doctor/medical-con/multi-step-form/Main";
import ForwardedCombinedHealthRecordsTable from "@/pages/healthServices/doctor/reffered_patients/ForwardedCombineConsultation";
import ConfirmedMedicalAppointments from "@/pages/healthServices/doctor/reffered_patients/upcoming_consultation";

export const doctorRouting = [

{
  path:"/referred-patients/adult",
  element:<MedicalConsultationFlow/>
},
{
  path: "/referred-patients/child",
  element: <ChildMedicalConsultation />,
},
{
  path: "/referred-patients",
  element: <ForwardedCombinedHealthRecordsTable />
},
{
  path: "/referred-patients/upcoming-consultations",
  element: <ConfirmedMedicalAppointments />

}

];
