import ResolutionPage from "@/pages/record/council/resolution/resolutionPage"
import AddResolution from "@/pages/record/council/resolution/addResolution"



export const res_router = [
    {
        path: '/res-page',
        element: <ResolutionPage/>
    },
    {
        path: '/add-res',
        element: <AddResolution/>
    }
]