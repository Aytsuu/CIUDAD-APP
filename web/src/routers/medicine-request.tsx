import AllMedicineRecords from "@/pages/healthServices/medicineservices/tables/AllMedicineRecords";
import IndivMedicineRecord from "@/pages/healthServices/medicineservices/tables/IndivMedicineRecord";
import MedicineRequests from "@/pages/healthServices/medicineservices/Request/request-processing/request-table";
import MedicineRequestDetail from "@/pages/healthServices/medicineservices/Request/request-processing/request-details";
import MedicineRequestForm from "@/pages/healthServices/medicineservices/MedicineRequestForm";
import MedicineRequestMain from "@/pages/healthServices/medicineservices/Request/Main";
import MedicineRequestPendingItems from "@/pages/healthServices/medicineservices/Request/request-pending/request-pending-items";
import path from "path";


export const medicineRequest = [
  {
    path: "/all-medicine-records",
    element: <AllMedicineRecords />,
  },
  {
    path: "/IndivMedicineRecord",
    element: <IndivMedicineRecord />,
  },
 
  {
    path: "/medicine-requests",
    element: <MedicineRequests />,
  },
  {
    path: "/medicine-request-detail",
    element: <MedicineRequestDetail />,
  },

  {
    path: "/medicine-request-form",
    element: <MedicineRequestForm />,
  },
  {
    path: "/medicine-request",
    element: <MedicineRequestMain />,
  },
  {
    path:"/medicine-request/pending-items",
    element:<MedicineRequestPendingItems/>
  }
  
];
