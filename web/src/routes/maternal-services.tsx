import MaternalAllRecords from "@/pages/maternal/maternal-all-records";
import MaternalIndivRecords from "@/pages/maternal/maternal-indiv-records";
import PrenatalForm from "@/pages/maternal/prenatal/prenatal-form";
import PrenatalViewingOne from "@/pages/maternal/prenatal/prenatal-viewing";
import PostpartumViewing from "@/pages/maternal/postpartum/pospartum-viewing";

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