import AllChildHealthRecords from "@/pages/record/health/childhealth/childHR_all_records"
import InvChildHealthRecords from "@/pages/record/health/childhealth/childHR_inv_records"
import ChildHealthForm from "@/pages/healthServices/childservices/childHR_Form";
export const childHealthServices = [
    
    { 
        path: "/allChildHRTable" ,
        element: <AllChildHealthRecords/>

    }
,
    { 
        path: "/invtablechr" ,
        element: <InvChildHealthRecords/>

    },
    {
        path:'/newAddChildHRForm',
        element: <ChildHealthForm/>

    }





];
