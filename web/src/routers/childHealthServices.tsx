import AllChildHealthRecords from "@/pages/healthServices/childservices/tables/ChildHR_all_records";
import InvChildHealthRecords from "@/pages/healthServices/childservices/tables/ChildHR_inv_records";
import ChildHealthRecordForm from "@/pages/healthServices/childservices/forms/multi-step-form/Main";
import ChildHealthHistoryDetail from "@/pages/healthServices/childservices/viewrecords/Viewhistory";
import ChildImmunization from "@/pages/healthServices/childservices/immunization/Main";
import ChildMedicalConsultation from "@/pages/healthServices/doctor/child-medical-con/Main";


export const childHealthServices = [
  {
    path: "/all-child-health-records",
    element: <AllChildHealthRecords />,
  },
  {
    path: "//child-health-records",
    element: <InvChildHealthRecords />,
  },
  {
    path: "/child-health-history-detail",
    element: <ChildHealthHistoryDetail />,
  },
  {
    path: "/child-health-record/form",
    element: <ChildHealthRecordForm />,
  },
  {
    path: "/child-medical-consultation",
    element: <ChildMedicalConsultation />,
  },
  {
    path: "/child-immunization",
    element: <ChildImmunization />,
  }

];

