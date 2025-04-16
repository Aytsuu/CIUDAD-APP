import AllChildHealthRecords from "@/pages/healthServices/childservices/childhealthRecords/ChildHR_all_records"
import InvChildHealthRecords from "@/pages/healthServices/childservices/childhealthRecords/ChildHR_inv_records"
import ChildHealthForm from "@/pages/healthServices/childservices/forms/ChildHRForm";
export const childHealthServices = [
    
    { 
        path: "/allChildHRTable" ,
        element: <AllChildHealthRecords/>
    },
    { 
        path: "/invtablechr" ,
        element: <InvChildHealthRecords/>
    },
    {
        path:'/newAddChildHRForm',
        element: <ChildHealthForm/>
    }





];
