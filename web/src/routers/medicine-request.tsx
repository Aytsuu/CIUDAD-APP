import path from "path";
import AllMedicineRecords from "@/pages/healthServices/medicineservices/tables/AllMedicineRecords";
import IndivMedicineRecord from "@/pages/healthServices/medicineservices/tables/IndivMedicineRecord";
import PatNewMedRecForm from "@/pages/healthServices/medicineservices/PatnewMedRecord";
// import PatNewMedRecForm from "@/pages/healthServices/medicineservices/backupPat";
import IndivPatNewMedRecForm from "@/pages/healthServices/medicineservices/IndivnewMedrecord";
import MedicineRequests from "@/pages/healthServices/medicineservices/Request/request-table";
import MedicineRequestDetail from "@/pages/healthServices/medicineservices/Request/request-details";

export const medicineRequest = [
  {
    path: "/AllMedicineRecords",
    element: <AllMedicineRecords />,
  },
  {
    path: "/IndivMedicineRecord",
    element: <IndivMedicineRecord />,
  },
  {
    path: "/PatNewMedRecForm",
    element: <PatNewMedRecForm />,
  },

  {
    path: "/IndivPatNewMedRecForm",
    element: <IndivPatNewMedRecForm />,
  },{
    path: "/medicine-requests",
    element: <MedicineRequests />,
  },
  {
    path: "/medicine-request-detail",
    element: <MedicineRequestDetail />,
  }
  
];
