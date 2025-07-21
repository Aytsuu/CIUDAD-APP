import PatNewFirstaidRecForm from "@/pages/healthServices/firstaidservices/PatnewFirstaid";
import path from "path";
import AllFirstAidRecords from "@/pages/healthServices/firstaidservices/tables/AllFirstaidRecords";
import IndivPatNewFirstAidRecForm from "@/pages/healthServices/firstaidservices/IndivnewFirstaidRecord";
import IndivFirstAidRecords from "@/pages/healthServices/firstaidservices/tables/IndivFirstaidRecord";
import MonthlyFirstAidRecords from "@/pages/healthServices/Reports/firstaid-report/monthly";
import MonthlyFirstAidDetails from "@/pages/healthServices/Reports/firstaid-report/records";
export const firstaid_router = [
  {
    path: "/patnew-firstaid-form",
    element: <PatNewFirstaidRecForm />,
  },
  {
    path: "/all-firstaid-records",
    element: <AllFirstAidRecords />,
  },
  {
    path: "/indiv-firstaid-records",
    element: <IndivFirstAidRecords />,
  },

  {
    path: "/indiv-firstaid-form",
    element: <IndivPatNewFirstAidRecForm />,
  },
  {
    path: "/monthly-firstaid-records",
    element: <MonthlyFirstAidRecords />,
  },
  { path: "/monthly-firstaid-details", element: <MonthlyFirstAidDetails /> },
];
