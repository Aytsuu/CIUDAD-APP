import ChildMedicalConsultation from "@/pages/healthServices/doctor/child-medical-con/Main";
import MedicalConsultationFlow from "@/pages/healthServices/doctor/medical-con/multi-step-form/Main";
// import ForwardedCombinedHealthRecordsTable from "@/pages/healthServices/doctor/reffered_patients/ForwardedCombineConsultation";
import ConfirmedMedicalAppointments from "@/pages/healthServices/doctor/reffered_patients/upcoming_consultation";
import ReferredTable from "@/pages/healthServices/doctor/reffered_patients/referredPatients";
// import AllMedicalConsRecord from "@/pages/healthServices/medicalconsultation/tables/AllRecords";
// import AllChildHealthRecords from "@/pages/healthServices/childservices/tables/ChildHR_all_records";
// import Layout from "@/pages/healthServices/Layout";
export const doctorRouting = [
  {
    path: "/referred-patients/adult",
    element: <MedicalConsultationFlow />,
  },
  {
    path: "/referred-patients/child",
    element: <ChildMedicalConsultation />,
  },
  {
    path: "/referred-patients/pending-assessment",
    element: <ReferredTable />
  },
  {
    path: "/referred-patients/upcoming-consultations",
    element: <ConfirmedMedicalAppointments />,
  },

  // {
  //   path: "/referred-patients",
  //   element: <ForwardedCombinedHealthRecordsTable />,
  //   children: [
  //     // Default route - redirect to records
  //     {
  //       index: true,
  //       element: <ForwardedCombinedHealthRecordsTable />,
  //     },
  //     {
  //       path: "pending-assessment",
  //       element: <Layout />,
  //       children: [
  //         {
  //           index: true,
  //           element: <ReferredTable />,
  //         },
  //       ],
  //     },
  //     // RECORDS routes
  //     {
  //       path: "medical-consultation",
  //       element: <Layout />,
  //       children: [
  //         {
  //           index: true,
  //           element: <AllMedicalConsRecord />,
  //         },
  //       ],
  //     },
  //     {
  //        path: "child-health",
  //       element: <Layout />,
  //       children: [
  //         {
  //           index: true,
  //           element: <AllChildHealthRecords />,
  //         },
  //       ],
  //     }

  //   ],
  // },
];
