import ResolutionPage from "@/pages/records/council/resolution/resolutionPage"
import AddResolution from "@/pages/records/council/resolution/addResolution"
import UpdateResolution from "@/pages/records/council/resolution/updateResolution"



export const res_route = [
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