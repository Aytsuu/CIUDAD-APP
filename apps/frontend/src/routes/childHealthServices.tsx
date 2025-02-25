import AllChildHealthRecords from "@/pages/CHR_SERVICES/CHR_RECORDS/childHR_all_records"
import InvChildHealthRecords from "@/pages/CHR_SERVICES/CHR_RECORDS/childHR_inv_records"
import ChildHealthForm from "@/pages/CHR_SERVICES/CHR_NEW_ADDFORM/childHR_Form";
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
