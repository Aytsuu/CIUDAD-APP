import RoleLayout from "@/pages/record/administration/RoleLayout"
import AdministrationRecords from "@/pages/record/administration/AdministrationRecords"
import NewPositionForm from "@/pages/record/administration/NewPositionForm"
import GroupPositionForm from "@/pages/record/administration/GroupPositionForm"
import ResidentFormLayout from "@/pages/record/profiling/resident/form/ResidentFormLayout"
import RegistrationLayout from "@/pages/record/profiling/resident/RegistrationLayout"

export const administration_router = [
    {
        path: 'administration',
        element: <AdministrationRecords />,
    },
    {
        path: 'administration/staff/assignment',
        element: <ResidentFormLayout />,
    },
    {
        path: 'administration/staff/create',
        element: <RegistrationLayout />,
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