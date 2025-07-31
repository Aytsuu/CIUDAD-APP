import path from "path";
import AllMedicineRecords from "@/pages/healthServices/medicineservices/tables/AllMedicineRecords";
import IndivMedicineRecord from "@/pages/healthServices/medicineservices/tables/IndivMedicineRecord";
import MedicineRequests from "@/pages/healthServices/medicineservices/Request/request-table";
import MedicineRequestDetail from "@/pages/healthServices/medicineservices/Request/request-details";
import MedicineRequestForm from "@/pages/healthServices/medicineservices/MedicineRequestForm";
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
  }
  
];
