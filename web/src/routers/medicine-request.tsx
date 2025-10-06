// import AllMedicineRecords from "@/pages/healthServices/medicineservices/tables/AllMedicineRecords";
import IndivMedicineRecord from "@/pages/healthServices/medicineservices/tables/IndivMedicineRecord";
import MedicineRequestDetail from "@/pages/healthServices/medicineservices/Request/request-processing/request-details";
import MedicineRequestForm from "@/pages/healthServices/medicineservices/MedicineRequestForm";
import MedicineRequestMain from "@/pages/healthServices/medicineservices/Request/Main";
import MedicineRequestPendingItems from "@/pages/healthServices/medicineservices/Request/request-pending/request-pending-items";
import AllMedicineRecords from "@/pages/healthServices/medicineservices/tables/AllMedicineRecords";

export const medicineRequest = [
  {
    path: "/services/medicine",
    element: <AllMedicineRecords />,
  },
  {
    path: "/services/medicine/records",
    element: <IndivMedicineRecord />,
  },
  
  {
    path: "/request/medicine/pending-pickup",
    element: <MedicineRequestDetail />,
  },

  {
    path: "/services/medicine/form",
    element: <MedicineRequestForm />,
  },
  {
    path: "/request/medicine",
    element: <MedicineRequestMain />,
  },
  {
    path:"/medicine-request/pending-items",
    element:<MedicineRequestPendingItems/>
  }
  
];