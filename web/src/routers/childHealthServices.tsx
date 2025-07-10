import AllChildHealthRecords from "@/pages/healthServices/childservices/childhealthRecords/ChildHR_all_records"
import InvChildHealthRecords from "@/pages/healthServices/childservices/childhealthRecords/ChildHR_inv_records"
import ChildHealthForm from "@/pages/healthServices/childservices/forms/backup/AddChildHRForm";
import ChildHealthViewing from "@/pages/healthServices/childservices/childHR-viewing";
import ChildHealthRecordForm from "@/pages/healthServices/childservices/forms/editform/child-health-record-form";
import ChildHealthHistoryDetail from "@/pages/healthServices/childservices/childhealthRecords/ViewRecords";
import { el } from "date-fns/locale";
import path from "path";
export const childHealthServices = [
    
    { 
        path: "/all-child-health-records" ,
        element: <AllChildHealthRecords/>
    },
    { 
        path: "//child-health-records" ,
        element: <InvChildHealthRecords/>
    },
    {
        path:'/newAddChildHRForm',
        element: <ChildHealthForm/>

    },
    {
        path: "/childHealthViewing",
        element: <ChildHealthViewing/>
    }
    ,
   { path: "/child-health-history-detail",
    element: <ChildHealthHistoryDetail/>},
    {
        path: "/child-health-record/:mode",
        element: <ChildHealthRecordForm/>
    }

];