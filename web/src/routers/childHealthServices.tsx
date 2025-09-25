import AllChildHealthRecords from "@/pages/healthServices/childservices/tables/ChildHR_all_records";
import InvChildHealthRecords from "@/pages/healthServices/childservices/tables/ChildHR_inv_records";
import ChildHealthRecordForm from "@/pages/healthServices/childservices/forms/multi-step-form/Main";
import ChildHealthHistoryDetail from "@/pages/healthServices/childservices/viewrecords/Viewhistory";
import ChildImmunization from "@/pages/healthServices/childservices/immunization/Main";
import ChildMedicalConsultation from "@/pages/healthServices/doctor/child-medical-con/Main";


export const childHealthServices = [
  {
    path: "/services/childhealthrecords",
    element: <AllChildHealthRecords />,
  },
  {
    path: "/services/childhealthrecords/records",
    element: <InvChildHealthRecords />,
  },
  {
    path: "/services/childhealthrecords/records/history",
    element: <ChildHealthHistoryDetail />,
  },
  {
    path: "/services/childhealthrecords/form",
    element: <ChildHealthRecordForm />,
  },
  
  

];

