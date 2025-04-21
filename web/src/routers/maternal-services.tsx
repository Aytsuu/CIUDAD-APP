import MaternalAllRecords from "@/pages/healthServices/maternal/maternal-all-records";
import MaternalIndivRecords from "@/pages/healthServices/maternal/maternal-indiv-records";
import PrenatalForm from "@/pages/healthServices/maternal/prenatal/prenatal-form";
import PrenatalViewingOne from "@/pages/healthServices/maternal/prenatal/prenatal-viewing";
import PostpartumViewing from "@/pages/healthServices/maternal/postpartum/pospartum-viewing";

export const maternal_router = [
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
    },
    {
        path: "/postpartumviewing",
        element: <PostpartumViewing />,
    }
]