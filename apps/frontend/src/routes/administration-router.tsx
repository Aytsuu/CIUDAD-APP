import RoleLayout from "@/pages/administration/role-layout"
import AdministrativeRecords from "@/pages/administration/administrative-records"

export const administration_router = [
    {
        path: '/administrative',
        element: <AdministrativeRecords /> 
    },
    {
        path: '/role',
        element: <RoleLayout /> 
    }
]