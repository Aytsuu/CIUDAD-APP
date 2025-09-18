import MaternalAllRecords from "@/pages/healthServices/maternal/maternal-all-records";
import MaternalIndivRecords from "@/pages/healthServices/maternal/maternal-indiv-records";
import PrenatalForm from "@/pages/healthServices/maternal/prenatal/prenatal-forms/prenatal-form-main";
import PrenatalViewingOne from "@/pages/healthServices/maternal/prenatal/prenatal-history/form-history/prenatal-viewing-one";
import PrenatalIndivHistory from "@/pages/healthServices/maternal/prenatal/prenatal-history/prenatal-indiv-history";
import PostpartumForm from "@/pages/healthServices/maternal/postpartum/postpartum-form-main";
import PostpartumViewing from "@/pages/healthServices/maternal/postpartum/postpartum-history/form-history/pospartum-viewing";
import PostpartumIndivHistory from "@/pages/healthServices/maternal/postpartum/postpartum-history/postpartum-indiv-history";

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