import RoleLayout from "@/pages/record/administration/RoleLayout"
import AdministrationRecords from "@/pages/record/administration/AdministrationRecords"
import NewPositionForm from "@/pages/record/administration/NewPositionForm"
import GroupPositionForm from "@/pages/record/administration/GroupPositionForm"

export const administration_router = [
    {
        path: 'administration',
        element: <AdministrationRecords />,
    },
    {   
        path: 'administration/role',
        element: <RoleLayout /> 
    }, 
    {
        path: 'administration/role/position',
        element: <NewPositionForm /> 
    },
    {
        path: 'administration/role/group-position',
        element: <GroupPositionForm /> 
    }
]