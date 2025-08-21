import BusinessDocumentPage from "@/pages/record/clearances/BusinessPermits";
import CertificatePage from "@/pages/record/clearances/Certification";
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
        path: "issuedcertificates",
        element: <IssuedCertificates />,
      }
    ]
  }
];
