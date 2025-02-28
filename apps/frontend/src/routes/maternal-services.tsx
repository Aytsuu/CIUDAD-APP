import MaternalAllRecords from "@/pages/maternal/maternal-all-records";
import MaternalIndivRecords from "@/pages/maternal/maternal-indiv-records";
import PrenatalForm from "@/pages/prenatal/prenatal-form";
import PrenatalViewingOne from "@/pages/prenatal/prenatal-viewing";

export const MaternalServices = [
    {
        path: "/maternalrecords",
        element: <MaternalAllRecords />,
    },
    {
        path: "/maternalindividualrecords",
        element: <MaternalIndivRecords />,
    },
    {
        path: "/prenatalform",
        element: <PrenatalForm />,
    },
    {
        path: "/prenatalviewing",
        element: <PrenatalViewingOne />,
    }
]