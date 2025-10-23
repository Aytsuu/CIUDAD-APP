// import AllMedicineRecords from "@/pages/healthServices/medicineservices/tables/AllMedicineRecords";
import IndivMedicineRecord from "@/pages/healthServices/medicineservices/tables/IndivMedicineRecord";
import MedicineRequestDetail from "@/pages/healthServices/medicineservices/Request/request-processing/request-details";
import MedicineRequestForm from "@/pages/healthServices/medicineservices/MedicineRequestForm";
import MedicineRequestMain from "@/pages/healthServices/medicineservices/Request/Main";
import MedicineRequestPendingItems from "@/pages/healthServices/medicineservices/Request/request-pending/request-pending-items";
import AllMedicineRecords from "@/pages/healthServices/medicineservices/tables/AllMedicineRecords";
import MainMedicine from "@/pages/healthServices/medicineservices/Main";
import PickupTable from "@/pages/healthServices/medicineservices/Request/request-processing/request-table";
import PendingConfirmation from "@/pages/healthServices/medicineservices/Request/request-pending/request-pending-table";
import MedicineLayout from "@/pages/healthServices/medicineservices/MedicineLayout";


export const medicineRequest = [
  {
    path: "services",
    element: <MedicineLayout />, // Create this layout component
    children: [
      {
        path: "medicine",
        element: <MainMedicine />,
        children: [
          {
            path: "records",
            element: <AllMedicineRecords />
          },
          {
            path: "requests",
            element: <MedicineRequestMain />,
            children: [
              { path: "pickup", element: <PickupTable /> },
              { path: "pending", element: <PendingConfirmation /> }
            ]
          }
        ]
      }
    ]
  },
  // {
  //   path: "/services/medicine",
  //   element: <AllMedicineRecords />,
  // },
  {
    path: "/services/medicine/records/individual-records",
    element: <IndivMedicineRecord />
  },

  {
    path: "/request/medicine/pending-pickup",
    element: <MedicineRequestDetail />
  },

  {
    path: "/services/medicine/form",
    element: <MedicineRequestForm />
  },
  // {
  //   path: "/request/medicine",
  //   element: <MedicineRequestMain />,
  // },
  {
    path: "/medicine-request/pending-items",
    element: <MedicineRequestPendingItems />
  }
];
