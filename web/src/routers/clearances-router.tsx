import BusinessDocumentPage from "@/pages/record/clearances/BusinessPermits";
import CertificatePage from "@/pages/record/clearances/Certification";
import ServiceChargePage from "@/pages/record/clearances/ServiceCharge";
import IssuedCertificates from "@/pages/record/clearances/IssuedCertificates";
import BusinessPermitDocumentation from "@/pages/record/clearances/BusinessPermitDocumentation";

export const clearances_router = [
  {
    path: "record/clearances",
    children: [
      {
        path: "businesspermit",
        element: <BusinessDocumentPage />,
      },
      {
        path: "BusinessPermitDocumentation/:bpr_id",
        element: <BusinessPermitDocumentation />,
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