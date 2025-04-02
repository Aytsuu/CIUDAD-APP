import ResolutionPage from "@/pages/record/council/resolution/resolutionPage"
import AddResolution from "@/pages/record/council/resolution/addResolution"
import UpdateResolution from "@/pages/record/council/resolution/updateResolution"



export const res_router = [
    {
        path: '/res-page',
        element: <ResolutionPage/>
    },
    {
        path: '/add-res',
        element: <AddResolution/>
    },
    {
        path: '/update-res',
        element: <UpdateResolution/>
    }
]