import RoleLayout from "@/pages/record/administration/RoleLayout"
import AdministrationRecords from "@/pages/record/administration/AdministrationRecords"
import PositionForm from "@/pages/record/administration/PositionForm"

export const administration_router = [
    {
        path: 'administration',
        element: <AdministrationRecords /> 
    },
    {   
        path: 'administration/role',
        element: <RoleLayout /> 
    }, 
    {
        path: 'administration/role/add-position',
        element: <PositionForm /> 
    }
]