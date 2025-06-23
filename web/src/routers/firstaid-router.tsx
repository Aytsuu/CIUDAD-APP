import PatNewFirstaidRecForm from "@/pages/healthServices/firstaidservices/PatnewFirstaid";
import path from "path";
import AllFirstAidRecords from "@/pages/healthServices/firstaidservices/tables/AllFirstaidRecords";
import IndivPatNewFirstAidRecForm from "@/pages/healthServices/firstaidservices/IndivnewFirstaidRecord";
import IndivFirstAidRecords from "@/pages/healthServices/firstaidservices/tables/IndivFirstaidRecord";

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
 

];
