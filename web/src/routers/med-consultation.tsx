// import AllMedicalConsRecord from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/IndividualRecords";
import DisplayMedicalConsultation from "@/pages/healthServices/medicalconsultation/medicalhistory/DisplayMedCon";
import MedicalConsultationForm from "@/pages/healthServices/medicalconsultation/Forms/MedicalConForm";
// import PendingMedicalAppointments from "@/pages/healthServices/medicalconsultation/tables/pending-appoinments";
// import ConfirmedMedicalAppointments from "@/pages/healthServices/medicalconsultation/tables/confirmed-appointments";
// import MainAppoinments from "@/pages/healthServices/medicalconsultation/tables/main-appoimnents";
import MainMedicalConsultation from "@/pages/healthServices/medicalconsultation/tables/main-medicalconsultation";
export const medicalConsultation = [
  {
    path: "/services/medical-consultation",
    element: <MainMedicalConsultation />
  },
  {
    path: "/services/medical-consultation/records",
    element: <InvMedicalConRecords />
  },

  {
    path: "/services/medical-consultation/records/history",
    element: <DisplayMedicalConsultation />
  },
  {
    path: "/services/medical-consultation/form",
    element: <MedicalConsultationForm />
  },

  // {
  //   path: "/services/appointments",
  //   element: <PendingMedicalAppointments />
  // },
  // {
  //   path: "/services/confirmed-appointments",
  //   element: <ConfirmedMedicalAppointments />
  // },
  // { path: "/services/medical/appointment/", element: <MainAppoinments /> }
];
