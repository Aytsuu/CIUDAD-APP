import AllMedicalConsRecord from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
import InvMedicalConRecords from "@/pages/healthServices/medicalconsultation/tables/IndividualRecords";
import DisplayMedicalConsultation from "@/pages/healthServices/medicalconsultation/medicalhistory/DisplayMedCon";
import MedicalConsultationForm from "@/pages/healthServices/medicalconsultation/Forms/MedicalConForm";
import MainMedicalConsultation from "@/pages/healthServices/medicalconsultation/tables/main-medicalconsultation";
import AppointmentForm from "@/pages/healthServices/medicalconsultation/Forms/AppointmentForm";
import AppointmentsLayout from "@/pages/healthServices/medicalconsultation/appointment/tables/main-appointmentlayout";
import MainAppointments from "@/pages/healthServices/medicalconsultation/appointment/tables/main-appoimnents";
import Layout from "@/pages/healthServices/Layout";

export const medicalConsultation = [
  {
    path: "/services/medical-consultation",
    element: <MainMedicalConsultation />,
    children: [
      // Default route - redirect to records
      {
        index: true,
        element: <AllMedicalConsRecord />
      },
      // RECORDS routes
      {
        path: "records",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <AllMedicalConsRecord />
          },
        ]
      },
      // APPOINTMENTS routes - Use MainAppointments as the main component
      {
        path: "appointments",
        element: <AppointmentsLayout />,
        children: [
          {
            index: true,
            element: <MainAppointments />
          },
          {
            path: "confirmed",
            element: <MainAppointments />
          },
          {
            path: "pending",
            element: <MainAppointments />
          },
          {
            path: "referred",
            element: <MainAppointments />
          },
          {
            path: "rejected",
            element: <MainAppointments />
          },
          {
            path: "cancelled",
            element: <MainAppointments />
          },
          {
            path: "missed",
            element: <MainAppointments />
          },
          {
            path: "completed",
            element: <MainAppointments />
          },
        ]
      }
    ]
  },
  {
    path: "/services/medical-consultation/records/individual-records",
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
  {
    path: "/services/medical-consultation/appointments/form",
    element: <AppointmentForm />

    }

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
