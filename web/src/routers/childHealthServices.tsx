import AllChildHealthRecords from "@/pages/healthServices/childservices/tables/ChildHR_all_records";
import InvChildHealthRecords from "@/pages/healthServices/childservices/tables/ChildHR_inv_records";
// import ChildHealthViewing from "@/pages/healthServices/childservices/childHR-viewing";
import ChildHealthRecordForm from "@/pages/healthServices/childservices/forms/muti-step-form/child-health-record-form";
import ChildHealthHistoryDetail from "@/pages/healthServices/childservices/viewrecords/Viewhistory";
import { el } from "date-fns/locale";
import path from "path";

import ChildMedicalConsultation from "@/pages/healthServices/doctor/child-medical-con/history";


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
    path: "/child-health-record/:mode",
    element: <ChildHealthRecordForm />,
  },
  {
    path: "/child-medical-consultation",
    element: <ChildMedicalConsultation />,
  }
];

