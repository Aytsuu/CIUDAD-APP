import MaternalAllRecords from "@/pages/healthServices/maternal/maternal-all-records";
import MaternalIndivRecords from "@/pages/healthServices/maternal/maternal-indiv-records";
import PrenatalForm from "@/pages/healthServices/maternal/prenatal/prenatal-form";
import PrenatalViewingOne from "@/pages/healthServices/maternal/prenatal/prenatal-viewing";
import PrenatalIndivHistory from "@/pages/healthServices/maternal/prenatal/prenatal-indiv-history";
import PostpartumForm from "@/pages/healthServices/maternal/postpartum/postpartum-form";
import PostpartumViewing from "@/pages/healthServices/maternal/postpartum/pospartum-viewing";
import PostpartumIndivHistory from "@/pages/healthServices/maternal/postpartum/postpartum-indiv-history";

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
        path: "/postpartumform",
        element: <PostpartumForm />
    },
    {
        path: "/prenatalindividualhistory",
        element: <PrenatalIndivHistory />
    },
    {
        path: "/postpartumindividualhistory",
        element: <PostpartumIndivHistory />
    },
    {
        path: "/postpartumviewing",
        element: <PostpartumViewing />,
    }
]