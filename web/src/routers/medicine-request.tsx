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
import CompletedRequest from "@/pages/healthServices/medicineservices/Request/completed-request/request-completed-table";
import CompletedRequestDetail from "@/pages/healthServices/medicineservices/Request/completed-request/request-completed-details";
import RejectedRequest from "@/pages/healthServices/medicineservices/Request/rejected-request/request-rejected-table";
import RejectedRequestDetail from "@/pages/healthServices/medicineservices/Request/rejected-request/request-rejected-details";
import CancelledRequest from "@/pages/healthServices/medicineservices/Request/cancelled-request/request-cancelled-table";
import CancelledRequestDetail from "@/pages/healthServices/medicineservices/Request/cancelled-request/request-cancelled-details";
import ReferredRequest from "@/pages/healthServices/medicineservices/Request/referred-request/request-referred-table";
import ReferredRequestDetail from "@/pages/healthServices/medicineservices/Request/referred-request/request-referred-details";
import Layout from "@/pages/healthServices/Layout";


export const medicineRequest = [
  {
    path: "services",
    element: <Layout />, // Create this layout component
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
              { path: "pending", element: <PendingConfirmation /> },
              { path: "completed", element: <CompletedRequest /> },
              {path:"rejected", element:<RejectedRequest />},
              {path:"cancelled", element:<CancelledRequest />},
              {path:"referred", element:<ReferredRequest />}
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
  },
  {
    path: "/services/medicine/requests/completed/view",
    element: <CompletedRequestDetail />
  },
  {
    path: "/services/medicine/requests/rejected/view",
    element: <RejectedRequestDetail />
  },
  {
    path: "/services/medicine/requests/cancelled/view",
    element: <CancelledRequestDetail />
  },
  {
    path: "/services/medicine/requests/referred/view",
    element: <ReferredRequestDetail />
  }

];
