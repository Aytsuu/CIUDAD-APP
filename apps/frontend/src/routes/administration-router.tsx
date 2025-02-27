import RoleLayout from "@/pages/record/administration/role-layout"
import AdministrativeRecords from "@/pages/record/administration/administrative-records"

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