import MaternalMain from "@/pages/healthServices/maternal/maternal-tabs/maternal-main";
import MaternalAllRecords from "@/pages/healthServices/maternal/maternal-tabs/maternal-all-records";
import MaternalIndivRecords from "@/pages/healthServices/maternal/maternal-tabs/maternal-indiv-records";
import PrenatalForm from "@/pages/healthServices/maternal/prenatal/prenatal-forms/prenatal-form-main";
import PrenatalViewingOne from "@/pages/healthServices/maternal/prenatal/prenatal-history/form-history/prenatal-viewing-one";
import PrenatalIndivHistory from "@/pages/healthServices/maternal/prenatal/prenatal-history/prenatal-indiv-history";
import PostpartumForm from "@/pages/healthServices/maternal/postpartum/postpartum-form-main";
import PostpartumViewing from "@/pages/healthServices/maternal/postpartum/postpartum-history/form-history/postpartum-care-viewing";
import PostpartumCareHistory from "@/pages/healthServices/maternal/postpartum/postpartum-history/postpartum-care-history";
import PostpartumIndivHistory from "@/pages/healthServices/maternal/postpartum/postpartum-history/postpartum-indiv-history";


export const maternal_router = [
    {
        path: "/services/maternal",
        element: <MaternalMain />,
    },
    {
        path: "/services/maternalrecords",
        element: <MaternalAllRecords />,
    },
    {
        path: "/services/maternalindividualrecords",
        element: <MaternalIndivRecords />,
    },
    {
        path: "/services/maternal/prenatal/form",
        element: <PrenatalForm />,
    },
    {
        path: "/services/maternal/prenatal/history",
        element: <PrenatalIndivHistory />
    },
    {
        path: "/services/maternal/prenatal/view",
        element: <PrenatalViewingOne />,
    },
    {
        path: "/services/maternal/postpartum/form",
        element: <PostpartumForm />
    },
    {
        path: "/services/maternal/postpartum/history",
        element: <PostpartumIndivHistory />
    },
    {
        path: "/services/maternal/postpartumcare/history",
        element: <PostpartumCareHistory />
    },
    {
        path: "/services/maternal/postpartum/view",
        element: <PostpartumViewing />,
    },
]