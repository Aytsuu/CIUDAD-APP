import AllMedicalConsRecord from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/IndividualRecords";
import DisplayMedicalConsultation from "@/pages/healthServices/medicalconsultation/medicalhistory/DisplayMedCon";
import MedicalConsultationForm from "@/pages/healthServices/medicalconsultation/Forms/MedicalConForm";
import AppointmentForm from "@/pages/healthServices/medicalconsultation/Forms/AppointmentForm";
import AppointmentsLayout from "@/pages/healthServices/medicalconsultation/appointment/tables/main-appointmentlayout";
import MainAppointments from "@/pages/healthServices/medicalconsultation/appointment/tables/main-appoimnents";


export const medicalConsultation = [
  {
    path: "/services/medical-consultation/records",
    element: <AllMedicalConsRecord />,
  },

  // {
  //   path: "/services/medical-consultation/appointments",
  //   element: <MainAppointments />,
  // },
  {
    path: "/services/medical-consultation",
    element: <MainAppointments />,
    children: [
      {
        path: "appointments",
        element: <AppointmentsLayout />,
        children: [
          {
            index: true,
            element: <MainAppointments />,
          },
          {
            path: "confirmed",
            element: <MainAppointments />,
          },
          {
            path: "pending",
            element: <MainAppointments />,
          },
          {
            path: "referred",
            element: <MainAppointments />,
          },
          {
            path: "rejected",
            element: <MainAppointments />,
          },
          {
            path: "cancelled",
            element: <MainAppointments />,
          },
          {
            path: "missed",
            element: <MainAppointments />,
          },
          {
            path: "completed",
            element: <MainAppointments />,
          },
        ],
      },
    ],
  },
  {
    path: "/services/medical-consultation/records/individual-records",
    element: <InvMedicalConRecords />,
  },
  {
    path: "/services/medical-consultation/records/history",
    element: <DisplayMedicalConsultation />,
  },

  {
    path: "/services/medical-consultation/form",
    element: <MedicalConsultationForm />,
  },
  {
    path: "/services/medical-consultation/appointments/form",
    element: <AppointmentForm />,
  },
];

// {
//   path: "/services/medical-consultation",
//   element: <MainMedicalConsultation />
// },

// {
//   path: "/services/medical-consultation/form",
//   element: <MedicalConsultationForm />
// },

// {
//   path: "/services/appointments",
//   element: <PendingMedicalAppointments />
// },
// {
//   path: "/services/confirmed-appointments",
//   element: <ConfirmedMedicalAppointments />
// },
// { path: "/services/medical/appointment/", element: <MainAppoinments /> }
