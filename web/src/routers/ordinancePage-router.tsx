

import OrdinancePage from "@/pages/record/council/ordinance/ordinancePage"
import AddOrdinancePage from "@/pages/record/council/ordinance/AddOrdinance"
import UpdateOrdinance from "@/pages/record/council/ordinance/UpdateOrdinance"



export const ord_router = [
    {
        path: '/ord-page',
        element: <OrdinancePage/>
    },
    {
        path: '/add-ord',
        element: <AddOrdinancePage/>
    },
    {
        path: 'update-ord',
        element: <UpdateOrdinance/>
    }
]