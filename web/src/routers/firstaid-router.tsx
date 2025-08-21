import AllFirstAidRecords from "@/pages/healthServices/firstaidservices/tables/AllFirstaidRecords";
import IndivFirstAidRecords from "@/pages/healthServices/firstaidservices/tables/IndivFirstaidRecord";
import FirstAidRequestForm from "@/pages/healthServices/firstaidservices/FirstAidRequestForm";
export const firstaid_router = [
  {
    path: "/all-firstaid-records",
    element: <AllFirstAidRecords />,
  },
  {
    path: "/indiv-firstaid-records",
    element: <IndivFirstAidRecords />,
  },

  {
    path: "/firstaid-request-form",
    element: <FirstAidRequestForm />,
  },
];
