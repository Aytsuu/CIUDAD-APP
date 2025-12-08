import BusinessDocumentPage from "@/pages/record/clearances/BusinessPermits";
import CertificatePage from "@/pages/record/clearances/Certification";
import ServiceChargePage from "@/pages/record/clearances/ServiceCharge";
import IssuedCertificates from "@/pages/record/clearances/IssuedCertificates";

export const clearances_router = [
  {
    path: "record/clearances",
    children: [
      {
        path: "businesspermit",
        element: <BusinessDocumentPage />,
      },
      {
        path: "certification", 
        element: <CertificatePage />,
      },
      {
        path: "servicecharge",
        element: <ServiceChargePage />,
      },
      {
        path: "issuedcertificates",
        element: <IssuedCertificates />,
      }
    ]
  }
];