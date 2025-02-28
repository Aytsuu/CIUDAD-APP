

import OrdinancePage from "@/pages/records/council/ordinance/ordinancePage"
import AddOrdinancePage from "@/pages/records/council/ordinance/AddOrdinance"
import UpdateOrdinance from "@/pages/records/council/ordinance/UpdateOrdinance"



export const ord_route = [
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