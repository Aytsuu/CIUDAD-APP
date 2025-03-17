import RoleLayout from "@/pages/record/administration/RoleLayout"
import AdministrativeRecords from "@/pages/record/administration/AdministrativeRecords"

export const administration_router = [
    {
        path: 'administrative',
        element: <AdministrativeRecords /> 
    },
    {
        path: 'role',
        element: <RoleLayout /> 
    }
]