import BusinessDocumentPage from "@/pages/record/clearances/BusinessPermits";
import CertificatePage from "@/pages/record/clearances/Certification";
import PermitPage from "@/pages/record/clearances/SummonPermit";

export const clearances_router = [
    {
        path: 'businesspermit',
        element: <BusinessDocumentPage/>
    },
    {
        path: 'certifications',
        element: <CertificatePage/>
    },
    {
        path: 'summonpermit',
        element: <PermitPage/>
    }
];