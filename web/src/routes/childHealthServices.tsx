import AllChildHealthRecords from "@/pages/record/health/childhealth/ChildHR_all_records"
import InvChildHealthRecords from "@/pages/record/health/childhealth/ChildHR_inv_records"
import ChildHealthForm from "@/pages/healthServices/childservices/ChildHRForm";
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
