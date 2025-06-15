import path from "path";
import AllMedicineRecords from "@/pages/healthServices/medicineservices/tables/AllMedicineRecords";
import IndivMedicineRecord from "@/pages/healthServices/medicineservices/tables/IndivMedicineRecord";
import PatNewMedRecForm from "@/pages/healthServices/medicineservices/PatnewMedRecord";
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
  
  
];
